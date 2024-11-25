const Order = require("../models/order");
const User = require("../models/user");
const Product = require("../models/product");
const ErrorHandler = require("../utils/errorHandler");
const mongoose = require("mongoose");

const placeOrder = async (req, res, next) => {
  const { email, address } = req.body;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    console.log("Transaction started");

    const user = await User.findOne({ email }).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return next(new ErrorHandler("User not found", 404));
    }

    const cart = user.cart;
    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return next(new ErrorHandler("Cart is empty", 400));
    }

    const products = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));
    const totalAmount = cart.totalAmount;

    for (const item of cart.items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return next(
          new ErrorHandler(`Product with ID ${item.productId} not found`, 404)
        );
      }
      if (product.countInStock < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return next(
          new ErrorHandler(
            `Insufficient stock for product ${product.name}. Only ${product.countInStock} left.`,
            400
          )
        );
      }
      product.countInStock -= item.quantity;
      await product.save({ session });
    }

    const order = await Order.create(
      [
        {
          products,
          totalAmount,
          address,
        },
      ],
      { session }
    );

    if (!order || !order[0]._id) {
      console.error("Order creation failed");
      await session.abortTransaction();
      session.endSession();
      return next(new ErrorHandler("Failed to create order", 500));
    }

    console.log("Order created with ID:", order[0]._id);

    user.history.push({ orderId: order[0]._id });
    user.cart = { items: [], totalAmount: 0 };
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();
    console.log("Transaction committed");

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: order[0],
    });
  } catch (error) {
    console.error("Error in transaction:", error);
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

const getOrderByEmailAndId = async (req, res, next) => {
    const { email, orderId } = req.params;

    try {

        const user = await User.findOne({ email });

        if (!user) {
            return next(new ErrorHandler("User not found!", 404));
        }

   
        const order = await Order.findById(orderId).populate({
            path: 'products.productId',
            select: 'name description price',
        });

        if (!order) {
            return next(new ErrorHandler("Order not found!", 404));
        }

        const orderInHistory = user.history.find(
            (entry) => entry.orderId.toString() === orderId
        );

        if (!orderInHistory) {
            return next(
                new ErrorHandler("Order does not belong to this user!", 403)
            );
        }

        res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error("Error fetching order:", error);
        next(new ErrorHandler("Something went wrong", 500));
    }
};



module.exports = { placeOrder, getOrderByEmailAndId };

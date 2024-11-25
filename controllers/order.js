const Order = require("../models/order");
const User = require("../models/user");
const Product = require("../models/product");
const ErrorHandler = require("../utils/errorHandler");

const placeOrder = async (req, res, next) => {
  const { email, address } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const cart = user.cart;
    if (!cart || cart.items.length === 0) {
      return next(new ErrorHandler("Cart is empty", 400));
    }

    const products = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    const totalAmount = cart.totalAmount;

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return next(
          new ErrorHandler(`Product with ID ${item.productId} not found`, 404)
        );
      }
      if (product.countInStock < item.quantity) {
        return next(
          new ErrorHandler(
            `Insufficient stock for product ${product.name}. Only ${product.countInStock} left/`,
            400
          )
        );
      }
      product.countInStock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      products,
      totalAmount,
      address,
    });

    user.history.push({ orderId: order._id });

    user.cart = { items: [], totalAmount: 0 };

    await user.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
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

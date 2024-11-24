const User = require("../models/user");
const Product = require("../models/product");
const ErrorHandler = require("../utils/errorHandler");
const addToCart = async (req, res, next) => {
  const { email, productId } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    const existingItemIndex = user.cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex !== -1) {
      const existingItem = user.cart.items[existingItemIndex];

      if (existingItem.quantity + 1 > product.countInStock) {
        return next(
          new ErrorHandler(
            `Insufficient stock. Only ${product.countInStock} left in stock.`,
            400
          )
        );
      }

      existingItem.quantity += 1;
    } else {
      if (product.countInStock < 1) {
        return next(
          new ErrorHandler("Insufficient stock. No items left in stock.", 400)
        );
      }

      user.cart.items.push({
        productId,
        quantity: 1,
        price: product.price,
      });
    }

    let newTotalAmount = 0;
    user.cart.items.forEach((item) => {
      newTotalAmount += item.quantity * item.price;
    });

    user.cart.totalAmount = newTotalAmount;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      cart: user.cart,
    });
  } catch (error) {
    next(error);
  }
};

const getCart = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
      success: true,
      cart: user.cart,
    });
  } catch (error) {
    next(error);
  }
};

const decreaseQuantity = async (req, res, next) => {
  const { email, productId } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const cart = user.cart;

    const productIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (productIndex === -1) {
      return next(new ErrorHandler("Product not found in cart", 404));
    }

    const product = cart.items[productIndex];

    product.quantity -= 1;

    if (product.quantity === 0) {
      cart.items.splice(productIndex, 1);
    } else {
      cart.items[productIndex] = product;
    }

    cart.totalAmount -= product.price;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Product quantity decreased successfully",
      cart,
    });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  const { email, productId } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const itemIndex = user.cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (itemIndex === -1) {
      return next(new ErrorHandler("Product not found in cart", 404));
    }

    user.cart.items.splice(itemIndex, 1);

    let newTotalAmount = 0;
    user.cart.items.forEach((item) => {
      newTotalAmount += item.quantity * item.price;
    });

    user.cart.totalAmount = newTotalAmount;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
      cart: user.cart,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { addToCart, getCart, decreaseQuantity, removeFromCart };

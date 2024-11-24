const mongoose = require("mongoose");
const Product = require("../models/product");
const ErrorHandler = require("../utils/errorHandler");

const addProduct = async (req, res) => {
  const { name, description, price, countInStock, image } = req.body;

  const result = await Product.create({
    name,
    description,
    price,
    countInStock,
    image,
  });

  res.status(200).json({
    product: result,
  });
};

const getAllProducts = async (req, res) => {
  try {
    const productList = await Product.find();
    if (!productList) {
      return res.status(500).json({ success: false });
    }
    res.send(productList);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID or Product ID not found",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "The product with the given ID was not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
};

module.exports = { getAllProducts, getProductById, addProduct };

const express = require("express");

const {
  getAllProducts,
  getProductById,
  addProduct,
} = require("../controllers/product");

const router = express.Router();

router.get(`/`, getAllProducts);
router.get("/:id", getProductById);
router.post("/addProduct", addProduct);

module.exports = router;

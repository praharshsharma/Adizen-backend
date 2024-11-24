const express = require('express');
const { addToCart,getCart,decreaseQuantity} = require('../controllers/cart');
const { removeFromCart } = require('../controllers/cart');

const router = express.Router();

router.post('/addtocart', addToCart);
router.post('/getcart', getCart);
router.post('/decreasequantity', decreaseQuantity);
router.delete('/removeproduct', removeFromCart);
module.exports = router;

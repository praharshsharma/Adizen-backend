const express = require('express');
const router = express.Router();
const { placeOrder} = require('../controllers/order');
const { getOrderByEmailAndId } = require('../controllers/order');
router.get('/:email/:orderId', getOrderByEmailAndId);

router.post('/placeorder', placeOrder);

module.exports = router;

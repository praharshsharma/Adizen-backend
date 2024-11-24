const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
        validate: {
            validator: function (v) {
                const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,})$/;
                return emailRegex.test(v);
            },
            message: (props) => `${props.value} is not a valid email!`
        }
    },
    password: {
        type: String,
        required: true
    },
    // Cart schema: stores products, quantity, price, and total amount
    cart: {
        items: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
                type: Number,
                required: true
            }
        }],
        totalAmount: {
            type: Number,
            default: 0
        }
    },
    // History: stores order IDs for completed orders
    history: [{
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

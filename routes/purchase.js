const Razorpay = require('razorpay');
const Order = require('../models/order');
const User = require('../models/user');
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
require('dotenv').config();

router.get('/', verifyToken, async (req, res) => {
    try {
        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const amount = 9900;

        rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to create order' });
            }

            try {
                const createdOrder = new Order({
                    paymentid: '', 
                    orderid: order.id,
                    status: 'PENDING',
                    userID: req.user.id
                });
                await createdOrder.save();

                return res.status(201).json({ order, key_id: rzp.key_id });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Failed to create order in database' });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', verifyToken, async (req, res) => {
    const { order_id, payment_id } = req.body;
    try {
        await Order.findOneAndUpdate(
            { orderid: order_id },
            { paymentid: payment_id, status: 'SUCCESSFUL' },
            { new: true }
        );

        const user = await User.findById(req.user.id);

        user.premiumUser = true;
        await user.save();

        return res.status(200).json({ message: 'Transaction status updated successfully' });
    } catch (error) {
        console.error(error);

        await Order.findOneAndUpdate(
            { orderid: order_id },
            { status: 'FAILED' },
            { new: true }
        );

        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

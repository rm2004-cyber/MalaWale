const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});
exports.createOrder = async (req, res) => {
    try {
        const { amount, orderId } = req.body;
        
        const options = {
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        if (orderId && orderId.length === 24) {
            await Order.findByIdAndUpdate(orderId, { razorpayOrderId: order.id });
        }

        res.status(200).json({ success: true, razorpayOrderId: order.id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Missing required fields for verification" });
        }

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // MongoDB ID validation check
            if (orderId.length !== 24) {
                return res.status(400).json({ success: false, message: "Invalid Order ID format" });
            }

            const updatedOrder = await Order.findByIdAndUpdate(
                orderId, 
                { 
                    paymentStatus: 'Completed', 
                    paymentId: razorpay_payment_id 
                },
                { new: true }
            );

            if (!updatedOrder) {
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            return res.status(200).json({ success: true, message: "Payment verified successfully!" });
        }

        return res.status(400).json({ success: false, message: "Invalid signature! Potential fraud detected." });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.initiateRefund = async (orderId) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) throw new Error("Order nahi mila");
        if (!order.paymentId) throw new Error("Payment ID nahi hai");

        // Real API Call
        const refundResponse = await razorpay.payments.refund(order.paymentId, {
            amount: Math.round(order.totalAmount * 100),
            speed: 'optimum'
        });

        order.paymentStatus = 'Refunded';
        await order.save();
        console.log(`✅ Refund Success: ${orderId}`);
    } catch (error) {
        // Yahan 'error.error.description' check karo, Razorpay ka asli reason wahi hoga
        console.error("❌ Razorpay Refund Failed:", error.error ? error.error.description : error.message);
        throw error;
    }
};
exports.handleWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const shasum = crypto.createHmac('sha256', secret);
        
        // req.body yahan Buffer hai, ise directly update mein daalo
        shasum.update(req.body); 
        const digest = shasum.digest('hex');

        if (digest === req.headers['x-razorpay-signature']) {
            // Ab Buffer ko string mein convert karke parse karo
            const eventData = JSON.parse(req.body.toString());
            const { event, payload } = eventData;
            
            console.log(`[WEBHOOK-RECEIVED] Event: ${event}`);

            if (event === 'payment.captured') {
                const entity = payload.payment.entity;
                await Order.findOneAndUpdate(
                    { razorpayOrderId: entity.order_id },
                    { paymentStatus: 'Completed', paymentId: entity.id}
                );
            }
            return res.status(200).json({ status: 'ok' });
        }
        return res.status(400).send('Invalid signature');
    } catch (error) {
        console.error("Webhook Error:", error);
        return res.status(500).send('Error');
    }
};
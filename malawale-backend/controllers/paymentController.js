const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

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
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderPayload } = req.body;
        const userId = req.user._id;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderPayload) {
            return res.status(400).json({ success: false, message: "Required fields for verification are missing!" });
        }

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            const { items, shippingAddress, couponCode, totalAmount } = orderPayload;

            if (!shippingAddress || !items || items.length === 0) {
                return res.status(400).json({ success: false, message: "Invalid order details in payload!" });
            }

            // 1. Stock check before saving order
            const cart = await Cart.findOne({ user: userId }).populate('items.product');
            if (!cart || cart.items.length === 0) {
                return res.status(400).json({ success: false, message: "Your cart is empty!" });
            }

            for (const item of cart.items) {
                let variant = item.size 
                    ? item.product.variants.find(v => v.size.trim().toLowerCase() === item.size.trim().toLowerCase())
                    : item.product.variants[0];

                if (!variant || variant.stock < item.quantity || variant.inStock === false) {
                    return res.status(400).json({ success: false, message: `${item.product.name} is out of stock!` });
                }
            }

            // 2. Prepare items, deduct stock, and save product updates
            const orderItems = [];
            for (const item of cart.items) {
                const product = await Product.findById(item.product._id);
                let variant = item.size 
                    ? product.variants.find(v => v.size.trim().toLowerCase() === item.size.trim().toLowerCase())
                    : product.variants[0];
                
                const price = variant ? variant.price : product.variants[0].price;
                variant.stock -= item.quantity;
                product.soldCount += item.quantity;
                if (variant.stock === 0) variant.inStock = false;
                await product.save();

                orderItems.push({
                    product: item.product._id,
                    size: item.size || variant.size,
                    quantity: item.quantity,
                    price: price
                });
            }

            // 3. Prepare shipping address
            const address = {
                receiverName: shippingAddress.fullName,
                receiverPhone: shippingAddress.phone,
                addressLine: shippingAddress.street,
                pincode: shippingAddress.pincode,
                city: shippingAddress.city,
                state: shippingAddress.state,
                addressType: 'Home'
            };

            // 4. Create and save MongoDB Order document
            const newOrder = new Order({
                user: userId,
                items: orderItems,
                address: address,
                totalAmount: totalAmount,
                paymentType: 'Online',
                paymentStatus: 'Completed',
                orderStatus: 'Pending',
                razorpayOrderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                couponCode: couponCode || null
            });

            await newOrder.save();
            console.log("Online Order Saved to DB (After success verification):", newOrder._id);

            // 5. Clear cart
            await Cart.findOneAndDelete({ user: userId });

            return res.status(200).json({ 
                success: true, 
                order: newOrder,
                message: "Payment verified and order placed successfully!" 
            });
        }

        return res.status(400).json({ success: false, message: "Invalid signature! Potential fraud detected." });
    } catch (error) {
        console.error("Payment Verification Error:", error);
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
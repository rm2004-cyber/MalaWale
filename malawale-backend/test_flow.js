require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');
const paymentController = require('./controllers/paymentController');

const BASE_URL = 'http://localhost:5000/api';
const instance = axios.create({ baseURL: BASE_URL, timeout: 15000 });

async function runFullFlow() {
    console.log("🚀 Starting Full Automated Flow...");

    try {
        // 1. LOGIN
        const loginRes = await instance.post('/auth/firebase-login', {
            firebaseUid: "GGpWosk770RtX8noXNB3ZITHyTX2", phone: "8053621120"
        });
        const token = loginRes.data.token;
        console.log("✅ [Step 1] Login Success");

        // 2. ADD TO CART
        await instance.post('/cart/add', 
            { productId: "6a1179a33e279ba3a614e0ed", quantity: 1, size: "Small" },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("✅ [Step 2] Item added to Cart");

        // 3. PLACE ORDER
        const orderRes = await instance.post('/order/place', {
            totalAmount: 450, paymentMethod: "Online",
            shippingAddress: { fullName: "Rahul", phone: "8053621120", street: "Sector 62", pincode: "160062", city: "Mohali", state: "Punjab" }
        }, { headers: { Authorization: `Bearer ${token}` } });
        
        const { order, razorpayOrderId } = orderRes.data;
        console.log(`✅ [Step 3] Order Placed: ${order._id}`);

        // 4. VERIFY PAYMENT (Real Signature)
        const paymentId = "pay_test_" + Date.now();
        const sign = razorpayOrderId + "|" + paymentId;
        const signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(sign).digest('hex');
        
        await instance.post('/payment/verify', {
            orderId: order._id, razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: paymentId, razorpay_signature: signature
        });
        console.log("✅ [Step 4] Payment Verified");

        // 5. WEBHOOK SIMULATION (Real Signature)
        const webhookPayload = JSON.stringify({
            event: "payment.captured",
            payload: { payment: { entity: { id: paymentId, order_id: razorpayOrderId } } }
        });
        const webhookSignature = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(webhookPayload).digest('hex');

        console.log("🔄 [Step 5] Triggering Webhook...");
        await instance.post('/payment/webhook', webhookPayload, { 
            headers: { 
                "x-razorpay-signature": webhookSignature,
                "Content-Type": "application/json"
            } 
        });
        console.log("✅ [Step 5] Webhook Processed");

        // 6. CANCEL ORDER & REFUND
        console.log("🔄 [Step 6] Cancelling Order & Initiating Refund...");
     await instance.post('/order/customer-cancel', { orderId: order._id }, 
    { headers: { Authorization: `Bearer ${token}` } }
);
        console.log("🎉 [Step 7] Flow Finished Successfully!");

    } catch (error) {
        console.error("❌ Test Failed:", error.response?.data || error.message);
    }
}

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    await runFullFlow();
    process.exit();
}
main();
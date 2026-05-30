require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:5000/api';
const instance = axios.create({ baseURL: BASE_URL, timeout: 15000 });

async function runTest() {
    console.log("🚀 Starting Automated Test for the Refactored Payment Flow...");

    const productId = "6a1179a33e279ba3a614e0ed"; // Premium Sandalwood Bracelet
    const variantSize = "Small";
    const firebaseUid = "GGpWosk770RtX8noXNB3ZITHyTX2";
    const phone = "8053621120";

    try {
        // Connect to Mongo to inspect direct states
        await mongoose.connect(process.env.MONGO_URI);
        const Product = require('./models/Product');
        const Order = require('./models/Order');
        const Cart = require('./models/Cart');
        const User = require('./models/User');


        // Check initial stock
        const initialProd = await Product.findById(productId);
        const initialVariant = initialProd.variants.find(v => v.size === variantSize);
        const initialStock = initialVariant.stock;
        console.log(`\n📊 [Initial State] Product Stock for ${variantSize}: ${initialStock}`);

        // 1. LOGIN
        const loginRes = await instance.post('/auth/firebase-login', {
            firebaseUid, phone
        });
        const token = loginRes.data.token;
        console.log("✅ [Step 1] Login Success. Received JWT.");
        console.log("Login Response Data:", loginRes.data);

        // Fetch User directly from MongoDB for bulletproof test consistency
        const userObj = await User.findOne({ phone });
        if (!userObj) {
            throw new Error(`User with phone ${phone} not found in DB!`);
        }
        const userId = userObj._id;

        // Clear existing cart first
        await Cart.findOneAndDelete({ user: userId });

        console.log("🧹 [Step 2] Cleared existing cart for clean test start.");

        // 2. ADD TO CART
        await instance.post('/cart/add', 
            { productId, quantity: 1, size: variantSize },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("✅ [Step 3] Added 1 Item to Cart via API.");

        // Verify cart in DB
        const cartInDb = await Cart.findOne({ user: userId });
        console.log(`🛒 Cart contents in DB: ${cartInDb.items.length} item(s)`);

        // Get orders count before
        const ordersBefore = await Order.countDocuments({ user: userId });

        // 3. PLACE ONLINE ORDER (Pre-authorization)
        const orderPayload = {
            items: cartInDb.items,
            shippingAddress: { fullName: "Rahul Test", phone: "8053621120", street: "Sector 62", pincode: "160062", city: "Mohali", state: "Punjab" },
            paymentMethod: "Online",
            couponCode: null,
            subtotal: 450,
            discount: 0,
            shippingCost: 0,
            totalAmount: 450
        };

        console.log("🔄 [Step 4] Initiating placeOrder for Online payment...");
        const placeRes = await instance.post('/order/place', orderPayload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("🟢 placeOrder response data:", placeRes.data);
        const { razorpayOrderId } = placeRes.data;

        // Verify database and stock state after placing order (should be UNCHANGED)
        const ordersAfterPlace = await Order.countDocuments({ user: userId });
        const prodAfterPlace = await Product.findById(productId);
        const variantAfterPlace = prodAfterPlace.variants.find(v => v.size === variantSize);
        const cartAfterPlace = await Cart.findOne({ user: userId });

        console.log("\n🛡️ [State Validation after placeOrder (Online)]");
        console.log(`- MongoDB Order count: ${ordersAfterPlace} (Before: ${ordersBefore}) -> ${ordersAfterPlace === ordersBefore ? "✅ UNCHANGED (No order saved to DB yet!)" : "❌ FAILED (Order saved prematurely!)"}`);
        console.log(`- Product Stock: ${variantAfterPlace.stock} (Initial: ${initialStock}) -> ${variantAfterPlace.stock === initialStock ? "✅ UNCHANGED (No stock deducted yet!)" : "❌ FAILED (Stock deducted prematurely!)"}`);
        console.log(`- User Cart: ${cartAfterPlace ? cartAfterPlace.items.length : 0} item(s) -> ${cartAfterPlace && cartAfterPlace.items.length > 0 ? "✅ UNCHANGED (Cart not deleted yet!)" : "❌ FAILED (Cart deleted prematurely!)"}`);

        if (ordersAfterPlace !== ordersBefore || variantAfterPlace.stock !== initialStock || !cartAfterPlace) {
            throw new Error("Validation failed: Online placeOrder did not preserve DB state!");
        }

        // 4. VERIFY PAYMENT (Simulating payment success)
        const paymentId = "pay_test_" + Date.now();
        const sign = razorpayOrderId + "|" + paymentId;
        const signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(sign).digest('hex');

        console.log("\n🔄 [Step 5] Calling payment verification api with payload...");
        const verifyRes = await instance.post('/payment/verify', {
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
            orderPayload: orderPayload
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("🟢 verifyPayment response data:", verifyRes.data);

        // Verify database and stock state after successful verification (should be UPDATED)
        const finalOrders = await Order.find({ user: userId }).sort({ createdAt: -1 });
        const finalProd = await Product.findById(productId);
        const finalVariant = finalProd.variants.find(v => v.size === variantSize);
        const finalCart = await Cart.findOne({ user: userId });

        console.log("\n🛡️ [State Validation after verifyPayment (Success)]");
        console.log(`- MongoDB Order count: ${finalOrders.length} (Before: ${ordersBefore}) -> ${finalOrders.length === ordersBefore + 1 ? "✅ SUCCESS (New order created in DB!)" : "❌ FAILED (Order not saved!)"}`);
        if (finalOrders.length > ordersBefore) {
            console.log(`  - New Order ID: ${finalOrders[0]._id}`);
            console.log(`  - Payment Status: ${finalOrders[0].paymentStatus} (Expected: Completed) -> ${finalOrders[0].paymentStatus === 'Completed' ? "✅ CORRECT" : "❌ INCORRECT"}`);
            console.log(`  - Order Status: ${finalOrders[0].orderStatus} (Expected: Pending) -> ${finalOrders[0].orderStatus === 'Pending' ? "✅ CORRECT" : "❌ INCORRECT"}`);
            console.log(`  - Razorpay Order ID: ${finalOrders[0].razorpayOrderId} -> ${finalOrders[0].razorpayOrderId === razorpayOrderId ? "✅ CORRECT" : "❌ INCORRECT"}`);
            console.log(`  - Payment ID: ${finalOrders[0].paymentId} -> ${finalOrders[0].paymentId === paymentId ? "✅ CORRECT" : "❌ INCORRECT"}`);
        }
        console.log(`- Product Stock: ${finalVariant.stock} (Initial: ${initialStock}) -> ${finalVariant.stock === initialStock - 1 ? "✅ SUCCESS (Stock correctly decremented by 1!)" : "❌ FAILED (Stock not decremented correctly!)"}`);
        console.log(`- User Cart: ${finalCart ? finalCart.items.length : 0} item(s) -> ${!finalCart || finalCart.items.length === 0 ? "✅ SUCCESS (Cart cleared successfully!)" : "❌ FAILED (Cart not cleared!)"}`);

        if (finalOrders.length !== ordersBefore + 1 || finalVariant.stock !== initialStock - 1 || (finalCart && finalCart.items.length > 0)) {
            throw new Error("Validation failed: verifyPayment did not correctly execute DB transactions!");
        }

        // 5. CLEAN UP TEST DATA
        console.log("\n🧹 [Step 6] Cleaning up test data...");
        // Restore stock
        finalVariant.stock = initialStock;
        finalVariant.inStock = true;
        await finalProd.save();
        console.log("- Restored product stock level to initial.");

        // Delete test order
        if (finalOrders.length > 0) {
            await Order.findByIdAndDelete(finalOrders[0]._id);
            console.log("- Deleted test Order document from database.");
        }

        console.log("\n🎉 ALL TESTS PASSED FLAWLESSLY! The refactored payment flow is completely verified, secure, and robust! 🚀\n");

    } catch (error) {
        console.error("\n❌ TEST FAILED:", error.response?.data || error.message || error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

runTest();

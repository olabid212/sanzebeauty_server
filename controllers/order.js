const Order = require("../models/Order.js");
const User = require("../models/User.js");
const Stripe = require('stripe');
const asyncHandler = require('express-async-handler');

const currency = 'usd';
const deliveryCharge = 25;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Place order using Cash on Delivery (COD) method
const placeOrder = asyncHandler(async (req, res) => {
    const { userId, items, amount, address } = req.body;

    const orderData = {
        userId,
        items,
        address,
        amount,
        paymentMethod: "COD",
        payment: false,
        status: "Pending",
        date: Date.now(),
    };

    const newOrder = new Order(orderData);
    await newOrder.save();

    // Clear the user's cart after placing the order
    await User.findByIdAndUpdate(userId, { cartData: {} });

    res.status(201).json({ success: true, message: "Order Placed" });
});

// Place order using Stripe payment method
const placeOrderStripe = asyncHandler(async (req, res) => {
    const { userId, items, amount, address } = req.body;
    const origin = req.headers.origin || 'http://localhost:3000';

    const orderData = {
        userId,
        items,
        address,
        amount,
        paymentMethod: "Stripe",
        payment: false,
        status: "Pending",
        date: Date.now(),
    };

    const newOrder = new Order(orderData);
    await newOrder.save();

    const line_items = items.map((item) => ({
        price_data: {
            currency: currency,
            product_data: {
                name: item.name,
            },
            unit_amount: item.price * 100,
        },
        quantity: item.quantity,
    }));

    line_items.push({
        price_data: {
            currency: currency,
            product_data: {
                name: 'Delivery Charges',
            },
            unit_amount: deliveryCharge * 100,
        },
        quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
        success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
        cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
        line_items,
        mode: 'payment',
    });

    // Return session URL and order ID for easier testing
    res.json({ success: true, session_url: session.url, orderId: newOrder._id });
});



// Verify Stripe payment
const verifyStripe = asyncHandler(async (req, res) => {
    const { orderId, success, userId } = req.body;

    if (success === "true") {
        await Order.findByIdAndUpdate(orderId, { payment: true });
        await User.findByIdAndUpdate(userId, { cartData: {} });
        res.json({ success: true });
    } else {
        await Order.findByIdAndDelete(orderId);
        res.json({ success: false });
    }
});

// Retrieve all orders for the Admin Panel
const allOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({});
    res.json({ success: true, orders });
});

// Retrieve user-specific orders
const userOrders = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    const orders = await Order.find({ userId });
    res.json({ success: true, orders });
});

// Update order status from the Admin Panel
const updateStatus = asyncHandler(async (req, res) => {
    const { orderId, status } = req.body;

    await Order.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: 'Status Updated' });
});

module.exports = { verifyStripe, placeOrder, placeOrderStripe, allOrders, userOrders, updateStatus };

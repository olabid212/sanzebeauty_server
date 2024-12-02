// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const {
    placeOrder,
    placeOrderStripe,
    verifyStripe,
    allOrders,
    userOrders,
    updateStatus,
} = require("../controllers/order");
const { protect, admin } = require("../middleware/auth");

// Place order using Cash on Delivery (COD) method
router.post("/place", protect, placeOrder);

// Place order using Stripe payment method
router.post("/stripe", protect, placeOrderStripe);

// Verify Stripe payment
router.post("/verify", protect, verifyStripe);

// Retrieve all orders for Admin Panel (admin-only route)
router.get("/all", protect, admin, allOrders);

// Retrieve specific user's orders
router.get("/user", protect, userOrders);

// Update order status (admin-only route)
router.put("/status", protect, admin, updateStatus);

module.exports = router;

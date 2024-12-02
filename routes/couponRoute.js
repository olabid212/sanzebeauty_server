const express = require("express");
const router = express.Router();
const {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    applyCoupon
} = require("../controllers/coupon");
const { protect, admin } = require("../middleware/auth");

// Create a new coupon (admin only)
router.post("/add", protect, admin, createCoupon);

// Get all coupons (admin only)
router.get("/all", protect, admin, getAllCoupons);

// Get a single coupon by ID (admin only)
router.get("/:couponId", protect, admin, getCouponById);

// Update a coupon (admin only)
router.put("/:couponId", protect, admin, updateCoupon);

// Delete a coupon (admin only)
router.delete("/:couponId", protect, admin, deleteCoupon);

// Apply a coupon (accessible to authenticated users)
router.post("/apply", protect, applyCoupon);

module.exports = router;

const asyncHandler = require("express-async-handler");
const Coupon = require("../models/Coupon");

// Create a new coupon
const createCoupon = asyncHandler(async (req, res) => {
    const { code, discountValue, discountType, expirationDate, minPurchaseAmount, applicableCategories, applicableProducts, isActive } = req.body;

    // Check if the coupon code already exists
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
        return res.status(400).json({ success: false, message: "Coupon code already exists" });
    }

    const coupon = new Coupon({ code, discountValue, discountType, expirationDate, minPurchaseAmount, applicableCategories, applicableProducts, isActive });
    await coupon.save();

    res.status(201).json({ success: true, coupon });
});

// Get all coupons
const getAllCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find({});
    res.json({ success: true, coupons });
});

// Get a single coupon by ID
const getCouponById = asyncHandler(async (req, res) => {
    const { couponId } = req.params;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
        return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    res.json({ success: true, coupon });
});

// Update a coupon
const updateCoupon = asyncHandler(async (req, res) => {
    const { couponId } = req.params;
    const { code, discountValue, discountType, expirationDate, minPurchaseAmount, applicableCategories, applicableProducts, isActive } = req.body;

    const coupon = await Coupon.findByIdAndUpdate(
        couponId,
        { code, discountValue, discountType, expirationDate, minPurchaseAmount, applicableCategories, applicableProducts, isActive },
        { new: true, runValidators: true }
    );

    if (!coupon) {
        return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    res.json({ success: true, coupon });
});

// Delete a coupon
const deleteCoupon = asyncHandler(async (req, res) => {
    const { couponId } = req.params;

    const coupon = await Coupon.findByIdAndDelete(couponId);
    if (!coupon) {
        return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    res.json({ success: true, message: "Coupon deleted successfully" });
});

// Apply a coupon to an order (for calculating the discounted price)
const applyCoupon = asyncHandler(async (req, res) => {
    const { code, orderTotal, categoryId, productId } = req.body;

    const coupon = await Coupon.findOne({ code, isActive: true });
    if (!coupon || new Date() > coupon.expirationDate) {
        return res.status(400).json({ success: false, message: "Invalid or expired coupon" });
    }

    // Check if coupon is applicable to the given category or product
    const isApplicable = await Coupon.isCouponApplicable(coupon._id, categoryId, productId);
    if (!isApplicable) {
        return res.status(400).json({ success: false, message: "Coupon not applicable to this category or product" });
    }

    // Calculate discount
    let discountAmount;
    if (coupon.discountType === 'percentage') {
        discountAmount = (orderTotal * coupon.discountValue) / 100;
    } else {
        discountAmount = coupon.discountValue;
    }

    const discountedTotal = Math.max(orderTotal - discountAmount, 0); // Ensure total is not negative

    res.json({ success: true, discountAmount, discountedTotal });
});

module.exports = {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    applyCoupon
};

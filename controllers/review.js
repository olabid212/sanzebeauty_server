const asyncHandler = require("express-async-handler");
const Review = require("../models/Review");

// Create a new review
const createReview = asyncHandler(async (req, res) => {
    const { service, rating, comment } = req.body;
    const userId = req.user._id; // Assuming `req.user` is populated by `protect` middleware

    const review = new Review({
        service,
        user: userId,
        rating,
        comment,
    });

    await review.save();
    res.status(201).json({ success: true, review });
});

// Get all reviews for a specific service
const getServiceReviews = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    const reviews = await Review.find({ service: serviceId }).populate("user", "name");
    res.json({ success: true, reviews });
});

// Get all reviews written by a specific user
const getUserReviews = asyncHandler(async (req, res) => {
    const userId = req.params.userId;

    const reviews = await Review.find({ user: userId }).populate("service", "name");
    res.json({ success: true, reviews });
});

// Update a review
const updateReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    const review = await Review.findOne({ _id: reviewId, user: userId });

    if (!review) {
        return res.status(404).json({ success: false, message: "Review not found" });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    res.json({ success: true, review });
});

// Delete a review
const deleteReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const userId = req.user._id;

    // Check if the review exists and if the user is the owner or an admin
    const review = await Review.findById(reviewId);
    if (!review) {
        return res.status(404).json({ success: false, message: "Review not found" });
    }

    if (review.user.toString() !== userId.toString() && !req.user.isAdmin) {
        return res.status(403).json({ success: false, message: "Not authorized to delete this review" });
    }

    await review.remove();
    res.json({ success: true, message: "Review deleted successfully" });
});

// Get all reviews across all services (for admin or site-wide view)
const getAllReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({}).populate("user", "name").populate("service", "name");
    res.json({ success: true, reviews });
});

module.exports = {
    createReview,
    getServiceReviews,
    getUserReviews,
    updateReview,
    deleteReview,
    getAllReviews
};

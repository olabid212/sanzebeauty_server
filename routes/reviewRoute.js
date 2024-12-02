const express = require("express");
const router = express.Router();
const {
    createReview,
    getServiceReviews,
    getUserReviews,
    updateReview,
    deleteReview,
    getAllReviews
} = require("../controllers/review");
const { protect, admin } = require("../middleware/auth");

// Create a review
router.post("/", protect, createReview);

// Get all reviews for a specific service
router.get("/service/:serviceId", getServiceReviews);

// Get all reviews written by a specific user
router.get("/user/:userId",protect, getUserReviews);

// Update a review
router.put("/:reviewId", protect, updateReview);

// Delete a review
router.delete("/:reviewId", protect, deleteReview);

// Get all reviews across all services (admin-only route)
router.get("/all", protect, admin, getAllReviews);

module.exports = router;

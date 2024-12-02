// routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const { addToCart, updateCart, getUserCart } = require("../controllers/cart");
const { protect } = require("../middleware/auth");

// Route to add a product to the cart
router.post("/add", protect, addToCart);

// Route to update the quantity of a specific product in the cart
router.put("/update", protect, updateCart);

// Route to get the user's cart data
router.get("/user", protect, getUserCart);

module.exports = router;

const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth"); // Import protect and admin middleware
const handleUploads = require("../middleware/upload"); // Import image upload middleware
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/product");

// Route to create a new product (admin only)
router.post("/add", protect, admin, handleUploads, createProduct);

// Route to get all products (public)
router.get("/all", getAllProducts);

// Route to get a single product by ID (public)
router.get("/:id", getProductById);

// Route to update a product by ID (admin only)
router.put("/:id", protect, admin, handleUploads, updateProduct);

// Route to delete a product by ID (admin only)
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;

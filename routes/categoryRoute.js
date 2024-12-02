const express = require('express');
const router = express.Router();
const {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} = require('../controllers/category');
const { protect, admin } = require('../middleware/auth'); 


// Route to create a new category (admin access)
router.post('/', protect, admin, createCategory);

// Route to get all categories
router.get('/', getAllCategories);

// Route to get a single category by ID
router.get('/:id', getCategoryById);

// Route to update a category by ID (admin access)
router.put('/:id', protect, admin, updateCategory);

// Route to delete a category by ID (admin access)
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;

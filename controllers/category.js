const expressAsyncHandler = require('express-async-handler');
const Category = require('../models/Category');

// Controller to create a new category
const createCategory = expressAsyncHandler(async (req, res) => {
    const { name, description, parentCategory } = req.body;

    // Check if the category name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
        return res.status(400).json({ success: false, message: 'Category name must be unique' });
    }

    // Create a new category
    const category = new Category({
        name,
        description,
        parentCategory: parentCategory || null,
    });

    await category.save();
    res.status(201).json({ success: true, message: 'Category created successfully', category });
});

// Controller to get all categories
const getAllCategories = expressAsyncHandler(async (req, res) => {
    const categories = await Category.find().populate('parentCategory', 'name');
    res.status(200).json({ success: true, data: categories });
});

// Controller to get a single category by ID
const getCategoryById = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await Category.findById(id).populate('parentCategory', 'name');
    if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({ success: true, data: category });
});

// Controller to update a category by ID
const updateCategory = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, parentCategory } = req.body;

    const category = await Category.findById(id);
    if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Update fields
    category.name = name || category.name;
    category.description = description || category.description;
    category.parentCategory = parentCategory || category.parentCategory;

    await category.save();
    res.status(200).json({ success: true, message: 'Category updated successfully', category });
});

// Controller to delete a category by ID
const deleteCategory = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await category.deleteOne();
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
});

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};

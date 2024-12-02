const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");

// Create a new product
exports.createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, category, sizes, bestseller, stock } = req.body;
  
    // Check for required fields
    if (!name || !description || !price || !category || !sizes || !stock) {
      return res.status(400).json({
        success: false,
        message: "Name, description, price, category, sizes, and stock are required",
      });
    }
  
    // Create the product
    const product = await Product.create({
      name,
      description,
      price,
      images: req.files ? req.files.map(file => file.path) : [], // Map file paths to the images field
      category,
      sizes,
      bestseller,
      stock,
    });
  
    res.status(201).json({
      success: true,
      data: product,
    });
  });

// Get all products
exports.getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  res.status(200).json({
    success: true,
    data: products,
  });
});

// Get a single product by ID
exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.status(200).json({
    success: true,
    data: product,
  });
});

// Update a product by ID
exports.updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, sizes, bestseller, stock } = req.body;
  
    // Find the product by ID
    const product = await Product.findById(id);
  
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
  
    // Update fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.sizes = sizes || product.sizes;
    product.bestseller = bestseller !== undefined ? bestseller : product.bestseller;
    product.stock = stock || product.stock;
  
    // Handle images if new files are uploaded
    if (req.files && req.files.length > 0) {
      product.images = req.files.map(file => file.path);
    }
  
    // Save the updated product
    const updatedProduct = await product.save();
  
    res.status(200).json({
      success: true,
      data: updatedProduct,
    });
  });

// Delete a product by ID
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

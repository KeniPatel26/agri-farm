const Product = require('../models/Product');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get all products for logged-in retailer
// @route   GET /api/v1/products
// @access  Private (Retailer/Admin)
const getProducts = async (req, res, next) => {
  try {
    const filter = req.user.role === 'Admin' ? {} : { retailerId: req.user._id };
    const products = await Product.find(filter).sort({ createdAt: -1 });
    return successResponse(res, products, "Retailer's products fetched successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products publicly (for farmers browsing with search, filter, and sort)
// @route   GET /api/v1/products/all
// @access  Public / Private
const getAllProducts = async (req, res, next) => {
  try {
    const { category, search, sort, minPrice, maxPrice } = req.query;
    const query = { available: true };

    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };
    if (sort === 'popular') sortOption = { stock: -1 };

    const products = await Product.find(query)
      .populate('retailerId', 'name mobileNumber location verificationStatus address')
      .sort(sortOption);

    return successResponse(res, products, 'Products fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/v1/products/:id
// @access  Public / Private
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'retailerId',
      'name mobileNumber location verificationStatus address'
    );
    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }
    return successResponse(res, product, 'Product details retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new product
// @route   POST /api/v1/products
// @access  Private (Retailer)
const addProduct = async (req, res, next) => {
  try {
    const { name, category, price, stock, description, unit, imageUrl } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return errorResponse(res, 'Please provide product name, price, and stock quantity', 400);
    }

    const product = await Product.create({
      retailerId: req.user._id,
      name: name.trim(),
      category: category || 'Other',
      price: Number(price),
      stock: Number(stock),
      description: description ? description.trim() : '',
      unit: unit || 'kg',
      available: Number(stock) > 0,
      imageUrl: imageUrl || '',
    });

    return successResponse(res, product, 'Product added successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/v1/products/:id
// @access  Private (Retailer/Admin)
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    if (product.retailerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return errorResponse(res, 'Not authorized to modify this product', 403);
    }

    // Auto-update availability based on stock
    if (req.body.stock !== undefined) {
      req.body.available = Number(req.body.stock) > 0;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return successResponse(res, updated, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/v1/products/:id
// @access  Private (Retailer/Admin)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    if (product.retailerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return errorResponse(res, 'Not authorized to delete this product', 403);
    }

    await product.deleteOne();
    return successResponse(res, { id: req.params.id }, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};

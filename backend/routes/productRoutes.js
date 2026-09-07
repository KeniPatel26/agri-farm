const express = require('express');
const router = express.Router();
const {
  getProducts,
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
} = require('../controller/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Public browse (all authenticated roles can see)
router.get('/all', getAllProducts);
router.get('/:id/details', getProductById);

// Retailer / Admin product management
router.route('/')
  .get(authorize('Retailer', 'Admin'), getProducts)
  .post(authorize('Retailer', 'Admin'), addProduct);

router.route('/:id')
  .get(getProductById)
  .put(authorize('Retailer', 'Admin'), updateProduct)
  .delete(authorize('Retailer', 'Admin'), deleteProduct);

module.exports = router;

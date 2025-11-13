const express = require('express');
const { body } = require('express-validator');
const productController = require('../controllers/product.controller');
const { verifyToken, authorize } = require('../../../../shared');

const router = express.Router();

// Public routes
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getProductById);

// Protected routes - Customer can add reviews
router.post('/:id/reviews',
  verifyToken,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString().withMessage('Comment must be a string')
  ],
  productController.addReview
);

// Protected routes - Seller and Admin only (All JSON)
router.post('/',
  verifyToken,
  authorize('seller', 'admin'),
  productController.createProduct
);

router.put('/:id',
  verifyToken,
  authorize('seller', 'admin'),
  productController.updateProduct
);

router.delete('/:id',
  verifyToken,
  authorize('seller', 'admin'),
  productController.deleteProduct
);

router.get('/seller/my-products',
  verifyToken,
  authorize('seller', 'admin'),
  productController.getProductsBySeller
);

router.get('/seller/:sellerId',
  productController.getProductsBySeller
);

module.exports = router;

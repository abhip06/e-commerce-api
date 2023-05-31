const express = require('express');
const { getAllProducts,
        createProduct,
        deleteProduct,
        updateProduct,
        getProductDetails,
        createProductReview,
        deleteProductReview,
        getProductReviews, 
    } = require('../controllers/productController');
        
const { isAuthenticatedUser, authorizedRole } = require('../middleware/auth');

const router = express.Router();

router.route('/products').get(getAllProducts);

router.route('/admin/product/new').post(isAuthenticatedUser, authorizedRole("admin"), createProduct);

router.route('/admin/product/:id')
    .delete(isAuthenticatedUser, authorizedRole("admin"), deleteProduct)
    .put(isAuthenticatedUser, authorizedRole("admin"), updateProduct);
    
router.route('/product/review').put(isAuthenticatedUser, createProductReview);

router.route('/product/reviews').delete(isAuthenticatedUser, deleteProductReview).get(isAuthenticatedUser, getProductReviews);

router.route('/product/:id').get(getProductDetails);

module.exports = router;
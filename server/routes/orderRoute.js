const express = require('express');
const { newOrder, getSingleOrder, myOrders, getAllOrders, updateOrderStatus, deleteOrder } = require('../controllers/orderController');
const router = express.Router();

const { isAuthenticatedUser, authorizedRole } = require('../middleware/auth');

router.route('/order/new').post(isAuthenticatedUser, newOrder);

router.route('/orders/:id').get(isAuthenticatedUser, getSingleOrder);

router.route('/my-orders').get(isAuthenticatedUser, myOrders);

router.route('/admin/orders').get(isAuthenticatedUser, authorizedRole("admin"), getAllOrders);

router.route('/admin/order/:id')
    .put(isAuthenticatedUser, authorizedRole("admin"), updateOrderStatus)
    .delete(isAuthenticatedUser, authorizedRole("admin"), deleteOrder);

module.exports = router;
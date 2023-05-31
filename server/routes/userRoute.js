const express = require('express');
const { registerUser, loginUser, logoutUser, getUserDetails, updateUserProfile, updateUserPassword, getAllUsers, getSingleUser, updateUserRole, deleteUser } = require('../controllers/userController');
const { isAuthenticatedUser, authorizedRole } = require('../middleware/auth');

const router = express.Router();

router.route('/register').post(registerUser);

router.route('/login').post(loginUser);

router.route('/logout').get(logoutUser);

router.route('/user').get(isAuthenticatedUser, getUserDetails);

router.route('/user/password/update').put(isAuthenticatedUser, updateUserPassword);

router.route('/user/profile/update').put(isAuthenticatedUser, updateUserProfile);

router.route('/admin/users').get(isAuthenticatedUser, authorizedRole("admin"), getAllUsers);

router.route('/admin/user/:id')
    .get(isAuthenticatedUser, authorizedRole("admin"), getSingleUser)
    .put(isAuthenticatedUser, authorizedRole("admin"), updateUserRole)
    .delete(isAuthenticatedUser, authorizedRole("admin"), deleteUser);

module.exports = router;
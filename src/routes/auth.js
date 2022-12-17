const express = require('express');
const authController = require('../controllers/auth');
const { verifyAccessToken } = require('../middlewares/auth');
const router = express.Router();

router.post('/signin', authController.login);
router.post('/signup', authController.signup);
router.post('/refresh', authController.refreshToken);
router.get('/me', verifyAccessToken, authController.getMyUserInfo);

module.exports = router;

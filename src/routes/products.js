const express = require('express');
const productsController = require('../controllers/products');
const { verifyAccessToken } = require('../middlewares/auth');
const router = express.Router();
const RESOURCE_ROUTE = '/products';

router.get(RESOURCE_ROUTE, productsController.getProductList);

router.post(
  RESOURCE_ROUTE,
  verifyAccessToken,
  productsController.createProduct
);

router.get(
  `${RESOURCE_ROUTE}/:productId`,
  verifyAccessToken,
  productsController.getProduct
);

router.put(
  `${RESOURCE_ROUTE}/:productId`,
  verifyAccessToken,
  productsController.updateProduct
);

router.delete(
  `${RESOURCE_ROUTE}/:productId`,
  verifyAccessToken,
  productsController.deleteProduct
);

router.patch(
  `${RESOURCE_ROUTE}/:productId`,
  verifyAccessToken,
  productsController.activateProduct
);

module.exports = router;

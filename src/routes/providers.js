const express = require('express');
const router = express.Router();
const providersController = require('../controllers/providers');
const { verifyAccessToken } = require('../middlewares/auth');
const RESOURCE_ROUTE = '/providers';

router.get(
  RESOURCE_ROUTE,
  verifyAccessToken,
  providersController.getProviderList
);

router.get(
  `${RESOURCE_ROUTE}/:providerId`,
  verifyAccessToken,
  providersController.getProvider
);

router.post(
  RESOURCE_ROUTE,
  verifyAccessToken,
  providersController.createProvider
);

router.put(
  `${RESOURCE_ROUTE}/:providerId`,
  verifyAccessToken,
  providersController.updateProvider
);

router.delete(
  `${RESOURCE_ROUTE}/:providerId`,
  providersController.deleteProvider
);

router.patch(
  `${RESOURCE_ROUTE}/:providerId`,
  providersController.activateProvider
);

module.exports = router;

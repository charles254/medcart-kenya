const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/search', productController.search);
router.get('/product/:slug', productController.show);

module.exports = router;

const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

router.get('/api/search', apiController.search);
router.get('/api/products', apiController.products);
router.post('/api/cart/add', apiController.cartAdd);

module.exports = router;

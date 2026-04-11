const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/cart', cartController.show);
router.post('/cart/add', cartController.add);
router.post('/cart/update', cartController.update);
router.post('/cart/remove', cartController.remove);

module.exports = router;

const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');

router.get('/brands', brandController.index);
router.get('/brand/:slug', brandController.show);

module.exports = router;

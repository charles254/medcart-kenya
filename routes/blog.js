const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

router.get('/blog', blogController.index);
router.get('/blog/category/:category', blogController.category);
router.get('/blog/:slug', blogController.show);

module.exports = router;

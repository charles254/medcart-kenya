const router = require('express').Router();
const pagesController = require('../controllers/pagesController');

router.get('/about', pagesController.about);
router.get('/privacy', pagesController.privacy);
router.get('/terms', pagesController.terms);
router.get('/cookies', pagesController.cookies);
router.get('/sitemap', pagesController.sitemap);
router.get('/sitemap.xml', pagesController.sitemapXml);

module.exports = router;

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const expressLayouts = require('express-ejs-layouts');
const rateLimit = require('express-rate-limit');

// Middleware
const cartMiddleware = require('./middleware/cartMiddleware');
const { notFound, serverError } = require('./middleware/errorHandler');
const { sanitizeQuery } = require('./middleware/validation');
const { pageCache } = require('./middleware/pageCache');

// Routes
const indexRoutes = require('./routes/index');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const brandRoutes = require('./routes/brands');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
const dealRoutes = require('./routes/deals');
const apiRoutes = require('./routes/api');
const pageRoutes = require('./routes/pages');
const blogRoutes = require('./routes/blog');

const app = express();
const PORT = process.env.PORT || 3000;

// Remove X-Powered-By header
app.disable('x-powered-by');

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Security: Enhanced Helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://www.google-analytics.com", "https://analytics.google.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xContentTypeOptions: true,
  xDnsPrefetchControl: true,
  xFrameOptions: { action: 'deny' },
}));

// Security: Additional headers
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Trust proxy (Apache reverse proxy sets X-Forwarded-For)
app.set('trust proxy', 1);

// Security: Rate limiting (per real client IP via X-Forwarded-For)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
});

app.use(generalLimiter);
app.use('/api', strictLimiter);
app.use('/cart', strictLimiter);
app.use('/checkout', strictLimiter);

app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing with size limits
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));

// WebP auto-serve: serve .webp when browser supports it and file exists
const fs = require('fs');
app.use('/images/products', (req, res, next) => {
  const accepts = req.headers.accept || '';
  if (accepts.includes('image/webp') && (req.path.endsWith('.jpg') || req.path.endsWith('.jpeg') || req.path.endsWith('.png'))) {
    const webpPath = req.path.replace(/\.(jpg|jpeg|png)$/, '.webp');
    const fullPath = path.join(__dirname, 'public', 'images', 'products', webpPath);
    if (fs.existsSync(fullPath)) {
      res.type('image/webp');
      return res.sendFile(fullPath);
    }
  }
  next();
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Security: Input sanitization
app.use(sanitizeQuery);

// Session with hardened cookie config
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.sqlite3',
    dir: path.join(__dirname, 'database'),
  }),
  secret: process.env.SESSION_SECRET || 'pharmacy-ecommerce-secret-key',
  resave: false,
  saveUninitialized: false,
  name: 'afyacart.sid',
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day (reduced from 7 days)
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
}));

// Cart middleware - attach cart info to all views
app.use(cartMiddleware);

// Page cache - serves cached HTML for repeat requests (5 min TTL)
app.use(pageCache(5 * 60 * 1000));

// Mount routes
app.use(indexRoutes);
app.use(productRoutes);
app.use(categoryRoutes);
app.use(brandRoutes);
app.use(cartRoutes);
app.use(checkoutRoutes);
app.use(dealRoutes);
app.use(apiRoutes);
app.use(blogRoutes);
app.use(pageRoutes);

// Error handlers
app.use(notFound);
app.use(serverError);

app.listen(PORT, () => {
  console.log(`Pharmacy e-commerce server running on http://localhost:${PORT}`);
});

module.exports = app;

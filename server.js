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
      scriptSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"],
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

// Security: Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
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
  name: 'medcart.sid',
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day (reduced from 7 days)
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
}));

// Cart middleware - attach cart info to all views
app.use(cartMiddleware);

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

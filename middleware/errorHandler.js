function notFound(req, res, next) {
  res.status(404).render('pages/404', {
    title: 'Page Not Found',
  });
}

function serverError(err, req, res, next) {
  console.error('Server Error:', err.stack || err);
  res.status(500).render('pages/500', {
    title: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err : { message: 'An unexpected error occurred.' },
  });
}

module.exports = {
  notFound,
  serverError,
};

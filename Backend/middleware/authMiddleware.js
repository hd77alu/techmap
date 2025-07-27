exports.ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  
  // Handle AJAX requests
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  res.redirect('/');
};
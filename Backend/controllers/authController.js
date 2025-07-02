// Authentication handled by Passport; no extra logic here
exports.postLogin = (req, res) => res.redirect('/dashboard');
exports.logout = (req, res) => { req.logout(); res.redirect('/'); };
const router = require('express').Router();
const passport = require('../config/passportSetup');

router.get('/google', passport.authenticate('google', { scope: ['profile','email'] }));
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Successful authentication, redirect to dashboard
        res.redirect('/dashboard');
    }
);

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/'); // Redirect to welcome page
    });
});
module.exports = router;
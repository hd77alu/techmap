const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');
require('dotenv').config();

// Force HTTPS callback URL in production
const getCallbackURL = () => {
    if (process.env.NODE_ENV === 'production') {
        return 'https://techmap-sy4z.onrender.com/auth/google/callback';
    }
    return '/auth/google/callback'; // Relative URL for development
};

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: getCallbackURL()
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await User.findOrCreate(profile);
    return done(null, user);
  } catch (err) {
    done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
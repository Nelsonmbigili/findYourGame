import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import mongoose from 'mongoose';
import { generateUniqueUsername } from './auth.mjs';

const User = mongoose.model('User');

// Configure the Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/oauth2/redirect/google",
  scope: ['profile', 'email']
},
async (accessToken, refreshToken, profile, cb) => {
  // This is the "verify" function. It finds or creates a user.
  try {
    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: profile.id });
    if (user) {
      return cb(null, user); // User found, log them in.
    }

    // No user with Google ID. Check if user exists with that email.
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    if (email) {
      user = await User.findOne({ email: email });
      if (user) {
        // Email found. Link this Google ID to their existing account.
        user.googleId = profile.id;
        await user.save();
        return cb(null, user); 
      }
    }

    // No user found. Create a new user.
    const username = await generateUniqueUsername(profile.name.givenName);
    const newUser = new User({
      googleId: profile.id,
      email: email,
      username: username,
      name: {
        firstName: profile.name.givenName || 'User',
        secondName: profile.name.familyName || 'Name',
        preferredName: profile.name.givenName || 'User'
      }

    });

    await newUser.save();
    return cb(null, newUser); 

  } catch (err) {
    return cb(err);
  }
}));

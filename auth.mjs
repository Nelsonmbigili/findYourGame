import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import validator from 'validator';
import crypto from 'crypto';

const User = mongoose.model('User');

const generateUsername = (firstName) => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${firstName.toLowerCase()}${randomNum}`;
};

const generateUniqueUsername = async (firstName) => {
  let username;
  let exists = true;

  while (exists) {
    username = generateUsername(firstName);
    const user = await User.findOne({ username });
    if (!user) exists = false;
  }

  return username;
};


const startAuthenticatedSession = (req, user) => {
  return new Promise((fulfill, reject) => {
    req.session.regenerate((err) => {
      if (!err) {
        req.session.user = user; 
        fulfill(user);
      } else {
        reject(err);
      }
    });
  });
};

const endAuthenticatedSession = req => {
  return new Promise((fulfill, reject) => {
    req.session.destroy(err => err ? reject(err) : fulfill(null));
  });
};

const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};


const hashPassword = async (password) => {
  if (!password || password.length < 9) {
    throw { message: 'Password must be at least 9 characters long.' };
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

const generatePasswordResetToken = async (user) => {
  // Random, unhashed token for the email link
  const unhashedToken = crypto.randomBytes(32).toString('hex');

  // Hashed the token for  the database
  const resetToken = crypto
    .createHash('sha256')
    .update(unhashedToken)
    .digest('hex');
  
  // Set expiry for 10 minutes from now
  const resetTokenExpiry = Date.now() + (10 * 60 * 1000);

  // Save token and expiry to the user
  user.resetToken = resetToken;
  user.resetTokenExpiry = resetTokenExpiry;
  await user.save();

  // Return the *unhashed* token for the email
  return unhashedToken;
};

const validatePasswordResetToken = async (unhashedToken) => {
  // 1. Hash the token from the URL to match the one in the DB
  const resetToken = crypto
    .createHash('sha256')
    .update(unhashedToken)
    .digest('hex');

  // 2. Find the user with this token AND make sure it hasn't expired
  const user = await User.findOne({
    resetToken: resetToken,
    resetTokenExpiry: { $gt: Date.now() } // $gt means "greater than"
  });

  return user; // Will be the user object or null
};

const resetUserPassword = async (user, newPassword, confirmPassword) => {
  // 1. Validate passwords
  if (newPassword !== confirmPassword) {
    throw { message: 'Passwords do not match.' };
  }
  
  // 2. Hash the new password (this also checks length)
  user.password = await hashPassword(newPassword);

  // 3. Clear the reset token fields
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;

  // 4. Save the user
  await user.save();
};


const signup = async (names, email, password) => {
  // Validate names
  if (!names || !names.firstName || !names.secondName) {
    throw { message: 'FIRST and SECOND NAME ARE REQUIRED' };
  }

  if (!validator.isEmail(email)) {
    throw { message: 'INVALID EMAIL FORMAT' };
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw { message: 'USER WITH EMAIL ALREADY EXISTS' };
  }

  const hash = await hashPassword(password);

  // generate random username
  const username = await generateUniqueUsername(names.firstName);

  const newUser = new User({
    name: {
      firstName: names.firstName,
      secondName: names.secondName,
      preferredName: names.preferredName,
    },
    email,
    username, 
    password: hash,
  });

  await newUser.save();

  return newUser;
};


const signin = async (email, password) => {
  // validate email format
  if (!validator.isEmail(email)) {
    throw { message: 'INVALID EMAIL FORMAT' };
  }

  // check if user exists
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw { message: 'INVALID EMAIL OR PASSWORD' }; 
  }

   if (!user.password) {
    throw { message: 'This account uses Google/Facebook. Please sign in with that method or reset password first' };
  }

  // compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw { message: 'INVALID EMAIL OR PASSWORD' };
  }

  //  Return User
  return {
    id: user._id,
    email: user.email,
    username: user.username,
    name: user.name,
    message: "LOGIN SUCCESSFUL"
  };
};

export {
  signin,
  signup,
  startAuthenticatedSession,
  endAuthenticatedSession,
  generateUniqueUsername,
  hashPassword,
  generatePasswordResetToken,
  validatePasswordResetToken,
  resetUserPassword,
  findUserByEmail 
}




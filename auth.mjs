import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import validator from 'validator';

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

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

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
  const user = await User.findOne({ email });
  if (!user) {
    throw { message: 'INVALID EMAIL OR PASSWORD' }; 
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
  generateUniqueUsername
}




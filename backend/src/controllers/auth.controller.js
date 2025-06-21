// backend/src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppError, catchAsync } = require('../utils/errors');
const User = require('../db/models/users/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user,
    },
  });
};

const register = async (req, res, next) => {
  try {
    let { name, email, password, role = 'donor' } = req.body;

    if (!name || !email || !password) {
      return next(new AppError('Please provide name, email and password', 400));
    }

    role = role.toLowerCase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('User already exists with this email', 400));
    }

    // Pass plain password here, model pre-save hook will hash it
    const newUser = await User.create({
      name,
      email,
      password,
      role,
    });

    createSendToken(newUser, 201, res);
  } catch (error) {
    console.error('Register error:', error);
    next(error);
  }
};

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(`Login attempt for email: ${email}`);

  if (!email || !password) {
    console.log('Email or password missing');
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    console.log('User not found');
    return next(new AppError('Incorrect email or password', 401));
  }

  const isPasswordCorrect = await user.correctPassword(password, user.password);
  console.log(`Password match: ${isPasswordCorrect}`);

  if (!isPasswordCorrect) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
});


const logout = catchAsync(async (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

module.exports = {
  register,
  login,
  logout,
};

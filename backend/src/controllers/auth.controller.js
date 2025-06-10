const User = require('../models/User.model');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// REGISTER FUNCTION WITH EMAIL VERIFICATION
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      verificationToken,
      isVerified: false
    });

    await newUser.save();

    // Email transporter setup
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'shahkavya.works@gmail.com',
        pass: 'zdldalifmcbjjzhs' // Your app password
      }
    });

    const verifyLink = `http://localhost:3000/verify-email?token=${verificationToken}`;

    // Send the email
    await transporter.sendMail({
      from: '"ByteBasket" <shahkavya.works@gmail.com>',
      to: email,
      subject: 'Verify Your ByteBasket Account',
      html: `
        <h3>Hello ${name},</h3>
        <p>Click the link below to verify your email:</p>
        <a href="${verifyLink}">${verifyLink}</a>
      `
    });

    res.status(201).json({ message: 'Registered successfully. Please verify your email.' });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// LOGIN FUNCTION WITH TOKEN + SESSION SUPPORT
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Return success + token
    res.status(200).json({
      message: 'Login successful',
      token
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

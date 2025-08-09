// backend/src/services/emailService.js
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // Prefer SMTP when fully configured
  const hasSmtpCreds =
    !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS;

  if (hasSmtpCreds) {
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = port === 465; // TLS on 465
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback: Gmail via app password if provided
  if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD.replace(/\s+/g, ''),
      },
    });
  }

  // As a last resort, if in development and no creds provided, use Ethereal suggestion
  if (process.env.NODE_ENV === 'development') {
    throw new Error(
      'Email transport not configured. Provide SMTP_HOST/SMTP_USER/SMTP_PASS or EMAIL_USER/EMAIL_APP_PASSWORD.'
    );
  }

  // In production without credentials, throw explicit error
  throw new Error(
    'Email transport not configured for production. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS (or EMAIL_USER/EMAIL_APP_PASSWORD).'
  );
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
const sendVerificationEmail = async (user, verificationToken) => {
  try {
    const transporter = createTransporter();

    const verificationUrl = `${
      process.env.CLIENT_URL || 'http://localhost:3000'
    }/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: `"ByteBasket" <${process.env.EMAIL_USER || 'noreply@bytebasket.com'}>`,
      to: user.email,
      subject: 'Welcome to ByteBasket - Please Verify Your Email',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #14b8a6; margin: 0;">ByteBasket</h1>
            <p style="color: #6b7280; margin: 5px 0;">Nourishing Communities, One Byte at a Time</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="color: #111827; margin-top: 0;">Welcome to ByteBasket, ${user.name}!</h2>
            <p style="color: #374151; line-height: 1.6;">
              Thank you for signing up as a <strong>${user.role}</strong> with ByteBasket. We're excited to have you join our community in the fight against hunger.
            </p>
            <p style="color: #374151; line-height: 1.6;">
              To complete your registration and start making a difference, please verify your email address by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              If the button doesn't work, copy and paste this link into your browser:
              <br>
              <a href="${verificationUrl}" style="color: #14b8a6; word-break: break-all;">${verificationUrl}</a>
            </p>
          </div>
          
          <div style="text-align: center; color: #6b7280; font-size: 12px;">
            <p>This verification link will expire in 24 hours.</p>
            <p>If you didn't create an account with ByteBasket, please ignore this email.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV === 'development') {
      console.log('Verification email sent successfully');
      console.log('Message ID:', info.messageId);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send welcome email after verification
const sendWelcomeEmail = async user => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"ByteBasket" <${process.env.EMAIL_USER || 'noreply@bytebasket.com'}>`,
      to: user.email,
      subject: 'Welcome to ByteBasket - Your Account is Verified!',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #14b8a6; margin: 0;">🎉 Welcome to ByteBasket!</h1>
          </div>
          
          <div style="background-color: #f0fdfa; padding: 30px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #14b8a6;">
            <h2 style="color: #111827; margin-top: 0;">Congratulations, ${user.name}!</h2>
            <p style="color: #374151; line-height: 1.6;">
              Your email has been successfully verified and your ByteBasket account is now active.
            </p>
            
            <div style="margin: 25px 0;">
              <h3 style="color: #111827; margin-bottom: 10px;">What's Next?</h3>
              <ul style="color: #374151; line-height: 1.6;">
                ${
                  user.role === 'volunteer'
                    ? `
                  <li>Browse available volunteer shifts in your area</li>
                  <li>Sign up for shifts that match your availability</li>
                  <li>Connect with other volunteers and make a difference</li>
                `
                    : user.role === 'donor'
                    ? `
                  <li>Start donating food and resources to those in need</li>
                  <li>Track your donations and their impact</li>
                  <li>Connect with local food banks and organizations</li>
                `
                    : `
                  <li>Explore available resources and food banks in your area</li>
                  <li>Access the support and assistance you need</li>
                  <li>Connect with your local community</li>
                `
                }
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" 
                 style="background-color: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
                Go to Dashboard
              </a>
            </div>
          </div>
          
          <div style="text-align: center; color: #6b7280; font-size: 12px;">
            <p>Thank you for being part of our mission to nourish communities!</p>
            <p>If you have any questions, feel free to contact our support team.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV === 'development') {
      console.log('Welcome email sent successfully');
      console.log('Message ID:', info.messageId);
    }

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error here as user verification is complete
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  sendWelcomeEmail,
};

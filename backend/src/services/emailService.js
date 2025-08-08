// backend/src/services/emailService.js
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // For development, you can use a service like Ethereal Email for testing
  // In production, use a real email service like SendGrid, Mailgun, etc.
  
  if (process.env.NODE_ENV === 'development') {
    // For development - using Gmail (you'll need to set up app password)
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_APP_PASSWORD // Your Gmail app password
      }
    });
  } else {
    // For production - use a professional email service
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
const sendVerificationEmail = async (user, verificationToken) => {
  try {
    const transporter = createTransporter();
    
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
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
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Verification email sent successfully');
      console.log('Message ID:', info.messageId);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return {
      success: true,
      messageId: info.messageId
    };
    
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send welcome email after verification
const sendWelcomeEmail = async (user) => {
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
                ${user.role === 'volunteer' ? `
                  <li>Browse available volunteer shifts in your area</li>
                  <li>Sign up for shifts that match your availability</li>
                  <li>Connect with other volunteers and make a difference</li>
                ` : user.role === 'donor' ? `
                  <li>Start donating food and resources to those in need</li>
                  <li>Track your donations and their impact</li>
                  <li>Connect with local food banks and organizations</li>
                ` : `
                  <li>Explore available resources and food banks in your area</li>
                  <li>Access the support and assistance you need</li>
                  <li>Connect with your local community</li>
                `}
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
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Welcome email sent successfully');
      console.log('Message ID:', info.messageId);
    }
    
    return {
      success: true,
      messageId: info.messageId
    };
    
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error here as user verification is complete
    return {
      success: false,
      error: error.message
    };
  }
};

// Send thank you email for contact form submissions
const sendContactThankYouEmail = async (contactData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"ByteBasket" <${process.env.EMAIL_USER || 'noreply@bytebasket.com'}>`,
      to: contactData.email,
      subject: 'Thank you for reaching out to ByteBasket!',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #14b8a6; margin: 0;">ByteBasket</h1>
            <p style="color: #6b7280; margin: 5px 0;">Nourishing Communities, One Byte at a Time</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="color: #111827; margin-top: 0;">Thank you for reaching out to us, ${contactData.name}!</h2>
            <p style="color: #374151; line-height: 1.6;">
              We have received your message and appreciate you taking the time to contact us. Your inquiry is important to us, and we're committed to getting back to you as soon as possible.
            </p>
            
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #92400e; margin-top: 0; margin-bottom: 10px;">Your Message Details:</h3>
              <p style="color: #92400e; margin: 5px 0;"><strong>Subject:</strong> ${contactData.subject}</p>
              <p style="color: #92400e; margin: 5px 0;"><strong>Message:</strong></p>
              <p style="color: #92400e; margin: 5px 0; font-style: italic;">"${contactData.message}"</p>
            </div>
            
            <p style="color: #374151; line-height: 1.6;">
              Our team will review your message and respond within 24-48 hours during business days. If your inquiry is urgent, please don't hesitate to call us directly at <strong>(555) 123-4567</strong>.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" 
                 style="background-color: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
                Visit Our Website
              </a>
            </div>
          </div>
          
          <div style="background-color: #f0fdfa; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #14b8a6;">
            <h3 style="color: #111827; margin-top: 0;">What happens next?</h3>
            <ul style="color: #374151; line-height: 1.6;">
              <li>We'll review your message and route it to the appropriate team member</li>
              <li>You'll receive a personalized response within 24-48 hours</li>
              <li>If needed, we may follow up with additional questions or information</li>
            </ul>
          </div>
          
          <div style="text-align: center; color: #6b7280; font-size: 12px;">
            <p>Thank you for being part of our mission to nourish communities!</p>
            <p>If you have any urgent questions, please call us at (555) 123-4567.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Contact thank you email sent successfully');
      console.log('Message ID:', info.messageId);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return {
      success: true,
      messageId: info.messageId
    };
    
  } catch (error) {
    console.error('Error sending contact thank you email:', error);
    throw new Error('Failed to send contact thank you email');
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendContactThankYouEmail
};

// backend/src/controllers/contact.controller.js
const { sendContactThankYouEmail } = require('../services/emailService');

/**
 * Submit contact form
 * POST /api/contact
 */
exports.submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, email, subject, message'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Send thank you email to the user
    try {
      await sendContactThankYouEmail({ name, email, subject, message });
    } catch (emailError) {
      console.error('Error sending thank you email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    // TODO: In the future, you might want to:
    // 1. Store the contact message in a database
    // 2. Send notification email to admin/staff
    // 3. Create a ticket in a support system

    res.status(200).json({
      success: true,
      message: 'Thank you for your message! We have received your inquiry and will get back to you soon.'
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form. Please try again later.',
      error: error.message
    });
  }
};

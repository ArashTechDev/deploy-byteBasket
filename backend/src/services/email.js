const nodemailer = require('nodemailer');

let transporter;
async function getTransporter() {
  if (transporter) return transporter;

  // Use real SMTP if provided in .env
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    return transporter;
  }

  // Otherwise use Ethereal (dev preview in console)
  const test = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: test.user, pass: test.pass },
  });
  return transporter;
}

async function sendMail({ to, subject, html }) {
  if (process.env.ENABLE_EMAIL !== 'true') return { skipped: true };
  const t = await getTransporter();
  const info = await t.sendMail({ from: process.env.FROM_EMAIL || 'ByteBasket <no-reply@bytebasket.dev>', to, subject, html });
  const url = nodemailer.getTestMessageUrl(info);
  if (url) console.log('📧 Preview email:', url);
  return info;
}

module.exports = { sendMail };

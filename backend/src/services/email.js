const nodemailer = require('nodemailer');

let transporter;
let transporterInfo = { host: null, port: null, secure: false, isEthereal: false };
let etherealAuth = null;

async function getTransporter(preferredOptions) {
  if (transporter && !preferredOptions) return transporter;

  // Use real SMTP if provided in .env
  if (!preferredOptions && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const secure = String(process.env.SMTP_PORT || '') === '465';
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure,
      pool: true,
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      tls: process.env.SMTP_TLS_INSECURE === 'true' ? { rejectUnauthorized: false } : undefined,
    });
    transporterInfo = { host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure, isEthereal: false };
    return transporter;
  }

  // Otherwise use Ethereal (dev preview in console)
  if (!preferredOptions) {
    const test = await nodemailer.createTestAccount();
    etherealAuth = { user: test.user, pass: test.pass };
    preferredOptions = { host: 'smtp.ethereal.email', port: 587, secure: false, auth: etherealAuth };
  }

  transporter = nodemailer.createTransport({
    ...preferredOptions,
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
  transporterInfo = { host: preferredOptions.host, port: preferredOptions.port, secure: !!preferredOptions.secure, isEthereal: preferredOptions.host === 'smtp.ethereal.email' };
  return transporter;
}

async function sendMail({ to, subject, html }) {
  if (process.env.ENABLE_EMAIL !== 'true') return { skipped: true };
  try {
    const t = await getTransporter();
    const info = await t.sendMail({ from: process.env.FROM_EMAIL || 'ByteBasket <no-reply@bytebasket.dev>', to, subject, html });
    const url = nodemailer.getTestMessageUrl(info);
    if (url) console.log('📧 Preview email:', url);
    return info;
  } catch (err) {
    const message = String(err && err.message || '');
    const timedOut = err && (err.code === 'ETIMEDOUT' || /Greeting never received/i.test(message));
    const usingEthereal587 = transporterInfo.isEthereal && transporterInfo.port === 587;

    if (timedOut && usingEthereal587) {
      try {
        console.warn('Email send via Ethereal 587 failed, retrying with SSL:465...');
        const fallbackOptions = { host: 'smtp.ethereal.email', port: 465, secure: true, auth: etherealAuth || (transporter && transporter.options && transporter.options.auth) };
        // Force new transporter for fallback
        transporter = null;
        await getTransporter(fallbackOptions);
        const info = await transporter.sendMail({ from: process.env.FROM_EMAIL || 'ByteBasket <no-reply@bytebasket.dev>', to, subject, html });
        const url = nodemailer.getTestMessageUrl(info);
        if (url) console.log('📧 Preview email (SSL):', url);
        return info;
      } catch (fallbackErr) {
        console.error('Fallback email send failed:', fallbackErr);
        throw err; // rethrow original error for upstream handling
      }
    }

    throw err;
  }
}

module.exports = { sendMail };

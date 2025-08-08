// backend/src/controllers/request.controller.js
const { randomUUID } = require('crypto');
const Request = require('../db/models/Request.model');
const User = require('../db/models/User.model');
const PDFDocument = require('pdfkit');
const { sendMail } = require('../services/email');

let Notification = { create: async () => {} };
try { Notification = require('../db/models/notifications/Notification.model'); } catch (e) {}

/** helper: get user from auth or dev header */
const getUserFromRequest = async (req) => {
  if (req.user && req.user._id) return req.user;
  const id = req.headers['x-user-id'];
  if (!id) return null;
  try { return await User.findById(id); } catch { return null; }
};

function buildConfirmationHTML(r) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${r.requestId}</title></head>
  <body>
    <h2>Request Confirmation</h2>
    <p><b>Request ID:</b> ${r.requestId}</p>
    <p><b>Pickup:</b> ${new Date(r.pickupDateTime).toLocaleString()}</p>
    <p><b>Status:</b> ${r.status}</p>
    <ul>${r.items.map(i=>`<li>${i.name} × ${i.quantity}</li>`).join('')}</ul>
    ${r.specialInstructions ? `<p><b>Notes:</b> ${r.specialInstructions}</p>` : ''}
  </body></html>`;
}

/** GET /api/requests/:id/confirmation.pdf  (#38 PDF) */
exports.downloadConfirmationPdf = async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).send('Unauthorized');

    const r = await Request.findById(req.params.id);
    if (!r || String(r.userId) !== String(user._id)) return res.status(404).send('Not found');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${r.requestId}.pdf`);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);

    doc.fontSize(20).text('Request Confirmation', { align: 'center' }).moveDown();
    doc.fontSize(12);
    doc.text(`Request ID: ${r.requestId}`);
    doc.text(`Pickup:    ${new Date(r.pickupDateTime).toLocaleString()}`);
    doc.text(`Status:    ${r.status}`);
    if (r.specialInstructions) doc.text(`Notes:     ${r.specialInstructions}`);
    if (r.dietaryRestrictions?.length) doc.text(`Dietary:   ${r.dietaryRestrictions.join(', ')}`);
    if (r.allergies) doc.text(`Allergies: ${r.allergies}`);

    doc.moveDown().text('Items:');
    r.items.forEach(i => doc.text(`• ${i.name}  x ${i.quantity}`));

    doc.end();
  } catch (e) {
    console.error('pdf error:', e);
    res.status(500).send('Failed to generate PDF');
  }
};

/** POST /api/requests  (#37) */
exports.submitRequest = async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // SAFE payload guard
    const payload = (req && req.body && typeof req.body === 'object') ? req.body : {};
    const {
      items = [],
      specialInstructions = '',
      pickupDateTime,
      dietaryRestrictions = [],
      allergies = ''
    } = payload;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items required' });
    }
    if (!pickupDateTime) {
      return res.status(400).json({ success: false, message: 'pickupDateTime required' });
    }

    const requestId = `REQ-${randomUUID().slice(0, 8).toUpperCase()}`;
    const request = await Request.create({
      requestId,
      userId: user._id,
      items,
      specialInstructions,
      pickupDateTime,
      dietaryRestrictions,
      allergies
    });

    try {
      if (process.env.ENABLE_EMAIL === 'true' && user.email) {
        await sendMail({
          to: user.email,
          subject: `Your ByteBasket request ${request.requestId}`,
          html: buildConfirmationHTML(request),
        });
      }
    } catch (e) {
      console.warn('email send failed/skipped:', e.message);
    }
    try {
      await Notification.create({ userId: user._id, type: 'request', message: `Request ${request.requestId} submitted.` });
    } catch (_) {}

    return res.status(201).json({
      success: true,
      message: 'Request submitted',
      data: { id: request._id, requestId, status: request.status }
    });
  } catch (err) {
    console.error('submitRequest error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/requests/my  (#38) */
exports.getMyRequests = async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const filter = { userId: user._id };
    if (req.query.status) filter.status = req.query.status;
    const rows = await Request.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

/** GET /api/requests/:id  (#38) */
exports.getRequestById = async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const r = await Request.findById(req.params.id);
    if (!r || String(r.userId) !== String(user._id)) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, data: r });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

/** PATCH /api/requests/:id/cancel  (#38) */
exports.cancelMyRequest = async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const r = await Request.findById(req.params.id);
    if (!r || String(r.userId) !== String(user._id)) return res.status(404).json({ success: false, message: 'Request not found' });
    if (r.status !== 'Pending') return res.status(400).json({ success: false, message: 'Only Pending requests can be cancelled' });
    r.status = 'Cancelled'; await r.save();
    try { await Notification.create({ userId: user._id, type: 'request', message: `Request ${r.requestId} cancelled.` }); } catch (_) {}
    res.json({ success: true, message: 'Cancelled', data: { id: r._id, status: r.status } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

/** PATCH /api/requests/:id/status  (#38 demo/staff) */
exports.updateStatus = async (req, res) => {
  try {
    const valid = ['Pending','Approved','Ready','Fulfilled','Cancelled'];
    const { status } = (req.body || {});
    if (!valid.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
    const r = await Request.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!r) return res.status(404).json({ success: false, message: 'Request not found' });
    try { await Notification.create({ userId: r.userId, type: 'request', message: `Request ${r.requestId} → ${status}` }); } catch (_) {}
    res.json({ success: true, data: r });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

/** GET /api/requests/:id/confirmation.html  (#38) */
exports.downloadConfirmation = async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).send('Unauthorized');
    const r = await Request.findById(req.params.id);
    if (!r || String(r.userId) !== String(user._id)) return res.status(404).send('Not found');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename=${r.requestId}.html`);
    res.end(`<!doctype html><html><head><meta charset="utf-8"><title>${r.requestId}</title></head>
      <body>
        <h2>Request Confirmation</h2>
        <p><b>Request ID:</b> ${r.requestId}</p>
        <p><b>Pickup:</b> ${new Date(r.pickupDateTime).toLocaleString()}</p>
        <p><b>Status:</b> ${r.status}</p>
        <ul>${r.items.map(i => `<li>${i.name} × ${i.quantity}</li>`).join('')}</ul>
        ${r.specialInstructions ? `<p><b>Notes:</b> ${r.specialInstructions}</p>` : ''}
      </body></html>`);
  } catch (e) { res.status(500).send(e.message); }
};

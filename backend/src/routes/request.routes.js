const express = require('express');
const router = express.Router();
const {
  submitRequest, getMyRequests, getRequestById,
  cancelMyRequest, updateStatus, downloadConfirmation, downloadConfirmationPdf,
} = require('../controllers/request.controller');

router.post('/', submitRequest);                // #37
router.get('/my', getMyRequests);               // #38
router.get('/:id', getRequestById);             // #38
router.patch('/:id/cancel', cancelMyRequest);   // #38
router.patch('/:id/status', updateStatus);      // #38 (demo/staff)
router.get('/:id/confirmation.html', downloadConfirmation); // #38 print
router.get('/:id/confirmation.pdf', downloadConfirmationPdf);

module.exports = router;

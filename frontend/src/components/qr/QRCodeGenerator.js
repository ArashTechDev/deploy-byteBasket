import React from 'react';
import QRCode from 'qrcode.react';

const QRCodeGenerator = ({ value }) => {
  if (!value) return null;

  return (
    <div className="p-4 bg-white rounded shadow inline-block mt-4">
      <QRCode value={value} size={150} data-testid="qr-code" />
    </div>
  );
};

export default QRCodeGenerator;

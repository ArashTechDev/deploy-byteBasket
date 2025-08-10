import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ onDetected }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 });

    scanner.render(
      (decodedText) => {
        onDetected(decodedText);
        scanner.clear();
      },
      (error) => {
        console.warn('QR scan error', error);
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onDetected]);

  return <div id="qr-reader" className="w-full h-48 mt-4" />;
};

export default QRScanner;

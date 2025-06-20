import React, { useEffect, useRef } from 'react';
import Quagga from 'quagga';

const BarcodeScanner = ({ onDetected, onError }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!scannerRef.current) return;

    Quagga.init(
      {
        inputStream: {
          type: 'LiveStream',
          target: scannerRef.current,
          constraints: {
            facingMode: 'environment',
          },
        },
        decoder: {
          readers: ['code_128_reader', 'ean_reader', 'ean_8_reader', 'upc_reader', 'upc_e_reader'],
        },
      },
      (err) => {
        if (err) {
          onError && onError(err);
          return;
        }
        Quagga.start();
      }
    );

    Quagga.onDetected((data) => {
      onDetected && onDetected(data.codeResult.code);
      Quagga.stop();
    });

    return () => {
      Quagga.stop();
      Quagga.offDetected();
    };
  }, [onDetected, onError]);

  return <div ref={scannerRef} className="w-full h-48 bg-black rounded" />;
};

export default BarcodeScanner;

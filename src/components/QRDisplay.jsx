const QRDisplay = ({ value, size = 200 }) => {
  // Simple QR code placeholder - in real app, use a QR library like qrcode.js
  return (
    <div className="flex flex-col items-center">
      <div 
        className="border-2 border-gray-300 bg-white flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <div className="text-center p-4">
          <div className="text-xs font-mono break-all mb-2">{value}</div>
          <div className="text-2xl">📱</div>
          <div className="text-xs text-gray-500 mt-2">QR Code</div>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center max-w-xs">
        Scan this code at the gate for entry
      </p>
    </div>
  );
};

export default QRDisplay;
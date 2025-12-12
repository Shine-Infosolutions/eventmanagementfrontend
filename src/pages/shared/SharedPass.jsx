import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://eventbackend-pi.vercel.app';

const SharedPass = () => {
  const { id } = useParams();
  const [passData, setPassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError('Invalid pass link');
      setLoading(false);
      return;
    }

    const fetchPassData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/bookings/${id}`);
        
        if (!response.ok) {
          throw new Error('Pass not found');
        }
        
        const booking = await response.json();
        
        setPassData({
          passId: booking.booking_id,
          customerName: booking.buyer_name,
          customerPhone: booking.buyer_phone,
          passType: booking.pass_type_id?.name,
          maxPeople: booking.total_people,
          price: booking.pass_type_id?.price,
          paymentStatus: booking.payment_status,
          paymentMode: booking.payment_mode,
          createdAt: booking.createdAt,
          qrCode: `QR-${booking.booking_id}-${Date.now()}`,
          eventName: 'New Year 2025 Event'
        });
      } catch (error) {
        setError('Pass not found or expired');
      }
      setLoading(false);
    };
    
    fetchPassData();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Pass...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-gray-600 text-lg">{error}</p>
          <p className="text-gray-400 text-sm mt-2">Please check the link and try again</p>
        </div>
      </div>
    );
  }

  if (!passData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="text-6xl mb-4">🎫</div>
          <p className="text-gray-500">Pass not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Print Button */}
      <div className="no-print p-2 flex justify-end gap-2">
        <button 
          onClick={handlePrint}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Print Pass
        </button>
      </div>

      <div className="print-content p-4 sm:p-6 lg:p-8 mt-16 sm:mt-20">
        {/* Pass Header */}
        <div className="p-6 mb-0 border-b-2 border-blue-800">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-800">EVENT PASS</h1>
              <h2 className="text-xl font-semibold text-gray-700 mb-1">{passData.eventName}</h2>
              <p className="text-gray-600 text-sm">December 31, 2024 - January 1, 2025</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 mb-2 bg-gray-200 flex items-center justify-center text-4xl">
                🎫
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Pass ID</p>
                <p className="text-xl font-bold text-gray-800">{passData.passId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pass Body */}
        <div className="bg-white p-6">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Pass Holder:</h3>
              <div className="text-gray-700 space-y-1">
                <p><span className="font-medium">Name:</span> <span className="font-semibold">{passData.customerName}</span></p>
                <p><span className="font-medium">Phone:</span> {passData.customerPhone}</p>
                <p><span className="font-medium">Pass Type:</span> {passData.passType}</p>
                <p><span className="font-medium">People Allowed:</span> {passData.maxPeople}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="space-y-2">
                <p><span className="font-medium text-gray-600">Date:</span> <span className="font-semibold">{new Date(passData.createdAt).toLocaleDateString()}</span></p>
                <p><span className="font-medium text-gray-600">Amount:</span> <span className="font-bold text-green-600">₹{passData.price}</span></p>
                <p><span className="font-medium text-gray-600">Status:</span> <span className={`px-2 py-1 rounded text-sm font-medium ${
                  passData.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>{passData.paymentStatus}</span></p>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="text-center mb-8 p-6 border-2 border-dashed border-gray-300">
            <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 flex items-center justify-center border-2 border-gray-300">
              <div className="text-center">
                <div className="text-xs font-mono break-all mb-2">{passData.qrCode}</div>
                <div className="text-2xl">📱</div>
                <div className="text-xs text-gray-500 mt-2">QR Code</div>
              </div>
            </div>
            <p className="text-sm text-gray-600">Show this QR code at the gate for entry</p>
          </div>

          {/* Pass Details Table */}
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="bg-blue-800 px-6 py-4 text-left text-white font-bold border border-gray-300">Pass Details</th>
                  <th className="bg-blue-800 px-6 py-4 text-right text-white font-bold border border-gray-300">Information</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-6 py-4 font-medium">Pass Type</td>
                  <td className="border border-gray-300 px-6 py-4 text-right">{passData.passType}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-6 py-4 font-medium">People Allowed</td>
                  <td className="border border-gray-300 px-6 py-4 text-right">{passData.maxPeople}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-6 py-4 font-medium">Payment Mode</td>
                  <td className="border border-gray-300 px-6 py-4 text-right">{passData.paymentMode}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-6 py-4 bg-blue-800 text-white font-bold">Total Amount</td>
                  <td className="border border-gray-300 px-6 py-4 bg-blue-800 text-white text-right font-bold">₹{passData.price}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pass Footer */}
        <div className="p-6 text-center border-t-2 border-blue-800">
          <p className="text-lg font-medium mb-2 text-gray-800">Welcome to {passData.eventName}!</p>
          <p className="text-gray-600">Please carry a valid ID along with this pass.</p>
          <p className="text-gray-600 text-sm mt-2">For support: Contact event organizers</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page { margin: 0; size: A4; }
          body * { visibility: hidden; }
          .print-content, .print-content * { visibility: visible; }
          .print-content { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default SharedPass;
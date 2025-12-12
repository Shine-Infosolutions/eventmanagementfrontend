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
        console.log('Fetching pass data for ID:', id);
        console.log('API URL:', `${API_URL}/api/bookings/${id}`);
        
        const response = await fetch(`${API_URL}/api/bookings/${id}/public`);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('Error response:', errorText);
          throw new Error('Pass not found');
        }
        
        const booking = await response.json();
        console.log('Booking data:', booking);
        
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
    <>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Print Button */}
      <div className="no-print p-4 flex justify-end gap-3">
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-md transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Pass
        </button>
      </div>

      <div className="print-content max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Pass Container */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          
          {/* Pass Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎉</span>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wide">EVENT PASS</h1>
                    <div className="w-16 h-1 bg-yellow-400 rounded-full mt-1"></div>
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-2">{passData.eventName}</h2>
                <div className="flex items-center justify-center lg:justify-start gap-2 text-blue-100">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">December 31, 2024 - January 1, 2025</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full flex items-center justify-center text-3xl sm:text-4xl mb-3 border-2 border-white/30">
                  🎫
                </div>
                <div className="text-center">
                  <p className="text-xs text-blue-200 uppercase tracking-wide font-medium">Pass ID</p>
                  <p className="text-lg sm:text-xl font-bold font-mono bg-white/20 px-3 py-1 rounded-lg mt-1">{passData.passId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pass Body */}
          <div className="p-6 sm:p-8">
            
            {/* Pass Holder Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Pass Holder Details</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Name</span>
                    <span className="font-semibold text-gray-900">{passData.customerName}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Phone</span>
                    <span className="font-semibold text-gray-900">{passData.customerPhone}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Pass Type</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">{passData.passType}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">People Allowed</span>
                    <span className="font-semibold text-gray-900">{passData.maxPeople}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Payment Information</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-green-200">
                    <span className="text-gray-600 font-medium">Date</span>
                    <span className="font-semibold text-gray-900">{new Date(passData.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-green-200">
                    <span className="text-gray-600 font-medium">Amount</span>
                    <span className="font-bold text-green-600 text-xl">₹{passData.price}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-green-200">
                    <span className="text-gray-600 font-medium">Payment Mode</span>
                    <span className="font-semibold text-gray-900">{passData.paymentMode}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      passData.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>{passData.paymentStatus}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 sm:p-8 text-center border border-blue-200">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Entry QR Code</h3>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-inner border-2 border-dashed border-blue-300 mb-4">
                <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border-2 border-gray-300 shadow-sm">
                  <div className="text-center">
                    <div className="text-xs font-mono break-all mb-2 px-2 text-gray-600">{passData.qrCode}</div>
                    <div className="text-2xl sm:text-3xl mb-2">📱</div>
                    <div className="text-xs text-gray-500 font-medium">QR Code</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-100 rounded-lg p-4">
                <p className="text-blue-800 font-semibold mb-1">📲 Show this QR code at the gate for entry</p>
                <p className="text-blue-600 text-sm">Gate staff will scan this code to verify your pass</p>
              </div>
            </div>

            {/* Important Information */}
            <div className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Important Instructions</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Carry a valid government ID along with this pass</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Pass is valid only for the specified number of people</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Entry is subject to security checks</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Pass cannot be transferred or refunded</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Pass Footer */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 sm:p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-2xl">🎊</span>
              <h3 className="text-xl sm:text-2xl font-bold">Welcome to {passData.eventName}!</h3>
              <span className="text-2xl">🎊</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Event Support Available</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Secure & Verified</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span>Valid for Event Dates</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-gray-400 text-xs">Generated on {new Date().toLocaleDateString()} • Event Management System</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page { 
            margin: 0.5in; 
            size: A4; 
          }
          body * { 
            visibility: hidden; 
          }
          .print-content, .print-content * { 
            visibility: visible; 
          }
          .print-content { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            background: white !important;
          }
          .no-print { 
            display: none !important; 
          }
          .bg-gradient-to-r,
          .bg-gradient-to-br {
            background: #1e40af !important;
            color: white !important;
          }
          .shadow-2xl,
          .shadow-lg,
          .shadow-md {
            box-shadow: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default SharedPass;
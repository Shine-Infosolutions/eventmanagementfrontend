import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Logo from '../../assets/Logo.png';

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
          price: booking.total_amount || booking.pass_type_id?.price,
          paymentStatus: booking.payment_status,
          paymentMode: booking.payment_mode,
          createdAt: booking.createdAt,
          qrCode: `QR-${booking.booking_id}-${Date.now()}`,
          eventName: 'CELESTIAL DAWN',
          notes: booking.notes,
          paymentNotes: booking.payment_notes,
          isOwnerPass: booking.is_owner_pass
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
      {/* Back Button */}
      <div className="p-4">
        <div className="flex gap-2">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors no-print"
          >
            <span>←</span>
            Back
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors no-print"
          >
            <span>🖨️</span>
            Print Pass
          </button>
        </div>
      </div>


      <div className="print-content max-w-2xl mx-auto p-2">
        {/* Pass Container */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          
          {/* Pass Header */}
          <div className="bg-gradient-to-r from-amber-600 to-amber-800 text-white p-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 rounded-lg p-2">
                <img src={Logo} alt="Logo" className="h-10 w-auto" />
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-bold">CELESTIAL DAWN</h1>
                <p className="text-sm">EVENT PASS</p>
                <p className="text-xs text-amber-100">8:00 PM • 31 DECEMBER WEDNESDAY</p>
              </div>
            </div>
          </div>

          {/* Pass Body */}
          <div className="p-4 space-y-4">
            
            {/* Pass Holder Details & Payment Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50 p-3 rounded border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-amber-600">👤</span>
                  <h3 className="text-sm font-bold">Pass Holder Details</h3>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold">{passData.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-semibold">{passData.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pass Type:</span>
                    <span className="font-semibold">{passData.passType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">People Allowed:</span>
                    <span className="font-semibold">{passData.maxPeople}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-600">💳</span>
                  <h3 className="text-sm font-bold">Payment Information</h3>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold">{new Date(passData.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-green-600">₹{passData.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Mode:</span>
                    <span className="font-semibold">{passData.paymentMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-semibold ${passData.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>{passData.paymentStatus}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pass Details */}
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-600">🎫</span>
                <h3 className="text-sm font-bold">Pass Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Pass Type:</span>
                  <span className="font-semibold ml-2">{passData.passType}</span>
                </div>
                <div>
                  <span className="text-gray-600">People Allowed:</span>
                  <span className="font-semibold ml-2">{passData.maxPeople}</span>
                </div>
              </div>
              {(passData.notes || passData.paymentNotes) && (
                <div className="mt-2 pt-2 border-t border-yellow-300">
                  {passData.notes && (
                    <div className="text-xs">
                      <span className="text-gray-600 font-medium">Notes:</span>
                      <p className="text-gray-900 mt-1">{passData.notes}</p>
                    </div>
                  )}
                  {passData.paymentNotes && (
                    <div className="text-xs mt-1">
                      <span className="text-gray-600 font-medium">Payment Notes:</span>
                      <p className="text-gray-900 mt-1">{passData.paymentNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="bg-orange-50 p-3 rounded border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-orange-600">📋</span>
                <h3 className="text-sm font-bold">TERMS & CONDITIONS</h3>
              </div>
              <div className="space-y-1 text-xs text-gray-700">
                <p>• DRINKS TO BE PURCHASED AT THE COUNTER</p>
                <p>• NO OUTSIDE FOOD AND DRINKS ALLOWED</p>
                <p>• ENTRY WOULD BE PERMITTED ONLY WITH PASSES</p>
                <p>• VALID ID CARD IS REQUIRED FOR ENTRY</p>
                <p>• THE TICKET IS NON REPLACEABLE AND NON REFUNDABLE</p>
              </div>
              
              <div className="mt-2 pt-2 border-t border-orange-300">
                <h4 className="text-orange-800 font-bold text-xs mb-1">CALL OR WHATSAPP US:</h4>
                <div className="text-xs text-gray-700">
                  <p>• +918795266667, 7752946667, 8052866667, 8795566667</p>
                  <p>• H.N. SINGH CHAURAHA, MEDICAL COLLEGE ROAD, GORAKHPUR</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pass Footer */}
          <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-white p-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span>🎊</span>
              <h3 className="text-sm font-bold">Welcome to {passData.eventName}!</h3>
              <span>🎊</span>
            </div>
            <div className="flex justify-center gap-4 text-xs text-gray-300">
              <span>Event Support Available</span>
              <span>Secure & Verified</span>
              <span>Valid for Event Dates</span>
            </div>
            <p className="text-gray-400 text-xs mt-2">
              Generated on {new Date().toLocaleDateString()} • Powered by Shine Infosolution
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page { 
            margin: 0.5in; 
            size: A4; 
          }
          @page :first {
            margin-top: 0;
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
            height: 100vh;
            background: white !important;
            transform: scale(1);
            transform-origin: center;
            page-break-inside: avoid;
            display: flex;
            align-items: center;
            justify-content: center;
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
    </div>
    </>
  );
};

export default SharedPass;
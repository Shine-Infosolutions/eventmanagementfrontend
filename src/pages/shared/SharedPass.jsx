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
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors no-print"
        >
          <span>←</span>
          Back
        </button>
      </div>


      <div className="print-content max-w-4xl mx-auto p-2 sm:p-4 lg:p-6 xl:p-8">
        {/* Pass Container */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          
          {/* Pass Header */}
          <div className="bg-gradient-to-r from-amber-600 via-yellow-700 to-amber-800 text-white p-6">
            <div className="flex items-center gap-4">
              {/* Logo on Left */}
              <div className="bg-white/10 rounded-xl p-2 backdrop-blur-sm flex flex-col items-center">
                <img 
                  src={Logo} 
                  alt="Event Logo" 
                  className="h-16 w-auto object-contain"
                />
                <p className="text-white text-xs font-semibold mt-1">BUDHA AVENUE</p>
              </div>
              
              {/* Event Details on Right */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-lg">🎉</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-wide">
                      CELESTIAL DAWN
                    </h1>
                    <div className="w-12 h-0.5 bg-amber-300 rounded-full mt-1"></div>
                  </div>
                </div>
                
                <h2 className="text-lg font-semibold mb-2">EVENT PASS</h2>
                
                <div className="flex items-center gap-4 text-amber-100 text-sm">
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">8:00 PM</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>31 DECEMBER WEDNESDAY</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pass Body */}
          <div className="p-3 sm:p-6 lg:p-8">
            
            {/* Pass Holder Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
              <div className="bg-amber-50 rounded-xl p-3 sm:p-4 lg:p-6 border border-amber-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
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
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">{passData.passType}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">People Allowed</span>
                    <span className="font-semibold text-gray-900">{passData.maxPeople}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-3 sm:p-4 lg:p-6 border border-amber-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
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
                    <span className="font-bold text-green-600 text-lg sm:text-xl">₹{passData.price}</span>
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

            {/* Pass Details Section */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-amber-600">🎫</span>
                <h3 className="text-sm font-bold text-gray-800">Pass Details</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-sm">Pass Type</span>
                  <span className="font-semibold text-gray-900 text-sm">{passData.passType}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-sm">People Allowed</span>
                  <span className="font-semibold text-gray-900 text-sm">{passData.maxPeople}</span>
                </div>
                {(passData.notes || passData.paymentNotes) && (
                  <div className="pt-2 border-t border-amber-200">
                    {passData.notes && (
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-amber-600 text-sm">📝</span>
                        <div>
                          <span className="text-gray-600 text-sm font-medium">Notes:</span>
                          <p className="text-gray-900 text-sm mt-1">{passData.notes}</p>
                        </div>
                      </div>
                    )}
                    {passData.paymentNotes && (
                      <div className="flex items-start gap-2">
                        <span className="text-amber-600 text-sm">💳</span>
                        <div>
                          <span className="text-gray-600 text-sm font-medium">Payment Notes:</span>
                          <p className="text-gray-900 text-sm mt-1">{passData.paymentNotes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="mt-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 sm:p-6 border border-amber-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-amber-800 tracking-wider">TERMS & CONDITIONS</h3>
              </div>
              
              <div className="space-y-2 text-sm text-gray-700">
                <p className="flex items-start gap-3">
                  <span className="text-amber-600 font-bold">▶</span>
                  <span>DRINKS TO BE PURCHASED AT THE COUNTER</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-amber-600 font-bold">▶</span>
                  <span>NO OUTSIDE FOOD AND DRINKS ALLOWED</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-amber-600 font-bold">▶</span>
                  <span>ENTRY WOULD BE PERMITTED ONLY WITH PASSES</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-amber-600 font-bold">▶</span>
                  <span>VALID ID CARD IS REQUIRED FOR ENTRY</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-amber-600 font-bold">▶</span>
                  <span>THE TICKET IS NON REPLACEABLE AND NON REFUNDABLE</span>
                </p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-amber-300">
                <h4 className="text-amber-800 font-bold text-base mb-3">CALL OR WHATSAPP US:</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                    <span>+918795266667, 7752946667, 8052866667, 8795566667</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                    <span>H.N. SINGH CHAURAHA, MEDICAL COLLEGE ROAD, GORAKHPUR</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Pass Footer */}
          <div className="bg-gradient-to-r from-amber-800 to-yellow-900 text-white p-3 sm:p-6 lg:p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-2xl">🎊</span>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">Welcome to {passData.eventName}!</h3>
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
              <p className="text-gray-400 text-xs text-center">
                Generated on {new Date().toLocaleDateString()} • Powered by <a href="https://www.shineinfosolutions.in/" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline">Shine Infosolution</a>
              </p>
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
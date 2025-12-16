import { useState } from 'react';

const BookingViewModal = ({ booking, onClose }) => {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full my-4 shadow-xl">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-t-xl border-b">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">📋</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
              <p className="text-blue-600 font-semibold">{booking.booking_id}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl p-2 hover:bg-white rounded-full transition-all"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-600">👤</span>
                <span className="text-sm font-semibold text-gray-700">Customer Info</span>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500">Name</span>
                  <p className="font-semibold text-gray-900">{booking.buyer_name}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Phone</span>
                  <p className="font-semibold text-gray-900">{booking.buyer_phone}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-600">🎫</span>
                <span className="text-sm font-semibold text-gray-700">Pass Details</span>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500">Type</span>
                  <p className="font-semibold text-gray-900">{booking.pass_type_id?.name || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Amount</span>
                  <p className="font-semibold text-green-600">₹{booking.total_amount || booking.pass_type_id?.price || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-3 rounded border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-purple-600">💳</span>
                <span className="text-sm font-semibold text-gray-700">Payment Info</span>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500">Status</span>
                  <div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      booking.payment_status === 'Paid' 
                        ? 'bg-green-100 text-green-800' 
                        : booking.payment_status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>{booking.payment_status}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Mode</span>
                  <div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      booking.payment_mode === 'Cash' ? 'bg-yellow-100 text-yellow-800' :
                      booking.payment_mode === 'UPI' ? 'bg-blue-100 text-blue-800' :
                      booking.payment_mode === 'Card' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>{booking.payment_mode}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-3 rounded border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-orange-600">👥</span>
                <span className="text-sm font-semibold text-gray-700">Entry Status</span>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500">People</span>
                  <p className="font-semibold text-gray-900">{booking.people_entered || 0}/{booking.total_people}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Check-in</span>
                  <div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      booking.checked_in 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>{booking.checked_in ? 'Checked In' : 'Pending Entry'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-600">📅</span>
                <span className="text-sm font-semibold text-gray-700">Booking Date</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{new Date(booking.createdAt).toLocaleDateString()}</p>
                <p className="text-xs text-gray-500">{new Date(booking.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
          
          {booking.pass_holders && booking.pass_holders.length > 0 && (
            <div className="mt-4">
              <div className="bg-white rounded border border-gray-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-indigo-600">👥</span>
                  <span className="text-sm font-semibold text-gray-800">Pass Holders</span>
                </div>
                <div className="space-y-2">
                  {booking.pass_holders.map((holder, index) => (
                    holder.name && (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <span className="w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs">{index + 1}</span>
                        <span className="font-medium">{holder.name}</span>
                        {holder.phone && <span className="text-gray-500">({holder.phone})</span>}
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {booking.notes && (
            <div className="mt-4">
              <div className="bg-gray-50 rounded border p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-600">📝</span>
                  <span className="text-sm font-semibold">Notes</span>
                </div>
                <p className="text-sm text-gray-700">{booking.notes}</p>
              </div>
            </div>
          )}

          {booking.payment_screenshot && (
            <div className="mt-4">
              <a 
                href={booking.payment_screenshot} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100 transition-colors"
              >
                <span>📷</span>
                View Payment Screenshot
              </a>
            </div>
          )}
          
          {/* <div className="mt-3 sm:mt-4 flex justify-center">
            <button
              onClick={onClose}
              className="px-4 sm:px-6 py-2 bg-gray-600 text-white rounded text-sm sm:text-base hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default BookingViewModal;
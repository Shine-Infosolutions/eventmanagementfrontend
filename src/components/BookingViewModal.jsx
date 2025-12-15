import { useState } from 'react';

const BookingViewModal = ({ booking, onClose }) => {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-start justify-center p-2 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full my-4 shadow-xl">
        <div className="flex justify-between items-center p-3 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Booking Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl font-light p-1"
          >
            ×
          </button>
        </div>
        
        <div className="p-3 sm:p-6">
          <div className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0">
            <div className="flex justify-between sm:block">
              <span className="text-xs sm:text-sm text-gray-500 sm:block sm:mb-1">Pass ID{!window.innerWidth || window.innerWidth >= 640 ? ':' : ''}</span>
              <span className="text-sm sm:text-lg font-mono sm:text-gray-900">{booking.booking_id}</span>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-xs sm:text-sm text-gray-500 sm:block sm:mb-1">Name{!window.innerWidth || window.innerWidth >= 640 ? ':' : ''}</span>
              <span className="text-sm sm:text-lg sm:text-gray-900">{booking.buyer_name}</span>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-xs sm:text-sm text-gray-500 sm:block sm:mb-1">Phone{!window.innerWidth || window.innerWidth >= 640 ? ':' : ''}</span>
              <span className="text-sm sm:text-lg sm:text-gray-900">{booking.buyer_phone}</span>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-xs sm:text-sm text-gray-500 sm:block sm:mb-1">Type{!window.innerWidth || window.innerWidth >= 640 ? ':' : ''}</span>
              <span className="text-sm sm:text-lg sm:text-gray-900">{booking.pass_type_id?.name || 'Unknown'}</span>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-xs sm:text-sm text-gray-500 sm:block sm:mb-1">Amount{!window.innerWidth || window.innerWidth >= 640 ? ':' : ''}</span>
              <span className="text-sm sm:text-lg font-semibold text-green-600">₹{booking.total_amount || booking.pass_type_id?.price || 0}</span>
            </div>
            <div className="flex justify-between items-center sm:block">
              <span className="text-xs sm:text-sm text-gray-500 sm:block sm:mb-1">Payment Status{!window.innerWidth || window.innerWidth >= 640 ? ':' : ''}</span>
              <span className={`px-2 py-1 sm:px-3 rounded text-xs sm:text-sm font-medium ${
                booking.payment_status === 'Paid' 
                  ? 'bg-green-100 text-green-800' 
                  : booking.payment_status === 'Pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>{booking.payment_status}</span>
            </div>
            <div className="flex justify-between items-center sm:block">
              <span className="text-xs sm:text-sm text-gray-500 sm:block sm:mb-1">Payment Mode{!window.innerWidth || window.innerWidth >= 640 ? ':' : ''}</span>
              <span className={`px-2 py-1 sm:px-3 rounded text-xs sm:text-sm font-medium ${
                booking.payment_mode === 'Cash' ? 'bg-yellow-100 text-yellow-800' :
                booking.payment_mode === 'UPI' ? 'bg-blue-100 text-blue-800' :
                booking.payment_mode === 'Card' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>{booking.payment_mode}</span>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-xs sm:text-sm text-gray-500 sm:block sm:mb-1">People{!window.innerWidth || window.innerWidth >= 640 ? ':' : ''}</span>
              <span className="text-sm sm:text-lg sm:text-gray-900">{booking.people_entered || 0}/{booking.total_people}</span>
            </div>
            <div className="flex justify-between items-center sm:block">
              <span className="text-xs sm:text-sm text-gray-500 sm:block sm:mb-1">Check-in Status{!window.innerWidth || window.innerWidth >= 640 ? ':' : ''}</span>
              <span className={`px-2 py-1 sm:px-3 rounded text-xs sm:text-sm font-medium ${
                booking.checked_in 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>{booking.checked_in ? 'Checked In' : 'Pending Entry'}</span>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-xs sm:text-sm text-gray-500 sm:block sm:mb-1">Date{!window.innerWidth || window.innerWidth >= 640 ? ':' : ''}</span>
              <span className="text-sm sm:text-lg sm:text-gray-900">{new Date(booking.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          {booking.pass_holders && booking.pass_holders.length > 0 && (
            <div className="mt-3 sm:mt-4">
              <span className="text-xs sm:text-sm font-medium text-gray-500 sm:block sm:mb-2">Pass Holders:</span>
              <div className="bg-gray-50 rounded p-2 sm:p-3 mt-1 max-h-20 sm:max-h-32 overflow-y-auto">
                {booking.pass_holders.map((holder, index) => (
                  holder.name && (
                    <div key={index} className="text-xs sm:text-sm py-1 sm:flex sm:justify-between sm:items-center sm:py-2 sm:border-b sm:border-gray-200 sm:last:border-b-0">
                      <span className="sm:font-medium sm:text-gray-900">{index + 1}. {holder.name}</span>
                      {holder.phone && (
                        <span className="sm:text-gray-500 sm:text-sm"> ({holder.phone})</span>
                      )}
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
          
          {booking.notes && (
            <div className="mt-3 sm:mt-4">
              <span className="text-xs sm:text-sm font-medium text-gray-500 sm:block sm:mb-2">Notes:</span>
              <div className="bg-gray-50 rounded p-2 sm:p-3 mt-1 max-h-16 sm:max-h-20 overflow-y-auto">
                <p className="text-xs sm:text-sm text-gray-700">{booking.notes}</p>
              </div>
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
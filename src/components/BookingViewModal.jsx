import { useState } from 'react';

const BookingViewModal = ({ booking, onClose }) => {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Pass ID</label>
              <p className="text-lg font-mono text-gray-900">{booking.booking_id}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Customer Name</label>
              <p className="text-lg text-gray-900">{booking.buyer_name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
              <p className="text-lg text-gray-900">{booking.buyer_phone}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Pass Type</label>
              <p className="text-lg text-gray-900">{booking.pass_type_id?.name || 'Unknown'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Amount</label>
              <p className="text-lg font-semibold text-green-600">
                ₹{booking.pass_type_id?.price || 0}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Payment Status</label>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                booking.payment_status === 'Paid' 
                  ? 'bg-green-100 text-green-800' 
                  : booking.payment_status === 'Pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {booking.payment_status}
              </span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Payment Mode</label>
              <span className={`inline-flex px-3 py-1 rounded text-sm font-medium ${
                booking.payment_mode === 'Cash' ? 'bg-yellow-100 text-yellow-800' :
                booking.payment_mode === 'UPI' ? 'bg-blue-100 text-blue-800' :
                booking.payment_mode === 'Card' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {booking.payment_mode}
              </span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">People</label>
              <p className="text-lg text-gray-900">
                {booking.people_entered || 0}/{booking.total_people}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Check-in Status</label>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                booking.checked_in 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {booking.checked_in ? 'Checked In' : 'Pending Entry'}
              </span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Created Date</label>
              <p className="text-lg text-gray-900">
                {new Date(booking.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {booking.pass_holders && booking.pass_holders.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-500 mb-3">Pass Holder Details</label>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {booking.pass_holders.map((holder, index) => (
                  holder.name && (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <div>
                        <span className="font-medium text-gray-900">Person {index + 1}:</span>
                        <span className="ml-2 text-gray-700">{holder.name}</span>
                      </div>
                      {holder.phone && (
                        <span className="text-sm text-gray-500">{holder.phone}</span>
                      )}
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
          
          {booking.notes && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-500 mb-2">Notes</label>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{booking.notes}</p>
              </div>
            </div>
          )}
          
          <div className="mt-8 flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingViewModal;
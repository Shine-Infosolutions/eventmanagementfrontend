import { useState, useEffect } from 'react';

const BookingViewModal = ({ booking, onClose, onUpdate }) => {
  const [notes, setNotes] = useState(booking?.notes || '');
  const [paymentNotes, setPaymentNotes] = useState(booking?.payment_notes || `${booking?.total_people || 1} pass booked. ${booking?.payment_mode || 'Cash'} payment received`);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingPaymentNotes, setIsEditingPaymentNotes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Update notes when booking changes
  useEffect(() => {
    if (booking?.notes) {
      setNotes(booking.notes);
    }
    if (booking?.payment_notes) {
      setPaymentNotes(booking.payment_notes);
    }
  }, [booking]);
  
  if (!booking) return null;

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${booking._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notes })
      });
      if (response.ok) {
        setIsEditingNotes(false);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePaymentNotes = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${booking._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ payment_notes: paymentNotes })
      });
      if (response.ok) {
        setIsEditingPaymentNotes(false);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error saving payment notes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full my-2 sm:my-4 shadow-xl">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-t-xl border-b">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">📋</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                {booking.is_owner_pass && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold flex items-center gap-1">
                    <span>👑</span>
                    Owner Pass
                  </span>
                )}
              </div>
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
        
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <div className="flex flex-col">
                    <p className="font-semibold text-green-600">₹{booking.total_amount || booking.pass_type_id?.price || 0}</p>
                    {booking.custom_price && booking.custom_price !== booking.pass_type_id?.price && (
                      <div className="text-xs text-orange-600 font-medium">
                        Custom Price (Default: ₹{booking.pass_type_id?.price})
                      </div>
                    )}
                  </div>
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
                  <p className="font-semibold text-gray-900">{booking.total_people}</p>
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

            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-600">📝</span>
                  <span className="text-sm font-semibold text-gray-700">Notes</span>
                </div>
                <button
                  onClick={() => setIsEditingNotes(!isEditingNotes)}
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  {isEditingNotes ? 'Cancel' : 'Edit'}
                </button>
              </div>
              {isEditingNotes ? (
                <div className="space-y-2">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes..."
                    className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                    rows={3}
                  />
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSaving}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-900">
                    {notes || 'No notes added'}
                  </p>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Booking Created:</span> {new Date(booking.createdAt).toLocaleDateString()} at {new Date(booking.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-indigo-50 p-3 rounded border border-indigo-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-600">📝</span>
                  <span className="text-sm font-semibold text-gray-700">Payment Notes</span>
                </div>
                <button
                  onClick={() => setIsEditingPaymentNotes(!isEditingPaymentNotes)}
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  {isEditingPaymentNotes ? 'Cancel' : 'Edit'}
                </button>
              </div>
              {isEditingPaymentNotes ? (
                <div className="space-y-2">
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="Add payment notes..."
                    className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                    rows={3}
                  />
                  <button
                    onClick={handleSavePaymentNotes}
                    disabled={isSaving}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-900">
                    {paymentNotes}
                  </p>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Amount:</span> ₹{booking.total_amount} | <span className="font-medium">Created:</span> {new Date(booking.createdAt).toLocaleDateString()} at {new Date(booking.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              )}
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
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{holder.name}</span>
                      <span className="text-xs text-gray-500">{holder.phone}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingViewModal;
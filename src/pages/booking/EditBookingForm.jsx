import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const EditBookingForm = ({ booking, onClose, onBookingUpdated }) => {
  const [formData, setFormData] = useState({
    buyer_name: '',
    buyer_phone: '',
    payment_mode: 'Cash',
    payment_status: 'Paid',
    notes: '',
    pass_holders: [],
    people_entered: 0,
    total_people: 1,
    total_amount: 0,
    payment_screenshot: null
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (booking) {
      setFormData({
        buyer_name: booking.buyer_name || '',
        buyer_phone: booking.buyer_phone || '',
        payment_mode: booking.payment_mode || 'Cash',
        payment_status: booking.payment_status || 'Paid',
        notes: booking.notes || '',
        pass_holders: booking.pass_holders || [],
        people_entered: booking.people_entered || 0,
        total_people: booking.total_people || 1,
        total_amount: booking.total_amount || 0,
        payment_screenshot: booking.payment_screenshot || null
      });
    }
  }, [booking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/bookings/${booking._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          buyer_name: formData.buyer_name,
          buyer_phone: formData.buyer_phone,
          payment_mode: formData.payment_mode,
          payment_status: formData.payment_status,
          notes: formData.notes,
          pass_holders: formData.pass_holders,
          people_entered: formData.people_entered,
          total_people: formData.total_people,
          total_amount: formData.total_amount
        })
      });

      if (!response.ok) throw new Error('Failed to update booking');
      
      alert('Booking updated successfully!');
      onBookingUpdated?.();
      onClose();
    } catch (error) {
      alert('Error updating booking: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePassHolder = (index, field, value) => {
    const updatedHolders = [...formData.pass_holders];
    if (!updatedHolders[index]) {
      updatedHolders[index] = { name: '', phone: '' };
    }
    updatedHolders[index] = { ...updatedHolders[index], [field]: value };
    setFormData({ ...formData, pass_holders: updatedHolders });
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">✏️</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Booking</h2>
              <p className="text-blue-600 font-semibold">{booking?.booking_id}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{booking?.pass_type_id?.name}</div>
              <div className="text-sm text-gray-600">₹{booking?.pass_type_id?.price}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{formData.people_entered}/{formData.total_people}</div>
              <div className="text-sm text-gray-600">People Entered</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">₹{formData.total_amount}</div>
              <div className="text-sm text-gray-600">Total Amount</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">👤</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Customer Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  value={formData.buyer_name}
                  onChange={(e) => setFormData({...formData, buyer_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  value={formData.buyer_phone}
                  onChange={(e) => setFormData({...formData, buyer_phone: e.target.value})}
                />
              </div>
            </div>
          </div>

        {/* Pass Holders */}
          {formData.pass_holders.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">👥</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Pass Holder Details</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                {formData.pass_holders.map((holder, index) => (
                  <div key={index} className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">{index + 1}</span>
                      Person {index + 1}
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                          value={holder.name || ''}
                          onChange={(e) => updatePassHolder(index, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                        <input
                          type="tel"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                          value={holder.phone || ''}
                          onChange={(e) => updatePassHolder(index, 'phone', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">💳</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Payment & Entry Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Mode</label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                  value={formData.payment_mode}
                  onChange={(e) => setFormData({...formData, payment_mode: e.target.value})}
                >
                  <option value="Cash">💰 Cash</option>
                  <option value="UPI">📱 UPI</option>
                  <option value="Card">💳 Card</option>
                  <option value="Online">🌐 Online</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Status</label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                  value={formData.payment_status}
                  onChange={(e) => setFormData({...formData, payment_status: e.target.value})}
                >
                  <option value="Paid">✅ Paid</option>
                  <option value="Pending">⏳ Pending</option>
                  <option value="Refunded">↩️ Refunded</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">People Entered</label>
                <input
                  type="number"
                  min="0"
                  max={formData.total_people}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                  value={formData.people_entered}
                  onChange={(e) => setFormData({...formData, people_entered: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Additional Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                  rows="4"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes..."
                />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Total Amount (₹)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all text-lg font-semibold"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({...formData, total_amount: parseInt(e.target.value) || 0})}
                  />
                </div>
                {formData.payment_screenshot && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                    <a 
                      href={formData.payment_screenshot} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                    >
                      <span className="text-xl">📷</span>
                      View Payment Screenshot
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>✅</span>
                    Update Booking
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookingForm;
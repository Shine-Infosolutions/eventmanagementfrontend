import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const BookingForm = ({ isOpen, onClose, onBookingCreated }) => {
  const { addBooking } = useAppContext();
  const [passTypes, setPassTypes] = useState([]);
  const [formData, setFormData] = useState({
    pass_type_id: '',
    buyer_name: '',
    buyer_phone: '',
    payment_mode: 'Cash',
    upi_id: '',
    transaction_id: '',
    notes: '',
    pass_holders: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPassTypes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (passTypes.length > 0) {
      setFormData(prev => ({
        ...prev,
        pass_type_id: passTypes[0]._id,
        pass_holders: Array(5).fill({ name: '', phone: '' })
      }));
    }
  }, [passTypes]);

  const loadPassTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/pass-types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPassTypes(data);
      }
    } catch (error) {
      console.error('Error loading pass types:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedPass = passTypes.find(p => p._id === formData.pass_type_id);
      const bookingData = {
        pass_type_id: selectedPass._id,
        buyer_name: formData.buyer_name,
        buyer_phone: formData.buyer_phone,
        total_people: 1,
        pass_holders: formData.pass_holders.filter(holder => holder.name.trim()),
        payment_mode: formData.payment_mode,
        payment_status: 'Paid',
        notes: formData.notes || `${formData.payment_mode} payment${formData.transaction_id ? ` - TXN: ${formData.transaction_id}` : ''}${formData.upi_id ? ` - UPI: ${formData.upi_id}` : ''}`
      };

      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) throw new Error('Failed to create booking');
      
      const booking = await response.json();
      const bookingId = booking.booking_id || `NY2025-${booking._id?.slice(-6) || 'XXXXXX'}`;
      alert(`Booking created successfully!\nBooking ID: ${bookingId}`);
      setFormData({ pass_type_id: passTypes[0]?._id || '', buyer_name: '', buyer_phone: '', payment_mode: 'Cash', upi_id: '', transaction_id: '', notes: '', pass_holders: [] });
      onBookingCreated?.();
      onClose();
    } catch (error) {
      alert('Error creating booking: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePassHolder = (index, field, value) => {
    const updatedHolders = [...formData.pass_holders];
    updatedHolders[index] = { ...updatedHolders[index], [field]: value };
    setFormData({ ...formData, pass_holders: updatedHolders });
  };

  const selectedPassType = passTypes.find(p => p._id === formData.pass_type_id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Booking">
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🎫</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Pass Type</h3>
            </div>
            <select
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
              value={formData.pass_type_id}
              onChange={(e) => {
                const selectedPass = passTypes.find(p => p._id === e.target.value);
                setFormData({
                  ...formData, 
                  pass_type_id: e.target.value,
                  pass_holders: selectedPass ? Array(5).fill({ name: '', phone: '' }) : []
                });
              }}
            >
              {passTypes.map((passType) => (
                <option key={passType._id} value={passType._id}>{passType.name} Pass - ₹{passType.price}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">👤</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Customer Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Buyer Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                  placeholder="Enter full name"
                  value={formData.buyer_name}
                  onChange={(e) => setFormData({...formData, buyer_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                  placeholder="Enter mobile number"
                  value={formData.buyer_phone}
                  onChange={(e) => setFormData({...formData, buyer_phone: e.target.value})}
                />
              </div>
            </div>
          </div>

          {selectedPassType && formData.pass_holders.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">👥</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Pass Holder Details ({selectedPassType.max_people} {selectedPassType.max_people === 1 ? 'Person' : 'People'})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.pass_holders.map((holder, index) => (
                  <div key={index} className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">{index + 1}</span>
                      Person {index + 1} {index === 0 ? '(Optional)' : ''}
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                          placeholder="Enter full name"
                          value={holder.name}
                          onChange={(e) => updatePassHolder(index, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                        <input
                          type="tel"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                          placeholder="Phone number"
                          value={holder.phone}
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
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">💳</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Payment Details</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Mode</label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                  value={formData.payment_mode}
                  onChange={(e) => setFormData({...formData, payment_mode: e.target.value, upi_id: '', transaction_id: ''})}
                >
                  <option value="Cash">💰 Cash</option>
                  <option value="UPI">📱 UPI</option>
                  <option value="Card">💳 Card</option>
                  <option value="Online">🌐 Online</option>
                </select>
              </div>

              {formData.payment_mode === 'UPI' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">UPI ID *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                        placeholder="example@upi"
                        value={formData.upi_id}
                        onChange={(e) => setFormData({...formData, upi_id: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction ID *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                        placeholder="TXN ID"
                        value={formData.transaction_id}
                        onChange={(e) => setFormData({...formData, transaction_id: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {(formData.payment_mode === 'Card' || formData.payment_mode === 'Online') && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction ID *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                    placeholder="Enter transaction ID"
                    value={formData.transaction_id}
                    onChange={(e) => setFormData({...formData, transaction_id: e.target.value})}
                  />
                </div>
              )}

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-600">₹{passTypes.find(p => p._id === formData.pass_type_id)?.price || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Notes</h3>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes (Optional)</label>
              <textarea
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all resize-none"
                placeholder="Add any special notes or requirements..."
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
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
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>✅</span>
                    Create Booking
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default BookingForm;

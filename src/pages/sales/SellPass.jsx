import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SellPass = () => {
  const navigate = useNavigate();
  const [passTypes, setPassTypes] = useState([]);
  const [formData, setFormData] = useState({
    pass_type_id: '',
    buyer_name: '',
    buyer_phone: '',
    payment_mode: 'Cash',
    upi_id: '',
    transaction_id: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPassTypes();
  }, []);

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
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, pass_type_id: data[0]._id }));
        }
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
        pass_type_id: formData.pass_type_id,
        buyer_name: formData.buyer_name,
        buyer_phone: formData.buyer_phone,
        total_people: selectedPass.max_people,
        payment_mode: formData.payment_mode,
        payment_status: 'Paid',
        notes: buildPaymentNotes()
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

      if (response.ok) {
        const booking = await response.json();
        alert(`Pass sold successfully!\nBooking ID: ${booking.booking_id}\nAmount: ₹${selectedPass.price}`);
        resetForm();
        navigate('/bookings');
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const buildPaymentNotes = () => {
    if (formData.payment_mode === 'Cash') return 'Cash payment';
    if (formData.payment_mode === 'UPI') return `UPI payment - ${formData.upi_id} - TXN: ${formData.transaction_id}`;
    return `${formData.payment_mode} payment - TXN: ${formData.transaction_id}`;
  };

  const resetForm = () => {
    setFormData({
      pass_type_id: passTypes[0]?._id || '',
      buyer_name: '',
      buyer_phone: '',
      payment_mode: 'Cash',
      upi_id: '',
      transaction_id: ''
    });
  };

  const selectedPass = passTypes.find(p => p._id === formData.pass_type_id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full">
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-4xl font-bold text-gray-900">Sell Pass</h1>
          <p className="text-gray-600 mt-2">Create new event pass for customers</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Pass Type Selection */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">Select Pass Type</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {passTypes.map((passType) => (
                  <div
                    key={passType._id}
                    className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-md ${
                      formData.pass_type_id === passType._id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData({...formData, pass_type_id: passType._id})}
                  >
                    {formData.pass_type_id === passType._id && (
                      <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                        ✓
                      </div>
                    )}
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{passType.name}</h3>
                      <div className="text-3xl font-bold text-green-600 mb-2">₹{passType.price}</div>
                      <div className="text-sm text-gray-500 mb-1">Max: {passType.max_people} people</div>
                      <div className="text-xs text-gray-400">{passType.valid_for_event}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            {selectedPass && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedPass.name} Pass</h3>
                    <p className="text-sm text-gray-600">Maximum {selectedPass.max_people} people allowed</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">₹{selectedPass.price}</div>
                    <div className="text-sm text-gray-500">Total Amount</div>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Customer Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter full name"
                  value={formData.buyer_name}
                  onChange={(e) => setFormData({...formData, buyer_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10-digit mobile number"
                  value={formData.buyer_phone}
                  onChange={(e) => setFormData({...formData, buyer_phone: e.target.value})}
                />
              </div>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Payment Mode</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Cash', 'UPI', 'Card', 'Online'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={`p-3 rounded-lg border-2 font-medium transition-all ${
                      formData.payment_mode === mode
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData({...formData, payment_mode: mode, upi_id: '', transaction_id: ''})}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Details */}
            {formData.payment_mode === 'UPI' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="example@upi"
                      value={formData.upi_id}
                      onChange={(e) => setFormData({...formData, upi_id: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Transaction ID"
                      value={formData.transaction_id}
                      onChange={(e) => setFormData({...formData, transaction_id: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            {(formData.payment_mode === 'Card' || formData.payment_mode === 'Online') && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter transaction ID"
                  value={formData.transaction_id}
                  onChange={(e) => setFormData({...formData, transaction_id: e.target.value})}
                />
              </div>
            )}

            {formData.payment_mode === 'Cash' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-yellow-600 mr-2">💰</span>
                  <span className="text-yellow-800 font-medium">Cash payment - No additional details required</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.pass_type_id || !formData.buyer_name || !formData.buyer_phone}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Complete Sale - ₹${selectedPass?.price || 0}`
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellPass;
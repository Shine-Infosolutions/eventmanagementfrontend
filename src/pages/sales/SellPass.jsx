import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SellPass = () => {
  const navigate = useNavigate();
  const { addBooking } = useAppContext();
  const [passTypes, setPassTypes] = useState([]);
  const [formData, setFormData] = useState({
    passTypeId: '',
    buyerName: '',
    buyerPhone: '',
    paymentMode: 'Cash',
    upiId: '',
    transactionId: ''
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
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setPassTypes(Array.isArray(data) ? data : []);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, passTypeId: data[0]._id }));
      }
    } catch (error) {
      console.error('Error loading pass types:', error);
      // Use fallback data if API fails
      setPassTypes([
        { _id: '1', name: 'Teens', price: 500, max_people: 2, valid_for_event: 'New Year 2025' },
        { _id: '2', name: 'Couple', price: 800, max_people: 2, valid_for_event: 'New Year 2025' },
        { _id: '3', name: 'Family', price: 1200, max_people: 4, valid_for_event: 'New Year 2025' }
      ]);
      setFormData(prev => ({ ...prev, passTypeId: '1' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const selectedPass = passTypes.find(p => p._id === formData.passTypeId);
    const bookingData = {
      passTypeId: selectedPass._id,
      passType: selectedPass.name,
      buyerName: formData.buyerName,
      buyerPhone: formData.buyerPhone,
      totalPeople: selectedPass.max_people,
      price: selectedPass.price,
      paymentMode: formData.paymentMode
    };

    const booking = addBooking(bookingData);
    alert(`Pass created successfully!\nPass ID: ${booking.id}\nQR Code: ${booking.qrCodeValue}`);
    setFormData({ passTypeId: passTypes[0]?._id || '', buyerName: '', buyerPhone: '', paymentMode: 'Cash', upiId: '', transactionId: '' });
    setLoading(false);
    navigate('/bookings');
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sell New Pass</h1>
        <p className="text-gray-600 mt-2">Create a new event pass for customers</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Pass Type</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {passTypes.map((passType) => (
                <div
                  key={passType._id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    formData.passTypeId === passType._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData({...formData, passTypeId: passType._id})}
                >
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">{passType.name} Pass</h3>
                    <p className="text-xl font-bold text-green-600 mt-2">₹{passType.price}</p>
                    <p className="text-xs text-gray-500 mt-1">Max: {passType.max_people} people</p>
                    <p className="text-xs text-gray-400 mt-1">{passType.valid_for_event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-700">Total Amount:</span>
              <span className="text-2xl font-bold text-green-600">
                ₹{passTypes.find(p => p._id === formData.passTypeId)?.price || 0}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buyer Name *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full name"
                value={formData.buyerName}
                onChange={(e) => setFormData({...formData, buyerName: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
              <input
                type="tel"
                required
                pattern="[0-9]{10}"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter 10-digit mobile number"
                value={formData.buyerPhone}
                onChange={(e) => setFormData({...formData, buyerPhone: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.paymentMode}
              onChange={(e) => setFormData({...formData, paymentMode: e.target.value, upiId: '', transactionId: ''})}
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Online">Online</option>
            </select>
          </div>

          {formData.paymentMode === 'UPI' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="example@upi"
                    value={formData.upiId}
                    onChange={(e) => setFormData({...formData, upiId: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter transaction ID"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {formData.paymentMode === 'Card' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter card transaction ID"
                  value={formData.transactionId}
                  onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                />
              </div>
            </div>
          )}

          {formData.paymentMode === 'Online' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter online payment transaction ID"
                  value={formData.transactionId}
                  onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                />
              </div>
            </div>
          )}

          {formData.paymentMode === 'Cash' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">💰 Cash payment - No additional details required</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium text-lg"
          >
            {loading ? 'Processing...' : 'Mark as Paid & Generate Pass'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellPass;
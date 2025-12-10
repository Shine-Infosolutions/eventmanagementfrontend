import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const SellPass = () => {
  const navigate = useNavigate();
  const { passTypes, addBooking } = useAppContext();
  const [formData, setFormData] = useState({
    passType: 'Teens',
    buyerName: '',
    buyerPhone: '',
    paymentMode: 'Cash'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const selectedPass = passTypes[formData.passType];
      const bookingData = {
        passTypeId: selectedPass.id,
        passType: formData.passType,
        buyerName: formData.buyerName,
        buyerPhone: formData.buyerPhone,
        totalPeople: selectedPass.maxPeople,
        price: selectedPass.price,
        paymentMode: formData.paymentMode
      };

      const booking = addBooking(bookingData);
      alert(`Pass created successfully!\nPass ID: ${booking.id}\nQR Code: ${booking.qrCodeValue}`);
      setFormData({ passType: 'Teens', buyerName: '', buyerPhone: '', paymentMode: 'Cash' });
      setLoading(false);
      navigate('/bookings');
    }, 1000);
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
              {Object.entries(passTypes).map(([type, details]) => (
                <div
                  key={type}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    formData.passType === type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData({...formData, passType: type})}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{details.icon}</div>
                    <h3 className="font-semibold text-lg">{type} Pass</h3>
                    <p className="text-sm text-gray-600 mt-1">{details.description}</p>
                    <p className="text-xl font-bold text-green-600 mt-2">₹{details.price}</p>
                    <p className="text-xs text-gray-500 mt-1">Max: {details.maxPeople} people</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-700">Total Amount:</span>
              <span className="text-2xl font-bold text-green-600">₹{passTypes[formData.passType].price}</span>
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
              onChange={(e) => setFormData({...formData, paymentMode: e.target.value})}
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Online">Online</option>
            </select>
          </div>

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
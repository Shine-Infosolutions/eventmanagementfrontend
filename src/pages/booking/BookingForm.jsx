import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

const BookingForm = ({ isOpen, onClose }) => {
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
      alert(`Booking created successfully!\nPass ID: ${booking.id}`);
      setFormData({ passType: 'Teens', buyerName: '', buyerPhone: '', paymentMode: 'Cash' });
      setLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Booking">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pass Type</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.passType}
            onChange={(e) => setFormData({...formData, passType: e.target.value})}
          >
            {Object.entries(passTypes).map(([type, details]) => (
              <option key={type} value={type}>{type} Pass - ₹{details.price}</option>
            ))}
          </select>
        </div>

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

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Amount:</span>
            <span className="text-lg font-bold text-green-600">₹{passTypes[formData.passType].price}</span>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Creating...' : 'Create Booking'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BookingForm;
import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const BookingForm = ({ isOpen, onClose, onBookingCreated, editData }) => {
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
    if (editData && passTypes.length > 0) {
      console.log('Setting edit data:', editData);
      setFormData({
        pass_type_id: editData.pass_type_id?._id || editData.pass_type_id,
        buyer_name: editData.buyer_name || '',
        buyer_phone: editData.buyer_phone || '',
        payment_mode: editData.payment_mode || 'Cash',
        upi_id: '',
        transaction_id: '',
        notes: editData.notes || '',
        pass_holders: editData.pass_holders || Array(5).fill({ name: '', phone: '' })
      });
    } else if (!editData && passTypes.length > 0) {
      setFormData(prev => ({
        ...prev,
        pass_type_id: passTypes[0]._id,
        pass_holders: Array(5).fill({ name: '', phone: '' })
      }));
    }
  }, [editData, passTypes]);

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
      const url = editData ? `${API_URL}/api/bookings/${editData._id}` : `${API_URL}/api/bookings`;
      const method = editData ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) throw new Error(`Failed to ${editData ? 'update' : 'create'} booking`);
      
      const booking = await response.json();
      const bookingId = booking.booking_id || `NY2025-${booking._id?.slice(-6) || 'XXXXXX'}`;
      alert(`Booking ${editData ? 'updated' : 'created'} successfully!\nBooking ID: ${bookingId}`);
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
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? "Edit Booking" : "Create New Booking"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pass Type</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Buyer Name *</label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter full name"
            value={formData.buyer_name}
            onChange={(e) => setFormData({...formData, buyer_name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
          <input
            type="tel"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter mobile number"
            value={formData.buyer_phone}
            onChange={(e) => setFormData({...formData, buyer_phone: e.target.value})}
          />
        </div>

        {/* Pass Holder Details Section */}
        {selectedPassType && formData.pass_holders.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Pass Holder Details ({selectedPassType.max_people} {selectedPassType.max_people === 1 ? 'Person' : 'People'})
            </h3>
            <div className="space-y-4">
              {formData.pass_holders.map((holder, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Person {index + 1} Details {index === 0 ? '(Optional)' : ''}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                      <input
                        type="text"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter full name"
                        value={holder.name}
                        onChange={(e) => updatePassHolder(index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                      <input
                        type="tel"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.payment_mode}
            onChange={(e) => setFormData({...formData, payment_mode: e.target.value, upi_id: '', transaction_id: ''})}
          >
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Online">Online</option>
          </select>
        </div>

        {formData.payment_mode === 'UPI' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="example@upi"
                  value={formData.upi_id}
                  onChange={(e) => setFormData({...formData, upi_id: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="TXN ID"
                  value={formData.transaction_id}
                  onChange={(e) => setFormData({...formData, transaction_id: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}

        {(formData.payment_mode === 'Card' || formData.payment_mode === 'Online') && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter transaction ID"
              value={formData.transaction_id}
              onChange={(e) => setFormData({...formData, transaction_id: e.target.value})}
            />
          </div>
        )}

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Amount:</span>
            <span className="text-lg font-bold text-green-600">₹{passTypes.find(p => p._id === formData.pass_type_id)?.price || 0}</span>
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

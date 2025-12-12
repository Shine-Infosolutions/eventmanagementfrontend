import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SellPass = ({ onClose, onBookingCreated, editData }) => {
  const navigate = useNavigate();
  const [passTypes, setPassTypes] = useState([]);
  const [formData, setFormData] = useState({
    pass_type_id: '',
    buyer_name: '',
    buyer_phone: '',
    passes: [{ people_count: 1, buyer_details: {} }],
    payment_mode: 'Cash',
    payment_status: 'Paid',
    custom_price: '',
    upi_id: '',
    transaction_id: ''
  });
  const [showPassDetails, setShowPassDetails] = useState(false);
  const [showCreatePassType, setShowCreatePassType] = useState(false);
  const [newPassType, setNewPassType] = useState({ name: 'Teens', price: '', max_people: '', description: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPassTypes();
    if (editData) {
      setFormData({
        pass_type_id: editData.pass_type_id?._id || editData.pass_type_id,
        buyer_name: editData.buyer_name || '',
        buyer_phone: editData.buyer_phone || '',
        passes: editData.passes || [{ people_count: editData.total_people || 2, buyer_details: {} }],
        payment_mode: editData.payment_mode || 'Cash',
        payment_status: editData.payment_status || 'Paid',
        custom_price: editData.custom_price || '',
        upi_id: '',
        transaction_id: ''
      });
    }
  }, [editData]);

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
        const activeTypes = data.filter(pt => pt.is_active);
        setPassTypes(activeTypes);
        if (activeTypes.length > 0) {
          const firstType = activeTypes[0];
          setFormData(prev => ({ 
            ...prev, 
            pass_type_id: firstType._id,
            passes: [{ people_count: firstType.name === 'Couple' ? 2 : firstType.name === 'Family' ? 5 : 1, buyer_details: {} }]
          }));
        }
      }
    } catch (error) {
      console.error('Error loading pass types:', error);
    }
  };

  const addPass = () => {
    const defaultPeopleCount = selectedPass?.name === 'Couple' ? 2 : selectedPass?.name === 'Family' ? 5 : 1;
    const defaultMaxPeople = selectedPass?.name === 'Family' ? 5 : selectedPass?.max_people || 2;
    setFormData({
      ...formData,
      passes: [...formData.passes, { 
        people_count: defaultPeopleCount, 
        max_people: defaultMaxPeople,
        buyer_details: {} 
      }]
    });
  };

  const removePass = (index) => {
    if (formData.passes.length > 1) {
      const newPasses = formData.passes.filter((_, i) => i !== index);
      setFormData({ ...formData, passes: newPasses });
    }
  };

  const updatePass = (index, field, value) => {
    const newPasses = [...formData.passes];
    if (field === 'people_count') {
      newPasses[index].people_count = value;
    } else if (field === 'max_people') {
      newPasses[index].max_people = value;
    } else {
      // Handle person-specific fields
      if (!newPasses[index].buyer_details) {
        newPasses[index].buyer_details = {};
      }
      newPasses[index].buyer_details[field] = value;
    }
    setFormData({ ...formData, passes: newPasses });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedPass = passTypes.find(p => p._id === formData.pass_type_id);
      const totalPeople = formData.passes.reduce((sum, pass) => sum + pass.people_count, 0);
      const totalPrice = selectedPass.price * formData.passes.length;
      
      const token = localStorage.getItem('token');
      
      // Format passes data for new structure
      const passes = formData.passes.map((pass, passIndex) => {
        const passHolders = [];
        for (let i = 0; i < pass.people_count; i++) {
          const personData = {
            name: pass.buyer_details[`person_${i}_name`] || '',
            phone: pass.buyer_details[`person_${i}_phone`] || ''
          };
          if (personData.name) {
            passHolders.push(personData);
          }
        }
        
        return {
          pass_type_id: formData.pass_type_id,
          people_count: pass.people_count,
          pass_holders: passHolders
        };
      });

      // Format pass holders data
      const passHolders = [];
      formData.passes.forEach((pass, passIndex) => {
        for (let i = 0; i < pass.people_count; i++) {
          const personData = {
            name: pass.buyer_details[`person_${i}_name`] || '',
            phone: pass.buyer_details[`person_${i}_phone`] || ''
          };
          if (personData.name) {
            passHolders.push(personData);
          }
        }
      });

      // Use simple booking format
      const saleData = {
        pass_type_id: formData.pass_type_id,
        buyer_name: formData.buyer_name,
        buyer_phone: formData.buyer_phone,
        total_people: totalPeople,
        pass_holders: passHolders,
        payment_mode: formData.payment_mode,
        mark_as_paid: formData.payment_status === 'Paid',
        notes: `${formData.passes.length} pass${formData.passes.length > 1 ? 'es' : ''} booked. ${buildPaymentNotes()}`
      };
      
      console.log('Sending booking data:', saleData);
      
      const response = await fetch(`${API_URL}/api/bookings/force`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saleData)
      });
      
      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create booking');
      }
      
      const booking = responseData;
      const bookings = [booking];
      
      if (response.ok) {
        const bookingId = booking.booking_id || 'Generated';
        alert(`🎉 Booking created successfully!\n\nBooking ID: ${bookingId}\nCustomer: ${formData.buyer_name}\nPasses: ${formData.passes.length}\nPayment: ${formData.payment_status}\nTotal People: ${totalPeople}\nTotal Amount: ₹${totalPrice.toLocaleString()}`);
        
        resetForm();
        
        if (onBookingCreated) {
          onBookingCreated();
        }
        if (onClose) {
          onClose();
        }
        setTimeout(() => {
          navigate('/bookings');
        }, 100);
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const buildPaymentNotes = () => {
    if (formData.payment_mode === 'Cash') return 'Cash payment received';
    if (formData.payment_mode === 'UPI') return `UPI: ${formData.upi_id} - TXN: ${formData.transaction_id}`;
    return `${formData.payment_mode} - TXN: ${formData.transaction_id}`;
  };

  const resetForm = () => {
    const firstPassType = passTypes[0];
    setFormData({
      pass_type_id: firstPassType?._id || '',
      buyer_name: '',
      buyer_phone: '',
      passes: [{ people_count: firstPassType?.name === 'Couple' ? 2 : firstPassType?.name === 'Family' ? 5 : 1, buyer_details: {} }],
      payment_mode: 'Cash',
      payment_status: 'Paid',
      custom_price: '',
      upi_id: '',
      transaction_id: ''
    });
    setShowPassDetails(false);
  };

  const selectedPass = passTypes.find(p => p._id === formData.pass_type_id);
  const totalPeople = formData.passes.reduce((sum, pass) => sum + pass.people_count, 0);
  const currentPrice = formData.custom_price ? parseInt(formData.custom_price) : (selectedPass?.price || 0);
  const totalPrice = currentPrice * formData.passes.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 sm:p-8 rounded-b-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <span className="text-2xl">🎫</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Event Pass Sales</h1>
              <p className="text-blue-100 text-sm sm:text-base">New Year 2025 Celebration</p>
            </div>
          </div>
        </div>

        <div className="bg-white m-4 sm:m-6 rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            
            {/* Pass Type Selection */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <label className="block text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-blue-600">🎫</span>
                Select Pass Type
              </label>
              <select
                className="w-full p-4 border-2 border-blue-200 rounded-xl text-lg bg-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                value={formData.pass_type_id}
                onChange={(e) => {
                  const selectedPassType = passTypes.find(p => p._id === e.target.value);
                  setFormData({
                    ...formData, 
                    pass_type_id: e.target.value,
                    passes: [{ people_count: selectedPassType?.name === 'Couple' ? 2 : selectedPassType?.name === 'Family' ? 5 : 1, buyer_details: {} }]
                  });
                }}
                required
              >
                <option value="">Choose a pass type... ({passTypes.length} available)</option>
                {passTypes.map((passType) => (
                  <option key={passType._id} value={passType._id}>
                    {passType.name} - ₹{passType.price} (Max: {passType.max_people} people)
                  </option>
                ))}
              </select>
              
              {/* Debug Info */}
              <div className="text-xs text-gray-500 mt-1">
                Pass Types Loaded: {passTypes.length}
                {passTypes.length > 0 && (
                  <div>Available: {passTypes.map(pt => pt.name).join(', ')}</div>
                )}
              </div>
              {passTypes.length === 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-red-600 mb-3">No pass types available.</p>
                  <button
                    type="button"
                    onClick={() => setShowCreatePassType(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    + Create Pass Type
                  </button>
                </div>
              )}
              
              {/* Create Pass Type Form */}
              {showCreatePassType && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                  <h3 className="font-bold mb-3">Create New Pass Type</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Pass Name</label>
                      <select
                        className="w-full p-2 border rounded"
                        value={newPassType.name}
                        onChange={(e) => setNewPassType({...newPassType, name: e.target.value})}
                      >
                        <option value="Teens">Teens</option>
                        <option value="Couple">Couple</option>
                        <option value="Family">Family</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Price (₹)</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        placeholder="Enter price"
                        value={newPassType.price}
                        onChange={(e) => setNewPassType({...newPassType, price: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Max People</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        placeholder="Max people allowed"
                        value={newPassType.max_people}
                        onChange={(e) => setNewPassType({...newPassType, max_people: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        placeholder="Optional description"
                        value={newPassType.description}
                        onChange={(e) => setNewPassType({...newPassType, description: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (newPassType.name && newPassType.price && newPassType.max_people) {
                          const passType = {
                            _id: Date.now().toString(),
                            name: newPassType.name,
                            price: parseInt(newPassType.price),
                            max_people: parseInt(newPassType.max_people),
                            description: newPassType.description,
                            is_active: true,
                            valid_for_event: 'New Year 2025'
                          };
                          setPassTypes([...passTypes, passType]);
                          setFormData(prev => ({ ...prev, pass_type_id: passType._id }));
                          setNewPassType({ name: 'Teens', price: '', max_people: '', description: '' });
                          setShowCreatePassType(false);
                        } else {
                          alert('Please fill all required fields');
                        }
                      }}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Add Pass Type
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreatePassType(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {selectedPass && selectedPass.description && (
                <p className="text-sm text-gray-600 mt-1 bg-yellow-50 p-2 rounded">
                  {selectedPass.description}
                </p>
              )}
              
              {/* Add More Pass Types Button */}
              {/* {passTypes.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowCreatePassType(true)}
                  className="mt-2 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                >
                  + Add Another Pass Type
                </button>
              )} */}
            </div>

            {/* Pass Configuration */}
            {selectedPass && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-green-600">⚙️</span>
                  Pass Configuration
                </h3>
                
                <div className="space-y-4">
                  {formData.passes.map((pass, index) => (
                    <div key={index} className="space-y-4">
                      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
                              <span className="text-green-500">💰</span>
                              Pass #{index + 1} - Price
                            </label>
                            <input
                              type="number"
                              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                              placeholder="Enter price"
                              value={formData.custom_price || selectedPass.price}
                              onChange={(e) => setFormData({...formData, custom_price: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
                              <span className="text-blue-500">👥</span>
                              People Count
                            </label>
                            <input
                              type="number"
                              min="1"
                              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                              value={pass.people_count}
                              onChange={(e) => updatePass(index, 'people_count', parseInt(e.target.value) || 1)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
                              <span className="text-purple-500">🔢</span>
                              Max People
                            </label>
                            <input
                              type="number"
                              min="1"
                              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                              value={pass.max_people || (selectedPass.name === 'Family' ? 5 : selectedPass.max_people)}
                              onChange={(e) => updatePass(index, 'max_people', parseInt(e.target.value) || 1)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Actions</label>
                            <div className="flex flex-col gap-2">
                              <button
                                type="button"
                                onClick={addPass}
                                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md flex items-center justify-center gap-2"
                              >
                                <span>➕</span> Add Pass
                              </button>
                              {formData.passes.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removePass(index)}
                                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md flex items-center justify-center gap-2"
                                >
                                  <span>❌</span> Remove
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Individual Pass Holder Details */}
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                          <span className="text-amber-600">📝</span>
                          Pass #{index + 1} - Holder Details ({pass.people_count} {pass.people_count === 1 ? 'Person' : 'People'})
                        </h4>
                        <div className="space-y-4">
                          {Array.from({ length: pass.people_count }, (_, personIndex) => (
                            <div key={personIndex} className="bg-white border border-gray-200 rounded-lg p-3">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">
                                Person {personIndex + 1} Details {personIndex === 0 ? '(Optional)' : ''}
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                                  <input
                                    type="text"
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                                    placeholder="Enter full name"
                                    value={pass.buyer_details[`person_${personIndex}_name`] || ''}
                                    onChange={(e) => updatePass(index, `person_${personIndex}_name`, e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                                  <input
                                    type="tel"
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                                    placeholder="Phone number"
                                    value={pass.buyer_details[`person_${personIndex}_phone`] || ''}
                                    onChange={(e) => updatePass(index, `person_${personIndex}_phone`, e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                




                {/* Summary */}
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{formData.passes.length}</div>
                      <div className="text-sm text-gray-600">Total Passes</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{totalPeople}</div>
                      <div className="text-sm text-gray-600">Total People</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">₹{currentPrice}</div>
                      <div className="text-sm text-gray-600">Per Pass</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-600">₹{totalPrice.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total Amount</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Primary Customer Name *</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 border-2 border-gray-300 rounded-lg"
                  placeholder="Enter full name"
                  value={formData.buyer_name}
                  onChange={(e) => setFormData({...formData, buyer_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Primary Mobile Number *</label>
                <input
                  type="tel"
                  required
                  className="w-full p-3 border-2 border-gray-300 rounded-lg"
                  placeholder="Enter mobile number"
                  value={formData.buyer_phone}
                  onChange={(e) => setFormData({...formData, buyer_phone: e.target.value})}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Payment Method</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Cash', 'UPI', 'Card', 'Online'].map((mode) => (
                  <label key={mode} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="payment_mode"
                      value={mode}
                      checked={formData.payment_mode === mode}
                      onChange={(e) => setFormData({...formData, payment_mode: e.target.value, upi_id: '', transaction_id: ''})}
                      className="w-4 h-4"
                    />
                    <span className="font-medium">{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Payment Status</label>
              <div className="grid grid-cols-2 gap-3">
                {['Paid', 'Pending'].map((status) => (
                  <label key={status} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="payment_status"
                      value={status}
                      checked={formData.payment_status === status}
                      onChange={(e) => setFormData({...formData, payment_status: e.target.value})}
                      className="w-4 h-4"
                    />
                    <span className={`font-medium ${
                      status === 'Paid' ? 'text-green-600' : 'text-yellow-600'
                    }`}>{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Details */}
            {formData.payment_mode === 'UPI' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">UPI ID *</label>
                    <input
                      type="text"
                      required
                      className="w-full p-2 border rounded"
                      placeholder="customer@upi"
                      value={formData.upi_id}
                      onChange={(e) => setFormData({...formData, upi_id: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Transaction ID *</label>
                    <input
                      type="text"
                      required
                      className="w-full p-2 border rounded"
                      placeholder="Transaction ID"
                      value={formData.transaction_id}
                      onChange={(e) => setFormData({...formData, transaction_id: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            {(formData.payment_mode === 'Card' || formData.payment_mode === 'Online') && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <label className="block text-sm font-medium mb-1">Transaction ID *</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded"
                  placeholder="Enter transaction ID"
                  value={formData.transaction_id}
                  onChange={(e) => setFormData({...formData, transaction_id: e.target.value})}
                />
              </div>
            )}

            {formData.payment_mode === 'Cash' && (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800">💰 Cash payment - No additional details required</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.pass_type_id || !formData.buyer_name || !formData.buyer_phone}
              className="w-full bg-blue-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-bold text-base sm:text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : `Complete Sale - ₹${totalPrice.toLocaleString()}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellPass;
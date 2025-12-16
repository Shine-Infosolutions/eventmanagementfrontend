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
    transaction_id: '',
    payment_screenshot: null
  });
  const [showPassDetails, setShowPassDetails] = useState(false);
  const [showCreatePassType, setShowCreatePassType] = useState(false);
  const [newPassType, setNewPassType] = useState({ name: 'Teens', price: '', max_people: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadPassTypes();
  }, []);

  useEffect(() => {
    if (editData && passTypes.length > 0) {
      console.log('Processing edit data:', editData);
      
      // Extract pass type ID
      const passTypeId = editData.pass_type_id?.$oid || editData.pass_type_id?._id || editData.pass_type_id;
      
      // Build buyer details from pass_holders
      const buyer_details = {};
      if (editData.pass_holders && editData.pass_holders.length > 0) {
        editData.pass_holders.forEach((holder, index) => {
          if (holder.name || holder.phone) {
            buyer_details[`person_${index}_name`] = holder.name || '';
            buyer_details[`person_${index}_phone`] = holder.phone || '';
          }
        });
      }
      
      const editFormData = {
        pass_type_id: passTypeId,
        buyer_name: editData.buyer_name || '',
        buyer_phone: editData.buyer_phone || '',
        passes: [{
          people_count: editData.total_people || 1,
          buyer_details: buyer_details
        }],
        payment_mode: editData.payment_mode || 'Cash',
        payment_status: editData.payment_status || 'Paid',
        custom_price: editData.total_amount ? editData.total_amount.toString() : '',
        upi_id: '',
        transaction_id: '',
        payment_screenshot: null
      };
      
      console.log('Setting edit form data:', editFormData);
      setFormData(editFormData);
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
        const activeTypes = data.filter(pt => pt.is_active);
        setPassTypes(activeTypes);
        if (activeTypes.length > 0 && !editData) {
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
    const selectedPass = passTypes.find(p => p._id === formData.pass_type_id);
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

  const uploadToBackend = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Upload failed');
    }
    
    return result.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let paymentScreenshotUrl = null;
      
      console.log('Payment screenshot file:', formData.payment_screenshot);
      
      if (formData.payment_screenshot) {
        console.log('Starting image upload...');
        setUploading(true);
        try {
          paymentScreenshotUrl = await uploadToBackend(formData.payment_screenshot);
          console.log('Upload successful:', paymentScreenshotUrl);
        } catch (error) {
          console.error('Upload failed:', error);
          alert('Image upload failed: ' + error.message);
        }
        setUploading(false);
      } else {
        console.log('No image selected for upload');
      }
      const selectedPass = passTypes.find(p => p._id === formData.pass_type_id);
      const totalPeople = formData.passes.reduce((sum, pass) => sum + pass.people_count, 0);
      const totalPrice = selectedPass.price * formData.passes.length;
      
      const token = localStorage.getItem('token');
      
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
        total_passes: formData.passes.length,
        total_amount: totalPrice,
        pass_holders: passHolders,
        payment_mode: formData.payment_mode,
        mark_as_paid: formData.payment_status === 'Paid',
        notes: `${formData.passes.length} pass${formData.passes.length > 1 ? 'es' : ''} booked. ${buildPaymentNotes()}`,
        payment_screenshot: paymentScreenshotUrl
      };
      
      console.log('Sending booking data with total_amount:', saleData.total_amount);
      
      const response = await fetch(`${API_URL}/api/bookings`, {
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
        const bookingId = booking.booking_id || `NY2025-${booking._id?.slice(-6) || 'XXXXXX'}`;
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
      transaction_id: '',
      payment_screenshot: null
    });
    setShowPassDetails(false);
    setUploading(false);
  };

  const selectedPass = passTypes.find(p => p._id === formData.pass_type_id);
  const totalPeople = formData.passes.reduce((sum, pass) => sum + pass.people_count, 0);
  const currentPrice = formData.custom_price ? parseInt(formData.custom_price) : (selectedPass?.price || 0);
  const totalPrice = currentPrice * formData.passes.length;

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">🎫</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Event Pass Sales</h1>
              <p className="text-blue-600 font-semibold">New Year 2025 Celebration</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="border-b border-gray-200 pb-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🎫</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Select Pass Type</h3>
              </div>
              <select
                className="w-full p-4 border-2 border-slate-200 rounded-xl text-base bg-white shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 appearance-none cursor-pointer"
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
                    {passType.name} - ₹{passType.price.toLocaleString()} (Max: {passType.max_people} people)
                  </option>
                ))}
              </select>
            </div>

            {selectedPass && (
              <div className="border-b border-gray-200 pb-6 mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">⚙️</span>
                  </div>
                  Pass Configuration
                </h3>
                
                <div className="space-y-6">
                  {formData.passes.map((pass, index) => (
                    <div key={index} className="space-y-6">
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">💰</span>
                              </div>
                              Pass {String(index + 1).padStart(2, '0')} - Price (₹)
                            </label>
                            <input
                              type="number"
                              className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 text-lg font-semibold"
                              placeholder="Enter price"
                              value={formData.custom_price || selectedPass.price}
                              onChange={(e) => setFormData({...formData, custom_price: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                              <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">👥</span>
                              </div>
                              People Count
                            </label>
                            <input
                              type="number"
                              min="1"
                              max={selectedPass.max_people}
                              className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 text-lg font-semibold"
                              value={pass.people_count}
                              onChange={(e) => updatePass(index, 'people_count', parseInt(e.target.value) || 1)}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                        <h4 className="text-base font-semibold text-slate-700 mb-5 flex items-center gap-3">
                          <div className="w-7 h-7 bg-slate-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">📝</span>
                          </div>
                          Pass {String(index + 1).padStart(2, '0')} - Holder Details ({pass.people_count} {pass.people_count === 1 ? 'Person' : 'People'})
                        </h4>
                        <div className="space-y-4">
                          {Array.from({ length: pass.people_count }, (_, personIndex) => (
                            <div key={personIndex} className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                              <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">{personIndex + 1}</span>
                                Person {personIndex + 1} {personIndex === 0 ? '(Optional)' : ''}
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-600 mb-2">Full Name</label>
                                  <input
                                    type="text"
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                                    placeholder="Enter full name"
                                    value={pass.buyer_details?.[`person_${personIndex}_name`] || ''}
                                    onChange={(e) => updatePass(index, `person_${personIndex}_name`, e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-600 mb-2">Phone Number</label>
                                  <input
                                    type="tel"
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                                    placeholder="Phone number"
                                    value={pass.buyer_details?.[`person_${personIndex}_phone`] || ''}
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
                <div className="mt-6 bg-gradient-to-r from-indigo-50 to-slate-50 p-6 rounded-xl border border-indigo-200">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">📊</span>
                    </div>
                    Order Summary
                  </h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl text-center shadow-sm">
                      <div className="text-2xl font-bold text-indigo-600 mb-1">{formData.passes.length}</div>
                      <div className="text-sm text-slate-600 font-medium">Total Passes</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl text-center shadow-sm">
                      <div className="text-2xl font-bold text-indigo-600 mb-1">{totalPeople}</div>
                      <div className="text-sm text-slate-600 font-medium">Total People</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl text-center shadow-sm">
                      <div className="text-2xl font-bold text-emerald-600 mb-1">₹{currentPrice.toLocaleString()}</div>
                      <div className="text-sm text-slate-600 font-medium">Per Pass</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl text-center shadow-sm border-2 border-emerald-200">
                      <div className="text-3xl font-bold text-emerald-600 mb-1">₹{totalPrice.toLocaleString()}</div>
                      <div className="text-sm text-slate-600 font-medium">Total Amount</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="border-b border-gray-200 pb-6 mb-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">👤</span>
                </div>
                Customer Details
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Primary Customer Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full p-4 border-2 border-slate-300 rounded-xl text-base focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200"
                    placeholder="Enter full name"
                    value={formData.buyer_name}
                    onChange={(e) => setFormData({...formData, buyer_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Primary Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    className="w-full p-4 border-2 border-slate-300 rounded-xl text-base focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200"
                    placeholder="Enter mobile number"
                    value={formData.buyer_phone}
                    onChange={(e) => setFormData({...formData, buyer_phone: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-6 mb-6">
              <label className="block text-xl font-semibold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">💳</span>
                </div>
                Payment Method
              </label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {['Cash', 'UPI', 'Card', 'Online'].map((mode) => (
                  <label key={mode} className="flex items-center space-x-3 cursor-pointer p-4 border-2 border-slate-200 rounded-xl hover:border-violet-400 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md">
                    <input
                      type="radio"
                      name="payment_mode"
                      value={mode}
                      checked={formData.payment_mode === mode}
                      onChange={(e) => setFormData({...formData, payment_mode: e.target.value, upi_id: '', transaction_id: ''})}
                      className="w-5 h-5 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="font-semibold text-slate-700">{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-b border-gray-200 pb-6 mb-6">
              <label className="block text-xl font-semibold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">✅</span>
                </div>
                Payment Status
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {['Paid', 'Pending'].map((status) => (
                  <label key={status} className="flex items-center space-x-4 cursor-pointer p-4 border-2 border-slate-200 rounded-xl hover:border-emerald-400 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md">
                    <input
                      type="radio"
                      name="payment_status"
                      value={status}
                      checked={formData.payment_status === status}
                      onChange={(e) => setFormData({...formData, payment_status: e.target.value})}
                      className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className={`font-semibold text-lg ${
                      status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>{status}</span>
                  </label>
                ))}
              </div>
              
              {/* Payment Screenshot Upload */}
              <div className="bg-gray-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Payment Screenshot (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({...formData, payment_screenshot: e.target.files[0]})}
                  className="w-full p-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {formData.payment_screenshot && (
                  <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-sm text-emerald-700 font-medium flex items-center gap-2">
                      <span>📷</span>
                      {formData.payment_screenshot.name}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Details */}
            {formData.payment_mode === 'UPI' && (
              <div className="border-b border-gray-200 pb-6 mb-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">💳</span>
                  </div>
                  UPI Payment Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-slate-700">UPI ID *</label>
                    <input
                      type="text"
                      required
                      className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                      placeholder="customer@upi"
                      value={formData.upi_id}
                      onChange={(e) => setFormData({...formData, upi_id: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-slate-700">Transaction ID *</label>
                    <input
                      type="text"
                      required
                      className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                      placeholder="Transaction ID"
                      value={formData.transaction_id}
                      onChange={(e) => setFormData({...formData, transaction_id: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            {(formData.payment_mode === 'Card' || formData.payment_mode === 'Online') && (
              <div className="border-b border-gray-200 pb-6 mb-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">💳</span>
                  </div>
                  {formData.payment_mode} Payment Details
                </h4>
                <label className="block text-sm font-semibold mb-3 text-slate-700">Transaction ID *</label>
                <input
                  type="text"
                  required
                  className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition-all duration-200"
                  placeholder="Enter transaction ID"
                  value={formData.transaction_id}
                  onChange={(e) => setFormData({...formData, transaction_id: e.target.value})}
                />
              </div>
            )}

            {formData.payment_mode === 'Cash' && (
              <div className="border-b border-gray-200 pb-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">💰</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-emerald-800">Cash Payment</h4>
                    <p className="text-emerald-700">No additional details required</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || uploading || !formData.pass_type_id || !formData.buyer_name || !formData.buyer_phone}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading || uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    {uploading ? 'Uploading...' : 'Processing...'}
                  </span>
                ) : (
                  `Submit Booking - ₹${totalPrice.toLocaleString()}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellPass;
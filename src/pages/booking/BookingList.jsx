import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import Button from '../../components/Button';
import SellPass from '../sales/SellPass';
import BookingForm from './BookingForm';
import EditBookingForm from './EditBookingForm';
import BookingViewModal from '../../components/BookingViewModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const BookingList = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [passTypes, setPassTypes] = useState([]);
  const [showSellPass, setShowSellPass] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState(null);
  const [viewingBooking, setViewingBooking] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    passType: 'all',
    paymentStatus: 'all',
    checkinStatus: 'all'
  });

  useEffect(() => {
    loadBookings();
  }, []);

  const updatePaymentStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/bookings/${bookingId}/payment`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ payment_status: newStatus })
      });
      if (response.ok) {
        loadBookings();
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };



  const sendPassWhatsApp = (bookingId) => {
    const booking = filteredBookings.find(b => b._id === bookingId);
    const customerPhone = booking?.buyer_phone || '';
    const customerName = booking?.buyer_name || 'Customer';
    
    // Clean and validate phone number
    let cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    
    // Ensure we have a valid 10-digit Indian number
    if (cleanPhone.length >= 10) {
      // Take last 10 digits
      cleanPhone = cleanPhone.slice(-10);
      // Add country code
      cleanPhone = '91' + cleanPhone;
    } else {
      alert('Invalid phone number format');
      return;
    }
    
    const passLink = `https://eventmanagementfrontend-psi.vercel.app/pass/${bookingId}`;
    
    const message = `New Year 2025 Event\n\nHi ${customerName}!\n\nYour Event Pass is Ready!\n\nPass ID: ${booking.booking_id}\nType: ${booking.pass_type_id?.name}\nPeople: ${booking.total_people}\nAmount: Rs${booking.pass_type_id?.price}\n\nView & Print Your Pass:\n${passLink}\n\nClick the link to view your pass with QR code!\nShow the QR code at the gate for entry.\n\nSee you at the event!`;
    
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    const confirmed = confirm(
      `Send pass via WhatsApp to:\n\n${customerName}\n${customerPhone}\n\nThis will open WhatsApp with the pass link.\n\nContinue?`
    );
    
    if (confirmed) {
      window.open(whatsappUrl, '_blank');
      alert(`WhatsApp opened with pass link for ${customerName}\n\nPass Link: ${passLink}`);
    }
  };

  const deleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        loadBookings();
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const loadBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Load both bookings and pass types
      const [bookingsResponse, passTypesResponse] = await Promise.all([
        fetch(`${API_URL}/api/bookings`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_URL}/api/pass-types`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);
      
      if (bookingsResponse.ok && passTypesResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        const passTypesData = await passTypesResponse.json();
        
        setPassTypes(passTypesData);
        
        // The bookings should already have populated pass_type_id from backend
        const enrichedBookings = bookingsData.map(booking => {
          // If pass_type_id is already populated (object with name/price), use it
          if (booking.pass_type_id && typeof booking.pass_type_id === 'object' && booking.pass_type_id.name) {
            return booking;
          }
          // If not populated, find from passTypesData
          const passType = passTypesData.find(pt => pt._id === booking.pass_type_id);
          return {
            ...booking,
            pass_type_id: passType || { name: 'Unknown', price: 0 }
          };
        });
        
        setBookings(enrichedBookings);
        setFilteredBookings(enrichedBookings);
      } else {
        setBookings([]);
        setFilteredBookings([]);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
      setFilteredBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFilteredBookings(bookings);
  }, [bookings]);

  useEffect(() => {
    let filtered = bookings;

    if (filters.search) {
      filtered = filtered.filter(booking =>
        booking.buyer_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        booking.buyer_phone?.includes(filters.search) ||
        booking.booking_id?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.passType !== 'all') {
      filtered = filtered.filter(booking => booking.pass_type_id?.name === filters.passType);
    }

    if (filters.paymentStatus !== 'all') {
      filtered = filtered.filter(booking => booking.payment_status === filters.paymentStatus);
    }

    if (filters.checkinStatus !== 'all') {
      filtered = filtered.filter(booking => 
        filters.checkinStatus === 'checked-in' ? booking.checked_in : !booking.checked_in
      );
    }

    setFilteredBookings(filtered);
  }, [filters, bookings]);

  const getStatusBadge = (booking) => {
    if (booking.checked_in) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✅ Checked In
        </span>
      );
    }
    const paymentColors = {
      'Paid': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Refunded': 'bg-red-100 text-red-800'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentColors[booking.payment_status] || 'bg-gray-100 text-gray-800'}`}>
        {booking.payment_status}
      </span>
    );
  };

  const getPassTypeBadge = (passType) => {
    const colors = {
      Teens: 'bg-purple-100 text-purple-800',
      Couple: 'bg-pink-100 text-pink-800',
      Family: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[passType] || 'bg-gray-100 text-gray-800'}`}>
        {passType}
      </span>
    );
  };

  const getPaymentModeBadge = (mode) => {
    const colors = {
      'Cash': 'bg-yellow-100 text-yellow-800',
      'UPI': 'bg-blue-100 text-blue-800',
      'Card': 'bg-green-100 text-green-800',
      'Online': 'bg-purple-100 text-purple-800'
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colors[mode] || 'bg-gray-100 text-gray-800'}`}>
        {mode}
      </span>
    );
  };

  return (
    <div className="p-3 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {user.role === 'admin' ? 'All Bookings' : 'Booking Management'}
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage and track event pass bookings</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                const excelData = filteredBookings.map(booking => ({
                  'Booking ID': booking.booking_id,
                  'Customer Name': booking.buyer_name,
                  'Phone': booking.buyer_phone,
                  'Pass Types': booking.passes ? booking.passes.map(p => p.pass_type_name).join(', ') : booking.pass_type_id?.name,
                  'Total Passes': booking.total_passes || 1,
                  'Total Price': booking.passes ? booking.passes.reduce((sum, p) => sum + p.pass_type_price, 0) : booking.pass_type_id?.price,
                  'Payment Mode': booking.payment_mode,
                  'Payment Status': booking.payment_status,
                  'Total People': booking.total_people,
                  'People Entered': booking.total_people_entered || booking.people_entered || 0,
                  'Checked In': booking.checked_in ? 'Yes' : 'No',
                  'Date': new Date(booking.createdAt).toLocaleDateString(),
                  'Time': new Date(booking.createdAt).toLocaleTimeString()
                }));
                const csv = [Object.keys(excelData[0] || {}), ...excelData.map(row => Object.values(row))]
                  .map(row => row.map(field => `"${field}"`).join(','))
                  .join('\n');
                const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `bookings-${new Date().toISOString().split('T')[0]}.xls`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              variant="outline" 
              className="w-full sm:w-auto"
            >
              📊 Download Excel
            </Button>
            <Button onClick={() => navigate('/sell-pass')} variant="primary" className="w-full sm:w-auto">
              <span className="mr-2">+</span>
              Create Booking
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <div className="sm:col-span-2 xl:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name, phone, or pass ID..."
              className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pass Type</label>
            <select
              className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              value={filters.passType}
              onChange={(e) => setFilters({...filters, passType: e.target.value})}
            >
              <option value="all">All Types</option>
              <option value="Teens">Teens Pass</option>
              <option value="Couple">Couple Pass</option>
              <option value="Family">Family Pass</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
            <select
              className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              value={filters.paymentStatus}
              onChange={(e) => setFilters({...filters, paymentStatus: e.target.value})}
            >
              <option value="all">All Payment</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Status</label>
            <select
              className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              value={filters.checkinStatus}
              onChange={(e) => setFilters({...filters, checkinStatus: e.target.value})}
            >
              <option value="all">All Check-in</option>
              <option value="checked-in">Checked In</option>
              <option value="pending">Not Checked In</option>
            </select>
          </div>
          <div className="flex justify-end xl:justify-start">
            <button
              onClick={() => setFilters({ search: '', passType: 'all', paymentStatus: 'all', checkinStatus: 'all' })}
              className="w-full sm:w-auto px-4 py-2 sm:py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm sm:text-base font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">⏳</div>
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-3 sm:space-y-4 p-3 sm:p-4">
              {filteredBookings.map((booking) => (
                <div key={booking._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                    <div className="mb-2 sm:mb-0">
                      <div className="font-medium text-gray-900 text-sm">{booking.booking_id}</div>
                      <div className="text-xs text-gray-500">People: {booking.total_people_entered || booking.people_entered || 0}/{booking.total_people}</div>
                    </div>
                    <div className="self-start">{getStatusBadge(booking)}</div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div>
                      <div className="font-medium text-gray-900">{booking.buyer_name}</div>
                      <div className="text-sm text-gray-500">{booking.buyer_phone}</div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div>
                        {booking.passes && booking.passes.length > 0 ? (
                          <div>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {booking.passes.length} Pass{booking.passes.length > 1 ? 'es' : ''}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              Rs {booking.passes.reduce((sum, p) => sum + p.pass_type_price, 0)}
                            </div>
                          </div>
                        ) : (
                          <div>
                            {getPassTypeBadge(booking.pass_type_id?.name)}
                            <div className="text-xs text-gray-500 mt-1">Rs {booking.pass_type_id?.price}</div>
                          </div>
                        )}
                      </div>
                      {getPaymentModeBadge(booking.payment_mode)}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {new Date(booking.createdAt).toLocaleDateString()} {new Date(booking.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() => setViewingBooking(booking)}
                      className="px-3 py-2 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
                    >
                      View
                    </button>
                    <button
                      onClick={() => setEditingBooking(booking)}
                      className="px-3 py-2 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => sendPassWhatsApp(booking._id)}
                      className="px-3 py-2 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                    >
                      Send Pass
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{booking.booking_id}</div>
                          <div className="text-xs text-gray-500">People: {booking.total_people_entered || booking.people_entered || 0}/{booking.total_people}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{booking.buyer_name}</div>
                            <div className="text-sm text-gray-500">{booking.buyer_phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {booking.passes && booking.passes.length > 0 ? (
                            <div>
                              <div className="space-y-1">
                                {booking.passes.map((pass, idx) => (
                                  <div key={idx} className="flex items-center justify-between">
                                    {getPassTypeBadge(pass.pass_type_name || 'Pass')}
                                    <span className="text-xs text-green-600 font-semibold ml-2">₹{pass.pass_type_price}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 font-bold">
                                Total: ₹{booking.total_amount || booking.passes.reduce((sum, p) => sum + (p.pass_type_price || 0), 0)}
                              </div>
                            </div>
                          ) : (
                            <div>
                              {getPassTypeBadge(booking.pass_type_id?.name || 'Unknown')}
                              <div className="text-xs text-green-600 font-semibold mt-1">₹{booking.total_amount || booking.pass_type_id?.price || 0}</div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPaymentModeBadge(booking.payment_mode)}
                          {booking.notes && <div className="text-xs text-gray-500 mt-1">{booking.notes}</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.payment_status === 'Paid' 
                              ? 'bg-green-100 text-green-800' 
                              : booking.payment_status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {booking.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.checked_in 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.checked_in ? 'Checked In' : 'Pending Entry'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(booking.createdAt).toLocaleDateString()}
                          <div className="text-xs">{new Date(booking.createdAt).toLocaleTimeString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => setViewingBooking(booking)}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
                            >
                              View
                            </button>
                            <button
                              onClick={() => setEditingBooking(booking)}
                              className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs hover:bg-gray-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => sendPassWhatsApp(booking._id)}
                              className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200"
                            >
                              Send Pass
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </>
        )}
      </div>
      
      {showSellPass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold">Create New Booking</h2>
              <button 
                onClick={() => setShowSellPass(false)}
                className="text-gray-500 hover:text-gray-700 text-xl p-1"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto">
              <SellPass onClose={() => setShowSellPass(false)} onBookingCreated={loadBookings} />
            </div>
          </div>
        </div>
      )}
      
      <BookingViewModal 
        booking={viewingBooking} 
        onClose={() => setViewingBooking(null)} 
      />
      
      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">Edit Booking</h2>
              <button 
                onClick={() => setEditingBooking(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-light"
              >
                ×
              </button>
            </div>
            <EditBookingForm 
              booking={editingBooking}
              onClose={() => setEditingBooking(null)} 
              onBookingUpdated={() => { loadBookings(); setEditingBooking(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingList;
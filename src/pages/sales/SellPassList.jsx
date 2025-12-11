import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://eventbackend-pi.vercel.app';

const SellPassList = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    passType: 'all',
    paymentMode: 'all'
  });

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/pass-sales`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
        setFilteredBookings(data);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

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

    if (filters.paymentMode !== 'all') {
      filtered = filtered.filter(booking => booking.payment_mode === filters.paymentMode);
    }

    setFilteredBookings(filtered);
  }, [filters, bookings]);

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
              Pass Sales
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Track and manage sold passes</p>
          </div>
          <button
            onClick={() => navigate('/sell-pass')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto"
          >
            <span className="mr-2">+</span>
            Sell New Pass
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name, phone, or pass ID..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pass Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.paymentMode}
              onChange={(e) => setFilters({...filters, paymentMode: e.target.value})}
            >
              <option value="all">All Modes</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Online">Online</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredBookings.length} of {bookings.length} sales
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">⏳</div>
            <p className="text-gray-600">Loading sales...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎫</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">People</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.booking_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.buyer_name}</div>
                        <div className="text-sm text-gray-500">{booking.buyer_phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPassTypeBadge(booking.pass_type_id?.name)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.total_people}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentModeBadge(booking.payment_mode)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{(booking.pass_type_id?.price * booking.total_people || 0).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(booking.createdAt).toLocaleDateString()}
                      <div className="text-xs">{new Date(booking.createdAt).toLocaleTimeString()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellPassList;
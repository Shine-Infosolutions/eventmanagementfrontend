import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import Button from '../../components/Button';
import BookingForm from './BookingForm';

const BookingList = () => {
  const { user, bookings } = useAppContext();
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    passType: 'all',
    status: 'all'
  });

  useEffect(() => {
    setFilteredBookings(bookings);
  }, [bookings]);

  useEffect(() => {
    let filtered = bookings;

    if (filters.search) {
      filtered = filtered.filter(booking =>
        booking.buyerName.toLowerCase().includes(filters.search.toLowerCase()) ||
        booking.buyerPhone.includes(filters.search) ||
        booking.id.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.passType !== 'all') {
      filtered = filtered.filter(booking => booking.passType === filters.passType);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(booking => 
        filters.status === 'checked-in' ? booking.checkedIn : !booking.checkedIn
      );
    }

    setFilteredBookings(filtered);
  }, [filters, bookings]);

  const getStatusBadge = (booking) => {
    if (booking.checkedIn) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✅ Checked In
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        ⏳ Pending
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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[passType]}`}>
        {passType}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user.role === 'admin' ? 'All Bookings' : 'Booking Management'}
            </h1>
            <p className="text-gray-600 mt-2">Manage and track event pass bookings</p>
          </div>
          <Button onClick={() => setShowBookingForm(true)} variant="primary">
            <span className="mr-2">+</span>
            Create Booking
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">All Status</option>
              <option value="checked-in">Checked In</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.id}</div>
                        <div className="text-sm text-gray-500">QR: {booking.qrCodeValue}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.buyerName}</div>
                        <div className="text-sm text-gray-500">{booking.buyerPhone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPassTypeBadge(booking.passType)}
                      <div className="text-xs text-gray-500 mt-1">Max: {booking.totalPeople} people</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{booking.price}</div>
                      <div className="text-sm text-gray-500">{booking.paymentMode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(booking)}</td>
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
      
      <BookingForm 
        isOpen={showBookingForm} 
        onClose={() => setShowBookingForm(false)} 
      />
    </div>
  );
};

export default BookingList;
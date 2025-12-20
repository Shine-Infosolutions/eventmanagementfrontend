import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FiSearch, FiX, FiCheckCircle, FiClock, FiCamera, FiAlertTriangle } from 'react-icons/fi';
import { MdConfirmationNumber } from 'react-icons/md';

const API_URL = import.meta.env.VITE_API_URL || 'https://eventbackend-pi.vercel.app';

const GateEntry = () => {
  const { user } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [peopleCount, setPeopleCount] = useState(1);
  const [mode, setMode] = useState('manual'); // 'manual' or 'qr'
  const [showAdminOverride, setShowAdminOverride] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    fetchAllBookings();
  }, []);

  useEffect(() => {
    setFilteredBookings(allBookings);
  }, [allBookings]);

  const fetchAllBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/entry/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const bookings = await response.json();
        setAllBookings(bookings);
        console.log('Loaded', bookings.length, 'bookings for gate entry');
      }
    } catch (error) {
      console.error('Error fetching gate bookings:', error);
    }
  };

  const handleSearch = async (searchValue = searchTerm) => {
    if (!searchValue.trim()) {
      setFilteredBookings(allBookings);
      return;
    }
    
    // Filter from local booking list
    const searchLower = searchValue.toLowerCase();
    const filtered = allBookings.filter(booking => 
      booking.buyer_name?.toLowerCase().includes(searchLower) ||
      booking.buyer_phone?.includes(searchValue)
    );
    
    setFilteredBookings(filtered);
  };

  const handleCheckIn = async (override = false) => {
    if (searchResult && searchResult !== 'not_found') {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/entry/checkin`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            booking_id: searchResult.id || searchResult._id,
            people_entered: peopleCount,
            scanned_by: user?.name || 'Gate Staff',
            admin_override: override,
            admin_pin: override ? adminPin : undefined
          })
        });
        
        const result = await response.json();
        if (response.ok) {
          setSearchResult({ 
            ...searchResult, 
            checked_in: true, 
            people_entered: result.booking.total_entered || (searchResult.people_entered || 0) + peopleCount,
            checked_in_at: new Date().toISOString(),
            scanned_by: user?.name || 'Gate Staff'
          });
          alert(`✅ Check-in successful! ${peopleCount} people entered.`);
          setShowAdminOverride(false);
          setAdminPin('');
        } else {
          if (result.alreadyCheckedIn) {
            // Show admin override option
            setShowAdminOverride(true);
          }
          alert(`❌ ${result.message}`);
        }
      } catch (error) {
        console.error('Check-in error:', error);
        alert('❌ Check-in failed. Please try again.');
      }
    }
  };

  const startQRScanner = async () => {
    try {
      setScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Camera error:', error);
      alert('❌ Camera access denied. Please use manual search.');
      setScanning(false);
    }
  };

  const stopQRScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const simulateQRScan = () => {
    // Simulate QR scan for demo
    const qrValue = prompt('Simulate QR Scan - Enter Pass ID or Phone:');
    if (qrValue) {
      handleSearch(qrValue);
      stopQRScanner();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      // Clear any pending timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
        setSearchTimeout(null);
      }
      handleSearch();
    }
  };

  // Clear search results
  const clearSearch = () => {
    setSearchTerm('');
    setFilteredBookings(allBookings);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gate Entry</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">Scan or search for passes to check in guests</p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 mb-4">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Pass</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter Pass ID, Phone Number, or Name"
                className="w-full px-3 sm:px-4 py-3 sm:py-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-lg"
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchTerm(value);
                  
                  if (!value.trim()) {
                    setFilteredBookings(allBookings);
                    return;
                  }
                  
                  handleSearch(value);
                }}
                onKeyPress={handleKeyPress}
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="text-lg" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={() => handleSearch()}
              disabled={loading || !searchTerm.trim()}
              className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium text-base sm:text-lg"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            {(searchResult || allBookings.length > 0) && (
              <button
                onClick={clearSearch}
                className="bg-gray-500 text-white px-4 py-3 sm:py-4 rounded-lg hover:bg-gray-600 font-medium text-base sm:text-lg"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6" style={{display: 'none'}}>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Quick tips:</span>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">Pass ID: NY2025-XXXXXX</span>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">Phone: 10 digits</span>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">Name: Full or partial</span>
        </div>
      </div>

      {searchResult === 'not_found' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <FiX className="text-red-400 text-3xl sm:text-4xl flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Pass Not Found</h3>
              <p className="text-red-600 mt-1 text-sm sm:text-base">No booking found with the provided information. Please check and try again.</p>
              <p className="text-red-500 text-xs sm:text-sm mt-2">💡 Check browser console (F12) for debug info</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          {searchTerm ? `Search Results (${filteredBookings.length})` : 'All Bookings'}
        </h3>
        {filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-t-lg">
                  <div className="flex justify-between items-center">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm truncate">Entry Pass</h4>
                    </div>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded flex-shrink-0 ml-2">NY 2025</span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-500 text-xs">Guest</p>
                      <p className="font-semibold text-sm truncate">{booking.buyer_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Phone</p>
                      <p className="font-semibold text-sm">{booking.buyer_phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">People</p>
                      <p className="font-semibold text-sm">{booking.total_people}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Payment</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.payment_status === 'Paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.payment_status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            {searchTerm ? 'No bookings found matching your search.' : 'Loading bookings...'}
          </p>
        )}
      </div>
    </div>
  );
};

export default GateEntry;
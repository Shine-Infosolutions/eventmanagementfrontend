import { useState, useRef } from 'react';
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
  const [searchTimeout, setSearchTimeout] = useState(null);

  const handleSearch = async (searchValue = searchTerm) => {
    if (!searchValue.trim()) {
      setSearchResult(null);
      setAllBookings([]);
      return;
    }
    
    setLoading(true);
    console.log('Searching for:', searchValue);
    console.log('API URL:', API_URL);
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      console.log('Making API call to:', `${API_URL}/api/entry/search`);
      const response = await fetch(`${API_URL}/api/entry/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ search_value: searchValue })
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Search SUCCESS:', data);
        console.log('Primary booking:', data.booking);
        console.log('All bookings count:', data.allBookings ? data.allBookings.length : 'No allBookings field');
        console.log('All bookings:', data.allBookings);
        setSearchResult(data.booking);
        setAllBookings(data.allBookings || [data.booking]);
        setPeopleCount(1);
      } else {
        const errorData = await response.json();
        console.log('❌ Search FAILED:', response.status, errorData);
        
        // Try fallback search using bookings API
        console.log('Trying fallback search...');
        const fallbackResponse = await fetch(`${API_URL}/api/bookings`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (fallbackResponse.ok) {
          const bookings = await fallbackResponse.json();
          console.log('All bookings:', bookings.length);
          console.log('All phone numbers in database:', bookings.map(b => b.buyer_phone).filter(Boolean));
          
          // Check if search value looks like a phone number
          const cleanSearchValue = searchValue.replace(/\D/g, ''); // Remove non-digits
          const isPhoneNumber = cleanSearchValue.length >= 10;
          
          let allBookingsForSearch = [];
          
          if (isPhoneNumber) {
            // Simple phone search - try multiple approaches
            console.log('=== PHONE SEARCH DEBUG ===');
            console.log('Searching for phone:', searchValue);
            console.log('Total bookings to search:', bookings.length);
            
            // Method 1: Exact match
            const exactMatch = bookings.filter(b => b.buyer_phone === searchValue);
            console.log('Exact match results:', exactMatch.length);
            
            // Method 2: Contains search
            const containsMatch = bookings.filter(b => b.buyer_phone && b.buyer_phone.includes(searchValue));
            console.log('Contains match results:', containsMatch.length);
            
            // Method 3: Reverse contains
            const reverseMatch = bookings.filter(b => b.buyer_phone && searchValue.includes(b.buyer_phone));
            console.log('Reverse contains results:', reverseMatch.length);
            
            // Show first few phone numbers for comparison
            console.log('Sample phone numbers in DB:', bookings.slice(0, 10).map(b => `"${b.buyer_phone}"`));
            
            allBookingsForSearch = exactMatch.length > 0 ? exactMatch : 
                                 containsMatch.length > 0 ? containsMatch : 
                                 reverseMatch;
            
            console.log('Final result count:', allBookingsForSearch.length);
            console.log('=== END DEBUG ===');
          } else {
            // Search by booking ID or name
            const foundByBookingId = bookings.find(b => 
              b.booking_id?.toLowerCase().includes(searchValue.toLowerCase())
            );
            
            if (foundByBookingId) {
              // If found by booking ID, get all bookings for that phone
              allBookingsForSearch = bookings.filter(b => b.buyer_phone === foundByBookingId.buyer_phone);
              console.log('Booking ID search - Found', allBookingsForSearch.length, 'bookings for phone:', foundByBookingId.buyer_phone);
            } else {
              // If searching by name, only show bookings with that name
              allBookingsForSearch = bookings.filter(b => 
                b.buyer_name?.toLowerCase().includes(searchValue.toLowerCase())
              );
              console.log('Name search - Found', allBookingsForSearch.length, 'bookings with name containing:', searchValue);
            }
          }
          
          if (allBookingsForSearch.length > 0) {
            // Calculate totals across all bookings
            const totalCapacity = allBookingsForSearch.reduce((sum, booking) => sum + (booking.total_people || 1), 0);
            const totalEntered = allBookingsForSearch.reduce((sum, booking) => sum + (booking.people_entered || 0), 0);
            
            // Use the first booking as the primary result but with aggregated data
            const primaryBooking = { ...allBookingsForSearch[0] };
            primaryBooking.total_people = totalCapacity;
            primaryBooking.people_entered = totalEntered;
            primaryBooking.total_people_entered = totalEntered;
            
            console.log('✅ Found', allBookingsForSearch.length, 'bookings');
            console.log('Total capacity:', totalCapacity, 'Total entered:', totalEntered);
            
            setSearchResult(primaryBooking);
            setAllBookings(allBookingsForSearch);
            setPeopleCount(1);
          } else {
            console.log('❌ Not found in', bookings.length, 'bookings');
            console.log('=== SEARCH FAILED ===');
            console.log('Searched for:', searchValue);
            console.log('All phones in DB:', bookings.map(b => b.buyer_phone).filter(Boolean));
            console.log('Booking sample:', bookings.slice(0, 3));
            console.log('=== END FAILED ===');
            setSearchResult('not_found');
            setAllBookings([]);
          }
        } else {
          console.log('❌ Fallback also failed');
          setSearchResult('not_found');
        }
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      setSearchResult('not_found');
    } finally {
      setLoading(false);
    }
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
    setSearchResult(null);
    setAllBookings([]);
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

      {/* Mode Toggle */}
      <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 mb-4">
        <div className="flex justify-center mb-4">
          <div className="bg-gray-100 p-1 rounded-lg flex w-full sm:w-auto">
            <button
              onClick={() => { setMode('manual'); stopQRScanner(); }}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-3 rounded-md font-medium transition-colors text-sm sm:text-base ${
                mode === 'manual' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FiSearch className="inline mr-1 sm:mr-2" />Manual Search
            </button>
            <button
              onClick={() => { setMode('qr'); startQRScanner(); }}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-3 rounded-md font-medium transition-colors text-sm sm:text-base ${
                mode === 'qr' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FiCamera className="inline mr-1 sm:mr-2" />QR Scanner
            </button>
          </div>
        </div>

        {mode === 'manual' ? (
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
                    
                    // Clear previous timeout
                    if (searchTimeout) {
                      clearTimeout(searchTimeout);
                    }
                    
                    // Clear results only if input is completely empty
                    if (!value.trim()) {
                      setSearchResult(null);
                      setAllBookings([]);
                      setSearchTimeout(null);
                      return;
                    }
                    
                    // Set new timeout for search
                    const newTimeout = setTimeout(() => {
                      handleSearch(value);
                    }, 1000);
                    
                    setSearchTimeout(newTimeout);
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
        ) : (
          <div className="text-center">
            <div className="bg-gray-900 rounded-lg p-3 sm:p-4 mb-4 relative">
              {scanning ? (
                <div>
                  <video
                    ref={videoRef}
                    className="w-full max-w-sm sm:max-w-md mx-auto rounded"
                    style={{ maxHeight: '250px' }}
                  />
                  <div className="absolute inset-0 border-2 border-red-500 rounded-lg pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 border-2 border-red-500 rounded-lg"></div>
                  </div>
                </div>
              ) : (
                <div className="py-8 sm:py-12">
                  <FiCamera className="text-gray-400 text-4xl sm:text-6xl mx-auto mb-4" />
                  <p className="text-gray-400 text-sm sm:text-base">Camera not active</p>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              {scanning ? (
                <>
                  <button
                    onClick={simulateQRScan}
                    className="bg-green-600 text-white px-4 py-2 sm:py-3 rounded-lg hover:bg-green-700 text-sm sm:text-base"
                  >
                    Simulate Scan
                  </button>
                  <button
                    onClick={stopQRScanner}
                    className="bg-red-600 text-white px-4 py-2 sm:py-3 rounded-lg hover:bg-red-700 text-sm sm:text-base"
                  >
                    Stop Scanner
                  </button>
                </>
              ) : (
                <button
                  onClick={startQRScanner}
                  className="bg-blue-600 text-white px-6 py-3 sm:py-4 rounded-lg hover:bg-blue-700 text-base sm:text-lg"
                >
                  <FiCamera className="inline mr-2" />Start QR Scanner
                </button>
              )}
            </div>
          </div>
        )}
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

      {searchResult && searchResult !== 'not_found' && allBookings.length >= 1 && (
        <div className="bg-white rounded-lg shadow-lg border p-3 sm:p-6">
          <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            All Bookings for {searchResult.buyer_phone} ({allBookings.length} total)
          </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {allBookings.map((booking, index) => (
                    <div key={booking._id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 sm:p-3 rounded-t-lg">
                        <div className="flex justify-between items-center">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-xs sm:text-sm truncate">
                              {booking.pass_type_id?.name || 'Pass'}
                            </h4>
                            <p className="text-xs opacity-90 truncate">#{booking.booking_id || `NY2025-${booking._id?.slice(-6)}`}</p>
                          </div>
                          <span className="text-xs bg-white/20 px-1 sm:px-2 py-1 rounded flex-shrink-0 ml-1 sm:ml-2">NY 2025</span>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-2 sm:p-3">
                        <div className="space-y-2 mb-3">
                          <div>
                            <p className="text-gray-500 text-xs">Guest</p>
                            <p className="font-semibold text-xs sm:text-sm truncate">{booking.buyer_name}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Phone</p>
                            <p className="font-semibold text-xs sm:text-sm">{booking.buyer_phone}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-gray-500 text-xs">Amount</p>
                              <p className="font-semibold text-xs sm:text-sm text-green-600">₹{booking.total_amount || booking.pass_type_id?.price || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Capacity</p>
                              <p className="font-semibold text-xs sm:text-sm">{booking.total_people || 1} people</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-1 sm:gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium text-center ${
                            (booking.people_entered || 0) >= (booking.total_people || 1)
                              ? 'bg-green-100 text-green-800'
                              : booking.people_entered > 0
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.people_entered || 0}/{booking.total_people || 1} entered
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium text-center ${
                            booking.payment_status === 'Paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.payment_status || 'Pending'}
                          </span>
                        </div>
                        
                        {booking.payment_mode && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500 text-center">
                              <strong>Payment:</strong> {booking.payment_mode}
                            </p>
                          </div>
                        )}
                        
                        {/* Check-in Button for Individual Booking */}
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          {(booking.people_entered || 0) >= (booking.total_people || 1) ? (
                            <div className="text-center">
                              <span className="text-xs text-green-600 font-medium">✅ Fully Checked In</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                // Set this booking as primary for check-in
                                setSearchResult({
                                  ...booking,
                                  total_people: booking.total_people || 1,
                                  people_entered: booking.people_entered || 0
                                });
                                setPeopleCount(1);
                                handleCheckIn(false);
                              }}
                              className="w-full bg-green-600 text-white py-2 px-2 rounded-lg text-xs hover:bg-green-700 font-medium transition-colors"
                            >
                              Check In ({(booking.total_people || 1) - (booking.people_entered || 0)} available)
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-800">
              <strong>Summary:</strong> {allBookings.reduce((sum, b) => sum + (b.people_entered || 0), 0)} of {allBookings.reduce((sum, b) => sum + (b.total_people || 1), 0)} total people have entered across all bookings.
            </p>
          </div>
        </div>
      )}

      {!searchResult && (
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mt-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">How to use Gate Entry:</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 text-sm sm:text-base text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center text-base sm:text-lg">
                <FiSearch className="mr-2 flex-shrink-0" /> Search Methods:
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span>Scan QR code from guest's phone/print</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span>Enter Pass ID (NY2025-XXXXXX)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span>Search by phone number</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span>Search by guest name</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center text-base sm:text-lg">
                <FiCheckCircle className="mr-2 flex-shrink-0" /> Check-in Process:
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span>Verify guest identity</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span>Check pass validity</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span>Click "Check In Now"</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 flex-shrink-0">•</span>
                  <span>Allow entry to event</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GateEntry;
import { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FiSearch, FiX, FiCheckCircle, FiClock, FiCamera, FiAlertTriangle } from 'react-icons/fi';
import { MdConfirmationNumber } from 'react-icons/md';

const API_URL = import.meta.env.VITE_API_URL || 'https://eventbackend-pi.vercel.app';

const GateEntry = () => {
  const { user } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [peopleCount, setPeopleCount] = useState(1);
  const [mode, setMode] = useState('manual'); // 'manual' or 'qr'
  const [showAdminOverride, setShowAdminOverride] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false);

  const handleSearch = async (searchValue = searchTerm) => {
    if (!searchValue.trim()) return;
    
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
        setSearchResult(data.booking);
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
          
          const found = bookings.find(b => 
            b.booking_id?.toLowerCase().includes(searchValue.toLowerCase()) ||
            b.buyer_phone === searchValue ||
            b.buyer_name?.toLowerCase().includes(searchValue.toLowerCase())
          );
          
          if (found) {
            // Calculate total capacity and entered from passes array if it exists
            if (found.passes && Array.isArray(found.passes)) {
              found.total_people = found.passes.reduce((sum, pass) => sum + pass.people_count, 0);
              found.total_people_entered = found.passes.reduce((sum, pass) => sum + (pass.people_entered || 0), 0);
            } else {
              // Fallback for old structure - find all bookings for same phone
              const allBookingsForPhone = bookings.filter(b => b.buyer_phone === found.buyer_phone);
              const totalCapacity = allBookingsForPhone.reduce((sum, booking) => sum + booking.total_people, 0);
              const totalEntered = allBookingsForPhone.reduce((sum, booking) => sum + (booking.people_entered || 0), 0);
              
              found.total_people = totalCapacity;
              found.people_entered = totalEntered;
            }
          }
          
          if (found) {
            console.log('✅ Found via fallback:', found);
            setSearchResult(found);
            setPeopleCount(1);
          } else {
            console.log('❌ Not found in', bookings.length, 'bookings');
            setSearchResult('not_found');
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
      handleSearch();
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gate Entry</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">Scan or search for passes to check in guests</p>
      </div>

      {/* Mode Toggle */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4">
        <div className="flex justify-center mb-4">
          <div className="bg-gray-100 p-1 rounded-lg flex">
            <button
              onClick={() => { setMode('manual'); stopQRScanner(); }}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                mode === 'manual' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FiSearch className="inline mr-2" />Manual Search
            </button>
            <button
              onClick={() => { setMode('qr'); startQRScanner(); }}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                mode === 'qr' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FiCamera className="inline mr-2" />QR Scanner
            </button>
          </div>
        </div>

        {mode === 'manual' ? (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Pass</label>
              <input
                type="text"
                placeholder="Enter Pass ID, Phone Number, or Name"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-lg"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (e.target.value.trim()) {
                    setTimeout(() => handleSearch(e.target.value), 500);
                  }
                }}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => handleSearch()}
                disabled={loading || !searchTerm.trim()}
                className="w-full sm:w-auto bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium text-sm sm:text-base"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-gray-900 rounded-lg p-4 mb-4 relative">
              {scanning ? (
                <div>
                  <video
                    ref={videoRef}
                    className="w-full max-w-md mx-auto rounded"
                    style={{ maxHeight: '300px' }}
                  />
                  <div className="absolute inset-0 border-2 border-red-500 rounded-lg pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-red-500 rounded-lg"></div>
                  </div>
                </div>
              ) : (
                <div className="py-12">
                  <FiCamera className="text-gray-400 text-6xl mx-auto mb-4" />
                  <p className="text-gray-400">Camera not active</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-center">
              {scanning ? (
                <>
                  <button
                    onClick={simulateQRScan}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Simulate Scan
                  </button>
                  <button
                    onClick={stopQRScanner}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Stop Scanner
                  </button>
                </>
              ) : (
                <button
                  onClick={startQRScanner}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
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
          <div className="flex items-center">
            <FiX className="text-red-400 text-3xl sm:text-4xl mr-3 sm:mr-4 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Pass Not Found</h3>
              <p className="text-red-600 mt-1">No booking found with the provided information. Please check and try again.</p>
              <p className="text-red-500 text-sm mt-2">💡 Check browser console (F12) for debug info</p>
            </div>
          </div>
        </div>
      )}

      {searchResult && searchResult !== 'not_found' && (
        <div className="bg-white rounded-lg shadow-lg border">
          <div className="bg-blue-600 text-white p-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold">
                  {searchResult.passes && searchResult.passes.length > 0 
                    ? `${searchResult.passes.length} Pass${searchResult.passes.length > 1 ? 'es' : ''} (${searchResult.passes.map(p => p.pass_type_name || 'Pass').join(', ')})` 
                    : (searchResult.pass_type_id?.name || 'Pass')}
                </h3>
                <p className="text-xs opacity-90">#{searchResult.booking_id}</p>
              </div>
              <span className="text-xs bg-white/20 px-2 py-1 rounded">NY 2025</span>
            </div>
          </div>

          <div className="p-3">
            <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
              <div className="text-center">
                <p className="text-gray-500">Guest</p>
                <p className="font-semibold">{searchResult.buyer_name}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Phone</p>
                <p className="font-semibold">{searchResult.buyer_phone}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Entry Status</p>
                <p className="font-semibold">{searchResult.total_people_entered || searchResult.people_entered || 0} of {searchResult.total_people}</p>
              </div>
            </div>

            <div className="border-t pt-6">
              {searchResult.checked_in && (searchResult.total_people_entered || searchResult.people_entered || 0) >= searchResult.total_people ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <FiAlertTriangle className="text-red-400 text-4xl mr-4 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-800">⚠️ ALREADY CHECKED IN</h3>
                      <p className="text-red-600 mt-1">
                        Checked in at: {searchResult.checked_in_at ? new Date(searchResult.checked_in_at).toLocaleString() : 'Unknown time'}
                      </p>
                      <p className="text-red-600">
                        By: {searchResult.scanned_by || 'Unknown staff'}
                      </p>
                      <p className="text-red-600 font-medium">
                        All {searchResult.total_people} people have entered. Pass fully utilized.
                      </p>
                    </div>
                  </div>
                  
                  {!showAdminOverride ? (
                    <div className="mt-4">
                      <button
                        onClick={() => setShowAdminOverride(true)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                      >
                        🔐 Admin Override
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold text-gray-800 mb-2">Admin Override Required</h4>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          placeholder="Enter Admin PIN"
                          className="flex-1 px-3 py-2 border rounded-lg"
                          value={adminPin}
                          onChange={(e) => setAdminPin(e.target.value)}
                        />
                        <button
                          onClick={() => handleCheckIn(true)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                          Override
                        </button>
                        <button
                          onClick={() => { setShowAdminOverride(false); setAdminPin(''); }}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (searchResult.total_people_entered || searchResult.people_entered || 0) >= searchResult.total_people ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <FiCheckCircle className="text-green-400 text-4xl mr-4" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-800">Fully Checked In</h3>
                      <p className="text-green-600 mt-1">
                        All {searchResult.total_people} people have entered. Pass is fully utilized.
                      </p>
                      {searchResult.checked_in_at && (
                        <p className="text-green-600 text-sm mt-1">
                          Last entry: {new Date(searchResult.checked_in_at).toLocaleString()} by {searchResult.scanned_by}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <div className="text-center">
                    <p className="text-sm font-bold text-green-800 mb-2">Ready for Entry</p>
                    <p className="text-xs text-green-700 mb-2">
                      {searchResult.total_people - (searchResult.total_people_entered || searchResult.people_entered || 0)} can enter
                    </p>
                    
                    {(searchResult.total_people_entered || searchResult.people_entered || 0) > 0 && (
                      <div className="mb-2 p-1 bg-amber-100 rounded text-xs text-amber-800">
                        {searchResult.total_people_entered || searchResult.people_entered} entered
                      </div>
                    )}
                    
                    <div className="mb-2">
                      <select
                        value={peopleCount}
                        onChange={(e) => setPeopleCount(Number(e.target.value))}
                        className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      >
                        {Array.from({ length: searchResult.total_people - (searchResult.total_people_entered || searchResult.people_entered || 0) }, (_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1} person{i > 0 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                    
                    <button
                      onClick={() => handleCheckIn(false)}
                      className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 font-semibold"
                    >
                      <FiCheckCircle className="inline mr-1" /> 
                      Check In {peopleCount}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {searchResult.payment_status && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Payment:</strong> {searchResult.payment_status} via {searchResult.payment_mode}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {!searchResult && (
        <div className="bg-gray-50 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to use Gate Entry:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center"><FiSearch className="mr-2" /> Search Methods:</h4>
              <ul className="space-y-1">
                <li>• Scan QR code from guest's phone/print</li>
                <li>• Enter Pass ID (NY2025-XXXXXX)</li>
                <li>• Search by phone number</li>
                <li>• Search by guest name</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center"><FiCheckCircle className="mr-2" /> Check-in Process:</h4>
              <ul className="space-y-1">
                <li>• Verify guest identity</li>
                <li>• Check pass validity</li>
                <li>• Click "Check In Now"</li>
                <li>• Allow entry to event</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GateEntry;
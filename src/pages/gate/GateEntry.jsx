import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FiSearch, FiX, FiCheckCircle, FiClock } from 'react-icons/fi';
import { MdConfirmationNumber } from 'react-icons/md';

const GateEntry = () => {
  const { bookings, updateBooking } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setTimeout(() => {
      const booking = bookings.find(b => 
        b.id.toLowerCase() === searchTerm.toLowerCase() ||
        b.buyerPhone === searchTerm ||
        b.qrCodeValue === searchTerm ||
        b.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResult(booking || 'not_found');
      setLoading(false);
    }, 500);
  };

  const handleCheckIn = () => {
    if (searchResult && searchResult !== 'not_found') {
      const updates = { 
        checkedIn: true, 
        checkedInAt: new Date().toISOString(),
        scannedBy: 'Gate Staff',
        peopleEntered: searchResult.totalPeople
      };
      updateBooking(searchResult.id, updates);
      setSearchResult({ ...searchResult, ...updates });
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

      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Pass</label>
            <input
              type="text"
              placeholder="Enter Pass ID, Phone Number, QR Code, or Name"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading || !searchTerm.trim()}
              className="w-full sm:w-auto bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium text-sm sm:text-base"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

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
            </div>
          </div>
        </div>
      )}

      {searchResult && searchResult !== 'not_found' && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">{searchResult.passType} Pass</h2>
                <p className="text-blue-100 mt-1">Pass ID: {searchResult.id}</p>
              </div>
              <div className="text-right">
                <MdConfirmationNumber className="text-3xl mb-2" />
                <div className="text-sm text-blue-100">New Year 2025</div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Buyer Name</label>
                  <p className="text-lg font-semibold text-gray-900">{searchResult.buyerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-lg font-semibold text-gray-900">{searchResult.buyerPhone}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Pass Type</label>
                  <p className="text-lg font-semibold text-gray-900">{searchResult.passType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Max People Allowed</label>
                  <p className="text-lg font-semibold text-gray-900">{searchResult.totalPeople} persons</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              {searchResult.checkedIn ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <FiCheckCircle className="text-green-400 text-4xl mr-4" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-800">Already Checked In</h3>
                      <p className="text-green-600 mt-1">
                        This pass was checked in on {new Date(searchResult.checkedInAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-100 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>Note:</strong> This pass has already been used for entry. Contact supervisor if re-entry is required.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="text-center">
                    <MdConfirmationNumber className="text-blue-400 text-4xl mb-4" />
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Ready for Check-In</h3>
                    <p className="text-blue-600 mb-6">This pass is valid and ready for entry. Click below to check in the guest(s).</p>
                    <button
                      onClick={handleCheckIn}
                      className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium text-lg"
                    >
                      <FiCheckCircle className="inline mr-2" /> Check In Now
                    </button>
                  </div>
                </div>
              )}
            </div>
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
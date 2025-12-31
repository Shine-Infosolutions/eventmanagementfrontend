import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    passTypes: [],
    checkedIn: 0,
    pending: 0,
    recentBookings: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const downloadReport = () => {
    const csvData = [
      ['Booking ID', 'Customer Name', 'Phone', 'Pass Type', 'Amount', 'Payment Status', 'Check-in Status', 'People Entered', 'Created Date'],
      ...stats.recentBookings.map(booking => [
        booking.booking_id,
        booking.buyer_name,
        booking.buyer_phone,
        booking.pass_type_id?.name || 'N/A',
        booking.total_amount || booking.pass_type_id?.price || 0,
        booking.payment_status,
        booking.checked_in ? 'Checked In' : 'Pending',
        booking.people_entered || 0,
        new Date(booking.createdAt).toLocaleDateString()
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const loadDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const [passTypesRes, allBookingsRes, staffBookingsRes] = await Promise.all([
        fetch(`${API_URL}/api/pass-types`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/bookings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/bookings/staff-only`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (passTypesRes.ok && allBookingsRes.ok && staffBookingsRes.ok) {
        const passTypes = await passTypesRes.json();
        const allBookings = await allBookingsRes.json();
        const staffBookings = await staffBookingsRes.json();
        
        // Calculate revenue from all paid bookings
        const paidBookings = allBookings.filter(b => b.payment_status === 'Paid');
        const totalRevenue = paidBookings.reduce((sum, b) => {
          // Use actual total_amount from booking (handles owner passes with 0 amount)
          return sum + (b.total_amount || 0);
        }, 0);
        
        // Use all bookings for other stats (check-in, etc.)
        const checkedInBookings = allBookings.filter(b => b.status === 'Checked-in' || b.checked_in);
        const totalPeopleEntered = allBookings.reduce((sum, b) => sum + (b.people_entered || 0), 0);
        const pendingEntry = allBookings.filter(b => 
          (!b.status || b.status === 'Pending') && 
          !b.checked_in && 
          (b.people_entered === 0 || !b.people_entered)
        ).length;
        
        // Pass type breakdown with revenue from all bookings
        const passTypeStats = passTypes.map(pt => {
          const typeBookings = allBookings.filter(b => 
            (typeof b.pass_type_id === 'object' ? b.pass_type_id._id : b.pass_type_id) === pt._id
          );
          const typePaidBookings = typeBookings.filter(b => b.payment_status === 'Paid');
          const typeRevenue = typePaidBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
          return {
            ...pt,
            count: typePaidBookings.length,
            revenue: typeRevenue,
            peopleEntered: typeBookings.reduce((sum, b) => sum + (b.people_entered || 0), 0)
          };
        });

        setStats({
          totalBookings: allBookings.length,
          paidBookings: paidBookings.length,
          totalRevenue,
          passTypes: passTypeStats,
          checkedIn: checkedInBookings.length,
          pending: pendingEntry,
          totalPeopleEntered,
          recentBookings: allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
        });
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, trend, onClick }) => {
    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onClick) {
        onClick();
      }
    };

    return (
      <div 
        className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 ${
          onClick ? 'cursor-pointer hover:border-blue-300 hover:shadow-lg transform hover:scale-105' : ''
        }`}
        onClick={handleClick}
        role={onClick ? 'button' : 'presentation'}
        tabIndex={onClick ? 0 : -1}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && <p className="text-sm text-green-600 mt-1">↗ {trend}</p>}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <span className="text-2xl">{icon}</span>
          </div>
        </div>
        {onClick && (
          <div className="mt-2 text-xs text-blue-600 font-medium">Click to view details →</div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2 text-base sm:text-lg">Welcome back, {user?.name || 'Admin'}</p>
            <p className="text-xs sm:text-sm text-gray-500">New Year 2025 Event Management</p>
          </div>
          <button
            onClick={downloadReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <span>📊</span>
            Download Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard 
          title="Total Bookings" 
          value={stats.totalBookings} 
          icon="🎫" 
          color="bg-blue-100 text-blue-600"
          trend={`${stats.paidBookings} paid`}
          onClick={() => {
            console.log('Clicking Total Bookings card');
            try {
              navigate('/bookings');
              console.log('Navigation called');
            } catch (error) {
              console.error('Navigation error:', error);
            }
          }}
        />
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.totalRevenue.toLocaleString()}`} 
          icon="💰" 
          color="bg-green-100 text-green-600"
          trend={`${stats.paidBookings} transactions`}
        />
        <StatCard 
          title="People Entered" 
          value={stats.totalPeopleEntered} 
          icon="👥" 
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard 
          title="Pending Entry" 
          value={stats.pending} 
          icon="⏳" 
          color="bg-amber-100 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Pass Type Analytics</h3>
          <div className="space-y-4">
            {stats.passTypes && stats.passTypes.length > 0 ? (
              stats.passTypes.map((passType, index) => {
                const colors = ['bg-purple-500', 'bg-pink-500', 'bg-blue-500'];
                const bgColors = ['bg-purple-50', 'bg-pink-50', 'bg-blue-50'];
                const percentage = stats.totalBookings > 0 ? (passType.count / stats.totalBookings * 100).toFixed(1) : 0;
                
                return (
                  <div key={passType._id} className={`p-4 ${bgColors[index]} rounded-lg`}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 ${colors[index]} rounded-full mr-3`}></div>
                        <span className="font-semibold text-gray-900">{passType.name} Pass</span>
                        <span className="ml-2 text-sm text-gray-500">₹{passType.price}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-lg">{passType.count || 0}</span>
                        <span className="text-sm text-gray-500 ml-1">({percentage}%)</span>
                        <div className="text-xs text-gray-400">₹{(passType.revenue || 0).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`${colors[index]} h-2 rounded-full`} style={{width: `${percentage}%`}}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📊</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Pass Types Found</h4>
                <p className="text-gray-600 mb-4">Create pass types to see analytics</p>
                <button 
                  onClick={() => navigate('/sell-pass')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Pass Type
                </button>
              </div>
            )}
          </div>
        </div>

        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/sell-pass')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center font-medium"
            >
              <span className="mr-2">🎫</span>Sell New Pass
            </button>
            <button
              onClick={() => navigate('/bookings')}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center font-medium"
            >
              <span className="mr-2">📋</span>View Bookings
            </button>
            <button
              onClick={() => navigate('/gate-entry')}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all flex items-center justify-center font-medium"
            >
              <span className="mr-2">🚪</span>Gate Entry
            </button>
            <button
              onClick={() => navigate('/manage-pass-types')}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all flex items-center justify-center font-medium"
            >
              <span className="mr-2">🎫</span>Manage Pass Types
            </button>
            <button
              onClick={downloadReport}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white p-4 rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all flex items-center justify-center font-medium"
            >
              <span className="mr-2">📊</span>Download Report
            </button>
          </div>
        </div> */}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Recent Bookings</h3>
          <button
            onClick={() => navigate('/bookings')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All →
          </button>
        </div>
        
        {stats.recentBookings && stats.recentBookings.length > 0 ? (
          <>
            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-3">
              {stats.recentBookings.map((booking) => (
                <div 
                  key={booking._id} 
                  className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all"
                  onClick={() => navigate('/bookings')}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-mono text-sm text-gray-900">{booking.booking_id || `NY2025-${booking._id?.slice(-6)}`}</div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.checked_in 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.checked_in ? 'Checked In' : 'Pending'}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="font-medium text-gray-900">{booking.buyer_name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{booking.buyer_phone || 'N/A'}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {booking.pass_type_id?.name || 'Unknown'}
                    </span>
                    <span className="font-semibold text-gray-900">₹{booking.total_amount || booking.pass_type_id?.price || 0}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Booking ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Pass Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBookings.map((booking) => (
                    <tr 
                      key={booking._id} 
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate('/bookings')}
                    >
                      <td className="py-3 px-4 font-mono text-sm">{booking.booking_id || `NY2025-${booking._id?.slice(-6)}`}</td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{booking.buyer_name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{booking.buyer_phone || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {booking.pass_type_id?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          booking.checked_in 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.checked_in ? 'Checked In' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold">₹{booking.total_amount || booking.pass_type_id?.price || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">📋</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Recent Bookings</h4>
            <p className="text-gray-600 mb-4">Start selling passes to see recent bookings here</p>
            <button 
              onClick={() => navigate('/sell-pass')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create First Booking
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
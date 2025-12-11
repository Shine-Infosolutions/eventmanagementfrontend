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

  const loadDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const [statsRes, bookingsRes, entryLogsRes] = await Promise.all([
        fetch(`${API_URL}/api/pass-types/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/bookings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/entry/logs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ ok: false }))
      ]);

      if (statsRes.ok && bookingsRes.ok) {
        const dashboardStats = await statsRes.json();
        const bookings = await bookingsRes.json();
        const entryLogs = entryLogsRes.ok ? await entryLogsRes.json() : [];
        
        // Calculate revenue from paid bookings only
        const paidBookings = bookings.filter(b => b.payment_status === 'Paid');
        const totalRevenue = paidBookings.reduce((sum, b) => {
          const price = typeof b.pass_type_id === 'object' ? b.pass_type_id.price : dashboardStats.passTypes?.find(pt => pt._id === b.pass_type_id)?.price || 0;
          return sum + price;
        }, 0);
        
        // Calculate check-in stats
        const checkedIn = bookings.filter(b => b.checked_in || b.people_entered > 0).length;
        const totalPeopleEntered = bookings.reduce((sum, b) => sum + (b.people_entered || 0), 0);
        
        // Pass type breakdown with revenue
        const passTypeStats = dashboardStats.passTypes?.map(pt => {
          const typeBookings = paidBookings.filter(b => 
            (typeof b.pass_type_id === 'object' ? b.pass_type_id._id : b.pass_type_id) === pt._id
          );
          return {
            ...pt,
            count: typeBookings.length,
            revenue: typeBookings.length * pt.price,
            peopleEntered: typeBookings.reduce((sum, b) => sum + (b.people_entered || 0), 0)
          };
        }) || [];

        setStats({
          totalBookings: bookings.length,
          paidBookings: paidBookings.length,
          totalRevenue,
          passTypes: passTypeStats,
          checkedIn,
          pending: bookings.length - checkedIn,
          totalPeopleEntered,
          recentBookings: bookings.slice(-5).reverse(),
          entryLogs: entryLogs.slice(-10) || []
        });
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, trend }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
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
    </div>
  );

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
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2 text-base sm:text-lg">Welcome back, {user?.name || 'Admin'}</p>
        <p className="text-xs sm:text-sm text-gray-500">New Year 2025 Event Management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard 
          title="Total Bookings" 
          value={stats.totalBookings} 
          icon="🎫" 
          color="bg-blue-100 text-blue-600"
          trend={`${stats.paidBookings} paid`}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Pass Type Analytics</h3>
          <div className="space-y-4">
            {stats.passTypes.map((passType, index) => {
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
                      <span className="font-bold text-lg">{passType.count}</span>
                      <span className="text-sm text-gray-500 ml-1">({percentage}%)</span>
                      <div className="text-xs text-gray-400">₹{passType.revenue?.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`${colors[index]} h-2 rounded-full`} style={{width: `${percentage}%`}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
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
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 overflow-x-auto">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Bookings</h3>
        <div className="overflow-x-auto">
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
                <tr key={booking._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-sm">{booking.booking_id}</td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">{booking.buyer_name}</div>
                      <div className="text-sm text-gray-500">{booking.buyer_phone}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {booking.pass_type_id?.name}
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
                  <td className="py-3 px-4 font-semibold">₹{booking.pass_type_id?.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
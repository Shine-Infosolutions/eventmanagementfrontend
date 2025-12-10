import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import Button from '../../components/Button';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, bookings } = useAppContext();
  const [stats, setStats] = useState({
    totalPasses: 0,
    totalRevenue: 0,
    teensCount: 0,
    coupleCount: 0,
    familyCount: 0,
    checkedIn: 0,
    notCheckedIn: 0
  });

  useEffect(() => {
    const newStats = bookings.reduce((acc, booking) => {
      acc.totalPasses++;
      acc.totalRevenue += booking.price;
      if (booking.passType === 'Teens') acc.teensCount++;
      if (booking.passType === 'Couple') acc.coupleCount++;
      if (booking.passType === 'Family') acc.familyCount++;
      if (booking.checkedIn) acc.checkedIn++;
      else acc.notCheckedIn++;
      return acc;
    }, { totalPasses: 0, totalRevenue: 0, teensCount: 0, coupleCount: 0, familyCount: 0, checkedIn: 0, notCheckedIn: 0 });
    setStats(newStats);
  }, [bookings]);

  const StatCard = ({ title, value, icon, color = "blue" }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600 mr-4`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Passes Sold" value={stats.totalPasses} icon="🎫" color="blue" />
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon="💰" color="green" />
        <StatCard title="Checked In" value={stats.checkedIn} icon="✅" color="green" />
        <StatCard title="Pending Check-in" value={stats.notCheckedIn} icon="⏳" color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pass Type Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-purple-600 mr-3">👤</span>
                <span className="font-medium">Teens Pass</span>
              </div>
              <span className="font-bold text-purple-600">{stats.teensCount}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-pink-600 mr-3">💑</span>
                <span className="font-medium">Couple Pass</span>
              </div>
              <span className="font-bold text-pink-600">{stats.coupleCount}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-blue-600 mr-3">👨👩👧👦</span>
                <span className="font-medium">Family Pass</span>
              </div>
              <span className="font-bold text-blue-600">{stats.familyCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button onClick={() => navigate('/sell-pass')} variant="primary" size="lg" className="w-full">
              <span className="mr-2">🎫</span>Sell New Pass
            </Button>
            <Button onClick={() => navigate('/bookings')} variant="success" size="lg" className="w-full">
              <span className="mr-2">📋</span>View All Bookings
            </Button>
            <Button onClick={() => navigate('/gate-entry')} variant="secondary" size="lg" className="w-full bg-purple-600 hover:bg-purple-700">
              <span className="mr-2">🚪</span>Gate Entry
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
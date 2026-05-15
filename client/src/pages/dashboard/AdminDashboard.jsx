import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getMenuItemsByRole } from '../../utils/menuItems';
import { FaUsers, FaUserShield, FaCalendarCheck, FaRupeeSign, FaChartLine, FaArrowUp, FaArrowDown, FaSpinner } from 'react-icons/fa';
import api from '../../services/api';

const StatCard = ({ title, value, label, icon: Icon, trend, color, gradient, isLoading }) => (
  <div className={`p-6 rounded-2xl border border-neutral-700/50 bg-gradient-to-br ${gradient} backdrop-blur-sm hover:translate-y-[-2px] transition-transform duration-300 relative overflow-hidden group`}>
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300`}>
      <Icon className="text-8xl" />
    </div>
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-neutral-900/50 border border-neutral-700/50 text-${color}-400`}>
          <Icon className="text-2xl" />
        </div>
        {trend !== undefined && trend !== null && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${trend > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend > 0 ? <FaArrowUp /> : <FaArrowDown />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <h3 className="text-neutral-400 text-sm font-medium mb-1">{title}</h3>
      <div className={`text-3xl font-black text-${color}-400 mb-2`}>
        {isLoading ? <FaSpinner className="animate-spin text-xl" /> : value}
      </div>
      <p className="text-neutral-500 text-xs">{label}</p>
    </div>
  </div>
);

const ActivityItem = ({ title, time, type }) => {
  const formatTime = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return past.toLocaleDateString();
  };

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-neutral-800/30 transition-colors border border-transparent hover:border-neutral-700/30 group">
      <div className={`mt-1 w-2 h-2 rounded-full ${type === 'success' ? 'bg-green-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'} shadow-lg shadow-${type === 'success' ? 'green' : type === 'warning' ? 'yellow' : 'blue'}-500/50`} />
      <div className="flex-1">
        <p className="text-neutral-200 text-sm font-medium group-hover:text-yellow-500 transition-colors">{title}</p>
        <p className="text-neutral-500 text-xs mt-1">{formatTime(time)}</p>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const menuItems = getMenuItemsByRole('admin');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  const getTechnicianCount = () => {
    if (!stats?.users?.byRole) return 0;
    const tech = stats.users.byRole.find(r => r._id === 'technician');
    return tech?.count || 0;
  };

  return (
    <DashboardLayout title="Admin Overview" menuItems={menuItems}>
      {/* Welcome Section */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-yellow-500/10 via-orange-500/5 to-transparent border border-yellow-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back, Admin! 👋</h2>
            <p className="text-neutral-400">Here's what's happening on your platform today.</p>
          </div>
          <div className="hidden md:flex gap-3">
            <button 
              onClick={() => navigate('/admin/analytics')}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-sm font-medium transition-colors border border-neutral-700"
            >
              View Analytics
            </button>
            <button 
              onClick={() => navigate('/admin/users')}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg text-sm font-bold transition-colors shadow-lg shadow-yellow-500/20"
            >
              Manage Users
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={stats?.users?.total || 0} 
          label={`+${stats?.users?.newThisWeek || 0} new this week`} 
          icon={FaUsers} 
          trend={stats?.users?.newThisWeek > 0 ? Math.round((stats.users.newThisWeek / (stats.users.total || 1)) * 100) : null}
          color="yellow"
          gradient="from-neutral-800 to-neutral-800/50"
          isLoading={isLoading}
        />
        <StatCard 
          title="Technicians" 
          value={getTechnicianCount()} 
          label={`${stats?.users?.pendingVerifications || 0} pending verification`} 
          icon={FaUserShield} 
          color="blue"
          gradient="from-neutral-800 to-neutral-800/50"
          isLoading={isLoading}
        />
        <StatCard 
          title="Total Bookings" 
          value={stats?.bookings?.total || 0} 
          label={`${stats?.bookings?.active || 0} active now`} 
          icon={FaCalendarCheck} 
          color="purple"
          gradient="from-neutral-800 to-neutral-800/50"
          isLoading={isLoading}
        />
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(stats?.revenue?.total || 0)} 
          label={`+${formatCurrency(stats?.revenue?.thisMonth || 0)} this month`} 
          icon={FaRupeeSign} 
          color="orange"
          gradient="from-neutral-800 to-neutral-800/50"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Section */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FaChartLine className="text-yellow-500" />
                Platform Overview
              </h3>
            </div>
            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
                <p className="text-2xl font-bold text-yellow-400">{stats?.services?.categories || 0}</p>
                <p className="text-xs text-neutral-500">Categories</p>
              </div>
              <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
                <p className="text-2xl font-bold text-blue-400">{stats?.services?.subServices || 0}</p>
                <p className="text-xs text-neutral-500">Sub-Services</p>
              </div>
              <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
                <p className="text-2xl font-bold text-green-400">{stats?.bookings?.completed || 0}</p>
                <p className="text-xs text-neutral-500">Completed</p>
              </div>
              <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
                <p className="text-2xl font-bold text-purple-400">{stats?.bookings?.thisMonth || 0}</p>
                <p className="text-xs text-neutral-500">This Month</p>
              </div>
            </div>
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/admin/services')}
                className="p-4 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-xl text-left transition-colors group"
              >
                <p className="text-white font-medium group-hover:text-yellow-500 transition-colors">Manage Services</p>
                <p className="text-neutral-500 text-sm">Categories & subservices</p>
              </button>
              <button 
                onClick={() => navigate('/admin/bookings')}
                className="p-4 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-xl text-left transition-colors group"
              >
                <p className="text-white font-medium group-hover:text-yellow-500 transition-colors">View Bookings</p>
                <p className="text-neutral-500 text-sm">All platform bookings</p>
              </button>
            </div>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Recent Activity</h3>
              <span className="text-xs text-neutral-500">Live updates</span>
            </div>
            <div className="flex-1 space-y-1 overflow-y-auto max-h-[350px] pr-2">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <FaSpinner className="animate-spin text-2xl text-yellow-500" />
                </div>
              ) : stats?.recentActivities?.length > 0 ? (
                stats.recentActivities.map((activity, index) => (
                  <ActivityItem 
                    key={index}
                    title={activity.title} 
                    time={activity.time} 
                    type={activity.type} 
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-neutral-800/50 flex items-center justify-center mb-4">
                    <FaCalendarCheck className="text-2xl text-neutral-600" />
                  </div>
                  <p className="text-neutral-400 font-medium mb-2">No recent activity</p>
                  <p className="text-neutral-500 text-sm mb-4">Activities will appear here when<br/>users or bookings are created</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="text-yellow-500 text-sm hover:text-yellow-400 transition-colors"
                  >
                    Refresh page
                  </button>
                </div>
              )}
            </div>
            <button 
              onClick={() => navigate('/admin/bookings')}
              className="w-full mt-4 py-3 text-sm text-yellow-500 hover:text-yellow-400 hover:bg-neutral-800/50 font-medium transition-all rounded-xl border border-neutral-700/50"
            >
              View All Bookings →
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;


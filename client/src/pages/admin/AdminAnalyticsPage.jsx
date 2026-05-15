import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getMenuItemsByRole } from '../../utils/menuItems';
import { FaChartLine, FaChartPie, FaChartBar, FaUserFriends, FaRupeeSign, FaArrowUp, FaArrowDown, FaCalendarAlt, FaSpinner } from 'react-icons/fa';
import api from '../../services/api';

const StatCard = ({ title, value, label, icon: Icon, trend, color, gradient, isLoading }) => (
  <div className={`p-6 rounded-2xl border border-neutral-700/50 bg-gradient-to-br ${gradient} backdrop-blur-sm hover:translate-y-[-2px] transition-transform duration-300 relative overflow-hidden group shadow-lg`}>
    <div className={`absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500`}>
      <Icon className="text-9xl" />
    </div>
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-neutral-900/50 border border-neutral-700/50 text-${color}-400`}>
          <Icon className="text-2xl" />
        </div>
        {trend !== undefined && trend !== null && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${trend >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend >= 0 ? <FaArrowUp /> : <FaArrowDown />}
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

const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const menuItems = getMenuItemsByRole('admin');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/admin/analytics');
        setAnalytics(response.data.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  return (
    <DashboardLayout title="Analytics & Reports" menuItems={menuItems}>
      {/* Date Range Picker Placeholder */}
      <div className="flex justify-end mb-6">
        <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900/50 border border-neutral-700/50 rounded-xl text-sm font-medium text-neutral-300 hover:text-white hover:border-yellow-500/50 transition-all">
          <FaCalendarAlt className="text-yellow-500" /> Last 30 Days
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(analytics?.revenue?.total)} 
          label={`+${formatCurrency(analytics?.revenue?.thisMonth)} this month`}
          icon={FaRupeeSign} 
          trend={analytics?.revenue?.trend} 
          color="yellow" 
          gradient="from-neutral-900 to-yellow-900/10"
          isLoading={isLoading}
        />
        <StatCard 
          title="User Growth" 
          value={analytics?.users?.total || 0} 
          label={`+${analytics?.users?.newThisMonth || 0} new users`}
          icon={FaUserFriends} 
          trend={analytics?.users?.trend} 
          color="blue" 
          gradient="from-neutral-900 to-blue-900/10"
          isLoading={isLoading}
        />
        <StatCard 
          title="Completion Rate" 
          value={`${analytics?.bookings?.conversionRate || 0}%`} 
          label="Completed bookings" 
          icon={FaChartPie} 
          color="purple" 
          gradient="from-neutral-900 to-purple-900/10"
          isLoading={isLoading}
        />
        <StatCard 
          title="Avg. Ticket Size" 
          value={formatCurrency(analytics?.bookings?.avgTicketSize)} 
          label="Per booking" 
          icon={FaChartBar} 
          color="orange" 
          gradient="from-neutral-900 to-orange-900/10"
          isLoading={isLoading}
        />
      </div>

      {/* Booking Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
            <FaChartPie className="text-purple-500" />
            Booking Status Breakdown
          </h3>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="animate-spin text-3xl text-yellow-500" />
            </div>
          ) : (
            <div className="space-y-4">
              {analytics?.bookings?.statusBreakdown?.map((status, i) => {
                const total = analytics.bookings.total || 1;
                const percentage = Math.round((status.count / total) * 100);
                const colors = {
                  pending: 'yellow',
                  accepted: 'blue',
                  'on-the-way': 'cyan',
                  'in-progress': 'purple',
                  completed: 'green',
                  cancelled: 'red'
                };
                const color = colors[status._id] || 'neutral';
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-neutral-400 capitalize">{status._id?.replace(/-/g, ' ')}</span>
                      <span className={`text-${color}-400 font-bold`}>{status.count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div className={`h-full bg-${color}-500`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
            <FaChartLine className="text-yellow-500" />
            Monthly Revenue
          </h3>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="animate-spin text-3xl text-yellow-500" />
            </div>
          ) : (
            <div className="h-48 flex items-end justify-between gap-2 px-2">
              {analytics?.monthlyRevenue?.length > 0 ? (
                analytics.monthlyRevenue.map((month, i) => {
                  const maxRevenue = Math.max(...analytics.monthlyRevenue.map(m => m.total));
                  const height = maxRevenue > 0 ? (month.total / maxRevenue) * 100 : 0;
                  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-neutral-800/50 rounded-t-lg relative overflow-hidden group hover:bg-yellow-500/20 transition-colors"
                        style={{ height: `${Math.max(height, 5)}%` }}
                      >
                        <div className="absolute bottom-0 w-full h-1 bg-yellow-500" />
                      </div>
                      <span className="text-[10px] text-neutral-500">{monthNames[month._id.month]}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-neutral-500 text-center w-full">No revenue data</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-2 rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
          <h3 className="text-lg font-bold text-white mb-6">Top Performing Services</h3>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="animate-spin text-3xl text-yellow-500" />
            </div>
          ) : analytics?.topServices?.length > 0 ? (
            <div className="space-y-4">
              {analytics.topServices.map((service, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-neutral-800/30 hover:bg-neutral-800/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 font-bold border border-neutral-700">#{i+1}</div>
                    <div>
                      <p className="font-semibold text-white">{service.name}</p>
                      <p className="text-xs text-neutral-500">{service.count} bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-yellow-500">{formatCurrency(service.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-center py-8">No service data available</p>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
          <h3 className="text-lg font-bold text-white mb-6">Platform Health</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-neutral-400">Bookings Completed</span>
                <span className="text-green-400 font-bold">{analytics?.bookings?.completed || 0}/{analytics?.bookings?.total || 0}</span>
              </div>
              <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500" 
                  style={{ width: `${analytics?.bookings?.conversionRate || 0}%` }} 
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-neutral-400">Technician Availability</span>
                <span className="text-blue-400 font-bold">{analytics?.technicianAvailability || 0}%</span>
              </div>
              <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500" 
                  style={{ width: `${analytics?.technicianAvailability || 0}%` }} 
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-neutral-400">This Month's Revenue</span>
                <span className="text-yellow-400 font-bold">{formatCurrency(analytics?.revenue?.thisMonth)}</span>
              </div>
              <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500" 
                  style={{ width: analytics?.revenue?.total > 0 ? `${Math.min((analytics.revenue.thisMonth / analytics.revenue.total) * 100, 100)}%` : '0%' }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalyticsPage;


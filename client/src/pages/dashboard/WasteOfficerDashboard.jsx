import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getMenuItemsByRole } from '../../utils/menuItems';
import api from '../../services/api';
import { FaRecycle, FaWeight, FaCheckCircle, FaRupeeSign, FaArrowRight, FaClock, FaMapMarkerAlt, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

const WasteOfficerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const menuItems = getMenuItemsByRole('wasteOfficer');
  
  const [stats, setStats] = useState(null);
  const [pendingPickups, setPendingPickups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, pendingRes] = await Promise.all([
          api.get('/waste/stats'),
          api.get('/waste/pending'),
        ]);
        setStats(statsRes.data.data);
        setPendingPickups(pendingRes.data.data || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      title: 'Pending Pickups',
      value: stats?.overview?.pendingCount || 0,
      icon: <FaClock />,
      color: 'from-orange-500/20 to-red-500/20',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-400',
    },
    {
      title: 'Total Collected',
      value: `${stats?.overview?.totalWeight || 0} kg`,
      icon: <FaWeight />,
      color: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-400',
    },
    {
      title: 'Completed',
      value: stats?.overview?.completedCount || 0,
      icon: <FaCheckCircle />,
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
    },
    {
      title: 'Total Value',
      value: `₹${stats?.overview?.totalValue || 0}`,
      icon: <FaRupeeSign />,
      color: 'from-yellow-500/20 to-amber-500/20',
      borderColor: 'border-yellow-500/30',
      textColor: 'text-yellow-400',
    },
  ];

  const getMaterialIcon = (type) => {
    const icons = {
      plastic: '♻️',
      paper: '📄',
      metal: '🔧',
      glass: '🫙',
      electronic: '📱',
      organic: '🌿',
      mixed: '🗑️',
    };
    return icons[type] || '📦';
  };

  return (
    <DashboardLayout title="Waste Management Dashboard" menuItems={menuItems}>
      {/* Welcome Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/20 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 text-[150px]">
          <FaRecycle />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome back, {user?.name?.split(' ')[0] || 'Officer'}! 👋
        </h1>
        <p className="text-neutral-400">
          Manage waste collection requests and help the environment.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <FaExclamationTriangle className="text-red-500" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`relative p-6 rounded-2xl bg-gradient-to-br ${stat.color} border ${stat.borderColor} backdrop-blur-sm overflow-hidden group hover:scale-105 transition-transform duration-300`}
          >
            <div className="absolute top-4 right-4 text-3xl opacity-20 group-hover:opacity-40 transition-opacity">
              {stat.icon}
            </div>
            <p className="text-neutral-400 text-sm font-medium mb-2">{stat.title}</p>
            {isLoading ? (
              <FaSpinner className="animate-spin text-2xl text-neutral-500" />
            ) : (
              <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Pickups */}
        <div className="bg-neutral-900/50 border border-neutral-700/30 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FaClock className="text-orange-500" />
              Pending Pickups
            </h2>
            <Link
              to="/waste/pickups"
              className="text-sm text-yellow-500 hover:text-yellow-400 flex items-center gap-1"
            >
              View All <FaArrowRight className="text-xs" />
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 text-center">
              <FaSpinner className="animate-spin text-3xl text-yellow-500 mx-auto" />
            </div>
          ) : pendingPickups.length > 0 ? (
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {pendingPickups.slice(0, 5).map((pickup) => (
                <div
                  key={pickup._id}
                  className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700/30 hover:border-yellow-500/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{getMaterialIcon(pickup.materialType)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white capitalize">
                          {pickup.materialType} Waste
                        </span>
                        <span className="text-sm text-yellow-500 font-medium">
                          {pickup.weight} kg
                        </span>
                      </div>
                      <p className="text-sm text-neutral-400 truncate flex items-center gap-1">
                        <FaMapMarkerAlt className="text-green-500 flex-shrink-0" />
                        {pickup.location?.address || 'Address not available'}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {pickup.userId?.name || 'Customer'} • {new Date(pickup.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="text-5xl mb-4 opacity-30">🗑️</div>
              <p className="text-neutral-400">No pending pickup requests</p>
              <p className="text-sm text-neutral-500 mt-1">
                New requests will appear here
              </p>
            </div>
          )}
        </div>

        {/* Material Breakdown */}
        <div className="bg-neutral-900/50 border border-neutral-700/30 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
            <FaRecycle className="text-green-500" />
            Material Breakdown
          </h2>
          
          {isLoading ? (
            <div className="py-12 text-center">
              <FaSpinner className="animate-spin text-3xl text-yellow-500 mx-auto" />
            </div>
          ) : stats?.byMaterial?.length > 0 ? (
            <div className="space-y-4">
              {stats.byMaterial.map((material) => {
                const totalWeight = stats.overview?.totalWeight || 1;
                const percentage = ((material.totalWeight / totalWeight) * 100).toFixed(1);
                return (
                  <div key={material._id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getMaterialIcon(material._id)}</span>
                        <span className="text-neutral-300 capitalize">{material._id}</span>
                      </div>
                      <span className="text-sm text-neutral-400">
                        {material.totalWeight} kg ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="text-5xl mb-4 opacity-30">📊</div>
              <p className="text-neutral-400">No collection data yet</p>
              <p className="text-sm text-neutral-500 mt-1">
                Statistics will appear after collections
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/waste/pickups"
          className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 hover:border-orange-500/40 transition-all group"
        >
          <FaClock className="text-3xl text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-white mb-1">Manage Pickups</h3>
          <p className="text-sm text-neutral-400">View and assign waste collection requests</p>
        </Link>
        
        <Link
          to="/waste/verify"
          className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 hover:border-green-500/40 transition-all group"
        >
          <FaCheckCircle className="text-3xl text-green-500 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-white mb-1">Verify Collections</h3>
          <p className="text-sm text-neutral-400">Confirm weights and issue credits</p>
        </Link>
        
        <Link
          to="/waste/stats"
          className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all group"
        >
          <FaRecycle className="text-3xl text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-white mb-1">View Statistics</h3>
          <p className="text-sm text-neutral-400">Track environmental impact</p>
        </Link>
      </div>
    </DashboardLayout>
  );
};

export default WasteOfficerDashboard;

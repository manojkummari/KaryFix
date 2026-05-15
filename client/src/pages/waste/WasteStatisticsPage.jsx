import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getMenuItemsByRole } from '../../utils/menuItems';
import api from '../../services/api';
import { FaRecycle, FaWeight, FaRupeeSign, FaUsers, FaLeaf, FaWater, FaBolt, FaSpinner, FaTrophy } from 'react-icons/fa';

const WasteStatisticsPage = () => {
  const menuItems = getMenuItemsByRole('wasteOfficer');
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/waste/stats');
        setStats(response.data.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

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

  const getMaterialColor = (type) => {
    const colors = {
      plastic: 'from-yellow-500 to-amber-500',
      paper: 'from-green-500 to-emerald-500',
      metal: 'from-purple-500 to-fuchsia-500',
      electronic: 'from-orange-500 to-red-500',
      organic: 'from-lime-500 to-green-500',
      glass: 'from-blue-500 to-cyan-500',
      mixed: 'from-neutral-500 to-neutral-600',
    };
    return colors[type] || 'from-neutral-500 to-neutral-600';
  };

  // Calculate environmental impact (rough estimates)
  const totalWeight = stats?.overview?.totalWeight || 0;
  const treesSaved = Math.floor(totalWeight * 0.017); // approx trees saved per kg
  const waterSaved = Math.floor(totalWeight * 3.5); // liters
  const energySaved = Math.floor(totalWeight * 2.5); // kWh

  return (
    <DashboardLayout title="Waste Management Statistics" menuItems={menuItems}>
      {isLoading ? (
        <div className="py-32 text-center">
          <FaSpinner className="animate-spin text-5xl text-yellow-500 mx-auto" />
          <p className="text-neutral-400 mt-4">Loading statistics...</p>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 backdrop-blur-sm relative overflow-hidden group hover:scale-105 transition-transform">
              <FaWeight className="absolute right-4 top-4 text-4xl text-yellow-500 opacity-20 group-hover:opacity-40 transition-opacity" />
              <p className="text-neutral-400 text-sm">Total Collected</p>
              <p className="text-3xl font-bold text-yellow-400 mt-2">{stats?.overview?.totalWeight || 0} kg</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 backdrop-blur-sm relative overflow-hidden group hover:scale-105 transition-transform">
              <FaRecycle className="absolute right-4 top-4 text-4xl text-green-500 opacity-20 group-hover:opacity-40 transition-opacity" />
              <p className="text-neutral-400 text-sm">Total Collections</p>
              <p className="text-3xl font-bold text-green-400 mt-2">{stats?.overview?.completedCount || 0}</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border border-purple-500/20 backdrop-blur-sm relative overflow-hidden group hover:scale-105 transition-transform">
              <FaRupeeSign className="absolute right-4 top-4 text-4xl text-purple-500 opacity-20 group-hover:opacity-40 transition-opacity" />
              <p className="text-neutral-400 text-sm">Credits Issued</p>
              <p className="text-3xl font-bold text-purple-400 mt-2">₹{stats?.overview?.totalValue || 0}</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 backdrop-blur-sm relative overflow-hidden group hover:scale-105 transition-transform">
              <FaUsers className="absolute right-4 top-4 text-4xl text-blue-500 opacity-20 group-hover:opacity-40 transition-opacity" />
              <p className="text-neutral-400 text-sm">Active Sellers</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">{stats?.overview?.uniqueUsers || 0}</p>
            </div>
          </div>

          {/* Material Breakdown & Environmental Impact */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Material Distribution */}
            <div className="bg-neutral-900/50 border border-neutral-700/30 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <FaRecycle className="text-green-500" />
                Material Distribution
              </h2>
              
              {stats?.byMaterial?.length > 0 ? (
                <div className="space-y-5">
                  {stats.byMaterial.map((material) => {
                    const total = stats?.overview?.totalWeight || 1;
                    const percentage = ((material.totalWeight / total) * 100).toFixed(1);
                    return (
                      <div key={material._id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getMaterialIcon(material._id)}</span>
                            <span className="text-neutral-300 capitalize font-medium">{material._id}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-white font-bold">{material.totalWeight} kg</span>
                            <span className="text-neutral-500 text-sm ml-2">({percentage}%)</span>
                          </div>
                        </div>
                        <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getMaterialColor(material._id)} rounded-full transition-all duration-700`}
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
                  <p className="text-neutral-400">No data yet</p>
                </div>
              )}
            </div>

            {/* Environmental Impact */}
            <div className="bg-neutral-900/50 border border-neutral-700/30 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <FaLeaf className="text-green-500" />
                Environmental Impact
              </h2>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="p-5 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 flex items-center gap-4">
                  <div className="text-4xl">🌳</div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">{treesSaved}</p>
                    <p className="text-sm text-neutral-400">Trees Saved (approx.)</p>
                  </div>
                </div>
                
                <div className="p-5 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 flex items-center gap-4">
                  <div className="text-4xl">💧</div>
                  <div>
                    <p className="text-2xl font-bold text-blue-400">{waterSaved} L</p>
                    <p className="text-sm text-neutral-400">Water Saved</p>
                  </div>
                </div>
                
                <div className="p-5 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 flex items-center gap-4">
                  <div className="text-4xl">⚡</div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-400">{energySaved} kWh</p>
                    <p className="text-sm text-neutral-400">Energy Saved</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Contributors */}
          <div className="bg-neutral-900/50 border border-neutral-700/30 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <FaTrophy className="text-yellow-500" />
              Top Contributors
            </h2>
            
            {stats?.topContributors?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.topContributors.slice(0, 3).map((contributor, index) => (
                  <div
                    key={contributor._id}
                    className={`p-5 rounded-xl border ${
                      index === 0
                        ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30'
                        : index === 1
                        ? 'bg-gradient-to-br from-neutral-400/10 to-neutral-500/10 border-neutral-500/30'
                        : 'bg-gradient-to-br from-orange-700/10 to-amber-700/10 border-orange-700/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`text-3xl ${
                        index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{contributor.name}</p>
                        <p className="text-sm text-neutral-400">{contributor.totalWeight} kg collected</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="text-5xl mb-4 opacity-30">🏆</div>
                <p className="text-neutral-400">No contributors yet</p>
                <p className="text-sm text-neutral-500 mt-1">
                  Top waste sellers will appear here
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default WasteStatisticsPage;

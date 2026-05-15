import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getMenuItemsByRole } from '../../utils/menuItems';
import api from '../../services/api';
import { FaSearch, FaHistory, FaWeight, FaRupeeSign, FaCalendarAlt, FaUser, FaMapMarkerAlt, FaSpinner, FaDownload } from 'react-icons/fa';

const WasteHistoryPage = () => {
  const menuItems = getMenuItemsByRole('wasteOfficer');
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/waste/history');
        setCollections(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredCollections = collections.filter(
    (c) =>
      c.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.materialType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location?.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: collections.length,
    totalWeight: collections.reduce((sum, c) => sum + c.weight, 0),
    totalCredits: collections.reduce((sum, c) => sum + c.total, 0),
    thisMonth: collections.filter((c) => {
      const date = new Date(c.createdAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
  };

  return (
    <DashboardLayout title="Collection History" menuItems={menuItems}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 backdrop-blur-sm">
          <p className="text-neutral-400 text-sm">Total Collections</p>
          <p className="text-3xl font-bold text-yellow-400 mt-1">{stats.total}</p>
        </div>
        
        <div className="p-5 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 backdrop-blur-sm">
          <p className="text-neutral-400 text-sm">Total Weight</p>
          <p className="text-3xl font-bold text-green-400 mt-1">{stats.totalWeight} kg</p>
        </div>
        
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border border-purple-500/20 backdrop-blur-sm">
          <p className="text-neutral-400 text-sm">Credits Issued</p>
          <p className="text-3xl font-bold text-purple-400 mt-1">₹{stats.totalCredits}</p>
        </div>
        
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 backdrop-blur-sm">
          <p className="text-neutral-400 text-sm">This Month</p>
          <p className="text-3xl font-bold text-blue-400 mt-1">{stats.thisMonth}</p>
        </div>
      </div>

      {/* Search & Export */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 group">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-yellow-500 transition-colors z-10 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by customer, material, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-neutral-900/50 border border-neutral-700/50 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all backdrop-blur-sm"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900/50 border border-neutral-700/50 rounded-xl text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors">
          <FaDownload />
          Export CSV
        </button>
      </div>

      {/* History Table */}
      <div className="bg-neutral-900/50 border border-neutral-700/30 rounded-2xl overflow-hidden backdrop-blur-sm">
        {isLoading ? (
          <div className="py-16 text-center">
            <FaSpinner className="animate-spin text-4xl text-yellow-500 mx-auto" />
            <p className="text-neutral-400 mt-4">Loading history...</p>
          </div>
        ) : filteredCollections.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-700/30 bg-neutral-900/50">
                  <th className="text-left py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Date</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Material</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Weight</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Credits</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700/30">
                {filteredCollections.map((collection) => (
                  <tr key={collection._id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-neutral-300">
                        <FaCalendarAlt className="text-yellow-500" />
                        {new Date(collection.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold text-sm">
                          {collection.userId?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-200">{collection.userId?.name || 'Customer'}</p>
                          <p className="text-xs text-neutral-500">{collection.userId?.phone || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getMaterialIcon(collection.materialType)}</span>
                        <span className="text-neutral-300 capitalize">{collection.materialType}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-green-400">{collection.weight} kg</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-yellow-500">₹{collection.total}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
                        {collection.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="text-6xl mb-4 opacity-30">📊</div>
            <p className="text-neutral-400 text-lg">No collection history</p>
            <p className="text-sm text-neutral-500 mt-1">
              Completed waste collections will appear here
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WasteHistoryPage;

import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getMenuItemsByRole } from '../../utils/menuItems';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { FaSearch, FaClock, FaCheckCircle, FaTruck, FaMapMarkerAlt, FaPhone, FaUser, FaSpinner, FaWeight, FaRupeeSign, FaCalendarAlt } from 'react-icons/fa';

const WastePickupRequestsPage = () => {
  const menuItems = getMenuItemsByRole('wasteOfficer');
  const [pickups, setPickups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchPickups = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/waste/pending');
      setPickups(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pickups');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  const handleStatusUpdate = async (pickupId, newStatus) => {
    setUpdatingId(pickupId);
    try {
      await api.patch(`/waste/pickup/${pickupId}`, { status: newStatus });
      toast.success(`Pickup marked as ${newStatus}`);
      fetchPickups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

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

  const getStatusColor = (status) => {
    const colors = {
      requested: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      collected: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      verified: 'bg-green-500/10 text-green-400 border-green-500/30',
      completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    };
    return colors[status] || 'bg-neutral-500/10 text-neutral-400 border-neutral-500/30';
  };

  const filteredPickups = pickups.filter((pickup) => {
    const matchesSearch = 
      pickup.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pickup.location?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pickup.materialType?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || pickup.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    requested: pickups.filter((p) => p.status === 'requested').length,
    collected: pickups.filter((p) => p.status === 'collected').length,
    total: pickups.length,
  };

  return (
    <DashboardLayout title="Waste Pickup Requests" menuItems={menuItems}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Pending Requests</p>
              <p className="text-3xl font-bold text-orange-400 mt-1">{stats.requested}</p>
            </div>
            <FaClock className="text-3xl text-orange-500 opacity-50" />
          </div>
        </div>
        
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Collected</p>
              <p className="text-3xl font-bold text-blue-400 mt-1">{stats.collected}</p>
            </div>
            <FaTruck className="text-3xl text-blue-500 opacity-50" />
          </div>
        </div>
        
        <div className="p-5 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Total Active</p>
              <p className="text-3xl font-bold text-green-400 mt-1">{stats.total}</p>
            </div>
            <FaCheckCircle className="text-3xl text-green-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 group">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-yellow-500 transition-colors z-10 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by customer, location, or material..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-neutral-900/50 border border-neutral-700/50 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all backdrop-blur-sm"
          />
        </div>
        
        <div className="flex gap-2 p-1 bg-neutral-900/50 rounded-xl border border-neutral-700/50">
          {['all', 'requested', 'collected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'bg-yellow-500 text-black'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Pickup List */}
      <div className="bg-neutral-900/50 border border-neutral-700/30 rounded-2xl overflow-hidden backdrop-blur-sm">
        {isLoading ? (
          <div className="py-16 text-center">
            <FaSpinner className="animate-spin text-4xl text-yellow-500 mx-auto" />
            <p className="text-neutral-400 mt-4">Loading pickup requests...</p>
          </div>
        ) : filteredPickups.length > 0 ? (
          <div className="divide-y divide-neutral-700/30">
            {filteredPickups.map((pickup) => (
              <div key={pickup._id} className="p-6 hover:bg-neutral-800/30 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Material Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="text-4xl flex-shrink-0">{getMaterialIcon(pickup.materialType)}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white capitalize">{pickup.materialType} Waste</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusColor(pickup.status)}`}>
                          {pickup.status}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-400 truncate flex items-center gap-1">
                        <FaMapMarkerAlt className="text-green-500 flex-shrink-0" />
                        {pickup.location?.address || 'No address'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Customer Info */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-neutral-400">
                      <FaUser className="text-blue-500" />
                      <span>{pickup.userId?.name || 'Customer'}</span>
                    </div>
                    {pickup.userId?.phone && (
                      <div className="flex items-center gap-2 text-neutral-400">
                        <FaPhone className="text-green-500" />
                        <span>{pickup.userId.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Weight & Value */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <FaWeight className="text-yellow-500" />
                      <span className="text-white font-semibold">{pickup.weight} kg</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaRupeeSign className="text-purple-500" />
                      <span className="text-white font-semibold">₹{pickup.total}</span>
                    </div>
                  </div>
                  
                  {/* Scheduled Date */}
                  {pickup.scheduledDate && (
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                      <FaCalendarAlt className="text-orange-500" />
                      <span>{new Date(pickup.scheduledDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {pickup.status === 'requested' && (
                      <button
                        onClick={() => handleStatusUpdate(pickup._id, 'collected')}
                        disabled={updatingId === pickup._id}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {updatingId === pickup._id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaTruck />
                        )}
                        Collect
                      </button>
                    )}
                    {pickup.status === 'collected' && (
                      <button
                        onClick={() => handleStatusUpdate(pickup._id, 'verified')}
                        disabled={updatingId === pickup._id}
                        className="px-4 py-2 bg-green-500 hover:bg-green-400 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {updatingId === pickup._id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaCheckCircle />
                        )}
                        Verify
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="text-6xl mb-4 opacity-30">🗑️</div>
            <p className="text-neutral-400 text-lg">No pickup requests found</p>
            <p className="text-sm text-neutral-500 mt-1">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'New waste collection requests will appear here'}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WastePickupRequestsPage;

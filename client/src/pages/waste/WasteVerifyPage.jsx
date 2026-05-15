import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getMenuItemsByRole } from '../../utils/menuItems';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { FaCheckCircle, FaWeight, FaRupeeSign, FaUser, FaMapMarkerAlt, FaSpinner, FaEdit, FaTimes, FaCheck } from 'react-icons/fa';

const WasteVerifyPage = () => {
  const menuItems = getMenuItemsByRole('wasteOfficer');
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWasteType, setSelectedWasteType] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editWeight, setEditWeight] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const wasteTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'plastic', label: 'Plastic' },
    { value: 'paper', label: 'Paper' },
    { value: 'metal', label: 'Metal' },
    { value: 'electronic', label: 'E-Waste' },
    { value: 'organic', label: 'Organic' },
    { value: 'mixed', label: 'Mixed' },
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

  const fetchPendingVerifications = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/waste/pending');
      // Filter for collected status (awaiting verification)
      const collected = (response.data.data || []).filter((p) => p.status === 'collected');
      setPendingVerifications(collected);
    } catch (err) {
      toast.error('Failed to fetch verifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const handleVerify = async (pickupId, weight) => {
    setProcessingId(pickupId);
    try {
      await api.patch(`/waste/pickup/${pickupId}`, { 
        status: 'completed',
        weight: parseFloat(weight),
      });
      toast.success('Waste verified and credits issued!');
      setEditingId(null);
      fetchPendingVerifications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredVerifications = pendingVerifications.filter(
    (v) => selectedWasteType === 'all' || v.materialType === selectedWasteType
  );

  const totalWeight = filteredVerifications.reduce((sum, v) => sum + v.weight, 0);
  const totalValue = filteredVerifications.reduce((sum, v) => sum + v.total, 0);

  return (
    <DashboardLayout title="Verify Collections" menuItems={menuItems}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Pending Verification</p>
              <p className="text-3xl font-bold text-orange-400 mt-1">{filteredVerifications.length}</p>
            </div>
            <FaCheckCircle className="text-3xl text-orange-500 opacity-50" />
          </div>
        </div>
        
        <div className="p-5 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Total Weight</p>
              <p className="text-3xl font-bold text-green-400 mt-1">{totalWeight} kg</p>
            </div>
            <FaWeight className="text-3xl text-green-500 opacity-50" />
          </div>
        </div>
        
        <div className="p-5 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Value to Credit</p>
              <p className="text-3xl font-bold text-yellow-400 mt-1">₹{totalValue}</p>
            </div>
            <FaRupeeSign className="text-3xl text-yellow-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Waste Type Filter */}
      <div className="mb-6 flex gap-2 flex-wrap p-1 bg-neutral-900/50 rounded-xl border border-neutral-700/50 w-fit">
        {wasteTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setSelectedWasteType(type.value)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              selectedWasteType === type.value
                ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Verification List */}
      <div className="bg-neutral-900/50 border border-neutral-700/30 rounded-2xl overflow-hidden backdrop-blur-sm">
        {isLoading ? (
          <div className="py-16 text-center">
            <FaSpinner className="animate-spin text-4xl text-yellow-500 mx-auto" />
            <p className="text-neutral-400 mt-4">Loading verifications...</p>
          </div>
        ) : filteredVerifications.length > 0 ? (
          <div className="divide-y divide-neutral-700/30">
            {filteredVerifications.map((verification) => (
              <div key={verification._id} className="p-6 hover:bg-neutral-800/30 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Material Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-4xl">{getMaterialIcon(verification.materialType)}</div>
                    <div>
                      <h3 className="font-semibold text-white capitalize">{verification.materialType} Waste</h3>
                      <p className="text-sm text-neutral-400 flex items-center gap-1 mt-1">
                        <FaUser className="text-blue-500" />
                        {verification.userId?.name || 'Customer'}
                      </p>
                      <p className="text-sm text-neutral-500 flex items-center gap-1 mt-1">
                        <FaMapMarkerAlt className="text-green-500" />
                        {verification.location?.address || 'No address'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Weight Section */}
                  <div className="flex items-center gap-4">
                    {editingId === verification._id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editWeight}
                          onChange={(e) => setEditWeight(e.target.value)}
                          className="w-24 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-center focus:border-yellow-500 focus:outline-none"
                          placeholder="kg"
                          autoFocus
                        />
                        <span className="text-neutral-400">kg</span>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 text-neutral-400 hover:text-white transition-colors"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="px-4 py-2 bg-neutral-800/50 rounded-lg border border-neutral-700/30">
                          <span className="text-xl font-bold text-white">{verification.weight}</span>
                          <span className="text-neutral-400 ml-1">kg</span>
                        </div>
                        <button
                          onClick={() => {
                            setEditingId(verification._id);
                            setEditWeight(verification.weight.toString());
                          }}
                          className="p-2 text-neutral-400 hover:text-yellow-500 transition-colors"
                          title="Adjust weight"
                        >
                          <FaEdit />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Value */}
                  <div className="px-4 py-2 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <span className="text-sm text-neutral-400">Credit: </span>
                    <span className="text-lg font-bold text-yellow-500">₹{verification.total}</span>
                  </div>
                  
                  {/* Verify Button */}
                  <button
                    onClick={() => handleVerify(verification._id, editingId === verification._id ? editWeight : verification.weight)}
                    disabled={processingId === verification._id}
                    className="px-6 py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-green-500/20"
                  >
                    {processingId === verification._id ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaCheck />
                    )}
                    Verify & Credit
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="text-6xl mb-4 opacity-30">✅</div>
            <p className="text-neutral-400 text-lg">No collections awaiting verification</p>
            <p className="text-sm text-neutral-500 mt-1">
              Collected waste items will appear here for weight verification
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WasteVerifyPage;

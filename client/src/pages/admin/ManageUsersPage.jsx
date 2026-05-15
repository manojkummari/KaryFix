import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getMenuItemsByRole } from '../../utils/menuItems';
import { ROLES, ROLE_LABELS } from '../../constants/roles';
import { FaSearch, FaFilter, FaUserCheck, FaUserTimes, FaTrash, FaEye, FaSpinner, FaUserPlus } from 'react-icons/fa';
import api from '../../services/api';
import Alert from '../../components/common/Alert';

const ManageUsersPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const menuItems = getMenuItemsByRole('admin');

  // Fetch users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('role', activeTab);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await api.get(`/users?${params.toString()}`);
      setUsers(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Toggle verification status
  const handleToggleVerify = async (userId, currentStatus) => {
    try {
      await api.patch(`/users/${userId}/verify`, { isVerified: !currentStatus });
      setMessage(`User ${!currentStatus ? 'verified' : 'unverified'} successfully`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  // Delete user
  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.delete(`/users/${userId}`);
      setMessage('User deleted successfully');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // Create User State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
  });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUser);
      setMessage('User created successfully');
      setShowCreateModal(false);
      setNewUser({ name: '', email: '', phone: '', password: '', role: 'customer' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  return (
    <DashboardLayout title="User Management" menuItems={menuItems}>
      {/* Alerts */}
      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {message && (
        <Alert variant="success" className="mb-6" onClose={() => setMessage(null)}>
          {message}
        </Alert>
      )}

      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-8">
        <div className="flex gap-2 p-1 bg-neutral-900/50 rounded-xl border border-neutral-700/50 backdrop-blur-sm overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 flex-nowrap">
            {['all', ...Object.values(ROLES)].map((role) => (
              <button
                key={role}
                onClick={() => setActiveTab(role)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  activeTab === role
                    ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {role === 'all' ? 'All Users' : ROLE_LABELS[role]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 w-full lg:w-auto flex-shrink-0">
          <div className="relative flex-1 lg:flex-initial group">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-yellow-500 transition-colors z-10 pointer-events-none" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full lg:w-64 pl-10 pr-4 py-2.5 bg-neutral-900/50 border border-neutral-700/50 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all backdrop-blur-sm relative"
            />
          </div>

          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl text-sm font-bold transition-colors shadow-lg shadow-yellow-500/20"
          >
            <FaUserPlus className="text-lg" />
            <span className="hidden sm:inline">Add User</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-neutral-900/50 border border-neutral-700/30 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-700/30 bg-neutral-900/50">
                <th className="text-left py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">User Details</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Role</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Wallet</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Joined Date</th>
                <th className="text-right py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700/30">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <FaSpinner className="animate-spin text-3xl text-yellow-500 mx-auto" />
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id} className="group hover:bg-neutral-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold shadow-lg shadow-yellow-500/5">
                          {user.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-200 group-hover:text-yellow-500 transition-colors">{user.name}</p>
                          <p className="text-xs text-neutral-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        user.role === 'customer' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        user.role === 'technician' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        user.role === 'manager' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        user.role === 'wasteOfficer' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {user.isVerified ? (
                        <div className="flex items-center gap-1.5 ">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                          <span className="text-sm text-green-400">Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                          <span className="text-sm text-yellow-500">Pending</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-neutral-300">₹{user.wallet?.balance || 0}</span>
                    </td>
                    <td className="py-4 px-6 text-sm text-neutral-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-lg transition-colors" title="View Details">
                          <FaEye />
                        </button>
                        <button 
                          onClick={() => handleToggleVerify(user._id, user.isVerified)}
                          className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-green-400 rounded-lg transition-colors" 
                          title="Toggle Status"
                        >
                          {user.isVerified ? <FaUserTimes /> : <FaUserCheck />}
                        </button>
                        <button 
                          onClick={() => handleDelete(user._id)}
                          className="p-2 bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-500 rounded-lg transition-colors" 
                          title="Delete User"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-neutral-500">
                      <FaSearch className="text-4xl mb-4 opacity-20" />
                      <p className="text-lg font-medium">No users found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
            >
              <FaUserTimes className="text-xl" />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6">Add New User</h2>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                >
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="w-full mt-6 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl transition-colors shadow-lg shadow-yellow-500/20"
              >
                Create User
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManageUsersPage;


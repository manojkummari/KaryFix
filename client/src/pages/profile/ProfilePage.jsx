import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createAddMoneyOrder, verifyAddMoney, updatePassword } from '../../store/slices/authSlice';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { ROLE_LABELS } from '../../constants/roles';
import { getMenuItemsByRole } from '../../utils/menuItems';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaShieldAlt, FaKey, FaWallet, FaCamera } from 'react-icons/fa';

const FormGroup = ({ label, icon: Icon, children }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-2">
      {Icon && <Icon className="text-yellow-500" />} {label}
    </label>
    {children}
  </div>
);

const StyledInput = ({ ...props }) => (
  <input
    {...props}
    className={`w-full px-4 py-3 bg-neutral-800/40 backdrop-blur-sm border border-neutral-700/50 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  />
);

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Load Razorpay Script
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };
    loadRazorpayScript();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // TODO: Implement update profile API call
    setMessage('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await dispatch(updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })).unwrap();
      
      toast.success('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err.message || 'Failed to update password');
      toast.error(err.message || 'Failed to update password');
    }
  };

  const handleAddMoney = async () => {
    if (!addAmount || isNaN(addAmount) || addAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    try {
      const order = await dispatch(createAddMoneyOrder(addAmount)).unwrap();
      
      if (!order || !order.id) {
        throw new Error('Failed to create payment order');
      }
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SphwSJWJgkm37s',
        amount: order.amount,
        currency: 'INR',
        name: 'KaryFix Wallet',
        description: 'Add money to your wallet',
        order_id: order.id,
        handler: async function (response) {
          try {
            await dispatch(verifyAddMoney({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amount: addAmount,
            })).unwrap();
            setMessage(`Successfully added ₹${addAmount} to your wallet!`);
            setShowAddMoneyModal(false);
            setAddAmount('');
          } catch (err) {
            setError('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone
        },
        theme: {
          color: '#22c55e' // green-500
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setError(response.error.description);
      });
      rzp.open();
    } catch (err) {
      console.error('Wallet Error:', err);
      setError(err.message || 'Failed to initiate payment');
      toast.error(err.message || 'Failed to initiate payment');
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <DashboardLayout title="My Profile" menuItems={getMenuItemsByRole(user?.role)}>
      <div className="max-w-6xl mx-auto">
        {message && (
          <Alert variant="success" className="mb-6" onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Header Profile Banner */}
        <div className="relative mb-8 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-700/50">
          <div className="h-32 bg-gradient-to-r from-yellow-500/20 via-orange-500/10 to-neutral-900"></div>
          <div className="px-8 pb-8 flex flex-col md:flex-row items-center md:items-end -mt-12 gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border-4 border-neutral-900 flex items-center justify-center shadow-2xl">
                <span className="text-4xl font-bold text-yellow-500">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <button className="absolute bottom-[-8px] right-[-8px] p-2 rounded-full bg-neutral-800 border border-neutral-600 text-neutral-400 hover:text-white transition-colors">
                <FaCamera className="text-sm" />
              </button>
            </div>
            <div className="flex-1 mb-2 text-center md:text-left">
              <h1 className="text-2xl font-bold text-white mb-1">{user?.name}</h1>
              <div className="flex flex-col md:flex-row items-center gap-2">
                <span className="text-neutral-400 text-sm flex items-center gap-1"><FaEnvelope className="text-xs" /> {user?.email}</span>
                <span className="w-1 h-1 bg-neutral-600 rounded-full"></span>
                <span className="px-2 py-0.5 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold uppercase">
                  {ROLE_LABELS[user?.role]}
                </span>
              </div>
            </div>
            <div className="mb-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button onClick={handleUpdateProfile}>Save Changes</Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Personal Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-8">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <FaUser className="text-yellow-500" /> Personal Information
              </h3>

              <form onSubmit={handleUpdateProfile}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormGroup label="Full Name" icon={FaUser}>
                    <StyledInput
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </FormGroup>

                  <FormGroup label="Email Address" icon={FaEnvelope}>
                    <StyledInput
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </FormGroup>

                  <FormGroup label="Phone Number" icon={FaPhone}>
                    <StyledInput
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </FormGroup>

                  <FormGroup label="Address" icon={FaMapMarkerAlt}>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      rows="1"
                      className={`w-full px-4 py-3 bg-neutral-800/40 backdrop-blur-sm border border-neutral-700/50 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </FormGroup>
                </div>
              </form>
            </div>

            {/* Security Section */}
            <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-8">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <FaShieldAlt className="text-red-500" /> Security
              </h3>
              <form onSubmit={handleUpdatePassword}>
                <div className="space-y-4 max-w-lg">
                  <FormGroup label="Current Password" icon={FaKey}>
                    <StyledInput
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                    />
                  </FormGroup>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormGroup label="New Password">
                      <StyledInput
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Min. 6 characters"
                      />
                    </FormGroup>
                    <FormGroup label="Confirm New Password">
                      <StyledInput
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Same as new"
                      />
                    </FormGroup>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" variant="outline" className="border-neutral-700 hover:bg-neutral-800">
                      Update Password
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Wallet Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-8 sticky top-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <FaWallet className="text-green-500" /> Wallet Overview
              </h3>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/50 mb-6">
                <p className="text-neutral-400 text-sm mb-1">Current Balance</p>
                <p className="text-3xl font-black text-white mb-4">₹{user?.wallet?.balance || 0}</p>
                <div className="flex gap-2">
                  <Button onClick={() => setShowAddMoneyModal(true)} className="flex-1 text-sm bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20">Add Money</Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-neutral-700/50">
                  <span className="text-neutral-400 text-sm">Wallet ID</span>
                  <span className="text-white font-mono text-sm">{user?.wallet?.walletId || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-neutral-700/50">
                  <span className="text-neutral-400 text-sm">Status</span>
                  <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded">ACTIVE</span>
                </div>
              </div>

              {user?.wallet?.transactions && user.wallet.transactions.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4">Recent Transactions</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {user.wallet.transactions.length > 0 ? (
                      user.wallet.transactions.slice().reverse().map((tx, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-neutral-800/40 border border-neutral-700/30">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                              {tx.type === 'credit' ? '+' : '-'}
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{tx.description || (tx.type === 'credit' ? 'Funds Added' : 'Withdrawal')}</p>
                              <p className="text-neutral-500 text-xs">{new Date(tx.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <span className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                            {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-4 text-neutral-500 text-sm italic">No recent transactions found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-700/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaWallet className="text-green-500" /> Add Funds to Wallet
              </h3>
            </div>
            <div className="p-6">
              <FormGroup label="Amount (₹)">
                <StyledInput 
                  type="number"
                  placeholder="Enter amount"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  min="1"
                />
              </FormGroup>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddMoneyModal(false)} disabled={isProcessing}>Cancel</Button>
                <Button 
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white" 
                  onClick={handleAddMoney}
                  loading={isProcessing}
                  disabled={isProcessing}
                >
                  Proceed to Pay
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProfilePage;

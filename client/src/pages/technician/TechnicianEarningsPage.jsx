import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateBankDetails, withdrawFunds, loadUser } from '../../store/slices/authSlice';
import { getMyBookings } from '../../store/slices/bookingSlice';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/common/Button';
import { getMenuItemsByRole } from '../../utils/menuItems';
import { FaRupeeSign, FaCalendarAlt, FaChartLine, FaWallet, FaUniversity, FaHistory, FaSpinner } from 'react-icons/fa';

// Reusable StatCard Component
const StatCard = ({ title, value, label, icon: Icon, color, gradient, isLoading }) => (
  <div className={`p-6 rounded-2xl border border-neutral-700/50 bg-gradient-to-br ${gradient} backdrop-blur-sm hover:translate-y-[-2px] transition-transform duration-300 relative overflow-hidden group h-full flex flex-col justify-between`}>
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300`}>
      <Icon className="text-8xl" />
    </div>
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-neutral-900/50 border border-neutral-700/50 text-${color}-400`}>
          <Icon className="text-2xl" />
        </div>
      </div>
      <h3 className="text-neutral-400 text-sm font-medium mb-1">{title}</h3>
      <div className={`text-3xl font-black text-${color}-400 mb-2`}>
        {isLoading ? <FaSpinner className="animate-spin text-xl" /> : value}
      </div>
      <p className="text-neutral-500 text-xs">{label}</p>
    </div>
  </div>
);

const TechnicianEarningsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { bookings, isLoading } = useSelector((state) => state.bookings);
  const navigate = useNavigate();

  const [showBankModal, setShowBankModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankData, setBankData] = useState({
    accountName: user?.bankDetails?.accountName || '',
    accountNumber: user?.bankDetails?.accountNumber || '',
    ifscCode: user?.bankDetails?.ifscCode || '',
  });
  /* Temporarily disabled to debug loading issue
  useEffect(() => {
    dispatch(getMyBookings({ limit: 50 }));
    dispatch(loadUser());
  }, [dispatch]);
  */

  const handleBankSubmit = async () => {
    try {
      await dispatch(updateBankDetails(bankData)).unwrap();
      toast.success('Bank details updated successfully!');
      setShowBankModal(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update bank details');
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (withdrawAmount > (user?.wallet?.balance || 0)) {
      toast.error('Insufficient wallet balance');
      return;
    }
    if (!user?.bankDetails?.accountNumber) {
      toast.error('Please link a bank account first');
      return;
    }

    try {
      await dispatch(withdrawFunds(withdrawAmount)).unwrap();
      toast.success(`Successfully withdrew ₹${withdrawAmount} to your bank account!`);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
    } catch (err) {
      toast.error(err.message || 'Failed to process withdrawal');
    }
  };

  const completedJobs = bookings.filter((b) => ['completed', 'verification_pending'].includes(b.status));
  const activeJobsCount = bookings.filter((b) =>
    ['assigned', 'accepted', 'on-the-way', 'in-progress'].includes(b.status)
  ).length;

  const totalEarnings = completedJobs.reduce(
    (sum, booking) => sum + (booking.price?.final > 0 ? booking.price.final : (booking.price?.estimated || 0)),
    0
  );

  const menuItems = getMenuItemsByRole('technician', { activeJobs: activeJobsCount });

  // Calculate earnings by period
  const thisMonth = completedJobs.filter((b) => {
    const bookingDate = new Date(b.createdAt);
    const now = new Date();
    return (
      bookingDate.getMonth() === now.getMonth() &&
      bookingDate.getFullYear() === now.getFullYear()
    );
  });

  const thisWeek = completedJobs.filter((b) => {
    const bookingDate = new Date(b.createdAt);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return bookingDate >= weekAgo;
  });

  const monthlyEarnings = thisMonth.reduce(
    (sum, b) => sum + (b.price?.final > 0 ? b.price.final : (b.price?.estimated || 0)),
    0
  );
  const weeklyEarnings = thisWeek.reduce((sum, b) => sum + (b.price?.final > 0 ? b.price.final : (b.price?.estimated || 0)), 0);

  return (
    <DashboardLayout title="Earnings & Payouts" menuItems={menuItems}>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Earnings"
          value={`₹${totalEarnings}`}
          label="Lifetime Income"
          icon={FaRupeeSign}
          color="yellow"
          gradient="from-neutral-800 to-neutral-800/50"
          isLoading={isLoading}
        />
        <StatCard
          title="This Month"
          value={`₹${monthlyEarnings}`}
          label={`${thisMonth.length} jobs completed`}
          icon={FaCalendarAlt}
          color="blue"
          gradient="from-neutral-800 to-neutral-800/50"
          isLoading={isLoading}
        />
        <StatCard
          title="This Week"
          value={`₹${weeklyEarnings}`}
          label={`${thisWeek.length} jobs completed`}
          icon={FaChartLine}
          color="green"
          gradient="from-neutral-800 to-neutral-800/50"
          isLoading={isLoading}
        />
        <StatCard
          title="Pending Payout"
          value={`₹${user?.wallet?.balance || 0}`}
          label="Available for withdrawal"
          icon={FaWallet}
          color="orange"
          gradient="from-neutral-800 to-neutral-800/50"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Earnings History */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FaHistory className="text-yellow-500" />
                Earnings Breakdown
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-700/50 text-left">
                    <th className="py-4 px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Date</th>
                    <th className="py-4 px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Service</th>
                    <th className="py-4 px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Customer</th>
                    <th className="py-4 px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Status</th>
                    <th className="py-4 px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider text-right">Amount</th>
                    <th className="py-4 px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider text-right">Net Earning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700/30">
                  {completedJobs.length > 0 ? (
                    completedJobs.map((booking) => {
                      const amount = booking.price?.final > 0 ? booking.price.final : (booking.price?.estimated || 0);
                      const commission = Math.round(amount * 0.1); // 10% commission
                      const earnings = amount - commission;

                      return (
                        <tr key={booking._id} className="hover:bg-neutral-800/30 transition-colors">
                          <td className="py-4 px-4 text-sm text-neutral-300">
                            {new Date(booking.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="py-4 px-4 text-sm text-white font-medium">
                            {booking.subServiceId?.name || booking.subService}
                          </td>
                          <td className="py-4 px-4 text-sm text-neutral-400">
                            {booking.customerId?.name || 'N/A'}
                          </td>
                          <td className="py-4 px-4 text-sm">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              booking.status === 'completed' 
                                ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                                : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                            }`}>
                              {booking.status === 'completed' ? 'Settled' : 'Pending Verification'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-right text-neutral-300">
                            ₹{amount}
                          </td>
                          <td className="py-4 px-4 text-sm text-right font-bold text-yellow-500">
                            ₹{earnings}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-neutral-500">
                        No completed jobs found yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Wallet & Withdrawal */}
        <div className="lg:col-span-1 space-y-6">

          {/* Wallet Card */}
          <div className="rounded-2xl p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border border-yellow-500/20 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-yellow-500/20 rounded-full blur-2xl"></div>

            <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
              <FaWallet className="text-yellow-500" /> Wallet Balance
            </h3>
            <p className="text-neutral-400 text-sm mb-6">Available to withdraw</p>

            <div className="mb-8">
              <p className="text-4xl font-black text-white">₹{user?.wallet?.balance || 0}</p>
            </div>

            <Button 
              onClick={() => setShowWithdrawModal(true)} 
              className="w-full shadow-lg shadow-yellow-500/20"
              disabled={!user?.wallet?.balance || user.wallet.balance <= 0}
            >
              Withdraw Funds
            </Button>
          </div>

          {/* Bank Details */}
          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <FaUniversity className="text-neutral-400" /> Bank Details
            </h3>

            {user?.bankDetails?.accountNumber ? (
              <div className="bg-neutral-800/40 border border-neutral-700/30 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaUniversity className="text-green-500" />
                </div>
                <p className="text-white font-bold mb-1">{user.bankDetails.accountName}</p>
                <p className="text-neutral-400 text-sm mb-4">A/C: ****{user.bankDetails.accountNumber.slice(-4)}</p>
                <Button variant="outline" size="sm" className="border-neutral-700" onClick={() => setShowBankModal(true)}>
                  Update Bank Details
                </Button>
              </div>
            ) : (
              <div className="bg-neutral-800/40 border border-neutral-700/30 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaUniversity className="text-neutral-500" />
                </div>
                <p className="text-neutral-300 font-medium mb-1">No Bank Account Linked</p>
                <p className="text-neutral-500 text-xs mb-4">Link your bank account to receive payouts.</p>
                <Button variant="outline" size="sm" className="border-neutral-700" onClick={() => setShowBankModal(true)}>
                  Link Account
                </Button>
              </div>
            )}
          </div>

          {/* Transaction History */}
          {user?.wallet?.transactions && user.wallet.transactions.length > 0 && (
            <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <FaWallet className="text-neutral-400" /> Recent Transactions
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {user.wallet.transactions.slice().reverse().map((tx, idx) => (
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
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bank Details Modal */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-700/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaUniversity className="text-neutral-400" /> Link Bank Account
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Account Holder Name</label>
                <input 
                  type="text"
                  value={bankData.accountName}
                  onChange={(e) => setBankData({...bankData, accountName: e.target.value})}
                  className="w-full px-4 py-3 bg-neutral-800/40 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Account Number</label>
                <input 
                  type="text"
                  value={bankData.accountNumber}
                  onChange={(e) => setBankData({...bankData, accountNumber: e.target.value})}
                  className="w-full px-4 py-3 bg-neutral-800/40 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                  placeholder="e.g. 1234567890"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">IFSC Code</label>
                <input 
                  type="text"
                  value={bankData.ifscCode}
                  onChange={(e) => setBankData({...bankData, ifscCode: e.target.value})}
                  className="w-full px-4 py-3 bg-neutral-800/40 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                  placeholder="e.g. HDFC0001234"
                />
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowBankModal(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleBankSubmit}>Save Details</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Funds Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-700/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaWallet className="text-yellow-500" /> Withdraw Funds
              </h3>
            </div>
            <div className="p-6">
              <p className="text-neutral-400 text-sm mb-4">
                Available Balance: <span className="text-white font-bold">₹{user?.wallet?.balance || 0}</span>
              </p>
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Withdrawal Amount (₹)</label>
                <input 
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-800/40 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                  placeholder="Enter amount"
                  max={user?.wallet?.balance || 0}
                />
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mt-4">
                <p className="text-blue-400 text-xs">
                  Funds will be transferred to your linked bank account ending in ****{user?.bankDetails?.accountNumber?.slice(-4) || 'N/A'} within 2-3 business days.
                </p>
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowWithdrawModal(false)}>Cancel</Button>
                <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black" onClick={handleWithdraw}>Confirm Withdrawal</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TechnicianEarningsPage;

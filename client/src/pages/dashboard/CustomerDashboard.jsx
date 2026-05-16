import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../../store/slices/serviceSlice';
import { getMyBookings } from '../../store/slices/bookingSlice';
import DashboardLayout from '../../layouts/DashboardLayout';
import CategoryCard from '../../components/services/CategoryCard';
import BookingCard from '../../components/bookings/BookingCard';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { getMenuItemsByRole } from '../../utils/menuItems';
import { FaWallet, FaClipboardList, FaCheckCircle, FaArrowRight, FaSearch, FaCalendarAlt } from 'react-icons/fa';

const StatCard = ({ title, value, subtitle, icon: Icon, color, gradient }) => (
  <div className={`p-6 rounded-2xl border border-neutral-700/50 bg-gradient-to-br ${gradient} backdrop-blur-sm hover:translate-y-[-2px] transition-transform duration-300 relative overflow-hidden group h-full flex flex-col justify-between`}>
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
      <Icon className="text-7xl" />
    </div>
    <div className="relative z-10">
      <div className={`p-3 rounded-xl bg-neutral-900/50 border border-neutral-700/50 text-${color}-400 w-fit mb-4`}>
        <Icon className="text-xl" />
      </div>
      <h3 className="text-neutral-400 text-sm font-medium mb-1">{title}</h3>
      <div className={`text-3xl font-black text-${color}-400 mb-1`}>{value}</div>
      <p className="text-neutral-500 text-xs">{subtitle}</p>
    </div>
  </div>
);

const CustomerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { categories, isLoading: servicesLoading } = useSelector((state) => state.services);
  const { bookings, isLoading: bookingsLoading } = useSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(getCategories({ active: true }));
    dispatch(getMyBookings({ limit: 5 }));
  }, [dispatch]);

  const activeBookings = bookings.filter(
    (b) => !['completed', 'cancelled', 'rejected'].includes(b.status)
  );
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const featuredCategories = categories.filter((c) => c.featured).slice(0, 4);

  const menuItems = getMenuItemsByRole('customer', { activeBookings: activeBookings.length });

  return (
    <DashboardLayout title="Dashboard" menuItems={menuItems}>
      {/* Welcome Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-yellow-500/10 via-orange-500/5 to-transparent border border-yellow-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome back, {user?.name?.split(' ')[0] || 'Customer'}! 👋
            </h2>
            <p className="text-neutral-400">Ready to book your next service?</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/services')}
              className="flex items-center gap-2 px-5 py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl text-sm font-bold transition-colors shadow-lg shadow-yellow-500/20"
            >
              <FaSearch /> Browse Services
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Wallet Balance"
          value={`₹${user?.wallet?.balance || 0}`}
          subtitle="Available balance"
          icon={FaWallet}
          color="yellow"
          gradient="from-neutral-800 to-neutral-800/50"
        />
        <StatCard 
          title="Active Bookings"
          value={activeBookings.length}
          subtitle="Ongoing services"
          icon={FaClipboardList}
          color="blue"
          gradient="from-neutral-800 to-neutral-800/50"
        />
        <StatCard 
          title="Completed"
          value={completedBookings.length}
          subtitle="Total completed"
          icon={FaCheckCircle}
          color="green"
          gradient="from-neutral-800 to-neutral-800/50"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button 
          onClick={() => navigate('/services')}
          className="flex items-center justify-between p-5 rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm hover:border-yellow-500/50 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500">
              <FaSearch className="text-xl" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold group-hover:text-yellow-500 transition-colors">Browse All Services</p>
              <p className="text-neutral-500 text-sm">Find the perfect service for you</p>
            </div>
          </div>
          <FaArrowRight className="text-neutral-600 group-hover:text-yellow-500 transition-colors" />
        </button>

        <button 
          onClick={() => navigate('/bookings/my-bookings')}
          className="flex items-center justify-between p-5 rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm hover:border-yellow-500/50 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500">
              <FaCalendarAlt className="text-xl" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold group-hover:text-yellow-500 transition-colors">View All Bookings</p>
              <p className="text-neutral-500 text-sm">Track your service history</p>
            </div>
          </div>
          <FaArrowRight className="text-neutral-600 group-hover:text-yellow-500 transition-colors" />
        </button>
      </div>

      {/* Featured Services */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Featured Services</h3>
          <Button variant="outline" onClick={() => navigate('/services')} className="text-sm">
            View All →
          </Button>
        </div>

        {servicesLoading ? (
          <div className="flex justify-center py-10">
            <Loader />
          </div>
        ) : featuredCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredCategories.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.slice(0, 4).map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 p-8 text-center">
            <p className="text-neutral-400">No services available</p>
          </div>
        )}
      </div>

      {/* Recent Bookings */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Recent Bookings</h3>
          {bookings.length > 0 && (
            <Button variant="outline" onClick={() => navigate('/bookings/my-bookings')} className="text-sm">
              View All →
            </Button>
          )}
        </div>

        {bookingsLoading ? (
          <div className="flex justify-center py-10">
            <Loader />
          </div>
        ) : bookings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.slice(0, 3).map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-800/50 flex items-center justify-center mx-auto mb-4">
              <FaCalendarAlt className="text-2xl text-neutral-600" />
            </div>
            <p className="text-neutral-300 font-medium mb-2">No bookings yet</p>
            <p className="text-neutral-500 text-sm mb-6">Start by booking your first service!</p>
            <Button onClick={() => navigate('/services')}>
              Book Your First Service
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;


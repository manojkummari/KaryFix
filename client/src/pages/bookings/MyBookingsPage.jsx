import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMyBookings, clearError } from '../../store/slices/bookingSlice';
import DashboardLayout from '../../layouts/DashboardLayout';
import BookingCard from '../../components/bookings/BookingCard';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { getMenuItemsByRole } from '../../utils/menuItems';
import { FaSearch, FaPlus, FaClipboardList, FaSpinner, FaCheckCircle, FaClock, FaTimes } from 'react-icons/fa';

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');

  const { bookings, pagination, isLoading, error } = useSelector(
    (state) => state.bookings
  );
  const { user } = useSelector((state) => state.auth);

  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(getMyBookings({ status: statusFilter, page: currentPage, limit: 10 }));
  }, [dispatch, statusFilter, currentPage]);

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleCreateBooking = () => {
    navigate('/services');
  };

  const statusOptions = [
    { value: '', label: 'All', icon: FaClipboardList },
    { value: 'pending', label: 'Pending', icon: FaClock },
    { value: 'in-progress', label: 'Active', icon: FaSpinner },
    { value: 'completed', label: 'Completed', icon: FaCheckCircle },
    { value: 'cancelled', label: 'Cancelled', icon: FaTimes },
  ];

  // Filter bookings by search and query params
  const filteredBookings = bookings.filter((booking) => {
    // 1. Text Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        booking.subServiceId?.name?.toLowerCase().includes(query) ||
        booking._id?.toLowerCase().includes(query) ||
        booking.status?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // 2. Date Filter (e.g. "Today's Schedule")
    if (filterParam === 'today') {
      if (!booking.scheduledDate) return false;
      const today = new Date().setHours(0, 0, 0, 0);
      const jobDate = new Date(booking.scheduledDate).setHours(0, 0, 0, 0);
      if (today !== jobDate) return false;
    }

    return true;
  });

  // Stats
  const activeCount = bookings.filter(
    (b) => !['completed', 'cancelled', 'rejected'].includes(b.status)
  ).length;
  // eslint-disable-next-line no-unused-vars
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  // eslint-disable-next-line no-unused-vars
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  const activeJobs = bookings.filter((b) =>
    ['assigned', 'accepted', 'on-the-way', 'in-progress'].includes(b.status)
  ).length;

  const todayJobs = bookings.filter((b) => {
    if (!b.scheduledDate) return false;
    const today = new Date().setHours(0, 0, 0, 0);
    const jobDate = new Date(b.scheduledDate).setHours(0, 0, 0, 0);
    return today === jobDate;
  }).length;

  return (
    <DashboardLayout
      title={
        filterParam === 'today' 
          ? "Today's Schedule" 
          : user?.role === 'customer' 
          ? 'My Bookings' 
          : 'My Jobs'
      }
      menuItems={getMenuItemsByRole(user?.role, { activeBookings: activeCount, activeJobs, todayJobs })}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 z-10 pointer-events-none" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-900/50 border border-neutral-700/50 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-yellow-500/50 transition-all"
          />
        </div>

        {/* New Booking Button */}
        {user?.role === 'customer' && (
          <button
            onClick={handleCreateBooking}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl text-sm font-bold transition-colors"
          >
            <FaPlus /> New Booking
          </button>
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 p-1 bg-neutral-900/50 rounded-xl border border-neutral-700/50 mb-6 overflow-x-auto">
        {statusOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                statusFilter === option.value
                  ? 'bg-yellow-500 text-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Icon className="text-xs" /> {option.label}
            </button>
          );
        })}
      </div>

      {error && (
        <Alert variant="error" className="mb-4" onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-neutral-700/50 bg-neutral-900/50">
          <div className="w-16 h-16 rounded-full bg-neutral-800/50 flex items-center justify-center mx-auto mb-4">
            <FaClipboardList className="text-2xl text-neutral-600" />
          </div>
          <p className="text-neutral-300 font-medium mb-2">
            {searchQuery
              ? 'No matching bookings found'
              : statusFilter
              ? `No ${statusFilter} bookings`
              : user?.role === 'customer'
              ? 'No bookings yet'
              : 'No jobs assigned yet'}
          </p>
          <p className="text-neutral-500 text-sm mb-6">
            {searchQuery
              ? 'Try adjusting your search'
              : user?.role === 'customer'
              ? 'Book your first service to get started!'
              : 'Jobs will appear here when assigned'}
          </p>
          {user?.role === 'customer' && !statusFilter && !searchQuery && (
            <button
              onClick={handleCreateBooking}
              className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl text-sm font-bold transition-colors"
            >
              Book Your First Service
            </button>
          )}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-yellow-500 text-sm hover:text-yellow-400"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-neutral-500 text-sm">
              Showing {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'}
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>

          {/* Bookings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex gap-1 mx-2">
                {[...Array(pagination.pages)].map((_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-colors ${
                      currentPage === idx + 1
                        ? 'bg-yellow-500 text-black'
                        : 'bg-neutral-800 border border-neutral-700 text-neutral-400 hover:bg-neutral-700 hover:text-white'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.pages))}
                disabled={currentPage === pagination.pages}
                className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default MyBookingsPage;

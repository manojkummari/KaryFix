import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAvailableBookings, requestBooking } from '../../store/slices/bookingSlice';
import { useSocket } from '../../context/SocketContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import BookingCard from '../../components/bookings/BookingCard';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { getMenuItemsByRole } from '../../utils/menuItems';
import { toast } from 'react-hot-toast';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaToolbox } from 'react-icons/fa';

const AvailableJobsPage = () => {
  const dispatch = useDispatch();
  const { availableBookings, isLoading } = useSelector((state) => state.bookings);
  const { user } = useSelector((state) => state.auth);
  const { startLocationTracking, stopLocationTracking, isTracking, socket, locationAcquired, locationError } = useSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Fetch available bookings only after location is acquired
  useEffect(() => {
    if (locationAcquired) {
      dispatch(getAvailableBookings({ limit: 50 }));
    }
  }, [locationAcquired, dispatch]);

  // Start real-time location tracking is now manual via button

  // Listen for new jobs in real-time
  useEffect(() => {
    if (socket) {
      const handleNewJob = (booking) => {
        toast.success('New job request nearby!');
        dispatch(getAvailableBookings({ limit: 50 }));
      };

      socket.on('new-job-request', handleNewJob);

      return () => {
        socket.off('new-job-request', handleNewJob);
      };
    }
  }, [socket, dispatch]);

  const handleRequestJob = async (id) => {
    try {
      await dispatch(requestBooking(id)).unwrap();
      toast.success('Job accepted successfully!');
    } catch (error) {
      toast.error('Failed to accept job: ' + error);
    }
  };

  const filteredBookings = availableBookings.filter((booking) => {
    const matchesSearch =
      booking.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.location?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.subServiceId?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !categoryFilter || booking.categoryId?._id === categoryFilter || booking.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Extract unique categories for filter
  const categories = [...new Set(availableBookings.map(b => b.categoryId))].filter(Boolean);

  const menuItems = getMenuItemsByRole('technician');

  return (
    <DashboardLayout title="Available Jobs Marketplace" menuItems={menuItems}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Marketplace</h1>
        {isTracking && (
          <Button variant="outline" onClick={stopLocationTracking} className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300">
            Go Offline
          </Button>
        )}
      </div>

      {/* Header & Filters */}
      <div className="mb-8">
        {/* Search Bar */}
        <div className="relative w-full group mb-8">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <FaSearch className="text-xl text-neutral-500 group-focus-within:text-yellow-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by location, service, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-neutral-900/80 border border-neutral-700/50 rounded-2xl text-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10 transition-all shadow-2xl backdrop-blur-xl hover:border-neutral-600"
          />
        </div>



        {/* Results */}
        {!isTracking ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-neutral-900/20 rounded-2xl border border-neutral-700/50 border-dashed">
            <div className="w-20 h-20 bg-neutral-800/50 rounded-full flex items-center justify-center mb-6">
              <FaMapMarkerAlt className="text-4xl text-neutral-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">You are currently Offline</h3>
            <p className="text-neutral-400 mb-8 max-w-md">Go online to share your live location and start receiving job requests from customers within your 60 KM radius.</p>
            <Button onClick={() => startLocationTracking(user?._id)} className="px-8 py-3 text-lg shadow-xl shadow-yellow-500/20 animate-pulse hover:animate-none">
              Go Online & Find Jobs
            </Button>
          </div>
        ) : locationError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-neutral-900/20 rounded-2xl border border-red-500/30 border-dashed">
            <FaMapMarkerAlt className="text-4xl text-red-500/50 mb-4" />
            <p className="text-red-400 font-bold mb-2 text-xl">Location Access Required</p>
            <p className="text-neutral-400">{locationError}</p>
            <p className="text-neutral-500 text-sm mt-2 max-w-md">Please enable location permissions in your browser. We need your live location to find jobs within a 60 KM radius.</p>
            <Button variant="outline" className="mt-6 border-red-500/50 text-red-400 hover:bg-red-500/10" onClick={() => startLocationTracking(user?._id)}>
              Try Again
            </Button>
          </div>
        ) : !locationAcquired ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader />
            <p className="text-neutral-400 mt-6 text-lg animate-pulse">Acquiring your live GPS location...</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-20">
            <Loader />
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="relative group flex flex-col h-full bg-neutral-900/40 border border-neutral-700/30 rounded-2xl overflow-hidden hover:border-yellow-500/30 transition-all duration-300">
                <BookingCard booking={booking} />

                {/* Overlay Action */}
                <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 p-6 z-10 transition-all duration-300">
                  <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h4 className="text-xl font-bold text-white mb-2">{booking.subServiceId?.name}</h4>
                    <p className="text-neutral-400 mb-6 max-w-xs mx-auto line-clamp-2">{booking.description}</p>
                    <Button onClick={() => handleRequestJob(booking._id)} className="w-full max-w-[200px] shadow-xl shadow-yellow-500/20">
                      Accept This Job
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-500 bg-neutral-900/20 rounded-2xl border border-neutral-800 border-dashed">
            <div className="w-20 h-20 bg-neutral-800/50 rounded-full flex items-center justify-center mb-6">
              <FaToolbox className="text-4xl opacity-30" />
            </div>
            <h3 className="text-xl font-bold text-neutral-400 mb-2">No Jobs Found</h3>
            <p className="text-sm">No available jobs within your 60 KM radius. Check back later.</p>
            <Button variant="outline" className="mt-6" onClick={() => dispatch(getAvailableBookings({ limit: 50 }))}>
              Refresh List
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AvailableJobsPage;

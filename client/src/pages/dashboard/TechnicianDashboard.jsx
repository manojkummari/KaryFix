import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMyBookings, getAvailableBookings, requestBooking, updateBookingStatus } from '../../store/slices/bookingSlice';
import { useSocket } from '../../context/SocketContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import BookingCard from '../../components/bookings/BookingCard';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { getMenuItemsByRole } from '../../utils/menuItems';
import { toast } from 'react-hot-toast';
import { 
  FaRupeeSign, 
  FaBriefcase, 
  FaCheckCircle, 
  FaClock, 
  FaSpinner, 
  FaSearch,
  FaMapMarkerAlt
} from 'react-icons/fa';

// Reusable StatCard Component (Local for now to match AdminDashboard style)
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

const TechnicianDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { bookings, availableBookings, isLoading } = useSelector((state) => state.bookings);
  const { startLocationTracking, stopLocationTracking, isTracking, socket, locationAcquired, locationError } = useSocket();

  // Fetch only my bookings initially
  useEffect(() => {
    dispatch(getMyBookings({ limit: 10 }));
  }, [dispatch]);

  // Fetch available bookings only after location is acquired
  useEffect(() => {
    if (locationAcquired) {
      dispatch(getAvailableBookings({ limit: 5 }));
    }
  }, [locationAcquired, dispatch]);

  // Start real-time location tracking is now manual via button

  // Listen for new jobs in real-time
  useEffect(() => {
    if (socket) {
      const handleNewJob = (booking) => {
        toast.success('New job request nearby!');
        dispatch(getAvailableBookings({ limit: 5 }));
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

  const activeJobs = bookings.filter(
    (b) => ['assigned', 'accepted', 'on-the-way', 'in-progress'].includes(b.status)
  );
  const completedJobs = bookings.filter((b) => b.status === 'completed');
  const pendingJobs = bookings.filter((b) => b.status === 'assigned');

  const totalEarnings = completedJobs.reduce((sum, booking) => {
    return sum + (booking.price?.final > 0 ? booking.price.final : (booking.price?.estimated || 0));
  }, 0);

  const todayJobs = bookings.filter((b) => {
    if (!b.scheduledDate) return false;
    const today = new Date().setHours(0, 0, 0, 0);
    const jobDate = new Date(b.scheduledDate).setHours(0, 0, 0, 0);
    return today === jobDate && activeJobs.includes(b);
  });

  const menuItems = getMenuItemsByRole('technician', { activeJobs: activeJobs.length, todayJobs: todayJobs.length });

  return (
    <DashboardLayout title="Technician Overview" menuItems={menuItems}>
      {/* Welcome Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-yellow-500/10 via-orange-500/5 to-transparent border border-yellow-500/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome back, {user?.name?.split(' ')[0] || 'Technician'}! 👋
            </h2>
            <p className="text-neutral-400">
              You have <span className="text-yellow-400 font-bold">{activeJobs.length} active jobs</span> and <span className="text-purple-400 font-bold">{todayJobs.length} scheduled for today</span>.
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button 
              onClick={() => navigate('/bookings/my-bookings')}
              variant="outline"
              className="flex-1 md:flex-none border-neutral-700 hover:bg-neutral-800"
            >
              My Jobs
            </Button>
            <Button 
              onClick={() => navigate('/technician/available-jobs')}
              className="flex-1 md:flex-none shadow-lg shadow-yellow-500/20"
            >
              Find Work
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Earnings" 
          value={`₹${totalEarnings}`}
          label="Lifetime Earnings"
          icon={FaRupeeSign}
          color="yellow"
          gradient="from-neutral-800 to-neutral-800/50"
          isLoading={isLoading}
        />
        <StatCard 
          title="Pending Payout" 
          value={`₹${user?.wallet?.balance || 0}`}
          label="Awaiting Transfer"
          icon={FaClock} // Reuse clock or maybe MoneyBillWave if imported
          color="orange"
          gradient="from-neutral-800 to-neutral-800/50"
          isLoading={isLoading}
        />
        <StatCard 
          title="Active Jobs" 
          value={activeJobs.length}
          label="In Progress"
          icon={FaBriefcase}
          color="blue"
          gradient="from-neutral-800 to-neutral-800/50"
          isLoading={isLoading}
        />
        <StatCard 
          title="Completed Jobs" 
          value={completedJobs.length}
          label="Total Completed"
          icon={FaCheckCircle}
          color="purple"
          gradient="from-neutral-800 to-neutral-800/50"
          isLoading={isLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Marketplace (Takes up 2/3 space) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Marketplace Section */}
           <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
              <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <FaSearch className="text-yellow-500" />
                 Available Jobs (Marketplace)
               </h3>
               {isTracking ? (
                 <div className="flex gap-2">
                   <Button variant="ghost" size="sm" onClick={stopLocationTracking} className="text-xs text-red-400 hover:bg-red-500/10">
                    Go Offline
                   </Button>
                   <Button variant="ghost" size="sm" onClick={() => dispatch(getAvailableBookings({ limit: 5 }))} className="text-xs">
                    Refresh
                   </Button>
                 </div>
               ) : (
                 <Button size="sm" onClick={() => startLocationTracking(user?._id)} className="text-xs shadow-md shadow-yellow-500/20">
                   Go Online
                 </Button>
               )}
             </div>

            {!isTracking ? (
               <div className="flex flex-col items-center justify-center py-12 text-center bg-neutral-800/30 rounded-xl border border-neutral-700/50 border-dashed">
                 <FaMapMarkerAlt className="text-4xl text-neutral-500 mb-4" />
                 <p className="text-white font-bold mb-2">You are Offline</p>
                 <p className="text-neutral-400 text-sm mb-4">Go online to share your live location.</p>
                 <Button onClick={() => startLocationTracking(user?._id)}>Go Online</Button>
               </div>
            ) : locationError ? (
               <div className="flex flex-col items-center justify-center py-12 text-center bg-neutral-800/30 rounded-xl border border-red-500/30">
                 <FaMapMarkerAlt className="text-4xl text-red-500/50 mb-4" />
                 <p className="text-red-400 font-bold mb-2">Location Access Required</p>
                 <p className="text-neutral-400 text-sm">{locationError}</p>
                 <p className="text-neutral-500 text-xs mt-2">Please enable location permissions in your browser to see nearby jobs.</p>
               </div>
            ) : !locationAcquired ? (
               <div className="flex flex-col items-center justify-center py-12 text-center">
                 <Loader />
                 <p className="text-neutral-400 mt-4 animate-pulse">Acquiring your live location...</p>
               </div>
            ) : isLoading ? (
               <div className="flex justify-center py-12">
                 <Loader />
               </div>
            ) : availableBookings?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableBookings.slice(0, 4).map((booking) => (
                  <div key={booking._id} className="relative group">
                     <BookingCard booking={booking} compact />
                     
                     {/* Overlay for quick action */}
                     <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl z-10 pointer-events-none">
                        <Button size="sm" onClick={() => handleRequestJob(booking._id)} className="shadow-lg shadow-yellow-500/20 pointer-events-auto">
                          Accept Job
                        </Button>
                     </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-neutral-800/30 rounded-xl">
                 <p className="text-neutral-400 mb-2">No new jobs available right now in your 60 KM radius.</p>
                 <Button variant="link" onClick={() => navigate('/technician/available-jobs')} className="text-yellow-500">
                    Check Full Marketplace
                 </Button>
              </div>
            )}
            
            {availableBookings?.length > 0 && (
              <div className="mt-4 text-center">
                 <Button variant="outline" className="w-full border-neutral-700 hover:bg-neutral-800" onClick={() => navigate('/technician/available-jobs')}>
                    View All Available Jobs
                 </Button>
              </div>
            )}
          </div>

          {/* Recent History */}
           <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Recent Job History</h3>
              </div>
              {isLoading ? (
                 <Loader />
              ) : bookings.length > 0 ? (
                 <div className="space-y-4">
                    {bookings.slice(0, 3).map((booking) => (
                       <BookingCard key={booking._id} booking={booking} />
                    ))}
                 </div>
              ) : (
                 <p className="text-neutral-500 text-center py-8">No job history yet.</p>
              )}
               {bookings.length > 3 && (
                  <Button variant="ghost" className="w-full mt-4 text-neutral-400 hover:text-white" onClick={() => navigate('/bookings/my-bookings')}>
                    View Full History
                  </Button>
               )}
           </div>

        </div>

        {/* Right Column: Today's Schedule & Pending (Takes up 1/3 space) */}
        <div className="lg:col-span-1 space-y-8">
           
           {/* Today's Schedule */}
           <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FaClock className="text-purple-400" />
                  Today's Schedule
                </h3>
                <span className="bg-purple-500/10 text-purple-400 px-2 py-1 rounded-lg text-xs font-bold">
                  {todayJobs.length}
                </span>
              </div>
              
              {todayJobs.length > 0 ? (
                 <div className="space-y-4">
                   {todayJobs.map((booking) => (
                     <div key={booking._id} className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-700/50">
                        <h4 className="font-bold text-white mb-1">{booking.subServiceId?.name}</h4>
                        <p className="text-xs text-neutral-400 mb-2">{booking.location?.address}</p>
                        <div className="flex justify-between items-center gap-2 mt-2">
                           {booking.status === 'assigned' && (
                             <Button 
                               size="sm" 
                               className="text-xs h-8 flex-1 bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center"
                               onClick={() => dispatch(updateBookingStatus({ id: booking._id, status: 'accepted', note: 'Job accepted' }))}
                             >
                               <FaCheckCircle className="mr-1" /> Accept
                             </Button>
                           )}

                           {booking.status === 'accepted' && (
                             <Button 
                               size="sm" 
                               className="text-xs h-8 flex-1 bg-yellow-500 hover:bg-yellow-600 text-black flex items-center justify-center"
                               onClick={() => dispatch(updateBookingStatus({ id: booking._id, status: 'on-the-way', note: 'Technician on the way' }))}
                             >
                               <FaMapMarkerAlt className="mr-1" /> Start Travel
                             </Button>
                           )}

                           {booking.status === 'on-the-way' && (
                             <Button 
                               size="sm" 
                               className="text-xs h-8 flex-1 bg-green-500 hover:bg-green-600 text-white flex items-center justify-center"
                               onClick={() => dispatch(updateBookingStatus({ id: booking._id, status: 'in-progress', note: 'Job started' }))}
                             >
                               <FaBriefcase className="mr-1" /> Start Job
                             </Button>
                           )}

                           {booking.status === 'in-progress' && (
                             <Button 
                               size="sm" 
                               className="text-xs h-8 flex-1 bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 flex items-center justify-center"
                               onClick={() => {
                                 if(window.confirm('Mark this job as completed?')) {
                                   dispatch(updateBookingStatus({ id: booking._id, status: 'verification_pending', note: 'Marked as done from dashboard' }));
                                 }
                               }}
                             >
                               <FaCheckCircle className="mr-1" /> Complete
                             </Button>
                           )}
                           
                           {['pending', 'cancelled', 'completed', 'verification_pending'].includes(booking.status) && (
                             <span className="text-xs bg-neutral-700/50 text-neutral-400 px-2 py-1 rounded capitalize">
                               {booking.status.replace(/_/g, ' ').replace(/-/g, ' ')}
                             </span>
                           )}

                           <Button size="sm" variant="outline" className="text-xs h-8 border-neutral-700" onClick={() => navigate(`/bookings/${booking._id}`)}>
                             View
                           </Button>
                        </div>
                     </div>
                   ))}
                 </div>
              ) : (
                <div className="text-center py-8">
                   <p className="text-neutral-500 text-sm">No jobs scheduled for today.</p>
                </div>
              )}
           </div>

           {/* Pending Requests */}
           <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
              <h3 className="text-lg font-bold text-white mb-6">Jobs to Start</h3>
              {pendingJobs.length > 0 ? (
                 <div className="space-y-4">
                    {pendingJobs.map(booking => (
                       <div key={booking._id} className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-700/50 opacity-75">
                          <div className="flex justify-between items-start">
                             <div>
                                <h4 className="font-bold text-white font-sm">{booking.subServiceId?.name}</h4>
                                <p className="text-xs text-neutral-500 mt-1">Ready to start</p>
                             </div>
                             <FaClock className="text-yellow-500" />
                          </div>
                       </div>
                    ))}
                 </div>
              ) : (
                 <p className="text-neutral-500 text-sm text-center py-8">No jobs waiting to start.</p>
              )}
           </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default TechnicianDashboard;

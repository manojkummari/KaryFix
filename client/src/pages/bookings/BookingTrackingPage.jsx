import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  getBookingById,
  updateBookingStatus,
  addBookingReview,
  clearSelectedBooking,
  clearError,
  clearMessage,
} from '../../store/slices/bookingSlice';
import { useSocket } from '../../context/SocketContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusTimeline from '../../components/bookings/StatusTimeline';
import BookingStatusBadge from '../../components/bookings/BookingStatusBadge';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import MapTracker from '../../components/tracking/MapTracker';
import { getMenuItemsByRole } from '../../utils/menuItems';
import { FaArrowLeft, FaUser, FaUserCog, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaClipboardList, FaRupeeSign, FaCreditCard, FaStar, FaImage, FaTimes, FaCheck, FaBriefcase } from 'react-icons/fa';

const BookingTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { joinBookingRoom, leaveBookingRoom } = useSocket();

  const { selectedBooking, isLoading, error, message } = useSelector(
    (state) => state.bookings
  );
  const { user } = useSelector((state) => state.auth);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    score: 5,
    review: '',
  });
  const [technicianLocation, setTechnicianLocation] = useState(null);
  const [locationUpdatedAt, setLocationUpdatedAt] = useState(null);

  useEffect(() => {
    dispatch(getBookingById(id));
    joinBookingRoom(id);

    return () => {
      leaveBookingRoom(id);
      dispatch(clearSelectedBooking());
    };
  }, [dispatch, id, joinBookingRoom, leaveBookingRoom]);

  useEffect(() => {
    if (message) {
      setTimeout(() => {
        dispatch(clearMessage());
      }, 3000);
    }
  }, [message, dispatch]);

  const handleCancelBooking = () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      dispatch(
        updateBookingStatus({
          id,
          status: 'cancelled',
          note: 'Cancelled by customer',
        })
      );
    }
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    dispatch(addBookingReview({ id, ...reviewData }));
    setShowReviewForm(false);
    setReviewData({ score: 5, review: '' });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canCancelBooking = () => {
    return (
      user?.role === 'customer' &&
      selectedBooking?.status !== 'completed' &&
      selectedBooking?.status !== 'cancelled'
    );
  };

  const canReview = () => {
    return (
      user?.role === 'customer' &&
      selectedBooking?.status === 'completed' &&
      !selectedBooking?.rating?.score
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Booking Details" menuItems={getMenuItemsByRole(user?.role)}>
        <div className="flex justify-center items-center py-20">
          <Loader />
        </div>
      </DashboardLayout>
    );
  }

  if (!selectedBooking) {
    return (
      <DashboardLayout title="Booking Details" menuItems={getMenuItemsByRole(user?.role)}>
        <div className="text-center py-16 rounded-xl border border-neutral-700/50 bg-neutral-900/50">
          <FaClipboardList className="text-4xl text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400 mb-4">Booking not found</p>
          <button
            onClick={() => navigate(user?.role === 'admin' ? '/admin/bookings' : '/bookings/my-bookings')}
            className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-bold transition-colors"
          >
            Back to Bookings
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Booking Details" menuItems={getMenuItemsByRole(user?.role)}>
      {/* Back Button */}
      <button
        onClick={() => navigate(user?.role === 'admin' ? '/admin/bookings' : '/bookings/my-bookings')}
        className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <FaArrowLeft /> Back to Bookings
      </button>

      {message && (
        <Alert variant="success" className="mb-6" onClose={() => dispatch(clearMessage())}>
          <div className="flex items-center gap-2"><FaCheck /> {message}</div>
        </Alert>
      )}

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Header */}
          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {selectedBooking.subServiceId?.name || selectedBooking.subService}
                </h2>
                <p className="text-neutral-500">
                  {selectedBooking.categoryId?.name || selectedBooking.category}
                </p>
              </div>
              <BookingStatusBadge status={selectedBooking.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-700/50">
              <div>
                <p className="text-neutral-500 text-sm mb-1">Booking ID</p>
                <p className="text-neutral-300 font-mono text-sm">
                  #{selectedBooking._id.slice(-8).toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-neutral-500 text-sm mb-1">Created On</p>
                <p className="text-neutral-300">{formatDate(selectedBooking.createdAt)}</p>
              </div>
            </div>
          </div>

            {/* Service Details & Location */ }
           <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6 relative overflow-hidden">
             {/* Live Indicator (if applicable) */}
             {['on-the-way', 'in-progress'].includes(selectedBooking.status) && (
                 <div className="absolute top-6 right-6 px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1 border border-green-500/30">
                   <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                   Live
                 </div>
              )}

             <div className="flex items-center gap-3 mb-6">
               <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                 <FaClipboardList className="text-blue-500" />
               </div>
               <h3 className="text-lg font-semibold text-white">Service Details</h3>
             </div>
             
             <div className="space-y-6">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Left Column: Text Details */}
                  <div className="space-y-4">
                     <div>
                       <p className="text-neutral-500 text-sm mb-1">Description</p>
                       <p className="text-neutral-300">{selectedBooking.description}</p>
                     </div>
                     
                     {selectedBooking.scheduledDate && (
                       <div className="flex items-start gap-2">
                         <FaCalendarAlt className="text-purple-500 mt-1" />
                         <div>
                           <p className="text-neutral-500 text-sm mb-1">Scheduled For</p>
                           <p className="text-neutral-300">{formatDate(selectedBooking.scheduledDate)}</p>
                         </div>
                       </div>
                     )}

                     <div className="flex items-start gap-2">
                         <FaMapMarkerAlt className="text-green-500 mt-1" />
                         <div>
                           <p className="text-neutral-500 text-sm mb-1">Location</p>
                           <p className="text-neutral-300 mb-2">{selectedBooking.location?.address}</p>
                           {user?.role === 'technician' && selectedBooking.location?.coordinates && selectedBooking.location.coordinates[0] !== 0 && (
                              <button 
                                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedBooking.location.coordinates[1]},${selectedBooking.location.coordinates[0]}`, '_blank')}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 text-sm rounded-lg border border-blue-500/20 transition-colors"
                              >
                                <FaMapMarkerAlt /> Navigate with Maps
                              </button>
                           )}
                         </div>
                       </div>
                  </div>

                  {/* Right Column: Map */}
                  <div className="h-64 md:h-full min-h-[200px] rounded-xl overflow-hidden border border-neutral-700/50 relative">
                     {selectedBooking.location?.coordinates && 
                      selectedBooking.location.coordinates[0] !== 0 && 
                      selectedBooking.location.coordinates[1] !== 0 ? (
                       <MapTracker
                         customerLocation={selectedBooking.location.coordinates}
                         technicianLocation={technicianLocation}
                         technicianName={selectedBooking.technicianId?.name}
                         technicianPhone={selectedBooking.technicianId?.phone}
                         isLive={['on-the-way', 'in-progress'].includes(selectedBooking.status)}
                         lastUpdated={locationUpdatedAt}
                       />
                     ) : (
                       <div className="w-full h-full bg-neutral-800/50 flex flex-col items-center justify-center p-4 text-center">
                         <FaMapMarkerAlt className="text-3xl text-neutral-600 mb-2" />
                         <p className="text-neutral-400 text-sm">Map unavailable</p>
                         <p className="text-neutral-500 text-xs mt-1">Coords not found</p>
                       </div>
                     )}
                  </div>
               </div>
             </div>
           </div>

          {/* Contact Information */}
          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <FaUser className="text-yellow-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">Contact Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Customer */}
              <div className="p-4 bg-neutral-800/50 rounded-xl">
                <p className="text-neutral-500 text-sm mb-3">Customer</p>
                <p className="text-white font-semibold mb-2">{selectedBooking.customerId?.name}</p>
                <div className="space-y-1 text-sm">
                  <p className="flex items-center gap-2 text-neutral-400">
                    <FaEnvelope className="text-xs" /> {selectedBooking.customerId?.email}
                  </p>
                  {selectedBooking.customerId?.phone && (
                    <p className="flex items-center gap-2 text-neutral-400">
                      <FaPhone className="text-xs" /> {selectedBooking.customerId?.phone}
                    </p>
                  )}
                </div>
              </div>
              {/* Technician */}
              {selectedBooking.technicianId && (
                <div className="p-4 bg-neutral-800/50 rounded-xl">
                  <p className="text-neutral-500 text-sm mb-3">Technician</p>
                  <p className="text-white font-semibold mb-2">{selectedBooking.technicianId.name}</p>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center gap-2 text-neutral-400">
                      <FaEnvelope className="text-xs" /> {selectedBooking.technicianId.email}
                    </p>
                    {selectedBooking.technicianId.phone && (
                      <p className="flex items-center gap-2 text-neutral-400">
                        <FaPhone className="text-xs" /> {selectedBooking.technicianId.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Photos */}
          {selectedBooking.photos && selectedBooking.photos.length > 0 && (
            <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <FaImage className="text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">Photos</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {selectedBooking.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-xl overflow-hidden bg-neutral-800"
                  >
                    <img
                      src={photo.url}
                      alt={`Booking photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review Section */}
          {selectedBooking.rating?.score && (
            <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <FaStar className="text-yellow-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">Your Review</h3>
              </div>
              <div className="flex items-center gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={star <= selectedBooking.rating.score ? 'text-yellow-500' : 'text-neutral-600'}
                  />
                ))}
                <span className="text-neutral-400 ml-2">({selectedBooking.rating.score}/5)</span>
              </div>
              {selectedBooking.rating.review && (
                <p className="text-neutral-300">{selectedBooking.rating.review}</p>
              )}
            </div>
          )}

          {/* Review Form */}
          {canReview() && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors"
            >
              Leave a Review
            </button>
          )}

          {showReviewForm && (
            <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Leave a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-neutral-400 text-sm mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewData({ ...reviewData, score: star })}
                        className="text-2xl transition-colors"
                      >
                        <FaStar className={star <= reviewData.score ? 'text-yellow-500' : 'text-neutral-600'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-neutral-400 text-sm mb-2">Review (Optional)</label>
                  <textarea
                    value={reviewData.review}
                    onChange={(e) => setReviewData({ ...reviewData, review: e.target.value })}
                    placeholder="Share your experience..."
                    rows={3}
                    className="w-full bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-all resize-none"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1 py-3 border border-neutral-700 text-neutral-300 rounded-xl hover:bg-neutral-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Card */}
          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <FaRupeeSign className="text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">Pricing</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Estimated</span>
                <span className="text-neutral-300">₹{selectedBooking.price?.estimated || 0}</span>
              </div>
              {selectedBooking.price?.final > 0 && (
                <div className="flex justify-between items-center pt-3 border-t border-neutral-700/50">
                  <span className="text-neutral-400">Final Price</span>
                  <span className="text-yellow-500 font-bold text-xl">₹{selectedBooking.price.final}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-neutral-700/50">
                <span className="text-neutral-400">Payment</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  selectedBooking.paymentStatus === 'paid'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {selectedBooking.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Method</span>
                <span className="text-neutral-300 flex items-center gap-2">
                  <FaCreditCard className="text-xs" /> {selectedBooking.paymentMethod}
                </span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Status Timeline</h3>
            <StatusTimeline timeline={selectedBooking.statusTimeline} />
          </div>

          {/* Actions */}
          {canCancelBooking() && (
            <button
              onClick={handleCancelBooking}
              className="w-full py-3 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <FaTimes /> Cancel Booking
            </button>
          )}

          {/* Technician: Status Transitions */}
          {user?.role === 'technician' && (
            <>
              {selectedBooking?.status === 'assigned' && (
                <button
                  onClick={() => dispatch(updateBookingStatus({ id, status: 'accepted', note: 'Job accepted by technician' }))}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                >
                  <FaCheck /> Accept Job
                </button>
              )}

              {selectedBooking?.status === 'accepted' && (
                <button
                  onClick={() => dispatch(updateBookingStatus({ id, status: 'on-the-way', note: 'Technician is on the way' }))}
                  className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl font-bold transition-colors shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2"
                >
                  <FaMapMarkerAlt /> Start Travel
                </button>
              )}

              {selectedBooking?.status === 'on-the-way' && (
                <button
                  onClick={() => dispatch(updateBookingStatus({ id, status: 'in-progress', note: 'Technician started the job' }))}
                  className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                >
                  <FaBriefcase /> Start Job
                </button>
              )}

              {selectedBooking?.status === 'in-progress' && (
                <button
                  onClick={() => {
                    if(window.confirm('Are you sure the job is done?')) {
                      dispatch(updateBookingStatus({ id, status: 'verification_pending', note: 'Marked as done by technician' }));
                    }
                  }}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                >
                  <FaCheck /> Mark as Completed
                </button>
              )}
            </>
          )}

          {/* Customer: Verify & Complete */}
          {user?.role === 'customer' && selectedBooking?.status === 'verification_pending' && (
             <button
              onClick={() => {
                 if(window.confirm('Are you satisfied with the work?')) {
                  dispatch(updateBookingStatus({ id, status: 'completed', note: 'Verified and completed by customer' }));
                 }
              }}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 animate-pulse"
            >
              <FaCheck /> Verify & Complete Job
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookingTrackingPage;


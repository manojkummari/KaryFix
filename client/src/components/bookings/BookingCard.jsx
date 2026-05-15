import { useNavigate } from 'react-router-dom';
import BookingStatusBadge from './BookingStatusBadge';

const BookingCard = ({ booking }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/bookings/${booking._id}`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div
      onClick={handleClick}
      className="bg-neutral-800/60 backdrop-blur-xl border border-neutral-700/50 rounded-lg p-5 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-yellow-500/20 hover:border-yellow-500/50 flex flex-col h-full group"
    >
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-yellow-500 mb-1 truncate group-hover:text-yellow-400 transition-colors">
            {booking.subServiceId?.name || booking.subService || 'Service'}
          </h4>
          <p className="text-sm text-neutral-400 truncate">
            {booking.categoryId?.name || booking.category || 'Category'}
          </p>
        </div>
        <div className="shrink-0">
          <BookingStatusBadge status={booking.status} />
        </div>
      </div>

      <p className="text-neutral-300 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
        {booking.description || <span className="text-neutral-500 italic">No description provided.</span>}
      </p>

      <div className="space-y-2 mb-4 flex-1">
        <div className="flex items-start text-sm gap-1">
          <span className="text-neutral-400 shrink-0">📍</span>
          <span className="text-neutral-200 truncate" title={booking.location?.address}>
            {booking.location?.address}
          </span>
        </div>

        {booking.scheduledDate && (
          <div className="flex items-center text-sm">
            <span className="text-neutral-400 w-24">Scheduled:</span>
            <span className="text-neutral-200">
              {formatDate(booking.scheduledDate)}
            </span>
          </div>
        )}

        {booking.technicianId && (
          <div className="flex items-center text-sm">
            <span className="text-neutral-400 w-24">Technician:</span>
            <span className="text-neutral-200">{booking.technicianId.name}</span>
          </div>
        )}
      </div>

      <div className="border-t border-neutral-700/50 pt-4 flex items-center justify-between mt-auto">
        <div>
          <p className="text-xs text-neutral-400">Price</p>
          <p className="text-lg font-bold text-yellow-500">
            {booking.price.final > 0
              ? `₹${booking.price.final}`
              : `₹${booking.price.estimated} (est.)`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-400">Created</p>
          <p className="text-sm text-neutral-300">{formatDate(booking.createdAt)}</p>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;

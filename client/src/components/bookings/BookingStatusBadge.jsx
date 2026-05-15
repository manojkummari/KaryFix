const BookingStatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50';
      case 'assigned':
        return 'bg-blue-900/30 text-blue-400 border-blue-500/50';
      case 'accepted':
        return 'bg-green-900/30 text-green-400 border-green-500/50';
      case 'on-the-way':
        return 'bg-purple-900/30 text-purple-400 border-purple-500/50';
      case 'in-progress':
        return 'bg-orange-900/30 text-orange-400 border-orange-500/50';
      case 'completed':
        return 'bg-green-900/30 text-green-500 border-green-500/50';
      case 'cancelled':
        return 'bg-red-900/30 text-red-400 border-red-500/50';
      case 'rejected':
        return 'bg-red-900/30 text-red-500 border-red-500/50';
      case 'verification_pending':
        return 'bg-indigo-900/30 text-indigo-400 border-indigo-500/50';
      default:
        return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    }
  };

  const getStatusLabel = () => {
    return status
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getStatusStyles()}`}
    >
      {getStatusLabel()}
    </span>
  );
};

export default BookingStatusBadge;

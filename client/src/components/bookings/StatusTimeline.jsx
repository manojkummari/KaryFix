const StatusTimeline = ({ timeline }) => {
  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'assigned':
        return 'bg-blue-500';
      case 'accepted':
        return 'bg-green-500';
      case 'on-the-way':
        return 'bg-purple-500';
      case 'in-progress':
        return 'bg-orange-500';
      case 'completed':
        return 'bg-green-600';
      case 'verification_pending':
        return 'bg-indigo-500';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-neutral-500';
    }
  };

  const getStatusLabel = (status) => {
    return status
      .replace(/_/g, '-') // Normalize underscores to dashes first
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-neutral-400 text-center py-8">
        No timeline data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {timeline.map((item, index) => (
        <div key={index} className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`w-4 h-4 rounded-full ${getStatusColor(item.status)} ring-4 ring-neutral-800`}
            />
            {index < timeline.length - 1 && (
              <div className="w-0.5 h-16 bg-neutral-700 mt-2" />
            )}
          </div>

          <div className="flex-1 pb-8">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-semibold text-yellow-500">
                {getStatusLabel(item.status)}
              </h4>
              <span className="text-sm text-neutral-400">
                {formatDateTime(item.timestamp)}
              </span>
            </div>
            {item.note && (
              <p className="text-neutral-300 text-sm">{item.note}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusTimeline;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import BookingStatusBadge from '../../components/bookings/BookingStatusBadge';
import Button from '../../components/common/Button';

const ManagerBookingsPage = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('pending');

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
    { icon: '📋', label: 'Service Requests', path: '/manager/bookings' },
    { icon: '👷', label: 'Technicians', path: '/manager/technicians' },
    { icon: '✅', label: 'Approvals', path: '/manager/approvals' },
    { icon: '📊', label: 'Reports', path: '/manager/reports' },
    { icon: '👤', label: 'Profile', path: '/profile' },
  ];

  // TODO: Fetch bookings from API
  const bookings = [];

  return (
    <DashboardLayout title="Service Requests" menuItems={menuItems}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-sm text-neutral-400 mb-1">Pending Assignment</p>
          <p className="text-2xl font-bold text-orange-500">0</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-400 mb-1">Assigned</p>
          <p className="text-2xl font-bold text-yellow-500">0</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-400 mb-1">In Progress</p>
          <p className="text-2xl font-bold text-yellow-500">0</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-400 mb-1">Completed Today</p>
          <p className="text-2xl font-bold text-green-500">0</p>
        </Card>
      </div>

      <Card title="Service Requests">
        <div className="mb-6 flex gap-2">
          {['pending', 'assigned', 'in-progress', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'bg-yellow-500 text-neutral-900'
                  : 'bg-neutral-800/60 text-neutral-300 hover:bg-neutral-700/60'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        {bookings.length > 0 ? (
          <div className="space-y-4">
            {/* Booking list will appear here */}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-400">No service requests found</p>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default ManagerBookingsPage;

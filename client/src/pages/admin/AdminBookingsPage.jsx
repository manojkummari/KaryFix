import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import BookingStatusBadge from '../../components/bookings/BookingStatusBadge';
import Loader from '../../components/common/Loader';
import { getMenuItemsByRole } from '../../utils/menuItems';
import { FaSearch, FaFilter, FaCalendarAlt, FaUser, FaToolbox, FaRupeeSign, FaEye, FaDownload } from 'react-icons/fa';

import { toast } from 'react-hot-toast';
import { getAllBookings } from '../../store/slices/bookingSlice';

const AdminBookingsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { bookings, isLoading } = useSelector((state) => state.bookings);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = getMenuItemsByRole('admin');

  // Fetch all bookings from API
  useEffect(() => {
    dispatch(getAllBookings());
  }, [dispatch]);



  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = !statusFilter || booking.status === statusFilter;
    const matchesSearch =
      booking.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.technicianId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    active: bookings.filter((b) =>
      ['assigned', 'accepted', 'on-the-way', 'in-progress'].includes(b.status)
    ).length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  const StatusCard = ({ label, count, color, icon: Icon }) => (
    <div className={`p-5 rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/50 to-${color}-900/10 backdrop-blur-sm relative overflow-hidden group`}>
      <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
        <Icon className="text-6xl" />
      </div>
      <div>
        <p className="text-neutral-400 text-sm font-medium mb-1">{label}</p>
        <p className={`text-2xl font-bold text-${color}-500`}>{count}</p>
      </div>
    </div>
  );

  return (
    <DashboardLayout title="Booking Management" menuItems={menuItems}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 h-full">
        <StatusCard label="Total Bookings" count={stats.total} color="blue" icon={FaCalendarAlt} />
        <StatusCard label="Pending" count={stats.pending} color="orange" icon={FaFilter} />
        <StatusCard label="Active" count={stats.active} color="yellow" icon={FaToolbox} />
        <StatusCard label="Completed" count={stats.completed} color="green" icon={FaUser} />
        <StatusCard label="Cancelled" count={stats.cancelled} color="red" icon={FaTimes} />
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex gap-2 p-1 bg-neutral-900/50 rounded-xl border border-neutral-700/50 backdrop-blur-sm overflow-x-auto max-w-full">
          {['', 'pending', 'active', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status === 'active' ? 'in-progress' : status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                (status === '' && statusFilter === '') || (status !== '' && statusFilter === status)
                  ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {status === '' ? 'All Bookings' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial group">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-yellow-500 transition-colors z-10 pointer-events-none" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-neutral-900/50 border border-neutral-700/50 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all backdrop-blur-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-sm font-bold transition-colors border border-neutral-700">
            <FaDownload /> <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-neutral-900/50 border border-neutral-700/30 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader />
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-700/30 bg-neutral-900/50">
                  <th className="text-left py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">ID</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Service Details</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Technician</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Price</th>
                  <th className="text-right py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700/30">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="group hover:bg-neutral-800/30 transition-colors">
                    <td className="py-4 px-6 text-sm font-mono text-neutral-400">
                      #{booking._id.slice(-6)}
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-neutral-200">{booking.subServiceId?.name || booking.subService}</p>
                        <p className="text-xs text-neutral-500">{booking.categoryId?.name || booking.category}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-[10px] text-blue-400 font-bold border border-blue-500/20">
                          {booking.customerId?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-sm text-neutral-300">{booking.customerId?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {booking.technicianId ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center text-[10px] text-yellow-400 font-bold border border-yellow-500/20">
                            {booking.technicianId.name.charAt(0)}
                          </div>
                          <span className="text-sm text-neutral-300">{booking.technicianId.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-neutral-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <BookingStatusBadge status={booking.status} />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1 text-sm font-bold text-yellow-500">
                        <FaRupeeSign className="text-xs" />
                        {booking.price.final > 0 ? booking.price.final : booking.price.estimated}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">

                        <button
                          onClick={() => navigate(`/bookings/${booking._id}`)}
                          className="px-3 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-colors border border-neutral-700"
                        >
                          Details
                        </button>
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
            <div className="w-16 h-16 bg-neutral-800/50 rounded-full flex items-center justify-center mb-4">
              <FaCalendarAlt className="text-2xl opacity-50" />
            </div>
            <p className="text-lg font-medium">No bookings found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

// Helper component for icon import
function FaTimes({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

export default AdminBookingsPage;

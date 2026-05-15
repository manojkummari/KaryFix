// Dynamic menu items based on user role
import {
  FaHome,
  FaTools,
  FaClipboardList,
  FaUser,
  FaBriefcase,
  FaClock,
  FaMoneyBillWave,
  FaUsers,
  FaCog,
  FaChartBar,
  FaChartLine,
  FaCheckCircle,
  FaTrash,
  FaHistory,
  FaUserTie,
  FaRecycle,
  FaBox,
} from 'react-icons/fa';

export const getMenuItemsByRole = (role, additionalData = {}) => {
  const { activeBookings = 0, activeJobs = 0, todayJobs = 0 } = additionalData;

  switch (role) {
    case 'customer':
      return [
        { icon: <FaHome />, label: 'Dashboard', path: '/dashboard' },
        { icon: <FaTools />, label: 'Services', path: '/services' },
        {
          icon: <FaClipboardList />,
          label: 'My Bookings',
          path: '/bookings/my-bookings',
          badge: activeBookings > 0 && (
            <span className="ml-auto bg-yellow-500 text-neutral-900 px-2 py-0.5 rounded-full text-xs font-bold">
              {activeBookings}
            </span>
          ),
        },
        { icon: <FaRecycle />, label: 'Sell Waste', path: '/waste/book' },
        { icon: <FaBox />, label: 'Materials', path: '/materials' },
        { icon: <FaUser />, label: 'Profile', path: '/profile' },
      ];

    case 'technician':
      return [
        { icon: <FaHome />, label: 'Dashboard', path: '/technician/dashboard' },
        {
          icon: <FaClipboardList />,
          label: 'Marketplace',
          path: '/technician/available-jobs',
        },
        {
          icon: <FaBriefcase />,
          label: 'My Jobs',
          path: '/bookings/my-bookings',
          badge: activeJobs > 0 && (
            <span className="ml-auto bg-yellow-500 text-neutral-900 px-2 py-0.5 rounded-full text-xs font-bold">
              {activeJobs}
            </span>
          ),
        },

        { icon: <FaMoneyBillWave />, label: 'Earnings', path: '/technician/earnings' },
        { icon: <FaUser />, label: 'Profile', path: '/profile' },
      ];

    case 'manager':
      return [
        { icon: <FaHome />, label: 'Dashboard', path: '/category-manager/dashboard' },
        { icon: <FaClipboardList />, label: 'Service Requests', path: '/manager/bookings' },
        { icon: <FaUserTie />, label: 'Technicians', path: '/manager/technicians' },
        { icon: <FaCheckCircle />, label: 'Approvals', path: '/manager/approvals' },
        { icon: <FaChartBar />, label: 'Reports', path: '/manager/reports' },
        { icon: <FaUser />, label: 'Profile', path: '/profile' },
      ];

    case 'wasteOfficer':
      return [
        { icon: <FaHome />, label: 'Dashboard', path: '/waste-officer/dashboard' },
        { icon: <FaTrash />, label: 'Pickup Requests', path: '/waste/pickups' },
        { icon: <FaCheckCircle />, label: 'Verify Collections', path: '/waste/verify' },
        { icon: <FaHistory />, label: 'Collection History', path: '/waste/history' },
        { icon: <FaChartLine />, label: 'Statistics', path: '/waste/stats' },
        { icon: <FaUser />, label: 'Profile', path: '/profile' },
      ];

    case 'admin':
      return [
        { icon: <FaHome />, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: <FaUsers />, label: 'Manage Users', path: '/admin/users' },
        { icon: <FaTools />, label: 'Manage Services', path: '/admin/services' },
        { icon: <FaClipboardList />, label: 'All Bookings', path: '/admin/bookings' },
        { icon: <FaChartBar />, label: 'Analytics', path: '/admin/analytics' },
        { icon: <FaCog />, label: 'Settings', path: '/admin/settings' },
      ];

    default:
      return [
        { icon: <FaHome />, label: 'Dashboard', path: '/dashboard' },
        { icon: <FaUser />, label: 'Profile', path: '/profile' },
      ];
  }
};

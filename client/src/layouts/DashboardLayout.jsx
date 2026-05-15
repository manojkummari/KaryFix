import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import Button from '../components/common/Button';
import Sidebar from '../components/layout/Sidebar';
import SOSButton from '../components/common/SOSButton';
import { FaBars } from 'react-icons/fa';

const DashboardLayout = ({ children, title, menuItems = [] }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  // Show SOS button for technicians and waste officers
  const showSOS = ['technician', 'wasteOfficer'].includes(user?.role);

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {menuItems.length > 0 && (
        <Sidebar 
          menuItems={menuItems} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Main Content */}
      <div className={`${menuItems.length > 0 ? 'lg:ml-72' : ''} transition-all duration-300`}>
        {/* Top Navigation */}
        <nav className="bg-neutral-900/40 backdrop-blur-xl border-b border-neutral-700/50 sticky top-0 z-30 shadow-xl shadow-black/20">
          <div className="px-4 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                {menuItems.length > 0 && (
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 -ml-2 text-neutral-400 hover:text-yellow-500 lg:hidden"
                  >
                    <FaBars className="text-xl" />
                  </button>
                )}
                <h2 className="text-xl lg:text-2xl font-bold text-yellow-500 truncate">{title}</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-neutral-800/60 backdrop-blur-sm rounded-lg border border-neutral-700/50">
                  <span className="text-neutral-300 text-sm">{user?.name}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="backdrop-blur-sm text-sm"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </div>

      {/* SOS Button for Technicians */}
      {showSOS && <SOSButton />}
    </div>
  );
};

export default DashboardLayout;

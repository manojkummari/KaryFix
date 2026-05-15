import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ROLE_LABELS, ROLE_ROUTES } from '../../constants/roles';
import { logout } from '../../store/slices/authSlice';
import { FaSignOutAlt, FaWallet, FaTimes } from 'react-icons/fa';

const Sidebar = ({ menuItems, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <aside 
      className={`
        w-72 min-h-screen bg-gradient-to-b from-neutral-900/95 via-neutral-900/90 to-neutral-950/95 
        backdrop-blur-2xl border-r border-neutral-700/30 fixed left-0 top-0 z-50 flex flex-col 
        shadow-2xl shadow-black/50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-neutral-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <span className="text-black font-black text-xl">K</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Kary<span className="text-yellow-500">Fix</span>
              </h1>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white lg:hidden"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <p className="px-4 mb-2 text-[10px] font-semibold text-neutral-500 uppercase tracking-widest">
          Menu
        </p>
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              onClick={() => onClose && onClose()} // Close sidebar on mobile when link clicked
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-yellow-500/20 via-yellow-500/10 to-transparent text-yellow-500 border-l-4 border-yellow-500'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="font-medium text-sm flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 bg-yellow-500 text-black text-xs font-bold rounded-full shadow-lg shadow-yellow-500/30">
                      {typeof item.badge === 'object' ? item.badge.props?.children : item.badge}
                    </span>
                  )}
                  {isActive && !item.badge && (
                    <div className="absolute right-3 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 space-y-3 border-t border-neutral-700/30">
        {/* User Profile Card */}
        <div className="p-3 bg-neutral-800/50 rounded-xl border border-neutral-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 flex items-center justify-center text-black font-bold text-base shadow-lg shadow-yellow-500/20">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-neutral-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name}
              </p>
              <p className="text-[10px] text-neutral-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Wallet Card */}
        <div className="p-4 bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent rounded-2xl border border-yellow-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <FaWallet className="text-yellow-500" />
              <p className="text-xs text-neutral-400 font-medium">Wallet Balance</p>
            </div>
            <p className="text-2xl font-black text-white">
              ₹{(user?.wallet?.balance || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-800/50 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 rounded-xl transition-all duration-300 border border-neutral-700/30 hover:border-red-500/30 group"
        >
          <FaSignOutAlt className="text-sm group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>

      {/* Decorative gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-yellow-500/5 to-transparent pointer-events-none" />
    </aside>
  );
};

export default Sidebar;

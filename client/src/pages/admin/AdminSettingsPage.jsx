import { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { getMenuItemsByRole } from '../../utils/menuItems';
import { FaSave, FaUndo, FaCogs, FaBell, FaShieldAlt } from 'react-icons/fa';

const AdminSettingsPage = () => {
  const [message, setMessage] = useState('');
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    platformName: 'Karyfix',
    supportEmail: 'support@karyfix.com',
    supportPhone: '+91 1800-000-0000',
    commissionRate: 10,
    minBookingAmount: 100,
    maxBookingAmount: 50000,
    enableWasteManagement: true,
    enableNotifications: true,
    maintenanceMode: false,
  });

  const menuItems = getMenuItemsByRole('admin');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setMessage('Settings saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const SectionButton = ({ id, icon: Icon, label }) => (
    <button
      type="button"
      onClick={() => setActiveSection(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
        activeSection === id
          ? 'bg-yellow-500 text-black font-bold shadow-lg shadow-yellow-500/20'
          : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
      }`}
    >
      <Icon className="text-lg" />
      <span>{label}</span>
    </button>
  );

  return (
    <DashboardLayout title="Platform Settings" menuItems={menuItems}>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Settings Nav */}
        <div className="w-full lg:w-64 space-y-2">
            <h3 className="px-4 text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Configuration</h3>
            <SectionButton id="general" icon={FaCogs} label="General" />
            <SectionButton id="notifications" icon={FaBell} label="Notifications" />
            <SectionButton id="security" icon={FaShieldAlt} label="Security & Limits" />
        </div>

        {/* Main Settings Area */}
        <div className="flex-1">
          {message && (
            <Alert variant="success" className="mb-6" onClose={() => setMessage('')}>
              {message}
            </Alert>
          )}

          <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
            {activeSection === 'general' && (
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-2xl p-6 backdrop-blur-sm animate-in fade-in duration-300">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500"><FaCogs /></span> General Settings
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Platform Name</label>
                    <input
                      type="text"
                      name="platformName"
                      value={settings.platformName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700/50 rounded-xl text-neutral-100 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-2">Support Email</label>
                      <input
                        type="email"
                        name="supportEmail"
                        value={settings.supportEmail}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700/50 rounded-xl text-neutral-100 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-2">Support Phone</label>
                      <input
                        type="tel"
                        name="supportPhone"
                        value={settings.supportPhone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700/50 rounded-xl text-neutral-100 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-700/50">
                    <label className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-xl cursor-pointer hover:bg-neutral-800/50 transition-colors group">
                      <div>
                        <p className="font-semibold text-white group-hover:text-yellow-500 transition-colors">Waste Management</p>
                        <p className="text-sm text-neutral-500">Enable waste collection and recycling features</p>
                      </div>
                      <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.enableWasteManagement ? 'bg-yellow-500' : 'bg-neutral-700'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${settings.enableWasteManagement ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                      <input type="checkbox" name="enableWasteManagement" checked={settings.enableWasteManagement} onChange={handleChange} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-2xl p-6 backdrop-blur-sm animate-in fade-in duration-300">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500"><FaBell /></span> Notifications
                </h3>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-xl cursor-pointer hover:bg-neutral-800/50 transition-colors group">
                    <div>
                      <p className="font-semibold text-white group-hover:text-yellow-500 transition-colors">System Notifications</p>
                      <p className="text-sm text-neutral-500">Enable email and SMS notifications for users</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.enableNotifications ? 'bg-green-500' : 'bg-neutral-700'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${settings.enableNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                    <input type="checkbox" name="enableNotifications" checked={settings.enableNotifications} onChange={handleChange} className="hidden" />
                  </label>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-2xl p-6 backdrop-blur-sm animate-in fade-in duration-300">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500"><FaShieldAlt /></span> Security & Limits
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Commission Rate (%)</label>
                    <input
                      type="number"
                      name="commissionRate"
                      value={settings.commissionRate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700/50 rounded-xl text-neutral-100 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Min Booking (₹)</label>
                    <input
                      type="number"
                      name="minBookingAmount"
                      value={settings.minBookingAmount}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700/50 rounded-xl text-neutral-100 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Max Booking (₹)</label>
                    <input
                      type="number"
                      name="maxBookingAmount"
                      value={settings.maxBookingAmount}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700/50 rounded-xl text-neutral-100 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-700/50">
                   <label className="flex items-center justify-between p-4 bg-red-900/10 border border-red-500/20 rounded-xl cursor-pointer hover:bg-red-900/20 transition-colors group">
                    <div>
                      <p className="font-semibold text-red-500">Maintenance Mode</p>
                      <p className="text-sm text-red-400/70">Disable platform access for all users except admins</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-neutral-800'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                    <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} className="hidden" />
                  </label>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1 md:flex-none md:w-40 flex items-center justify-center gap-2">
                <FaSave /> Save Changes
              </Button>
              <Button type="button" variant="outline" className="flex-1 md:flex-none md:w-40 flex items-center justify-center gap-2">
                <FaUndo /> Reset
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettingsPage;

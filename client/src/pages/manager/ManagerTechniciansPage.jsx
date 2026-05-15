import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getMenuItemsByRole } from '../../utils/menuItems';

const ManagerTechniciansPage = () => {
  const menuItems = getMenuItemsByRole('manager');

  // TODO: Fetch technicians from API
  const technicians = [];

  return (
    <DashboardLayout title="Manage Technicians" menuItems={menuItems}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-sm text-neutral-400 mb-1">Total Technicians</p>
          <p className="text-2xl font-bold text-yellow-500">0</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-400 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-500">0</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-400 mb-1">Busy</p>
          <p className="text-2xl font-bold text-orange-500">0</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-400 mb-1">Offline</p>
          <p className="text-2xl font-bold text-neutral-400">0</p>
        </Card>
      </div>

      <Card title="All Technicians">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search technicians..."
            className="w-full px-4 py-2 bg-neutral-800/60 backdrop-blur-md border border-neutral-700/50 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div className="text-center py-12">
          <p className="text-neutral-400">No technicians available</p>
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default ManagerTechniciansPage;

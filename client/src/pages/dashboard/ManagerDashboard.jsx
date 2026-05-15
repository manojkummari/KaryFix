import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import { getMenuItemsByRole } from '../../utils/menuItems';

const ManagerDashboard = () => {
  const menuItems = getMenuItemsByRole('manager');

  return (
    <DashboardLayout title="Category Manager Dashboard" menuItems={menuItems}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Pending Approvals">
          <div className="text-3xl font-bold text-orange-400">0</div>
          <p className="text-sm text-neutral-400 mt-2">Technicians to Verify</p>
        </Card>

        <Card title="Active Technicians">
          <div className="text-3xl font-bold text-yellow-500">0</div>
          <p className="text-sm text-neutral-400 mt-2">Verified & Active</p>
        </Card>

        <Card title="Active Bookings">
          <div className="text-3xl font-bold text-yellow-500">0</div>
          <p className="text-sm text-neutral-400 mt-2">In Progress</p>
        </Card>

        <Card title="Completed Today">
          <div className="text-3xl font-bold text-purple-400">0</div>
          <p className="text-sm text-neutral-400 mt-2">Services Completed</p>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Technician Verification Queue">
          <p className="text-neutral-400 text-center py-8">
            No pending technician applications
          </p>
        </Card>

        <Card title="Service Assignments">
          <p className="text-neutral-400 text-center py-8">
            No unassigned service requests
          </p>
        </Card>
      </div>

      <div className="mt-8">
        <Card title="Service Overview">
          <p className="text-neutral-400 text-center py-8">
            Category performance metrics will appear here
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;

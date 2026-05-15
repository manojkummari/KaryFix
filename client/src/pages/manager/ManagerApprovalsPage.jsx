import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getMenuItemsByRole } from '../../utils/menuItems';

const ManagerApprovalsPage = () => {
  const menuItems = getMenuItemsByRole('manager');

  // TODO: Fetch pending approvals from API
  const pendingApprovals = [];

  return (
    <DashboardLayout title="Pending Approvals" menuItems={menuItems}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <p className="text-sm text-neutral-400 mb-1">Technician Applications</p>
          <p className="text-2xl font-bold text-orange-500">0</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-400 mb-1">Service Approvals</p>
          <p className="text-2xl font-bold text-orange-500">0</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-400 mb-1">Completed Verifications</p>
          <p className="text-2xl font-bold text-green-500">0</p>
        </Card>
      </div>

      <Card title="Technician Verification Queue">
        <div className="text-center py-12">
          <p className="text-neutral-400 mb-4">No pending technician applications</p>
          <p className="text-sm text-neutral-500">
            New technician registrations will appear here for verification
          </p>
        </div>
      </Card>

      <Card title="Service Completion Approvals" className="mt-6">
        <div className="text-center py-12">
          <p className="text-neutral-400 mb-4">No services pending approval</p>
          <p className="text-sm text-neutral-500">
            Completed services awaiting verification will appear here
          </p>
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default ManagerApprovalsPage;

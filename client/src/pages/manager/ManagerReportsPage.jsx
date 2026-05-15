import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getMenuItemsByRole } from '../../utils/menuItems';

const ManagerReportsPage = () => {
  const menuItems = getMenuItemsByRole('manager');

  return (
    <DashboardLayout title="Reports & Analytics" menuItems={menuItems}>
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-sm text-neutral-400 mb-1">Total Services</p>
          <p className="text-2xl font-bold text-yellow-500">0</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-400 mb-1">Completion Rate</p>
          <p className="text-2xl font-bold text-green-500">0%</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-400 mb-1">Avg Response Time</p>
          <p className="text-2xl font-bold text-purple-400">0 hrs</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-400 mb-1">Customer Satisfaction</p>
          <p className="text-2xl font-bold text-yellow-500">0.0 ⭐</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Service Distribution">
          <div className="h-64 flex items-center justify-center">
            <p className="text-neutral-400">Service distribution chart will appear here</p>
          </div>
        </Card>

        <Card title="Technician Performance">
          <div className="h-64 flex items-center justify-center">
            <p className="text-neutral-400">Performance chart will appear here</p>
          </div>
        </Card>
      </div>

      <Card title="Export Reports">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" fullWidth>
            📊 Service Report
          </Button>
          <Button variant="outline" fullWidth>
            👷 Technician Report
          </Button>
          <Button variant="outline" fullWidth>
            💰 Revenue Report
          </Button>
          <Button variant="outline" fullWidth>
            ⭐ Customer Feedback
          </Button>
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default ManagerReportsPage;

import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROLE_ROUTES } from '../../constants/roles';
import Button from '../../components/common/Button';

const Forbidden = () => {
  const { user } = useSelector((state) => state.auth);
  const dashboardRoute = user ? ROLE_ROUTES[user.role] : '/login';

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-yellow-500">403</h1>
          <h2 className="text-3xl font-semibold text-neutral-100 mt-4">
            Access Forbidden
          </h2>
          <p className="text-neutral-400 mt-2">
            You don't have permission to access this page.
          </p>
        </div>

        <div className="space-y-4">
          <Link to={dashboardRoute}>
            <Button fullWidth>Go to Dashboard</Button>
          </Link>
          <Link to="/login">
            <Button fullWidth variant="outline">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;

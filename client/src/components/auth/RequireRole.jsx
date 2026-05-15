import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RequireRole = ({ children, allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default RequireRole;

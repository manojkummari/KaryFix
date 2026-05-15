import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { resetPassword, clearError } from '../../store/slices/authSlice';
import { ROLE_ROUTES } from '../../constants/roles';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { resetToken } = useParams();
  const { isAuthenticated, isLoading, error, user } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [formError, setFormError] = useState('');

  const { password, confirmPassword } = formData;

  useEffect(() => {
    if (isAuthenticated && user) {
      const route = ROLE_ROUTES[user.role] || '/dashboard';
      navigate(route, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    dispatch(resetPassword({ resetToken, password }));
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-yellow-500 mb-2 tracking-tight">Karyfix</h1>
          <h2 className="text-2xl font-semibold text-neutral-100">
            Set new password
          </h2>
        </div>

        <Card>
          {(error || formError) && (
            <Alert
              type="error"
              message={error?.message || formError}
              onClose={() => {
                dispatch(clearError());
                setFormError('');
              }}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
            />

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            >
              Reset Password
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-yellow-500 hover:text-yellow-400"
            >
              Back to sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;

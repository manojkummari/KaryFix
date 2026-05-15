import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { forgotPassword, clearError, clearMessage } from '../../store/slices/authSlice';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { isLoading, error, message } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearMessage());
    };
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(forgotPassword(email));
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-yellow-500 mb-2 tracking-tight">Karyfix</h1>
          <h2 className="text-2xl font-semibold text-neutral-100">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Enter your email and we'll send you a reset token
          </p>
        </div>

        <Card>
          {error && (
            <Alert
              type="error"
              message={error.message}
              onClose={() => dispatch(clearError())}
            />
          )}

          {message && (
            <Alert
              type="success"
              message={message}
              onClose={() => dispatch(clearMessage())}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            >
              Send Reset Token
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

export default ForgotPassword;

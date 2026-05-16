import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, clearError } from '../../store/slices/authSlice';
import { ROLE_ROUTES, ROLES } from '../../constants/roles';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaUserTag, FaArrowRight, FaUserPlus } from 'react-icons/fa';
import Alert from '../../components/common/Alert';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error, user } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: ROLES.CUSTOMER,
  });

  const [formError, setFormError] = useState('');

  const { name, email, phone, password, confirmPassword, role } = formData;

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

    if (phone.length !== 10) {
      setFormError('Phone number must be 10 digits');
      return;
    }

    dispatch(register({ name, email, phone, password, role }));
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex font-sans text-neutral-100">
      
      {/* Left Side - Visual / Branding */}
       <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black items-center justify-center">
         {/* Abstract Clean Background */}
        <div className="absolute top-0 left-0 w-full h-full bg-neutral-950">
           <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(234,179,8,0.1),transparent_50%)]"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[linear-gradient(to_top,rgba(0,0,0,0.8),transparent)]"></div>
        </div>

        <div className="relative z-10 p-12 text-center max-w-lg">
           <div className="mb-6 inline-flex p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
             <FaUserPlus className="text-5xl text-yellow-500" />
           </div>
          <h1 className="text-4xl font-bold mb-6 text-white tracking-tight">Join <span className="text-yellow-500">KaryFix</span> Today</h1>
          <p className="text-lg text-neutral-400 leading-relaxed">
            Create an account to access premium services or join as a professional to grow your business.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-12 relative overflow-y-auto">
         {/* Background for Mobile */}
        <div className="absolute lg:hidden top-0 left-0 w-full h-full bg-neutral-900"></div>

        <div className="w-full max-w-md relative z-10 my-auto">
          <div className="text-center lg:text-left mb-8">
             <Link to="/" className="lg:hidden text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-8 inline-block">
                KaryFix
              </Link>
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
             <p className="text-neutral-400">Fill in your details to get started.</p>
          </div>

          {(error || formError) && (
            <div className="mb-6">
               <Alert
                type="error"
                message={error?.message || formError}
                onClose={() => {
                  dispatch(clearError());
                  setFormError('');
                }}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name */}
            <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-neutral-500 group-focus-within:text-yellow-500 transition-colors" />
                </div>
              <input
                type="text"
                name="name"
                value={name}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-neutral-700 rounded-lg leading-5 bg-neutral-800 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 sm:text-sm transition-all"
                placeholder="Full Name"
                required
              />
            </div>

            {/* Email */}
             <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-neutral-500 group-focus-within:text-yellow-500 transition-colors" />
                </div>
              <input
                type="email"
                name="email"
                value={email}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-neutral-700 rounded-lg leading-5 bg-neutral-800 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 sm:text-sm transition-all"
                placeholder="Email Address"
                required
              />
            </div>

            {/* Phone */}
             <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="text-neutral-500 group-focus-within:text-yellow-500 transition-colors" />
                </div>
              <input
                type="tel"
                name="phone"
                value={phone}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-neutral-700 rounded-lg leading-5 bg-neutral-800 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 sm:text-sm transition-all"
                placeholder="Phone Number (10 digits)"
                maxLength={10}
                required
              />
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
              <label 
                className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center transition-all ${role === ROLES.CUSTOMER ? 'border-yellow-500 bg-yellow-500/10 text-white' : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-500'}`}
              >
                <input 
                  type="radio" 
                  name="role" 
                  value={ROLES.CUSTOMER} 
                  checked={role === ROLES.CUSTOMER} 
                  onChange={handleChange} 
                  className="hidden" 
                />
                <FaUser className="text-2xl mb-2" />
                <span className="font-medium text-sm">Customer</span>
              </label>

              <label 
                 className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center transition-all ${role === ROLES.TECHNICIAN ? 'border-yellow-500 bg-yellow-500/10 text-white' : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-500'}`}
              >
                <input 
                  type="radio" 
                  name="role" 
                  value={ROLES.TECHNICIAN} 
                  checked={role === ROLES.TECHNICIAN} 
                  onChange={handleChange} 
                  className="hidden" 
                />
                <FaUserTag className="text-2xl mb-2" />
                <span className="font-medium text-sm">Technician</span>
              </label>
            </div>


            {/* Passwords */}
            <div className="space-y-4">
               <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-neutral-500 group-focus-within:text-yellow-500 transition-colors" />
                  </div>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                   className="block w-full pl-10 pr-3 py-3 border border-neutral-700 rounded-lg leading-5 bg-neutral-800 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 sm:text-sm transition-all"
                  placeholder="Password (min 6 chars)"
                  required
                />
              </div>

               <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-neutral-500 group-focus-within:text-yellow-500 transition-colors" />
                  </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleChange}
                   className="block w-full pl-10 pr-3 py-3 border border-neutral-700 rounded-lg leading-5 bg-neutral-800 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 sm:text-sm transition-all"
                  placeholder="Confirm Password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-black bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isLoading ? 'Creating Account...' : 'Sign Up'} <FaArrowRight className="ml-2" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-yellow-500 hover:text-yellow-400 transition-colors hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

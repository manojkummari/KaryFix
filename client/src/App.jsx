import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './store/slices/authSlice';
import { ROLES } from './constants/roles';

import ProtectedRoute from './components/auth/ProtectedRoute';
import RequireRole from './components/auth/RequireRole';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Forbidden from './pages/auth/Forbidden';
import LandingPage from './pages/landing/LandingPage';

import CustomerDashboard from './pages/dashboard/CustomerDashboard';
import TechnicianDashboard from './pages/dashboard/TechnicianDashboard';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import WasteOfficerDashboard from './pages/dashboard/WasteOfficerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

import ServicesPage from './pages/services/ServicesPage';
import CategoryDetailsPage from './pages/services/CategoryDetailsPage';
import CreateBookingPage from './pages/bookings/CreateBookingPage';
import MyBookingsPage from './pages/bookings/MyBookingsPage';
import BookingTrackingPage from './pages/bookings/BookingTrackingPage';

// Profile
import ProfilePage from './pages/profile/ProfilePage';

// Admin Pages
import ManageServicesPage from './pages/admin/ManageServicesPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

// Manager Pages
import ManagerBookingsPage from './pages/manager/ManagerBookingsPage';
import ManagerTechniciansPage from './pages/manager/ManagerTechniciansPage';
import ManagerApprovalsPage from './pages/manager/ManagerApprovalsPage';
import ManagerReportsPage from './pages/manager/ManagerReportsPage';

// Technician Pages
import TechnicianEarningsPage from './pages/technician/TechnicianEarningsPage';

// Waste Officer Pages
import WastePickupRequestsPage from './pages/waste/WastePickupRequestsPage';
import WasteVerifyPage from './pages/waste/WasteVerifyPage';
import WasteHistoryPage from './pages/waste/WasteHistoryPage';
import WasteStatisticsPage from './pages/waste/WasteStatisticsPage';
import WasteBookingPage from './pages/waste/WasteBookingPage';

// Materials Pages
import MaterialsPage from './pages/materials/MaterialsPage';
import MaterialCartPage from './pages/materials/MaterialCartPage';
import AvailableJobsPage from './pages/technician/AvailableJobsPage';

import Loader from './components/common/Loader';

import { Toaster } from 'react-hot-toast';

function App() {
  const dispatch = useDispatch();
  const { isLoading, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  if (isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#333',
          color: '#fff',
        },
      }} />
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LandingPage />
            )
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
        <Route path="/403" element={<Forbidden />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={[ROLES.CUSTOMER]}>
                <CustomerDashboard />
              </RequireRole>
            </ProtectedRoute>
          }
        />

        <Route
          path="/technician/dashboard"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={[ROLES.TECHNICIAN]}>
                <TechnicianDashboard />
              </RequireRole>
            </ProtectedRoute>
          }
        />

        <Route
          path="/category-manager/dashboard"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={[ROLES.MANAGER]}>
                <ManagerDashboard />
              </RequireRole>
            </ProtectedRoute>
          }
        />

        <Route
          path="/waste-officer/dashboard"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={[ROLES.WASTE_OFFICER]}>
                <WasteOfficerDashboard />
              </RequireRole>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={[ROLES.ADMIN]}>
                <AdminDashboard />
              </RequireRole>
            </ProtectedRoute>
          }
        />

        {/* Service Routes - Accessible to customers and technicians */}
        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <ServicesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/services/:id"
          element={
            <ProtectedRoute>
              <CategoryDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Booking Routes */}
        <Route
          path="/booking/create"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={[ROLES.CUSTOMER]}>
                <CreateBookingPage />
              </RequireRole>
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings/my-bookings"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={[ROLES.CUSTOMER, ROLES.TECHNICIAN]}>
                <MyBookingsPage />
              </RequireRole>
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings/:id"
          element={
            <ProtectedRoute>
              <BookingTrackingPage />
            </ProtectedRoute>
          }
        />

        {/* Profile Route - Accessible to all authenticated users */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/services"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={[ROLES.ADMIN]}>
                <ManageServicesPage />
              </RequireRole>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={[ROLES.ADMIN]}>
                <ManageUsersPage />
              </RequireRole>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={[ROLES.ADMIN]}>
                <AdminBookingsPage />
              </RequireRole>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={[ROLES.ADMIN]}>
                <AdminAnalyticsPage />
              </RequireRole>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={[ROLES.ADMIN]}>
                <AdminSettingsPage />
              </RequireRole>
            </ProtectedRoute>
          }
        />

        {/* Manager Routes */}
        <Route
          path="/manager/bookings"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={[ROLES.MANAGER]}>
                <ManagerBookingsPage />
              </RequireRole>
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/technicians"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={[ROLES.MANAGER]}>
                <ManagerTechniciansPage />
              </RequireRole>
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/approvals"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={[ROLES.MANAGER]}>
                <ManagerApprovalsPage />
              </RequireRole>
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/reports"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={[ROLES.MANAGER]}>
                <ManagerReportsPage />
              </RequireRole>
            </ProtectedRoute>
          }
        />

        {/* Technician Routes */}
        <Route
          path="/technician/available-jobs"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={[ROLES.TECHNICIAN]}>
                <AvailableJobsPage />
              </RequireRole>
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/earnings"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={[ROLES.TECHNICIAN]}>
                <TechnicianEarningsPage />
              </RequireRole>
            </ProtectedRoute>
          }
        />

        {/* Waste Booking Route (Customer) */}
        <Route
          path="/waste/book"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={[ROLES.CUSTOMER]}>
                <WasteBookingPage />
              </RequireRole>
            </ProtectedRoute>
          }
        />

        {/* Materials Routes */}
        <Route
          path="/materials"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={[ROLES.CUSTOMER]}>
                <MaterialsPage />
              </RequireRole>
            </ProtectedRoute>
          }
        />
        <Route
          path="/materials/cart"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={[ROLES.CUSTOMER]}>
                <MaterialCartPage />
              </RequireRole>
            </ProtectedRoute>
          }
        />

        {/* Waste Officer Routes */}
        <Route
          path="/waste/pickups"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={[ROLES.WASTE_OFFICER]}>
                <WastePickupRequestsPage />
              </RequireRole>
            </ProtectedRoute>
          }
        />

        <Route
          path="/waste/verify"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={[ROLES.WASTE_OFFICER]}>
                <WasteVerifyPage />
              </RequireRole>
            </ProtectedRoute>
          }
        />

        <Route
          path="/waste/history"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={[ROLES.WASTE_OFFICER]}>
                <WasteHistoryPage />
              </RequireRole>
            </ProtectedRoute>
          }
        />

        <Route
          path="/waste/stats"
          element={
            <ProtectedRoute>
              <RequireRole allowedRoles={[ROLES.WASTE_OFFICER]}>
                <WasteStatisticsPage />
              </RequireRole>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

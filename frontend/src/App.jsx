import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import VerifyOTP from './VerifyOTP';
import VerifyLoginOTP from './VerifyLoginOTP';
import ProtectedRoute from './components/ProtectedRoute';
import StartupDashboard from './components/StartupDashboard';
import NewStartupDashboard from './components/NewStartupDashboard';
import InvestorDashboard from './components/InvestorDashboard';
import AdminDashboard from './components/AdminDashboard';
import PublicStartupProfile from './components/PublicStartupProfile';
import InvestorProfile from './components/InvestorProfile';
import CreatePitch from './components/CreatePitch';
import ChatComponent from './components/ChatComponent';
import StartupChatList from './components/StartupChatList';
import MessageHub from './components/MessageHub';
import StartupStrategy from './components/StartupStrategy';
import Notifications from "./components/Notifications";
import StartupAnalytics from './components/StartupAnalytics';
import InvestorAnalytics from "./components/InvestorAnalytics";
import InvestorPortfolio from "./components/InvestorPortfolio";
import StartupProfile from "./components/StartupProfile";
import StartupFunding from "./components/StartupFunding";
import MyReports from "./components/MyReports";
import ReportDetail from "./components/ReportDetail";
import StartupMarketplacePage from "./components/StartupMarketplacePage";
import HomePage from "./components/HomePage";
import EnterpriseBackground from "./components/EnterpriseBackground";

// Wraps authentication pages to provide a clean transparent layout without the standard dashboard navigation.
function AuthLayout({ children }) {
  return <>{children}</>;
}

// Main application component configuring React Router paths and orchestrating role-based protected dashboard access.
function App() {
  return (
    <>
      <EnterpriseBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Router>
          <Routes>
        {/* Public Home & Authentication Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/verify-login-otp" element={<VerifyLoginOTP />} />
        
        {/* Role-Protected Dashboard Routes */}
        <Route
          path="/startup-dashboard"
          element={
            <ProtectedRoute allowedRoles={['startup']}>
              <StartupDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-dashboard"
          element={
            <ProtectedRoute allowedRoles={['startup']}>
              <NewStartupDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/investor-dashboard"
          element={
            <ProtectedRoute allowedRoles={['investor']}>
              <InvestorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback Pages */}
        <Route path="/startup-profile/:startup_id" element={
          <ProtectedRoute allowedRoles={['investor', 'startup', 'admin']}>
            <PublicStartupProfile />
          </ProtectedRoute>
        }
        />
        <Route path="/investor-profile/:investor_id" element={<InvestorProfile />} />
        <Route path="/analytics" element={<StartupAnalytics />} />
        <Route path="/create-pitch" element={<CreatePitch />} />
        <Route path="/my-chats" element={<StartupChatList />} />
        <Route path="/chat/:other_user_id" element={<ChatComponent />} />
        <Route path="/messages" element={<MessageHub />} />
        <Route path="/unauthorized" element={<div style={{ padding: '40px', textAlign: 'center', color: 'var(--error)' }}>🚫 Access Denied: You don't have permission to view this panel.</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/strategy" element={<StartupStrategy />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route
          path="/startup-analytics"
          element={
            <ProtectedRoute allowedRoles={["startup"]}>
              <StartupAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/investor-analytics"
          element={
            <ProtectedRoute allowedRoles={["investor"]}>
              <InvestorAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolio"
          element={
            <ProtectedRoute allowedRoles={["investor"]}>
              <InvestorPortfolio />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketplace"
          element={
            <ProtectedRoute allowedRoles={['investor']}>
              <StartupMarketplacePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/startup-profile/:id"
          element={<StartupProfile />}
        />
        <Route
          path="/my-reports"
          element={
            <ProtectedRoute allowedRoles={['startup']}>
              <MyReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/:id"
          element={
            <ProtectedRoute allowedRoles={['startup']}>
              <ReportDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/funding"
          element={<StartupFunding />}
        />
        </Routes>
      </Router>
      </div>
    </>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100%',
    padding: '20px 0',
  },
  toggleContainer: {
    marginTop: '16px',
    zIndex: 10,
    textAlign: 'center',
  },
  text: {
    margin: 0,
    color: 'var(--text-light)',
    fontSize: '14px',
  },
  button: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    fontWeight: '700',
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.2s ease',
  }
};

export default App;
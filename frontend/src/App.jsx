import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Results from './pages/Results.jsx';
import About from './pages/About.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import History from './pages/History.jsx';
import Account from './pages/Account.jsx';
import Console from './pages/Console.jsx';
import CyberBackground from './components/CyberBackground.jsx';
import Dashboard from './pages/Dashboard.jsx';
import UserProtectedRoute from './components/UserProtectedRoute.jsx';
import AdminProtectedRoute from './components/AdminProtectedRoute.jsx';
import OnboardingModal from './components/OnboardingModal.jsx';
import { useUserAuth } from './services/userAuth.jsx';

export default function App() {
  const { user } = useUserAuth();
  const location = useLocation();
  const showOnboarding = Boolean(user && !user.hasOnboarded);
  // The admin dashboard owns its own sidebar layout/padding, so give it
  // the full width instead of the marketing-page max-width + padding.
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <div className="app-shell">
      <CyberBackground />
      <Header />
      <main className={isDashboard ? 'app-main app-main--flush' : 'app-main'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/about" element={<About />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/history"
            element={
              <UserProtectedRoute>
                <History />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <UserProtectedRoute>
                <Account />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/console"
            element={
              <UserProtectedRoute>
                <Console />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AdminProtectedRoute>
                <Dashboard />
              </AdminProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
      {showOnboarding && <OnboardingModal />}
    </div>
  );
}

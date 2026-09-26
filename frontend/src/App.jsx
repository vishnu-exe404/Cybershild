import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Results from './pages/Results.jsx';
import About from './pages/About.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import History from './pages/History.jsx';
import Dashboard from './pages/Dashboard.jsx';
import UserProtectedRoute from './components/UserProtectedRoute.jsx';
import AdminProtectedRoute from './components/AdminProtectedRoute.jsx';
import OnboardingModal from './components/OnboardingModal.jsx';
import { useUserAuth } from './services/userAuth.jsx';

export default function App() {
  const { user } = useUserAuth();
  const showOnboarding = Boolean(user && !user.hasOnboarded);

  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/about" element={<About />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
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

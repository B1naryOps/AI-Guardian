import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { AuthPage } from './pages/AuthPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { HistoryPage } from './pages/HistoryPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { DocumentationPage } from './pages/DocumentationPage';
import { TrainingPage } from './pages/TrainingPage';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ForcePasswordChangeModal } from './components/auth/ForcePasswordChangeModal';

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' || 
                  user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar 
        currentPage={location.pathname.substring(1) || 'landing'} 
        onNavigate={(page) => navigate(page === 'landing' ? '/' : `/${page}`)} 
        onLogout={handleLogout} 
      />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage 
            onStart={() => navigate('/auth?mode=register')} 
            onLogin={() => navigate('/auth?mode=login')} 
            onDocs={() => navigate('/docs')} 
          />} />
          <Route path="/docs" element={<DocumentationPage />} />
          <Route path="/awareness" element={<TrainingPage />} />
          <Route path="/auth" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />
          } />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={isAdmin ? <Navigate to="/admin" replace /> : <Dashboard />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {isAuthenticated && user?.requires_password_change && (
          <ForcePasswordChangeModal 
            isOpen={true} 
            onSuccess={() => window.location.reload()} 
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

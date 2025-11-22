import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/layout/Sidebar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Closet from './pages/Closet';
import Outfits from './pages/Outfits';
import Calendar from './pages/Calendar';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Help from './pages/Help';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import { ToastContainer } from './components/ui/toast';
import { useState } from 'react';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { user } = useAuth();
  const [toasts, setToasts] = useState([]);

  const showToast = (toast) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Router>
        <Routes>
          {/* Public routes without Navbar */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Protected routes with Sidebar */}
          <Route
            path="/*"
            element={
              <>
                <Sidebar />
                <main className="lg:pl-64 min-h-screen bg-background pt-16 lg:pt-0">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                    <Routes>
                    <Route
                      path="/dashboard"
                      element={
                        <PrivateRoute>
                          <Home />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/closet"
                      element={
                        <PrivateRoute>
                          <Closet showToast={showToast} />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/outfits"
                      element={
                        <PrivateRoute>
                          <Outfits showToast={showToast} />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/calendar"
                      element={
                        <PrivateRoute>
                          <Calendar showToast={showToast} />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/help"
                      element={
                        <PrivateRoute>
                          <Help />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <PrivateRoute>
                          <Settings showToast={showToast} />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/analytics"
                      element={
                        <PrivateRoute>
                          <Analytics />
                        </PrivateRoute>
                      }
                    />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </div>
                </main>
                <ToastContainer toasts={toasts} setToasts={setToasts} />
              </>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

function AppWithTheme() {
  const { user } = useAuth();
  const userTheme = user?.preferences?.theme || 'system';
  
  return (
    <ThemeProvider userTheme={userTheme}>
      <AppContent />
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppWithTheme />
    </AuthProvider>
  );
}

export default App;

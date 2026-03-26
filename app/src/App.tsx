import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { NewsProvider } from '@/context/NewsContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Home } from '@/pages/Home';
import { News } from '@/pages/News';
import { NewsDetail } from '@/pages/NewsDetail';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { NewsForm } from '@/pages/NewsForm';
import { TestPage } from '@/pages/TestPage';
import { useAuth } from '@/context/AuthContext';
import React from 'react';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center max-w-md">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Error Occurred</h1>
            <p className="text-gray-700 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Protected Route Component
function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d90429]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// Public Layout with Navbar and Footer
function PublicLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NewsProvider>
            <Router>
              <Routes>
                {/* Test Route */}
                <Route path="/test" element={<TestPage />} />
                
                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/berita" element={<News />} />
                  <Route path="/berita/:id" element={<NewsDetail />} />
                </Route>

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Admin Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/berita/baru" element={<NewsForm />} />
                  <Route path="/admin/berita/edit/:id" element={<NewsForm />} />
                </Route>

                {/* 404 Redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </NewsProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

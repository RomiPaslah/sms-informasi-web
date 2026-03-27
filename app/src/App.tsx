import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import React from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { NewsProvider } from '@/context/NewsContext';
import { SiteContentProvider } from '@/context/SiteContentContext';
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

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error; errorInfo?: React.ErrorInfo }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('[ErrorBoundary] Caught error:', error?.message);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Error:', error?.message, 'Stack:', errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
          <div className="text-center max-w-md bg-white rounded-lg shadow-lg p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-700 mb-6 leading-relaxed">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.reload();
                }}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium transition"
              >
                Reload
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 font-medium transition"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function ProtectedRoute() {
  const { isAuthenticated, isLoading, canAccessAdmin } = useAuth();

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

  if (!canAccessAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

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
            <SiteContentProvider>
              <Router>
                <Routes>
                  <Route path="/test" element={<TestPage />} />

                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/berita" element={<News />} />
                    <Route path="/berita/:id" element={<NewsDetail />} />
                  </Route>

                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  <Route element={<ProtectedRoute />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/berita/baru" element={<NewsForm />} />
                    <Route path="/admin/berita/edit/:id" element={<NewsForm />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Router>
            </SiteContentProvider>
          </NewsProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

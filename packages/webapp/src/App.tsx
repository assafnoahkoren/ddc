import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import HomePage from './pages/home';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import DataSourcesPage from './pages/data-sources';
import QueryDataPage from './pages/query-data';
import SchemaMatchingPage from './pages/schema-matching';
import SchemaMatchingDetailPage from './pages/schema-matching/match';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/data-sources"
            element={
              <ProtectedRoute>
                <DataSourcesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/query-data"
            element={
              <ProtectedRoute>
                <QueryDataPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logical-schemas"
            element={
              <ProtectedRoute>
                <SchemaMatchingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logical-schemas/:id/match"
            element={
              <ProtectedRoute>
                <SchemaMatchingDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

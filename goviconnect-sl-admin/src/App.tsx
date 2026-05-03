import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Farmers from './pages/Farmers';
import Experts from './pages/Experts';
import Shops from './pages/Shops';
import Crops from './pages/Crops';
import Guides from './pages/Guides';
import Tips from './pages/Tips';
import Notifications from './pages/Notifications';
import UserGuides from './pages/UserGuides';
import Meetings from './pages/Meetings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" /></div>;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/farmers" element={<Farmers />} />
                <Route path="/experts" element={<Experts />} />
                <Route path="/shops" element={<Shops />} />
                <Route path="/crops" element={<Crops />} />
                <Route path="/guides" element={<Guides />} />
                <Route path="/tips" element={<Tips />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/user-guides" element={<UserGuides />} />
                <Route path="/meetings" element={<Meetings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

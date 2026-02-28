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
import Meetings from './pages/Meetings';
import Diagnoses from './pages/Diagnoses';
import Predictions from './pages/Predictions';
import Notifications from './pages/Notifications';
import Products from './pages/Products';
import Orders from './pages/Orders';
import UserGuides from './pages/UserGuides';

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
                <Route path="/meetings" element={<Meetings />} />
                <Route path="/diagnoses" element={<Diagnoses />} />
                <Route path="/predictions" element={<Predictions />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/products" element={<Products />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/user-guides" element={<UserGuides />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

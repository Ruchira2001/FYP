import { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Store,
  Package,
  Sprout,
  ClipboardCheck,
  Bell,
  CalendarDays,
  ScanSearch,
  TrendingUp,
  Lightbulb,
  LogOut,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Farmers', path: '/farmers', icon: Users },
  { label: 'Experts', path: '/experts', icon: GraduationCap },
  { label: 'Shops', path: '/shops', icon: Store },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Crops', path: '/crops', icon: Sprout },
  { label: 'User Guides', path: '/user-guides', icon: ClipboardCheck },
  { label: 'Meetings', path: '/meetings', icon: CalendarDays },
  { label: 'AI Crop Doctor', path: '/ai-crop-doctor', icon: ScanSearch },
  { label: 'Price Predictions', path: '/price-predictions', icon: TrendingUp },
  { label: 'Tips', path: '/tips', icon: Lightbulb },
  { label: 'Notifications', path: '/notifications', icon: Bell },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-green-800 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center gap-3 border-b border-green-700">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-green-800 font-bold text-sm flex-shrink-0">
            G
          </div>
          {sidebarOpen && (
            <span className="font-bold text-lg whitespace-nowrap">GoviConnect</span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-green-700 text-white font-medium'
                    : 'text-green-100 hover:bg-green-700/50'
                }`
              }
            >
              <item.icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-green-700">
          {sidebarOpen && admin && (
            <div className="mb-2 px-2 text-xs text-green-200 truncate">
              {admin.email}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-2 py-2 text-sm text-red-300 hover:bg-red-600/30 hover:text-red-100 rounded transition-colors"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{admin?.name}</span>
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              {admin?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

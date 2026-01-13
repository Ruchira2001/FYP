import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  ShoppingBag,
  BookOpen,
  Calendar,
  Brain,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Leaf,
  HelpCircle,
  LogOut
} from 'lucide-react';
import './Sidebar.css';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/experts', label: 'Experts', icon: UserCheck },
  { path: '/shops', label: 'Shops', icon: ShoppingBag },
  { path: '/knowledge', label: 'Knowledge', icon: BookOpen },
  { path: '/meetings', label: 'Meetings', icon: Calendar },
  { path: '/ai-logs', label: 'AI Logs', icon: Brain },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const bottomItems = [
  { path: '/help', label: 'Help & Support', icon: HelpCircle },
];

export default function Sidebar({ isCollapsed, onToggle }) {
  const location = useLocation();

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Logo Section */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Leaf size={28} />
          </div>
          {!isCollapsed && (
            <div className="logo-text">
              <span className="logo-title">Goviconnect</span>
              <span className="logo-subtitle">SL</span>
            </div>
          )}
        </div>
        <button 
          className="sidebar-toggle"
          onClick={onToggle}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <NavLink 
                  to={item.path} 
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="nav-icon">
                    <Icon size={20} />
                  </span>
                  {!isCollapsed && (
                    <span className="nav-label">{item.label}</span>
                  )}
                  {isActive && <span className="nav-indicator" />}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="sidebar-footer">
        <ul className="nav-list">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink 
                  to={item.path} 
                  className="nav-item"
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="nav-icon">
                    <Icon size={20} />
                  </span>
                  {!isCollapsed && (
                    <span className="nav-label">{item.label}</span>
                  )}
                </NavLink>
              </li>
            );
          })}
          <li>
            <button className="nav-item logout-btn" title={isCollapsed ? 'Logout' : undefined}>
              <span className="nav-icon">
                <LogOut size={20} />
              </span>
              {!isCollapsed && <span className="nav-label">Logout</span>}
            </button>
          </li>
        </ul>

        {/* User Profile */}
        {!isCollapsed && (
          <div className="sidebar-user">
            <div className="avatar avatar-md">
              <img src="https://i.pravatar.cc/100?img=12" alt="Admin" />
            </div>
            <div className="user-info">
              <span className="user-name">Sarah James</span>
              <span className="user-role">Administrator</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

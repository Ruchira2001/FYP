import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Experts from './pages/Experts';
import Shops from './pages/Shops';
import Knowledge from './pages/Knowledge';
import Meetings from './pages/Meetings';
import AILogs from './pages/AILogs';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

import './App.css';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <Router>
      <div className="app-layout">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
        />

        <div className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <Header
            onMenuClick={toggleSidebar}
            isSidebarCollapsed={sidebarCollapsed}
          />

          <main className="page-wrapper">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/experts" element={<Experts />} />
              <Route path="/shops" element={<Shops />} />
              <Route path="/knowledge" element={<Knowledge />} />
              <Route path="/meetings" element={<Meetings />} />
              <Route path="/ai-logs" element={<AILogs />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;

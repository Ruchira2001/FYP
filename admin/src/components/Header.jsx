import { useState } from 'react';
import {
    Search,
    Bell,
    MessageSquare,
    Menu,
    X,
    ChevronDown,
    Sun,
    Moon
} from 'lucide-react';
import './Header.css';

export default function Header({ onMenuClick, isSidebarCollapsed }) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const notifications = [
        { id: 1, title: 'New farmer registered', time: '5 min ago', unread: true },
        { id: 2, title: 'Expert Dr. Perera approved', time: '1 hour ago', unread: true },
        { id: 3, title: 'AI diagnosis completed', time: '2 hours ago', unread: false },
        { id: 4, title: 'New shop item added', time: '3 hours ago', unread: false },
    ];

    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <header className={`header ${isSidebarCollapsed ? 'expanded' : ''}`}>
            <div className="header-left">
                <button className="header-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
                    <Menu size={24} />
                </button>

                <div className="search-container">
                    <div className="input-with-icon">
                        <Search className="input-icon" size={18} />
                        <input
                            type="text"
                            className="input search-input"
                            placeholder="Search users, experts, content..."
                        />
                    </div>
                </div>
            </div>

            <div className="header-right">
                {/* Messages */}
                <button className="header-icon-btn" aria-label="Messages">
                    <MessageSquare size={20} />
                    <span className="icon-badge">3</span>
                </button>

                {/* Notifications */}
                <div className="dropdown-container">
                    <button
                        className="header-icon-btn"
                        aria-label="Notifications"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && <span className="icon-badge">{unreadCount}</span>}
                    </button>

                    {showNotifications && (
                        <div className="dropdown notifications-dropdown">
                            <div className="dropdown-header">
                                <span className="dropdown-title">Notifications</span>
                                <button className="btn btn-ghost btn-sm">Mark all read</button>
                            </div>
                            <div className="dropdown-content">
                                {notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        className={`notification-item ${notification.unread ? 'unread' : ''}`}
                                    >
                                        <div className="notification-dot" />
                                        <div className="notification-content">
                                            <span className="notification-title">{notification.title}</span>
                                            <span className="notification-time">{notification.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="dropdown-footer">
                                <button className="btn btn-ghost btn-sm">View all notifications</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* User Profile */}
                <div className="dropdown-container">
                    <button
                        className="header-profile"
                        onClick={() => setShowProfile(!showProfile)}
                    >
                        <div className="avatar avatar-sm">
                            <img src="https://i.pravatar.cc/100?img=12" alt="Admin" />
                        </div>
                        <div className="profile-info">
                            <span className="profile-name">Sarah James</span>
                            <span className="profile-role">Admin</span>
                        </div>
                        <ChevronDown size={16} className={`chevron ${showProfile ? 'rotated' : ''}`} />
                    </button>

                    {showProfile && (
                        <div className="dropdown profile-dropdown">
                            <div className="dropdown-content">
                                <button className="dropdown-item">
                                    <span>My Profile</span>
                                </button>
                                <button className="dropdown-item">
                                    <span>Settings</span>
                                </button>
                                <hr className="dropdown-divider" />
                                <button className="dropdown-item danger">
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Click outside to close dropdowns */}
            {(showNotifications || showProfile) && (
                <div
                    className="dropdown-overlay"
                    onClick={() => {
                        setShowNotifications(false);
                        setShowProfile(false);
                    }}
                />
            )}
        </header>
    );
}

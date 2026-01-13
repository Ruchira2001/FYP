import { useState } from 'react';
import {
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    Eye,
    Edit2,
    Trash2,
    Download,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import './Users.css';

// Mock data
const usersData = [
    { id: 1, name: 'Sunil Bandara', email: 'sunil.b@email.com', phone: '+94 77 123 4567', role: 'Farmer', status: 'Active', avatar: 'https://i.pravatar.cc/100?img=1', joined: '2024-01-15' },
    { id: 2, name: 'Kamala Perera', email: 'kamala.p@email.com', phone: '+94 71 234 5678', role: 'Farmer', status: 'Active', avatar: 'https://i.pravatar.cc/100?img=2', joined: '2024-01-20' },
    { id: 3, name: 'Dr. Nimal Silva', email: 'nimal.s@email.com', phone: '+94 76 345 6789', role: 'Expert', status: 'Active', avatar: 'https://i.pravatar.cc/100?img=3', joined: '2024-02-01' },
    { id: 4, name: 'Ravi Fernando', email: 'ravi.f@email.com', phone: '+94 77 456 7890', role: 'Farmer', status: 'Inactive', avatar: 'https://i.pravatar.cc/100?img=4', joined: '2024-02-10' },
    { id: 5, name: 'Lakshmi Jayawardena', email: 'lakshmi.j@email.com', phone: '+94 72 567 8901', role: 'Farmer', status: 'Active', avatar: 'https://i.pravatar.cc/100?img=5', joined: '2024-02-15' },
    { id: 6, name: 'Dr. Anura Wijesinghe', email: 'anura.w@email.com', phone: '+94 78 678 9012', role: 'Expert', status: 'Pending', avatar: 'https://i.pravatar.cc/100?img=6', joined: '2024-03-01' },
    { id: 7, name: 'Saman Kumara', email: 'saman.k@email.com', phone: '+94 75 789 0123', role: 'Farmer', status: 'Active', avatar: 'https://i.pravatar.cc/100?img=7', joined: '2024-03-05' },
    { id: 8, name: 'Priya Ratnayake', email: 'priya.r@email.com', phone: '+94 77 890 1234', role: 'Farmer', status: 'Active', avatar: 'https://i.pravatar.cc/100?img=8', joined: '2024-03-10' },
];

export default function Users() {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [openDropdown, setOpenDropdown] = useState(null);

    const filteredUsers = usersData.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    return (
        <div className="users-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Manage Users</h1>
                    <p className="text-secondary">View and manage all registered users</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary">
                        <Download size={16} />
                        Export
                    </button>
                    <button className="btn btn-primary">
                        <Plus size={16} />
                        Add User
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card filters-card">
                <div className="filters-row">
                    <div className="search-box">
                        <div className="input-with-icon">
                            <Search className="input-icon" size={18} />
                            <input
                                type="text"
                                className="input"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="filter-group">
                        <select
                            className="input select"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="All">All Roles</option>
                            <option value="Farmer">Farmer</option>
                            <option value="Expert">Expert</option>
                        </select>

                        <select
                            className="input select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Pending">Pending</option>
                        </select>

                        <button className="btn btn-ghost">
                            <Filter size={16} />
                            More Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="card table-card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="avatar avatar-sm">
                                                <img src={user.avatar} alt={user.name} />
                                            </div>
                                            <span className="user-name">{user.name}</span>
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>{user.phone}</td>
                                    <td>
                                        <span className={`badge badge-${user.role === 'Expert' ? 'forest' : 'leaf'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${getStatusBadge(user.status)}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td>{formatDate(user.joined)}</td>
                                    <td>
                                        <div className="actions-cell">
                                            <button className="btn btn-icon btn-ghost" title="View">
                                                <Eye size={16} />
                                            </button>
                                            <button className="btn btn-icon btn-ghost" title="Edit">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn btn-icon btn-ghost text-error" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="table-footer">
                    <span className="results-count">
                        Showing {filteredUsers.length} of {usersData.length} users
                    </span>
                    <div className="pagination">
                        <button className="btn btn-icon btn-ghost" disabled>
                            <ChevronLeft size={18} />
                        </button>
                        <button className="pagination-btn active">1</button>
                        <button className="pagination-btn">2</button>
                        <button className="pagination-btn">3</button>
                        <button className="btn btn-icon btn-ghost">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function getStatusBadge(status) {
    const badges = {
        Active: 'success',
        Inactive: 'error',
        Pending: 'warning',
    };
    return badges[status] || 'info';
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

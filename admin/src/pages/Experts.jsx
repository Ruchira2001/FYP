import { useState } from 'react';
import {
    Search,
    Plus,
    Eye,
    Edit2,
    Trash2,
    CheckCircle,
    XCircle,
    Star,
    Clock,
    MessageSquare
} from 'lucide-react';
import './Experts.css';

// Mock data
const expertsData = [
    {
        id: 1,
        name: 'Dr. Nimal Silva',
        email: 'nimal.s@email.com',
        specialization: 'Plant Pathologist',
        rating: 4.9,
        consultations: 245,
        responseTime: '2h',
        status: 'Approved',
        avatar: 'https://i.pravatar.cc/100?img=11'
    },
    {
        id: 2,
        name: 'Dr. Anura Wijesinghe',
        email: 'anura.w@email.com',
        specialization: 'Soil Scientist',
        rating: 4.7,
        consultations: 189,
        responseTime: '3h',
        status: 'Pending',
        avatar: 'https://i.pravatar.cc/100?img=12'
    },
    {
        id: 3,
        name: 'Prof. Kumari Jayasuriya',
        email: 'kumari.j@email.com',
        specialization: 'Crop Science',
        rating: 4.8,
        consultations: 312,
        responseTime: '1h',
        status: 'Approved',
        avatar: 'https://i.pravatar.cc/100?img=13'
    },
    {
        id: 4,
        name: 'Dr. Rohan Perera',
        email: 'rohan.p@email.com',
        specialization: 'Entomologist',
        rating: 4.6,
        consultations: 156,
        responseTime: '4h',
        status: 'Approved',
        avatar: 'https://i.pravatar.cc/100?img=14'
    },
    {
        id: 5,
        name: 'Dr. Mallika Fernando',
        email: 'mallika.f@email.com',
        specialization: 'Horticulturist',
        rating: 0,
        consultations: 0,
        responseTime: '-',
        status: 'Pending',
        avatar: 'https://i.pravatar.cc/100?img=15'
    },
];

export default function Experts() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const filteredExperts = expertsData.filter(expert => {
        const matchesSearch = expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expert.specialization.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || expert.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const pendingCount = expertsData.filter(e => e.status === 'Pending').length;

    return (
        <div className="experts-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Manage Experts</h1>
                    <p className="text-secondary">
                        Review and manage agricultural experts
                        {pendingCount > 0 && (
                            <span className="pending-badge">{pendingCount} pending approval</span>
                        )}
                    </p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={16} />
                    Invite Expert
                </button>
            </div>

            {/* Stats Cards */}
            <div className="experts-stats">
                <div className="stat-mini">
                    <span className="stat-mini-value">{expertsData.length}</span>
                    <span className="stat-mini-label">Total Experts</span>
                </div>
                <div className="stat-mini">
                    <span className="stat-mini-value">{expertsData.filter(e => e.status === 'Approved').length}</span>
                    <span className="stat-mini-label">Active</span>
                </div>
                <div className="stat-mini pending">
                    <span className="stat-mini-value">{pendingCount}</span>
                    <span className="stat-mini-label">Pending</span>
                </div>
                <div className="stat-mini">
                    <span className="stat-mini-value">4.75</span>
                    <span className="stat-mini-label">Avg. Rating</span>
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
                                placeholder="Search experts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="filter-tabs">
                        {['All', 'Approved', 'Pending'].map(status => (
                            <button
                                key={status}
                                className={`filter-tab ${statusFilter === status ? 'active' : ''}`}
                                onClick={() => setStatusFilter(status)}
                            >
                                {status}
                                {status === 'Pending' && pendingCount > 0 && (
                                    <span className="tab-badge">{pendingCount}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Experts Grid */}
            <div className="experts-grid">
                {filteredExperts.map((expert) => (
                    <div key={expert.id} className={`expert-card ${expert.status === 'Pending' ? 'pending' : ''}`}>
                        {expert.status === 'Pending' && (
                            <div className="pending-overlay">
                                <span className="badge badge-warning">Awaiting Approval</span>
                            </div>
                        )}

                        <div className="expert-header">
                            <div className="expert-avatar">
                                <img src={expert.avatar} alt={expert.name} />
                            </div>
                            <div className="expert-info">
                                <h3 className="expert-name">{expert.name}</h3>
                                <p className="expert-specialization">{expert.specialization}</p>
                            </div>
                        </div>

                        <div className="expert-stats">
                            <div className="expert-stat">
                                <MessageSquare size={16} />
                                <span>{expert.consultations}</span>
                                <span className="stat-label">Consults</span>
                            </div>
                            <div className="expert-stat">
                                <Star size={16} />
                                <span>{expert.rating || '-'}</span>
                                <span className="stat-label">Rating</span>
                            </div>
                            <div className="expert-stat">
                                <Clock size={16} />
                                <span>{expert.responseTime}</span>
                                <span className="stat-label">Response</span>
                            </div>
                        </div>

                        <div className="expert-actions">
                            {expert.status === 'Pending' ? (
                                <>
                                    <button className="btn btn-primary btn-sm">
                                        <CheckCircle size={14} />
                                        Approve
                                    </button>
                                    <button className="btn btn-ghost btn-sm text-error">
                                        <XCircle size={14} />
                                        Reject
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="btn btn-secondary btn-sm">
                                        <Eye size={14} />
                                        View Profile
                                    </button>
                                    <button className="btn btn-ghost btn-sm">
                                        <Edit2 size={14} />
                                        Edit
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

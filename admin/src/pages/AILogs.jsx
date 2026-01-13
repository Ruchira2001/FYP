import { useState } from 'react';
import {
    Search,
    Filter,
    Download,
    Eye,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock,
    Image
} from 'lucide-react';
import './AILogs.css';

// Mock data
const aiLogsData = [
    {
        id: 1,
        farmer: 'Sunil Bandara',
        crop: 'Tomato',
        disease: 'Late Blight',
        confidence: 94,
        status: 'Confirmed',
        image: 'https://images.unsplash.com/photo-1592921870789-04563d55041c?w=100',
        date: '2024-03-10 10:45 AM'
    },
    {
        id: 2,
        farmer: 'Kamala Perera',
        crop: 'Rice',
        disease: 'Blast',
        confidence: 87,
        status: 'Confirmed',
        image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=100',
        date: '2024-03-10 11:30 AM'
    },
    {
        id: 3,
        farmer: 'Ravi Fernando',
        crop: 'Maize',
        disease: 'Leaf Rust',
        confidence: 72,
        status: 'Pending Review',
        image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=100',
        date: '2024-03-10 12:15 PM'
    },
    {
        id: 4,
        farmer: 'Lakshmi J.',
        crop: 'Chili',
        disease: 'Anthracnose',
        confidence: 91,
        status: 'Confirmed',
        image: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=100',
        date: '2024-03-10 01:00 PM'
    },
    {
        id: 5,
        farmer: 'Saman Kumara',
        crop: 'Banana',
        disease: 'No Disease Detected',
        confidence: 96,
        status: 'Healthy',
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=100',
        date: '2024-03-10 02:30 PM'
    },
    {
        id: 6,
        farmer: 'Priya Ratnayake',
        crop: 'Coconut',
        disease: 'Bud Rot',
        confidence: 65,
        status: 'Rejected',
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=100',
        date: '2024-03-10 03:45 PM'
    },
];

const statsData = [
    { label: 'Total Scans Today', value: '482', trend: '+15%' },
    { label: 'Avg. Confidence', value: '84%', trend: '+2%' },
    { label: 'Confirmed', value: '412', trend: '+12%' },
    { label: 'Pending Review', value: '45', trend: '-8%' },
];

export default function AILogs() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const filteredLogs = aiLogsData.filter(log => {
        const matchesSearch =
            log.farmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.disease.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || log.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="ailogs-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">AI Diagnosis Logs</h1>
                    <p className="text-secondary">Review and manage AI crop disease diagnoses</p>
                </div>
                <button className="btn btn-secondary">
                    <Download size={16} />
                    Export Logs
                </button>
            </div>

            {/* Stats Row */}
            <div className="logs-stats">
                {statsData.map((stat, index) => (
                    <div key={index} className="log-stat">
                        <span className="log-stat-value">{stat.value}</span>
                        <span className="log-stat-label">{stat.label}</span>
                        <span className={`log-stat-trend ${stat.trend.startsWith('+') ? 'up' : 'down'}`}>
                            {stat.trend}
                        </span>
                    </div>
                ))}
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
                                placeholder="Search by farmer, crop, or disease..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="filter-group">
                        <select
                            className="input select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Pending Review">Pending Review</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Healthy">Healthy</option>
                        </select>

                        <button className="btn btn-ghost">
                            <Filter size={16} />
                            More Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="card table-card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Farmer</th>
                                <th>Crop</th>
                                <th>Diagnosis</th>
                                <th>Confidence</th>
                                <th>Status</th>
                                <th>Date & Time</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log) => (
                                <tr key={log.id}>
                                    <td>
                                        <div className="log-image">
                                            <img src={log.image} alt={log.crop} />
                                            <button className="image-zoom">
                                                <Image size={12} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="farmer-name">{log.farmer}</td>
                                    <td>
                                        <span className="badge badge-leaf">{log.crop}</span>
                                    </td>
                                    <td className="disease-name">{log.disease}</td>
                                    <td>
                                        <div className="confidence-bar">
                                            <div
                                                className="confidence-fill"
                                                style={{
                                                    width: `${log.confidence}%`,
                                                    background: getConfidenceColor(log.confidence)
                                                }}
                                            />
                                            <span className="confidence-value">{log.confidence}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-pill ${getStatusClass(log.status)}`}>
                                            {getStatusIcon(log.status)}
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="log-date">
                                        <Clock size={12} />
                                        {log.date}
                                    </td>
                                    <td>
                                        <button className="btn btn-icon btn-ghost" title="View Details">
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function getConfidenceColor(confidence) {
    if (confidence >= 90) return 'var(--color-success)';
    if (confidence >= 70) return 'var(--color-leaf-green)';
    if (confidence >= 50) return 'var(--color-warning)';
    return 'var(--color-error)';
}

function getStatusClass(status) {
    const classes = {
        'Confirmed': 'success',
        'Pending Review': 'warning',
        'Rejected': 'error',
        'Healthy': 'info',
    };
    return classes[status] || 'info';
}

function getStatusIcon(status) {
    const icons = {
        'Confirmed': <CheckCircle size={12} />,
        'Pending Review': <Clock size={12} />,
        'Rejected': <XCircle size={12} />,
        'Healthy': <CheckCircle size={12} />,
    };
    return icons[status] || <AlertCircle size={12} />;
}

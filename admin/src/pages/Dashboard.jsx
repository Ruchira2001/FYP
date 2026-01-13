import {
    Users,
    UserCheck,
    Brain,
    DollarSign,
    Eye,
    ChevronRight,
    Clock
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { LineChart, BarChart, DoughnutChart } from '../components/Charts';
import './Dashboard.css';

// Mock data
const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
        {
            label: 'Users',
            data: [15200, 17500, 18900, 21000, 23500, 24500],
            color: '#4CAF50',
            fillColor: 'rgba(76, 175, 80, 0.1)',
        },
        {
            label: 'AI Diagnoses',
            data: [8500, 10200, 12000, 14500, 16000, 18750],
            color: '#1B5E20',
            fillColor: 'rgba(27, 94, 32, 0.1)',
        },
    ],
};

const diseaseData = {
    labels: ['Leaf Rust', 'Powdery Mildew', 'Blight', 'Anthracnose', 'Other'],
    datasets: [{
        data: [35, 25, 20, 15, 5],
    }],
};

const regionData = {
    labels: ['North', 'South', 'East', 'West'],
    values: [35, 25, 20, 20],
    colors: ['#4CAF50', '#1B5E20', '#81C784', '#FFB300'],
};

const recentActivity = [
    { id: 1, user: 'John Doe', action: 'Submitted Diagnosis Request', time: 'Today, 10:45 AM', status: 'pending', avatar: 'https://i.pravatar.cc/100?img=1' },
    { id: 2, user: 'Dr. Smith', action: 'Completed Diagnosis for #1234', time: 'Today, 11:30 AM', status: 'completed', avatar: 'https://i.pravatar.cc/100?img=2' },
    { id: 3, user: 'Sarah Lee', action: 'New Expert Registered', time: 'Today, 12:15 PM', status: 'verified', avatar: 'https://i.pravatar.cc/100?img=3' },
    { id: 4, user: 'AI System', action: 'Processed 50 Image Scans', time: 'Today, 01:00 PM', status: 'successful', avatar: null },
    { id: 5, user: 'Meeting', action: 'Regional Farmers Meetup', time: 'Tomorrow, 10:00 AM', status: 'upcoming', avatar: null },
];

export default function Dashboard() {
    return (
        <div className="dashboard-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard Overview</h1>
                    <p className="text-secondary">Welcome back, Sarah! Here's what's happening today.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary">
                        <Clock size={16} />
                        Last 30 days
                    </button>
                    <button className="btn btn-primary">
                        Download Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <StatCard
                    icon={Users}
                    value="24,500"
                    label="Total Farmers"
                    trend="up"
                    trendValue="+8.5%"
                    iconBg="leaf"
                    className="stagger-1"
                />
                <StatCard
                    icon={UserCheck}
                    value="1,250"
                    label="Active Experts"
                    trend="up"
                    trendValue="+3.2%"
                    iconBg="forest"
                    className="stagger-2"
                />
                <StatCard
                    icon={Brain}
                    value="482"
                    label="Diagnoses Today"
                    trend="up"
                    trendValue="+15%"
                    iconBg="info"
                    className="stagger-3"
                />
                <StatCard
                    icon={DollarSign}
                    value="$128,450"
                    label="Shop Revenue"
                    trend="up"
                    trendValue="+12%"
                    iconBg="gold"
                    className="stagger-4"
                />
            </div>

            {/* Charts Row */}
            <div className="charts-grid">
                <div className="chart-card main-chart">
                    <div className="chart-card-header">
                        <h3 className="chart-card-title">User Growth</h3>
                        <div className="chart-legend">
                            <span className="legend-item">
                                <span className="legend-dot" style={{ background: '#4CAF50' }}></span>
                                Users
                            </span>
                            <span className="legend-item">
                                <span className="legend-dot" style={{ background: '#1B5E20' }}></span>
                                AI Diagnoses
                            </span>
                        </div>
                    </div>
                    <LineChart data={userGrowthData} height={280} />
                </div>

                <div className="chart-card">
                    <div className="chart-card-header">
                        <h3 className="chart-card-title">Disease Trends</h3>
                    </div>
                    <BarChart data={diseaseData} height={280} />
                </div>
            </div>

            {/* Bottom Row */}
            <div className="bottom-grid">
                {/* Recent Activity */}
                <div className="card activity-card">
                    <div className="card-header">
                        <h3 className="card-title">Recent Activity</h3>
                        <button className="btn btn-ghost btn-sm">
                            View all
                            <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="activity-list">
                        {recentActivity.map((item) => (
                            <div key={item.id} className="activity-item">
                                <div className="activity-avatar">
                                    {item.avatar ? (
                                        <img src={item.avatar} alt={item.user} />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {item.user.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="activity-content">
                                    <div className="activity-header">
                                        <span className="activity-user">{item.user}</span>
                                        <span className={`badge badge-${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <p className="activity-action">{item.action}</p>
                                    <span className="activity-time">{item.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Distribution */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <h3 className="chart-card-title">User Distribution by Region</h3>
                    </div>
                    <DoughnutChart data={regionData} height={260} />
                    <div className="total-users">
                        <span className="total-value">24,500</span>
                        <span className="total-label">Total Users</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function getStatusColor(status) {
    const colors = {
        pending: 'warning',
        completed: 'success',
        verified: 'info',
        successful: 'success',
        upcoming: 'leaf',
    };
    return colors[status] || 'info';
}

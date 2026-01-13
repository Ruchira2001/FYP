import { useState } from 'react';
import {
    Download,
    Calendar,
    TrendingUp,
    Users,
    Brain,
    ShoppingBag
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { LineChart, BarChart, DoughnutChart } from '../components/Charts';
import './Reports.css';

// Mock data
const usageData = {
    labels: ['Oct 1', 'Oct 5', 'Oct 9', 'Oct 13', 'Oct 17', 'Oct 21', 'Oct 25', 'Oct 29'],
    datasets: [
        {
            label: 'Users',
            data: [1000, 1100, 1150, 1200, 1180, 1220, 1280, 1200],
            color: '#4CAF50',
            fillColor: 'rgba(76, 175, 80, 0.1)',
        },
        {
            label: 'AI Diagnoses',
            data: [600, 700, 750, 850, 800, 900, 950, 850],
            color: '#1B5E20',
            fillColor: 'rgba(27, 94, 32, 0.1)',
        },
        {
            label: 'Expert Sessions',
            data: [100, 120, 140, 160, 150, 170, 180, 180],
            color: '#FFB300',
            fillColor: 'rgba(255, 179, 0, 0.1)',
        },
    ],
};

const diseaseDistribution = {
    labels: ['Tomato', 'Rice', 'Maize', 'Potato', 'Pepper'],
    datasets: [{
        data: [4500, 3800, 2200, 1800, 1200],
        colors: [
            'rgba(76, 175, 80, 0.9)',
            'rgba(27, 94, 32, 0.9)',
            'rgba(129, 199, 132, 0.9)',
            'rgba(255, 179, 0, 0.9)',
            'rgba(56, 142, 60, 0.9)',
        ],
    }],
};

const regionData = {
    labels: ['North', 'South', 'East', 'West'],
    values: [35, 25, 20, 20],
    colors: ['#4CAF50', '#1B5E20', '#81C784', '#FFB300'],
};

const topDiseases = [
    { name: 'Bacterial Wilt', crop: 'Tomato', count: 4500, trend: '+10%', status: 'Active' },
    { name: 'Rice Blast', crop: 'Rice', count: 3800, trend: '+15%', status: 'Active' },
    { name: 'Fall Armyworm', crop: 'Maize', count: 2200, trend: '+5%', status: 'Monitoring' },
    { name: 'Late Blight', crop: 'Potato', count: 1800, trend: '-2%', status: 'Controlled' },
    { name: 'Anthracnose', crop: 'Pepper', count: 1200, trend: '+8%', status: 'Active' },
];

export default function Reports() {
    const [dateRange, setDateRange] = useState('Oct 1 - Oct 31, 2024');

    return (
        <div className="reports-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reports & Analytics</h1>
                    <p className="text-secondary">Comprehensive insights and data analysis</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary">
                        <Calendar size={16} />
                        {dateRange}
                    </button>
                    <button className="btn btn-primary">
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="reports-stats">
                <StatCard
                    icon={Users}
                    value="24,500"
                    label="Total Users"
                    trend="up"
                    trendValue="+12%"
                    iconBg="leaf"
                />
                <StatCard
                    icon={Brain}
                    value="18,750"
                    label="AI Diagnoses"
                    trend="up"
                    trendValue="+8%"
                    iconBg="info"
                />
                <StatCard
                    icon={TrendingUp}
                    value="3,200"
                    label="Expert Sessions"
                    trend="up"
                    trendValue="+5%"
                    iconBg="forest"
                />
                <StatCard
                    icon={ShoppingBag}
                    value="$45,800"
                    label="Shop Revenue"
                    trend="up"
                    trendValue="+15%"
                    iconBg="gold"
                />
            </div>

            {/* Usage Trends Chart */}
            <div className="chart-card full-width">
                <div className="chart-card-header">
                    <h3 className="chart-card-title">Usage Trends Over Time (Last 30 Days)</h3>
                    <div className="chart-legend">
                        <span className="legend-item">
                            <span className="legend-dot" style={{ background: '#4CAF50' }}></span>
                            Users
                        </span>
                        <span className="legend-item">
                            <span className="legend-dot" style={{ background: '#1B5E20' }}></span>
                            AI Diagnoses
                        </span>
                        <span className="legend-item">
                            <span className="legend-dot" style={{ background: '#FFB300' }}></span>
                            Expert Sessions
                        </span>
                    </div>
                </div>
                <LineChart data={usageData} height={320} />
            </div>

            {/* Charts Row */}
            <div className="reports-charts-row">
                <div className="chart-card">
                    <div className="chart-card-header">
                        <h3 className="chart-card-title">Disease Distribution by Crop Type</h3>
                    </div>
                    <BarChart data={diseaseDistribution} height={280} horizontal />
                </div>

                <div className="chart-card">
                    <div className="chart-card-header">
                        <h3 className="chart-card-title">User Distribution by Region</h3>
                    </div>
                    <DoughnutChart data={regionData} height={280} />
                </div>
            </div>

            {/* Top Diseases Table */}
            <div className="card table-card">
                <div className="card-header">
                    <h3 className="card-title">Top Diagnosed Diseases (Last 30 Days)</h3>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Disease Name</th>
                                <th>Crop</th>
                                <th>Diagnoses Count</th>
                                <th>Trend</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topDiseases.map((disease, index) => (
                                <tr key={index}>
                                    <td className="disease-name-cell">{disease.name}</td>
                                    <td>
                                        <span className="badge badge-leaf">{disease.crop}</span>
                                    </td>
                                    <td className="count-cell">{disease.count.toLocaleString()}</td>
                                    <td>
                                        <span className={`trend-badge ${disease.trend.startsWith('+') ? 'up' : 'down'}`}>
                                            {disease.trend}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge-${getStatusClass(disease.status)}`}>
                                            {disease.status}
                                        </span>
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

function getStatusClass(status) {
    const classes = {
        'Active': 'warning',
        'Monitoring': 'info',
        'Controlled': 'success',
    };
    return classes[status] || 'info';
}

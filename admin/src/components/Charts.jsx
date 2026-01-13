import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './Charts.css';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Common chart options
const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
            },
            ticks: {
                color: '#6B7280',
                font: {
                    size: 12,
                    family: 'Inter',
                },
            },
        },
        y: {
            grid: {
                color: 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
                color: '#6B7280',
                font: {
                    size: 12,
                    family: 'Inter',
                },
            },
        },
    },
};

// Line Chart Component
export function LineChart({ data, title, height = 300 }) {
    const chartData = {
        labels: data.labels,
        datasets: data.datasets.map((dataset, index) => ({
            ...dataset,
            borderColor: dataset.color || '#4CAF50',
            backgroundColor: dataset.fillColor || 'rgba(76, 175, 80, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: dataset.color || '#4CAF50',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
        })),
    };

    const options = {
        ...commonOptions,
        plugins: {
            ...commonOptions.plugins,
            legend: {
                display: data.datasets.length > 1,
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12,
                        family: 'Inter',
                    },
                },
            },
            tooltip: {
                backgroundColor: '#1A1A1A',
                titleFont: { size: 12, family: 'Inter' },
                bodyFont: { size: 12, family: 'Inter' },
                padding: 12,
                cornerRadius: 8,
            },
        },
    };

    return (
        <div className="chart-container" style={{ height }}>
            {title && <h3 className="chart-title">{title}</h3>}
            <div className="chart-wrapper">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
}

// Bar Chart Component
export function BarChart({ data, title, height = 300, horizontal = false }) {
    const chartData = {
        labels: data.labels,
        datasets: data.datasets.map((dataset) => ({
            ...dataset,
            backgroundColor: dataset.colors || [
                'rgba(76, 175, 80, 0.8)',
                'rgba(27, 94, 32, 0.8)',
                'rgba(129, 199, 132, 0.8)',
                'rgba(255, 179, 0, 0.8)',
                'rgba(56, 142, 60, 0.8)',
            ],
            borderRadius: 8,
            borderSkipped: false,
        })),
    };

    const options = {
        ...commonOptions,
        indexAxis: horizontal ? 'y' : 'x',
        plugins: {
            ...commonOptions.plugins,
            tooltip: {
                backgroundColor: '#1A1A1A',
                titleFont: { size: 12, family: 'Inter' },
                bodyFont: { size: 12, family: 'Inter' },
                padding: 12,
                cornerRadius: 8,
            },
        },
    };

    return (
        <div className="chart-container" style={{ height }}>
            {title && <h3 className="chart-title">{title}</h3>}
            <div className="chart-wrapper">
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
}

// Doughnut Chart Component
export function DoughnutChart({ data, title, height = 300 }) {
    const chartData = {
        labels: data.labels,
        datasets: [{
            data: data.values,
            backgroundColor: data.colors || [
                '#4CAF50',
                '#1B5E20',
                '#81C784',
                '#FFB300',
                '#388E3C',
            ],
            borderWidth: 0,
            hoverOffset: 8,
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                display: true,
                position: 'right',
                labels: {
                    usePointStyle: true,
                    padding: 16,
                    font: {
                        size: 12,
                        family: 'Inter',
                    },
                },
            },
            tooltip: {
                backgroundColor: '#1A1A1A',
                titleFont: { size: 12, family: 'Inter' },
                bodyFont: { size: 12, family: 'Inter' },
                padding: 12,
                cornerRadius: 8,
            },
        },
    };

    return (
        <div className="chart-container doughnut" style={{ height }}>
            {title && <h3 className="chart-title">{title}</h3>}
            <div className="chart-wrapper">
                <Doughnut data={chartData} options={options} />
            </div>
        </div>
    );
}

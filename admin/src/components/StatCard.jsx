import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatCard.css';

export default function StatCard({
    icon: Icon,
    value,
    label,
    trend,
    trendValue,
    iconBg = 'leaf',
    className = ''
}) {
    const isPositive = trend === 'up';

    return (
        <div className={`stat-card animate-slideUp ${className}`}>
            <div className="stat-card-top">
                <div className={`stat-card-icon ${iconBg}`}>
                    <Icon size={24} />
                </div>
                {trendValue && (
                    <div className={`stat-card-trend ${isPositive ? 'up' : 'down'}`}>
                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>{trendValue}</span>
                    </div>
                )}
            </div>
            <div className="stat-card-body">
                <div className="stat-card-value">{value}</div>
                <div className="stat-card-label">{label}</div>
            </div>
        </div>
    );
}

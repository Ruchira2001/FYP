import { Construction } from 'lucide-react';
import './Placeholder.css';

export default function Settings() {
    return (
        <div className="placeholder-page">
            <div className="placeholder-content">
                <div className="placeholder-icon">
                    <Construction size={48} />
                </div>
                <h1 className="placeholder-title">Settings</h1>
                <p className="placeholder-description">
                    Configure system settings, roles, and preferences.
                    This page is under construction.
                </p>
                <button className="btn btn-primary">Coming Soon</button>
            </div>
        </div>
    );
}

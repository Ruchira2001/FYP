import { Construction } from 'lucide-react';
import './Placeholder.css';

export default function Shops() {
    return (
        <div className="placeholder-page">
            <div className="placeholder-content">
                <div className="placeholder-icon">
                    <Construction size={48} />
                </div>
                <h1 className="placeholder-title">Shops Management</h1>
                <p className="placeholder-description">
                    Manage agricultural products, shop listings, and inventory.
                    This page is under construction.
                </p>
                <button className="btn btn-primary">Coming Soon</button>
            </div>
        </div>
    );
}

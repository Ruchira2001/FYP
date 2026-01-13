import { useState } from 'react';
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Eye,
    FileText,
    Video,
    Leaf,
    Bug,
    BookOpen
} from 'lucide-react';
import './Knowledge.css';

// Mock data
const knowledgeData = [
    {
        id: 1,
        title: 'Modern Maize Cultivation Techniques for 2024',
        category: 'Crops',
        type: 'Article',
        status: 'Published',
        views: 1250,
        image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
        author: 'Dr. Nimal Silva',
        date: '2024-01-15'
    },
    {
        id: 2,
        title: 'Identifying and Treating Tomato Early Blight',
        category: 'Diseases',
        type: 'Article',
        status: 'Published',
        views: 2340,
        image: 'https://images.unsplash.com/photo-1592921870789-04563d55041c?w=400',
        author: 'Prof. Kumari J.',
        date: '2024-01-20'
    },
    {
        id: 3,
        title: 'Video Guide: Step-by-Step Soil Testing Method',
        category: 'Videos',
        type: 'Video',
        status: 'Published',
        views: 3420,
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
        author: 'Admin',
        date: '2024-02-01'
    },
    {
        id: 4,
        title: 'Understanding the New Agricultural Subsidy Scheme',
        category: 'Government',
        type: 'Article',
        status: 'Published',
        views: 890,
        image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=400',
        author: 'Ministry of Agri.',
        date: '2024-02-10'
    },
    {
        id: 5,
        title: 'Benefits of Organic Fertilizers in Sustainable Farming',
        category: 'Fertilizers',
        type: 'Article',
        status: 'Draft',
        views: 0,
        image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400',
        author: 'Dr. Rohan Perera',
        date: '2024-02-15'
    },
    {
        id: 6,
        title: 'Goviconnect App Tutorial: Real-Time Market Data',
        category: 'Tutorials',
        type: 'Video',
        status: 'Published',
        views: 567,
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
        author: 'Admin',
        date: '2024-03-01'
    },
];

const categories = ['All', 'Crops', 'Diseases', 'Fertilizers', 'Videos', 'Government', 'Tutorials'];

export default function Knowledge() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeTab, setActiveTab] = useState('Articles');

    const tabs = ['Articles', 'Crops', 'Diseases', 'Videos'];

    const filteredContent = knowledgeData.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="knowledge-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Knowledge Hub Management</h1>
                    <p className="text-secondary">Manage articles, guides, and educational content</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={16} />
                    Add New
                </button>
            </div>

            {/* Tabs */}
            <div className="knowledge-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        className={`knowledge-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="card filters-card">
                <div className="filters-row">
                    <div className="category-filter">
                        <select
                            className="input select"
                            value={activeCategory}
                            onChange={(e) => setActiveCategory(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="search-box">
                        <div className="input-with-icon">
                            <Search className="input-icon" size={18} />
                            <input
                                type="text"
                                className="input"
                                placeholder="Search content, titles, or tags..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="content-grid">
                {filteredContent.map((item) => (
                    <div key={item.id} className="content-card">
                        <div className="content-image">
                            <img src={item.image} alt={item.title} />
                            {item.type === 'Video' && (
                                <div className="video-badge">
                                    <Video size={14} />
                                </div>
                            )}
                            <span className={`status-badge ${item.status.toLowerCase()}`}>
                                {item.status}
                            </span>
                        </div>

                        <div className="content-body">
                            <div className="content-meta">
                                <span className="content-category">
                                    {getCategoryIcon(item.category)}
                                    {item.category}
                                </span>
                                <span className="content-views">
                                    <Eye size={12} />
                                    {item.views.toLocaleString()}
                                </span>
                            </div>

                            <h3 className="content-title">{item.title}</h3>

                            <div className="content-footer">
                                <span className="content-author">{item.author}</span>
                                <span className="content-date">{formatDate(item.date)}</span>
                            </div>
                        </div>

                        <div className="content-actions">
                            <button className="btn btn-icon btn-ghost" title="Edit">
                                <Edit2 size={16} />
                            </button>
                            <button className="btn btn-icon btn-ghost text-error" title="Delete">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function getCategoryIcon(category) {
    const icons = {
        Crops: <Leaf size={12} />,
        Diseases: <Bug size={12} />,
        Videos: <Video size={12} />,
        default: <BookOpen size={12} />,
    };
    return icons[category] || icons.default;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

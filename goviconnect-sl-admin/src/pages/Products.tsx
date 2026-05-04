import React, { useState, useEffect } from 'react';
import { Package, Search, ChevronLeft, ChevronRight, Store, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../services/api';
import DataTable from '../components/DataTable';
import { socket, connectSocket } from '../services/socket';

interface Product {
    _id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    availability: string;
    shopId: {
        _id: string;
        name: string;
    } | null;
    imageUrl?: string;
    createdAt: string;
}

export default function Products() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setPages] = useState(1);
    const limit = 10;

    useEffect(() => {
        fetchProducts();

        const handleProductUpdate = () => {
            fetchProducts();
        };

        connectSocket();
        if (socket) {
            socket.on('product_changed', handleProductUpdate);
        }

        return () => {
            if (socket) {
                socket.off('product_changed', handleProductUpdate);
            }
        };
    }, [page]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await getProducts({ page, limit });
            setProducts(data.data || []);
            setPages(data.pages || 1);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            key: 'name', label: 'Product', render: (item: Product) => (
                <div className="flex items-center gap-3">
                    {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded object-cover" />
                    ) : (
                        <div className="p-2 bg-green-50 rounded text-green-600">
                            <Package className="w-6 h-6" />
                        </div>
                    )}
                    <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'shop', label: 'Shop', render: (item: Product) => (
                <div className="flex items-center gap-2 text-gray-600">
                    <Store className="w-4 h-4" />
                    <span>{item.shopId?.name || 'Unknown Shop'}</span>
                </div>
            )
        },
        { 
            key: 'price', 
            label: 'Price (LKR)', 
            render: (item: Product) => <span className="font-medium">Rs. {item.price.toFixed(2)}</span>
        },
        {
            key: 'status', label: 'Status', render: (item: Product) => {
                let badgeClass = 'bg-gray-100 text-gray-800';
                if (item.availability === 'In Stock') badgeClass = 'bg-green-100 text-green-800';
                if (item.availability === 'Low Stock') badgeClass = 'bg-yellow-100 text-yellow-800';
                if (item.availability === 'Out of Stock') badgeClass = 'bg-red-100 text-red-800';

                return (
                    <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
                            {item.availability}
                        </span>
                        <span className="text-xs text-gray-500">Stock: {item.stock}</span>
                    </div>
                );
            }
        }
    ];

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.shopId && p.shopId.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center relative">
                <h1 className="text-2xl font-bold text-gray-900">Products Inventory</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search products or shops..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                        />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredProducts}
                    loading={loading}
                    actions={(item) => (
                        <button
                            onClick={() => navigate(`/products/${item._id}`)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                        >
                            <Eye className="h-3 w-3" />
                            View
                        </button>
                    )}
                />

                {!loading && totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                            Page {page} of {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 border border-gray-200"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 border border-gray-200"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

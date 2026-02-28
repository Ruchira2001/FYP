import { useEffect, useState, useCallback } from 'react';
import { getProducts } from '../services/api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  shopId: { name: string } | null;
  availability: string;
  createdAt: string;
}

export default function Products() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts({ page });
      setItems(res.data.data);
      setTotalPages(res.data.pages || 1);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: 'name', label: 'Product Name' },
    { key: 'category', label: 'Category' },
    {
      key: 'price',
      label: 'Price',
      render: (p: Product) => `Rs. ${p.price || 0}`,
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (p: Product) => (
        <span className={`font-medium ${(p.stock || 0) < 10 ? 'text-red-600' : 'text-green-600'}`}>
          {p.stock || 0}
        </span>
      ),
    },
    {
      key: 'shopId',
      label: 'Shop',
      render: (p: Product) => p.shopId?.name || '-',
    },
    {
      key: 'availability',
      label: 'Status',
      render: (p: Product) => {
        const colors: Record<string, string> = {
          'In Stock': 'bg-green-100 text-green-700',
          'Low Stock': 'bg-yellow-100 text-yellow-700',
          'Out of Stock': 'bg-red-100 text-red-700',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[p.availability] || 'bg-gray-100 text-gray-700'}`}>
            {p.availability || 'Unknown'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Products</h1>
      <DataTable columns={columns} data={items} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

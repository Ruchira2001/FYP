import { useEffect, useState, useCallback } from 'react';
import { getOrders } from '../services/api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';

interface Order {
  _id: string;
  shopId: { name: string } | null;
  supplier: string;
  total: number;
  status: string;
  items: { name: string; quantity: number; price: number }[];
  createdAt: string;
}

export default function Orders() {
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (statusFilter) params.status = statusFilter;
      const res = await getOrders(params);
      setItems(res.data.data);
      setTotalPages(res.data.pages || 1);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    {
      key: '_id',
      label: 'Order ID',
      render: (o: Order) => o._id.slice(-8).toUpperCase(),
    },
    {
      key: 'shopId',
      label: 'Shop',
      render: (o: Order) => o.shopId?.name || '-',
    },
    { key: 'supplier', label: 'Supplier' },
    {
      key: 'items',
      label: 'Items',
      render: (o: Order) => o.items?.length || 0,
    },
    {
      key: 'total',
      label: 'Total',
      render: (o: Order) => `Rs. ${o.total || 0}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (o: Order) => {
        const colors: Record<string, string> = {
          Pending: 'bg-yellow-100 text-yellow-700',
          Processing: 'bg-blue-100 text-blue-700',
          Delivered: 'bg-green-100 text-green-700',
          Cancelled: 'bg-red-100 text-red-700',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[o.status] || 'bg-gray-100 text-gray-700'}`}>
            {o.status}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (o: Order) => new Date(o.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <DataTable columns={columns} data={items} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

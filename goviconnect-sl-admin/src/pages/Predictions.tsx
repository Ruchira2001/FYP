import { useEffect, useState, useCallback } from 'react';
import { getPredictions } from '../services/api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';

interface Prediction {
  _id: string;
  userId: { name: string; email: string } | null;
  crop: string;
  variety: string;
  district: string;
  season: string;
  priceLow: number;
  priceHigh: number;
  expectedYield: string;
  createdAt: string;
}

export default function Predictions() {
  const [items, setItems] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPredictions({ page });
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
    {
      key: 'userId',
      label: 'User',
      render: (p: Prediction) => p.userId?.name || '-',
    },
    { key: 'crop', label: 'Crop' },
    { key: 'variety', label: 'Variety' },
    { key: 'district', label: 'District' },
    { key: 'season', label: 'Season' },
    {
      key: 'priceLow',
      label: 'Price Range',
      render: (p: Prediction) => p.priceLow && p.priceHigh ? `Rs. ${p.priceLow} - ${p.priceHigh}` : '-',
    },
    {
      key: 'expectedYield',
      label: 'Expected Yield',
      render: (p: Prediction) => p.expectedYield ? `${p.expectedYield} kg` : '-',
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (p: Prediction) => new Date(p.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Price Predictions</h1>
      <DataTable columns={columns} data={items} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

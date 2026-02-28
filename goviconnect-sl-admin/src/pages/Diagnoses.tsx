import { useEffect, useState, useCallback } from 'react';
import { getDiagnoses } from '../services/api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';

interface Diagnosis {
  _id: string;
  userId: { name: string; email: string } | null;
  diseaseName: string;
  confidence: number;
  isHealthy: boolean;
  imageUrl: string;
  expertReviewed: boolean;
  reviewStatus: string;
  createdAt: string;
}

export default function Diagnoses() {
  const [items, setItems] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDiagnoses({ page });
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
      render: (d: Diagnosis) => d.userId?.name || '-',
    },
    { key: 'diseaseName', label: 'Disease' },
    {
      key: 'confidence',
      label: 'Confidence',
      render: (d: Diagnosis) => d.confidence ? `${(d.confidence * 100).toFixed(1)}%` : '-',
    },
    {
      key: 'isHealthy',
      label: 'Healthy',
      render: (d: Diagnosis) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${d.isHealthy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {d.isHealthy ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'reviewStatus',
      label: 'Review',
      render: (d: Diagnosis) => {
        const colors: Record<string, string> = {
          pending_review: 'bg-yellow-100 text-yellow-700',
          verified: 'bg-green-100 text-green-700',
          corrected: 'bg-blue-100 text-blue-700',
        };
        return d.reviewStatus ? (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[d.reviewStatus] || 'bg-gray-100 text-gray-700'}`}>
            {d.reviewStatus}
          </span>
        ) : '-';
      },
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (d: Diagnosis) => new Date(d.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">AI Diagnoses</h1>
      <DataTable columns={columns} data={items} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

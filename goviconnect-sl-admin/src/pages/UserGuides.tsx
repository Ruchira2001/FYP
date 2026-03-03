import { useEffect, useState, useCallback } from 'react';
import { getUserGuides, approveUserGuide, rejectUserGuide } from '../services/api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import { Eye, Check, XCircle } from 'lucide-react';

interface UGuide {
  _id: string;
  name: string;
  description: string;
  category: string;
  userId: { name: string; email: string } | null;
  status: string;
  rejectionReason: string;
  createdAt: string;
}

export default function UserGuides() {
  const [items, setItems] = useState<UGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [rejectItem, setRejectItem] = useState<UGuide | null>(null);
  const [reason, setReason] = useState('');
  const [viewItem, setViewItem] = useState<UGuide | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (statusFilter) params.status = statusFilter;
      const res = await getUserGuides(params);
      setItems(res.data.data);
      setTotalPages(res.data.pages || 1);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this guide?')) return;
    try {
      await approveUserGuide(id);
      load();
    } catch {
      alert('Approval failed');
    }
  };

  const handleReject = async () => {
    if (!rejectItem || !reason) return alert('Enter a reason');
    try {
      await rejectUserGuide(rejectItem._id, reason);
      setRejectItem(null);
      setReason('');
      load();
    } catch {
      alert('Rejection failed');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    {
      key: 'userId',
      label: 'Author',
      render: (g: UGuide) => g.userId?.name || '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (g: UGuide) => {
        const colors: Record<string, string> = {
          pending: 'bg-yellow-100 text-yellow-700',
          approved: 'bg-green-100 text-green-700',
          rejected: 'bg-red-100 text-red-700',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[g.status] || 'bg-gray-100 text-gray-700'}`}>
            {g.status}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Submitted',
      render: (g: UGuide) => new Date(g.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">User Submitted Guides</h1>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        actions={(item) => (
          <div className="flex gap-2 justify-end">
            <button onClick={() => setViewItem(item)} className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"><Eye size={12} /> View</button>
            {item.status === 'pending' && (
              <>
                <button onClick={() => handleApprove(item._id)} className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><Check size={12} /> Approve</button>
                <button
                  onClick={() => { setRejectItem(item); setReason(''); }}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                  <XCircle size={12} /> Reject
                </button>
              </>
            )}
          </div>
        )}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* View Modal */}
      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Guide Details" size="lg">
        {viewItem && (
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Name:</span>
              <p className="text-gray-800">{viewItem.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Category:</span>
              <p className="text-gray-800">{viewItem.category}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Author:</span>
              <p className="text-gray-800">{viewItem.userId?.name} ({viewItem.userId?.email})</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Description:</span>
              <p className="text-gray-800 whitespace-pre-wrap">{viewItem.description}</p>
            </div>
            {viewItem.rejectionReason && (
              <div>
                <span className="text-sm font-medium text-red-500">Rejection Reason:</span>
                <p className="text-red-700">{viewItem.rejectionReason}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal open={!!rejectItem} onClose={() => setRejectItem(null)} title="Reject Guide" size="sm">
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Rejecting: <strong>{rejectItem?.name}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="Enter reason for rejection..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleReject} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700">Reject</button>
            <button onClick={() => setRejectItem(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

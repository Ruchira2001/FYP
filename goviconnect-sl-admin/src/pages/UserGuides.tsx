import { useEffect, useState, useCallback } from 'react';
import { getUserGuides, approveUserGuide, rejectUserGuide, deleteUserGuidePerm } from '../services/api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import { Eye, Check, XCircle, Trash2 } from 'lucide-react';

interface UGuide {
  _id: string;
  cropId?: string;
  name: string;
  scientificName?: string;
  description: string;
  category: string;
  climate?: string;
  soil?: string;
  season?: string;
  diseases?: string;
  treatments?: string;
  practices?: string;
  videoLink?: string;
  videoLinks?: string[];
  videoUrls?: string[];
  imageUrl?: string;
  images?: string[];
  userId: { name: string; email: string } | null;
  status: string;
  rejectionReason: string;
  createdAt: string;
}

const shortText = (value?: string, max = 60) => {
  if (!value?.trim()) return '-';
  return value.length > max ? `${value.slice(0, max)}...` : value;
};

const mediaCount = (guide: UGuide) => {
  const imageCount = (guide.imageUrl ? 1 : 0) + (guide.images?.length || 0);
  const videoCount = (guide.videoLink ? 1 : 0) + (guide.videoLinks?.length || 0) + (guide.videoUrls?.length || 0);
  return `${imageCount} images / ${videoCount} videos`;
};

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

  const handleDeletePerm = async (id: string) => {
    if (!confirm('Permanently delete this guide? This cannot be undone.')) return;
    try {
      await deleteUserGuidePerm(id);
      load();
    } catch {
      alert('Delete failed');
    }
  };

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
          <option value="delete_requested">Delete Requested</option>
        </select>
      </div>

      <DataTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'cropId', label: 'Crop ID', render: (g: UGuide) => g.cropId || '-' },
          { key: 'scientificName', label: 'Scientific Name', render: (g: UGuide) => g.scientificName || '-' },
          { key: 'category', label: 'Category' },
          {
            key: 'description',
            label: 'Description',
            render: (g: UGuide) => <span className="block min-w-52" title={g.description}>{shortText(g.description)}</span>,
          },
          { key: 'climate', label: 'Climate', render: (g: UGuide) => <span title={g.climate}>{shortText(g.climate, 40)}</span> },
          { key: 'soil', label: 'Soil', render: (g: UGuide) => <span title={g.soil}>{shortText(g.soil, 40)}</span> },
          { key: 'season', label: 'Season', render: (g: UGuide) => <span title={g.season}>{shortText(g.season, 40)}</span> },
          { key: 'diseases', label: 'Diseases', render: (g: UGuide) => <span title={g.diseases}>{shortText(g.diseases, 40)}</span> },
          { key: 'treatments', label: 'Treatments', render: (g: UGuide) => <span title={g.treatments}>{shortText(g.treatments, 40)}</span> },
          { key: 'practices', label: 'Practices', render: (g: UGuide) => <span title={g.practices}>{shortText(g.practices, 40)}</span> },
          { key: 'media', label: 'Media', render: mediaCount },
          {
            key: 'userId',
            label: 'Author',
            render: (g: UGuide) => (
              <div className="min-w-40">
                <p className="font-medium text-gray-800">{g.userId?.name || '-'}</p>
                <p className="text-xs text-gray-500">{g.userId?.email || '-'}</p>
              </div>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (g: UGuide) => {
              const colors: Record<string, string> = {
                pending: 'bg-yellow-100 text-yellow-700',
                approved: 'bg-green-100 text-green-700',
                rejected: 'bg-red-100 text-red-700',
                delete_requested: 'bg-purple-100 text-purple-700',
              };
              return (
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${colors[g.status] || 'bg-gray-100 text-gray-700'}`}>
                  {g.status.replace('_', ' ')}
                </span>
              );
            },
          },
          {
            key: 'createdAt',
            label: 'Submitted',
            render: (g: UGuide) => new Date(g.createdAt).toLocaleDateString(),
          },
        ]}
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
            {item.status === 'delete_requested' && (
              <button onClick={() => handleDeletePerm(item._id)} className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100"><Trash2 size={12} /> Confirm Delete</button>
            )}
            <button onClick={() => handleDeletePerm(item._id)} className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Delete Permanently"><Trash2 size={12} /></button>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Crop ID:</span>
              <p className="text-gray-800">{viewItem.cropId || '-'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Scientific Name:</span>
              <p className="text-gray-800">{viewItem.scientificName || '-'}</p>
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Author:</span>
            <p className="text-gray-800">{viewItem.userId?.name} ({viewItem.userId?.email})</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Description:</span>
            <p className="text-gray-800 whitespace-pre-wrap">{viewItem.description}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Climate:</span>
              <p className="text-gray-800 whitespace-pre-wrap">{viewItem.climate || '-'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Soil:</span>
              <p className="text-gray-800 whitespace-pre-wrap">{viewItem.soil || '-'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Season:</span>
              <p className="text-gray-800 whitespace-pre-wrap">{viewItem.season || '-'}</p>
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Diseases:</span>
            <p className="text-gray-800 whitespace-pre-wrap">{viewItem.diseases || '-'}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Treatments:</span>
            <p className="text-gray-800 whitespace-pre-wrap">{viewItem.treatments || '-'}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Practices:</span>
            <p className="text-gray-800 whitespace-pre-wrap">{viewItem.practices || '-'}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Media:</span>
            <p className="text-gray-800">{mediaCount(viewItem)}</p>
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

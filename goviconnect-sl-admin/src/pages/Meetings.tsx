import { useEffect, useState, useCallback } from 'react';
import { getMeetings, updateMeeting, deleteMeeting } from '../services/api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';

interface Meeting {
  _id: string;
  topic: string;
  farmerId: { name: string; email: string } | null;
  expertId: { name: string; email: string } | null;
  farmerName?: string;
  expertName?: string;
  dateTime: string;
  status: string;
  type: string;
  duration: number;
  createdAt: string;
}

export default function Meetings() {
  const [items, setItems] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [editItem, setEditItem] = useState<Meeting | null>(null);
  const [editStatus, setEditStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (statusFilter) params.status = statusFilter;
      const res = await getMeetings(params);
      setItems(res.data.data);
      setTotalPages(res.data.pages || 1);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleUpdate = async () => {
    if (!editItem) return;
    try {
      await updateMeeting(editItem._id, { status: editStatus });
      setEditItem(null);
      load();
    } catch {
      alert('Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this meeting?')) return;
    try {
      await deleteMeeting(id);
      load();
    } catch {
      alert('Delete failed');
    }
  };

  const columns = [
    { key: 'topic', label: 'Topic' },
    {
      key: 'farmerId',
      label: 'Farmer',
      render: (m: Meeting) => m.farmerId?.name || m.farmerName || '-',
    },
    {
      key: 'expertId',
      label: 'Expert',
      render: (m: Meeting) => m.expertId?.name || m.expertName || '-',
    },
    {
      key: 'dateTime',
      label: 'Date & Time',
      render: (m: Meeting) => m.dateTime ? new Date(m.dateTime).toLocaleString() : '-',
    },
    { key: 'type', label: 'Type' },
    {
      key: 'status',
      label: 'Status',
      render: (m: Meeting) => {
        const colors: Record<string, string> = {
          pending: 'bg-yellow-100 text-yellow-700',
          confirmed: 'bg-blue-100 text-blue-700',
          completed: 'bg-green-100 text-green-700',
          cancelled: 'bg-red-100 text-red-700',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[m.status] || 'bg-gray-100 text-gray-700'}`}>
            {m.status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Meetings</h1>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        actions={(item) => (
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setEditItem(item);
                setEditStatus(item.status);
              }}
              className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
            >
              Update
            </button>
            <button onClick={() => handleDelete(item._id)} className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100">Delete</button>
          </div>
        )}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Update Meeting Status" size="sm">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleUpdate} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700">Save</button>
            <button onClick={() => setEditItem(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

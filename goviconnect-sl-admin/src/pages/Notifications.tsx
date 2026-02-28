import { useEffect, useState, useCallback } from 'react';
import { getNotifications, broadcastNotification } from '../services/api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';

interface NotifItem {
  _id: string;
  title: string;
  body: string;
  userId: { name: string } | null;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function Notifications() {
  const [items, setItems] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', targetRole: 'all' });
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNotifications({ page });
      setItems(res.data.data);
      setTotalPages(res.data.pages || 1);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleBroadcast = async () => {
    if (!form.title || !form.message) return alert('Fill in all fields');
    setSending(true);
    try {
      await broadcastNotification(form);
      setModalOpen(false);
      setForm({ title: '', message: '', targetRole: 'all' });
      load();
      alert('Notification sent!');
    } catch {
      alert('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    {
      key: 'body',
      label: 'Message',
      render: (n: NotifItem) => (
        <span className="line-clamp-2 max-w-xs block">{n.body}</span>
      ),
    },
    {
      key: 'userId',
      label: 'Recipient',
      render: (n: NotifItem) => n.userId?.name || '-',
    },
    { key: 'type', label: 'Type' },
    {
      key: 'isRead',
      label: 'Read',
      render: (n: NotifItem) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${n.read ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {n.read ? 'Read' : 'Unread'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (n: NotifItem) => new Date(n.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <button onClick={() => setModalOpen(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
          📢 Broadcast
        </button>
      </div>

      <DataTable columns={columns} data={items} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Broadcast Notification">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
            <select
              value={form.targetRole}
              onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="all">All Users</option>
              <option value="farmer">Farmers Only</option>
              <option value="expert">Experts Only</option>
              <option value="shop">Shops Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Notification title..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Notification message..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleBroadcast}
              disabled={sending}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send Notification'}
            </button>
            <button onClick={() => setModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

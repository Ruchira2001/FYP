import { useEffect, useState, useCallback } from 'react';
import { getTips, createTip, updateTip, deleteTip } from '../services/api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';

interface Tip {
  _id: string;
  title: string;
  titleSi: string;
  content: string;
  contentSi: string;
  category: string;
  type: string;
  crop: string;
  icon: string;
  createdAt: string;
}

const EMPTY = { title: '', titleSi: '', content: '', contentSi: '', category: '', type: '', crop: '', icon: '' };

export default function Tips() {
  const [items, setItems] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTips({ page });
      setItems(res.data.data);
      setTotalPages(res.data.pages || 1);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditId(null); setForm(EMPTY); setModalOpen(true); };

  const openEdit = (item: Tip) => {
    setEditId(item._id);
    setForm({ title: item.title, titleSi: item.titleSi || '', content: item.content || '', contentSi: item.contentSi || '', category: item.category || '', type: item.type || '', crop: item.crop || '', icon: item.icon || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await updateTip(editId, form);
      } else {
        await createTip(form);
      }
      setModalOpen(false);
      load();
    } catch {
      alert('Save failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tip?')) return;
    try {
      await deleteTip(id);
      load();
    } catch {
      alert('Delete failed');
    }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'type', label: 'Type' },
    { key: 'category', label: 'Category' },
    { key: 'crop', label: 'Crop' },
    {
      key: 'content',
      label: 'Content',
      render: (t: Tip) => (
        <span className="line-clamp-2 max-w-xs block">{t.content}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (t: Tip) => new Date(t.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Tips</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">+ Add Tip</button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        actions={(item) => (
          <div className="flex gap-2 justify-end">
            <button onClick={() => openEdit(item)} className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">Edit</button>
            <button onClick={() => handleDelete(item._id)} className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100">Delete</button>
          </div>
        )}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Tip' : 'Add Tip'}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sinhala Title</label>
            <input
              type="text"
              value={form.titleSi}
              onChange={(e) => setForm({ ...form, titleSi: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <input type="text" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
              <input type="text" value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
            <input
              type="text"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700">
              {editId ? 'Update' : 'Create'}
            </button>
            <button onClick={() => setModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

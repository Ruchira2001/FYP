import { useEffect, useState, useCallback } from 'react';
import { getGuides, createGuide, updateGuide, deleteGuide } from '../services/api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';

interface Guide {
  _id: string;
  title: string;
  titleSi: string;
  cropId: string;
  category: string;
  overview: { content: string; climate: string; soil: string; season: string };
  views: number;
  likes: number;
  createdAt: string;
}

const EMPTY = { title: '', titleSi: '', cropId: '', category: '', content: '', climate: '', soil: '', season: '' };

export default function Guides() {
  const [items, setItems] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getGuides({ page });
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

  const openEdit = (item: Guide) => {
    setEditId(item._id);
    setForm({
      title: item.title, titleSi: item.titleSi || '', cropId: item.cropId || '',
      category: item.category || '', content: item.overview?.content || '',
      climate: item.overview?.climate || '', soil: item.overview?.soil || '',
      season: item.overview?.season || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        title: form.title,
        titleSi: form.titleSi,
        cropId: form.cropId,
        category: form.category,
        overview: { content: form.content, climate: form.climate, soil: form.soil, season: form.season },
      };
      if (editId) {
        await updateGuide(editId, payload);
      } else {
        await createGuide(payload);
      }
      setModalOpen(false);
      load();
    } catch {
      alert('Save failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this guide?')) return;
    try {
      await deleteGuide(id);
      load();
    } catch {
      alert('Delete failed');
    }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'cropId', label: 'Crop ID' },
    { key: 'category', label: 'Category' },
    { key: 'views', label: 'Views' },
    { key: 'likes', label: 'Likes' },
    {
      key: 'createdAt',
      label: 'Created',
      render: (g: Guide) => new Date(g.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Guides</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">+ Add Guide</button>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Guide' : 'Add Guide'} size="lg">
        <div className="space-y-3">
          {(['title', 'titleSi', 'cropId', 'category'] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {field === 'titleSi' ? 'Sinhala Title' : field === 'cropId' ? 'Crop ID' : field}
              </label>
              <input
                type="text"
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Climate</label>
              <input type="text" value={form.climate} onChange={(e) => setForm({ ...form, climate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soil</label>
              <input type="text" value={form.soil} onChange={(e) => setForm({ ...form, soil: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
              <input type="text" value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
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

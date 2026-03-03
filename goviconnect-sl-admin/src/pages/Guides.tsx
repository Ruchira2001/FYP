import { useEffect, useState, useCallback } from 'react';
import { getGuides, createGuide, updateGuide, deleteGuide, getCrops } from '../services/api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { showToast } from '../components/Toast';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface Guide {
  _id: string;
  title: string;
  titleSi: string;
  cropId: string;
  category: string;
  overview: {
    content: string; contentSi: string;
    climate: string; climateSi: string;
    soil: string; soilSi: string;
    season: string; seasonSi: string;
  };
  views: number;
  likes: number;
  createdAt: string;
}

interface CropOption {
  _id: string;
  cropId: string;
  name: string;
}

const EMPTY = {
  title: '', titleSi: '', cropId: '', category: '',
  content: '', contentSi: '',
  climate: '', climateSi: '',
  soil: '', soilSi: '',
  season: '', seasonSi: '',
};

export default function Guides() {
  const [items, setItems] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [crops, setCrops] = useState<CropOption[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getGuides({ page });
      setItems(res.data.data);
      setTotalPages(res.data.pages || 1);
    } catch {
      showToast('Failed to load guides', 'error');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    getCrops({ limit: 100 }).then((r) => setCrops(r.data.data)).catch(() => {});
  }, []);

  const openCreate = () => { setEditId(null); setForm(EMPTY); setModalOpen(true); };

  const openEdit = (item: Guide) => {
    setEditId(item._id);
    setForm({
      title: item.title, titleSi: item.titleSi || '', cropId: item.cropId || '',
      category: item.category || '',
      content: item.overview?.content || '', contentSi: item.overview?.contentSi || '',
      climate: item.overview?.climate || '', climateSi: item.overview?.climateSi || '',
      soil: item.overview?.soil || '', soilSi: item.overview?.soilSi || '',
      season: item.overview?.season || '', seasonSi: item.overview?.seasonSi || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }
    try {
      const payload = {
        title: form.title,
        titleSi: form.titleSi,
        cropId: form.cropId,
        category: form.category,
        overview: {
          content: form.content, contentSi: form.contentSi,
          climate: form.climate, climateSi: form.climateSi,
          soil: form.soil, soilSi: form.soilSi,
          season: form.season, seasonSi: form.seasonSi,
        },
      };
      if (editId) {
        await updateGuide(editId, payload);
        showToast('Guide updated successfully');
      } else {
        await createGuide(payload);
        showToast('Guide created successfully');
      }
      setModalOpen(false);
      load();
    } catch {
      showToast('Save failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteGuide(deleteTarget);
      setDeleteTarget(null);
      showToast('Guide deleted');
      load();
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    {
      key: 'cropId',
      label: 'Crop',
      render: (g: Guide) => {
        const crop = crops.find((c) => c.cropId === g.cropId);
        return crop ? crop.name : g.cropId || '-';
      },
    },
    { key: 'category', label: 'Category' },
    { key: 'views', label: 'Views' },
    { key: 'likes', label: 'Likes' },
    {
      key: 'createdAt',
      label: 'Created',
      render: (g: Guide) => new Date(g.createdAt).toLocaleDateString(),
    },
  ];

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Guides</h1>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"><Plus size={16} /> Add Guide</button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        actions={(item) => (
          <div className="flex gap-2 justify-end">
            <button onClick={() => openEdit(item)} className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Pencil size={12} /> Edit</button>
            <button onClick={() => setDeleteTarget(item._id)} className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={12} /> Delete</button>
          </div>
        )}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Guide' : 'Add Guide'} size="lg">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title (Sinhala)</label>
              <input type="text" value={form.titleSi} onChange={(e) => setForm({ ...form, titleSi: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
              <select
                value={form.cropId}
                onChange={(e) => setForm({ ...form, cropId: e.target.value })}
                className={`${inputClass} bg-white`}
              >
                <option value="">Select crop</option>
                {crops.map((c) => <option key={c.cropId} value={c.cropId}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3 mt-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Overview</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content (Sinhala)</label>
            <textarea value={form.contentSi} onChange={(e) => setForm({ ...form, contentSi: e.target.value })} rows={3} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Climate</label>
              <input type="text" value={form.climate} onChange={(e) => setForm({ ...form, climate: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Climate (Sinhala)</label>
              <input type="text" value={form.climateSi} onChange={(e) => setForm({ ...form, climateSi: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soil</label>
              <input type="text" value={form.soil} onChange={(e) => setForm({ ...form, soil: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soil (Sinhala)</label>
              <input type="text" value={form.soilSi} onChange={(e) => setForm({ ...form, soilSi: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
              <input type="text" value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Season (Sinhala)</label>
              <input type="text" value={form.seasonSi} onChange={(e) => setForm({ ...form, seasonSi: e.target.value })} className={inputClass} />
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

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Guide"
        message="Are you sure you want to delete this guide? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

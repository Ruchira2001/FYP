import { useEffect, useState, useCallback } from 'react';
import { getTips, createTip, updateTip, deleteTip, getCrops } from '../services/api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { showToast } from '../components/Toast';
import { TIP_CATEGORIES } from '../constants';
import { Pencil, Trash2, Plus } from 'lucide-react';

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

interface CropOption {
  cropId: string;
  name: string;
}

const EMPTY = { title: '', titleSi: '', content: '', contentSi: '', category: '', type: 'tip', crop: '', icon: '' };

export default function Tips() {
  const [items, setItems] = useState<Tip[]>([]);
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
      const res = await getTips({ page });
      setItems(res.data.data);
      setTotalPages(res.data.pages || 1);
    } catch {
      showToast('Failed to load tips', 'error');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    getCrops({ limit: 100 }).then((r) => setCrops(r.data.data)).catch(() => {});
  }, []);

  const openCreate = () => { setEditId(null); setForm(EMPTY); setModalOpen(true); };

  const openEdit = (item: Tip) => {
    setEditId(item._id);
    setForm({
      title: item.title, titleSi: item.titleSi || '',
      content: item.content || '', contentSi: item.contentSi || '',
      category: item.category || '', type: item.type || 'tip',
      crop: item.crop || '', icon: item.icon || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      showToast('Title and content are required', 'error');
      return;
    }
    try {
      if (editId) {
        await updateTip(editId, form);
        showToast('Tip updated successfully');
      } else {
        await createTip(form);
        showToast('Tip created successfully');
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
      await deleteTip(deleteTarget);
      setDeleteTarget(null);
      showToast('Tip deleted');
      load();
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'type', label: 'Type' },
    {
      key: 'category',
      label: 'Category',
      render: (t: Tip) => (
        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-yellow-50 text-yellow-700 capitalize">
          {(t.category || '-').replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'crop',
      label: 'Crop',
      render: (t: Tip) => {
        if (!t.crop) return <span className="text-gray-400">All crops</span>;
        const c = crops.find((cr) => cr.cropId === t.crop);
        return c ? c.name : t.crop;
      },
    },
    {
      key: 'content',
      label: 'Content',
      render: (t: Tip) => (
        <span className="line-clamp-2 max-w-xs block text-xs">{t.content}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (t: Tip) => new Date(t.createdAt).toLocaleDateString(),
    },
  ];

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Tips</h1>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"><Plus size={16} /> Add Tip</button>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Tip' : 'Add Tip'} size="lg">
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
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={`${inputClass} bg-white`}
              >
                <option value="">Select category</option>
                {TIP_CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
              <select
                value={form.crop}
                onChange={(e) => setForm({ ...form, crop: e.target.value })}
                className={`${inputClass} bg-white`}
              >
                <option value="">All Crops</option>
                {crops.map((c) => <option key={c.cropId} value={c.cropId}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
              <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className={inputClass} placeholder="🌱" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content (Sinhala)</label>
            <textarea value={form.contentSi} onChange={(e) => setForm({ ...form, contentSi: e.target.value })} rows={4} className={inputClass} />
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
        title="Delete Tip"
        message="Are you sure you want to delete this tip? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

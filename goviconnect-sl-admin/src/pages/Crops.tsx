import { useEffect, useState, useCallback } from 'react';
import { getCrops, createCrop, updateCrop, deleteCrop } from '../services/api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { showToast } from '../components/Toast';
import { CROP_CATEGORIES } from '../constants';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface Crop {
  _id: string;
  cropId: string;
  name: string;
  nameSi: string;
  category: string;
  icon: string;
  color: string;
}

const EMPTY = { cropId: '', name: '', nameSi: '', category: '', icon: '', color: '' };

export default function Crops() {
  const [items, setItems] = useState<Crop[]>([]);
  const [filtered, setFiltered] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCrops({ page });
      setItems(res.data.data);
      setTotalPages(res.data.pages || 1);
    } catch {
      showToast('Failed to load crops', 'error');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(items);
    } else {
      const q = search.toLowerCase();
      setFiltered(items.filter((c) => c.name.toLowerCase().includes(q) || (c.nameSi || '').toLowerCase().includes(q) || (c.category || '').toLowerCase().includes(q)));
    }
  }, [items, search]);

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY);
    setModalOpen(true);
  };

  const openEdit = (item: Crop) => {
    setEditId(item._id);
    setForm({ cropId: item.cropId || '', name: item.name, nameSi: item.nameSi || '', category: item.category || '', icon: item.icon || '', color: item.color || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.cropId.trim()) {
      showToast('Crop ID and Name are required', 'error');
      return;
    }
    try {
      if (editId) {
        await updateCrop(editId, form);
        showToast('Crop updated successfully');
      } else {
        await createCrop(form);
        showToast('Crop created successfully');
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
      await deleteCrop(deleteTarget);
      setDeleteTarget(null);
      showToast('Crop deleted');
      load();
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'nameSi', label: 'Sinhala Name' },
    {
      key: 'category',
      label: 'Category',
      render: (c: Crop) => (
        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 capitalize">
          {c.category || '-'}
        </span>
      ),
    },
    { key: 'icon', label: 'Icon' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Crops</h1>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search crops..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none w-52"
          />
          <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"><Plus size={16} /> Add Crop</button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        actions={(item) => (
          <div className="flex gap-2 justify-end">
            <button onClick={() => openEdit(item)} className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Pencil size={12} /> Edit</button>
            <button onClick={() => setDeleteTarget(item._id)} className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={12} /> Delete</button>
          </div>
        )}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Crop' : 'Add Crop'}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop ID *</label>
            <input type="text" value={form.cropId} onChange={(e) => setForm({ ...form, cropId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sinhala Name</label>
            <input type="text" value={form.nameSi} onChange={(e) => setForm({ ...form, nameSi: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
            >
              <option value="">Select category</option>
              {CROP_CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
              <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input type="text" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" placeholder="#16a34a" />
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
        title="Delete Crop"
        message="Are you sure you want to delete this crop? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

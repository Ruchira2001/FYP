import { useEffect, useState, useCallback } from 'react';
import { getCrops, createCrop, updateCrop, deleteCrop } from '../services/api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';

interface Crop {
  _id: string;
  cropId: string;
  name: string;
  nameSi: string;
  category: string;
  icon: string;
  color: string;
  createdAt: string;
}

const EMPTY = { name: '', nameSi: '', category: '', icon: '', color: '' };

export default function Crops() {
  const [items, setItems] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCrops({ page });
      setItems(res.data.data);
      setTotalPages(res.data.pages || 1);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY);
    setModalOpen(true);
  };

  const openEdit = (item: Crop) => {
    setEditId(item._id);
    setForm({ name: item.name, nameSi: item.nameSi || '', category: item.category || '', icon: item.icon || '', color: item.color || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await updateCrop(editId, form);
      } else {
        await createCrop(form);
      }
      setModalOpen(false);
      load();
    } catch {
      alert('Save failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this crop?')) return;
    try {
      await deleteCrop(id);
      load();
    } catch {
      alert('Delete failed');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'nameSi', label: 'Sinhala Name' },
    { key: 'category', label: 'Category' },
    { key: 'icon', label: 'Icon' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Crops</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">+ Add Crop</button>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Crop' : 'Add Crop'}>
        <div className="space-y-3">
          {(['name', 'nameSi', 'category', 'icon', 'color'] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {field === 'nameSi' ? 'Sinhala Name' : field}
              </label>
              <input
                type="text"
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          ))}
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

import { useEffect, useState, useCallback } from 'react';
import { getExperts, updateExpert, deleteExpert } from '../services/api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';

interface Expert {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  yearsExperience: number;
  rating: number;
  district: string;
  createdAt: string;
}

export default function Experts() {
  const [items, setItems] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState<Expert | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', specialty: '', yearsExperience: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getExperts({ page, search });
      setItems(res.data.data);
      setTotalPages(res.data.pages || 1);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleEdit = (item: Expert) => {
    setEditItem(item);
    setEditForm({ name: item.name, email: item.email, phone: item.phone || '', specialty: item.specialty || '', yearsExperience: String(item.yearsExperience || '') });
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    try {
      await updateExpert(editItem._id, { ...editForm, yearsExperience: Number(editForm.yearsExperience) });
      setEditItem(null);
      load();
    } catch {
      alert('Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expert?')) return;
    try {
      await deleteExpert(id);
      load();
    } catch {
      alert('Delete failed');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'specialty', label: 'Specialty' },
    { key: 'yearsExperience', label: 'Experience', render: (e: Expert) => `${e.yearsExperience || 0} yrs` },
    {
      key: 'rating',
      label: 'Rating',
      render: (e: Expert) => e.rating ? `${e.rating.toFixed(1)} ⭐` : '-',
    },
    { key: 'district', label: 'District' },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (e: Expert) => new Date(e.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Experts</h1>
        <input
          type="text"
          placeholder="Search experts..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none w-64"
        />
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        actions={(item) => (
          <div className="flex gap-2 justify-end">
            <button onClick={() => handleEdit(item)} className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">Edit</button>
            <button onClick={() => handleDelete(item._id)} className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100">Delete</button>
          </div>
        )}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Expert">
        <div className="space-y-3">
          {(['name', 'email', 'phone', 'specialty', 'yearsExperience'] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {field === 'yearsExperience' ? 'Years Experience' : field}
              </label>
              <input
                type={field === 'yearsExperience' ? 'number' : 'text'}
                value={editForm[field]}
                onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={handleUpdate} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700">Save</button>
            <button onClick={() => setEditItem(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

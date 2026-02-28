import { useEffect, useState, useCallback } from 'react';
import { getShops, updateShop, deleteShop } from '../services/api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';

interface Shop {
  _id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  type: string;
  createdAt: string;
}

export default function Shops() {
  const [items, setItems] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState<Shop | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', location: '', type: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getShops({ page, search });
      setItems(res.data.data);
      setTotalPages(res.data.pages || 1);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleEdit = (item: Shop) => {
    setEditItem(item);
    setEditForm({ name: item.name || '', email: item.email, phone: item.phone || '', location: item.location || '', type: item.type || '' });
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    try {
      await updateShop(editItem._id, editForm);
      setEditItem(null);
      load();
    } catch {
      alert('Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this shop?')) return;
    try {
      await deleteShop(id);
      load();
    } catch {
      alert('Delete failed');
    }
  };

  const columns = [
    { key: 'name', label: 'Shop Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'type', label: 'Type' },
    { key: 'location', label: 'Location' },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (s: Shop) => new Date(s.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Shops</h1>
        <input
          type="text"
          placeholder="Search shops..."
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

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Shop">
        <div className="space-y-3">
          {(['name', 'email', 'phone', 'location', 'type'] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{field}</label>
              <input
                type="text"
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

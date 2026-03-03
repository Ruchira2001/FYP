import { useEffect, useState, useCallback } from 'react';
import { getShops, updateShop, deleteShop } from '../services/api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { showToast } from '../components/Toast';
import { SHOP_TYPES } from '../constants';
import { Pencil, Trash2 } from 'lucide-react';

interface Shop {
  _id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  type: string;
  isActive: boolean;
  createdAt: string;
}

export default function Shops() {
  const [items, setItems] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState<Shop | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', location: '', type: '', isActive: true });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getShops({ page, search });
      setItems(res.data.data);
      setTotalPages(res.data.pages || 1);
    } catch {
      showToast('Failed to load shops', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleEdit = (item: Shop) => {
    setEditItem(item);
    setEditForm({
      name: item.name || '',
      email: item.email,
      phone: item.phone || '',
      location: item.location || '',
      type: item.type || '',
      isActive: item.isActive !== false,
    });
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    if (!editForm.name.trim() || !editForm.email.trim()) {
      showToast('Name and email are required', 'error');
      return;
    }
    try {
      await updateShop(editItem._id, editForm);
      setEditItem(null);
      showToast('Shop updated successfully');
      load();
    } catch {
      showToast('Update failed', 'error');
    }
  };

  const handleToggleActive = async (item: Shop) => {
    try {
      await updateShop(item._id, { isActive: !item.isActive });
      showToast(`Shop ${item.isActive ? 'deactivated' : 'activated'}`);
      load();
    } catch {
      showToast('Status update failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteShop(deleteTarget);
      setDeleteTarget(null);
      showToast('Shop deleted');
      load();
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const columns = [
    { key: 'name', label: 'Shop Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'type',
      label: 'Type',
      render: (s: Shop) => (
        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">
          {s.type || '-'}
        </span>
      ),
    },
    { key: 'location', label: 'Location' },
    {
      key: 'isActive',
      label: 'Status',
      render: (s: Shop) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
          s.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {s.isActive !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
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
            <button
              onClick={() => handleToggleActive(item)}
              className={`px-3 py-1 text-xs rounded-lg ${
                item.isActive !== false
                  ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
              }`}
            >
              {item.isActive !== false ? 'Deactivate' : 'Activate'}
            </button>
            <button onClick={() => handleEdit(item)} className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Pencil size={12} /> Edit</button>
            <button onClick={() => setDeleteTarget(item._id)} className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={12} /> Delete</button>
          </div>
        )}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Edit Modal */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Shop">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name *</label>
            <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input type="text" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={editForm.type}
              onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
            >
              <option value="">Select type</option>
              {SHOP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <label className="text-sm font-medium text-gray-700">Account Status</label>
            <button
              type="button"
              onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                editForm.isActive ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                editForm.isActive ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
            <span className={`text-xs font-medium ${editForm.isActive ? 'text-green-600' : 'text-red-600'}`}>
              {editForm.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {editItem && (
            <div className="bg-gray-50 rounded-lg p-3 mt-2">
              <p className="text-xs text-gray-500">
                <span className="font-medium">Joined:</span> {new Date(editItem.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={handleUpdate} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700">Save</button>
            <button onClick={() => setEditItem(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Shop"
        message="Are you sure you want to delete this shop? This action cannot be undone. Consider deactivating the account instead."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

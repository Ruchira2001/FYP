import { useEffect, useState, useCallback } from 'react';
import { getFarmers, updateFarmer, deleteFarmer } from '../services/api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { showToast } from '../components/Toast';
import { SL_DISTRICTS } from '../constants';
import { Pencil, Trash2 } from 'lucide-react';

interface Farmer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  district: string;
  crops: string[];
  isActive: boolean;
  hasCompletedOnboarding: boolean;
  createdAt: string;
}

export default function Farmers() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState<Farmer | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', district: '', isActive: true });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFarmers({ page, search });
      setFarmers(res.data.data);
      setTotalPages(res.data.pages || 1);
    } catch {
      showToast('Failed to load farmers', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleEdit = (item: Farmer) => {
    setEditItem(item);
    setEditForm({
      name: item.name,
      email: item.email,
      phone: item.phone || '',
      district: item.district || '',
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
      await updateFarmer(editItem._id, editForm);
      setEditItem(null);
      showToast('Farmer updated successfully');
      load();
    } catch {
      showToast('Update failed', 'error');
    }
  };

  const handleToggleActive = async (item: Farmer) => {
    try {
      await updateFarmer(item._id, { isActive: !item.isActive });
      showToast(`Farmer ${item.isActive ? 'deactivated' : 'activated'}`);
      load();
    } catch {
      showToast('Status update failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFarmer(deleteTarget);
      setDeleteTarget(null);
      showToast('Farmer deleted');
      load();
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'district', label: 'District' },
    {
      key: 'crops',
      label: 'Crops',
      render: (f: Farmer) => (f.crops || []).length > 0
        ? <span className="text-xs">{f.crops.join(', ')}</span>
        : <span className="text-gray-400">-</span>,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (f: Farmer) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
          f.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {f.isActive !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (f: Farmer) => new Date(f.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Farmers</h1>
        <input
          type="text"
          placeholder="Search farmers..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none w-64"
        />
      </div>

      <DataTable
        columns={columns}
        data={farmers}
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
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Farmer">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <select
              value={editForm.district}
              onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
            >
              <option value="">Select district</option>
              {SL_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
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

          {/* Read-only info */}
          {editItem && (
            <div className="bg-gray-50 rounded-lg p-3 mt-2 space-y-1">
              <p className="text-xs text-gray-500">
                <span className="font-medium">Crops:</span> {(editItem.crops || []).join(', ') || 'None'}
              </p>
              <p className="text-xs text-gray-500">
                <span className="font-medium">Onboarding:</span> {editItem.hasCompletedOnboarding ? 'Completed' : 'Pending'}
              </p>
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
        title="Delete Farmer"
        message="Are you sure you want to delete this farmer? This action cannot be undone. Consider deactivating the account instead."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

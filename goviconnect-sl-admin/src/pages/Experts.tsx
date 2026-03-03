import { useEffect, useState, useCallback } from 'react';
import { getExperts, updateExpert, deleteExpert } from '../services/api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { showToast } from '../components/Toast';
import { SL_DISTRICTS } from '../constants';
import { Pencil, Trash2 } from 'lucide-react';

interface Expert {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  specialtySi: string;
  yearsExperience: number;
  rating: number;
  totalConsultations: number;
  farmersHelped: number;
  district: string;
  bio: string;
  bioSi: string;
  qualifications: string[];
  specializations: string[];
  languages: string[];
  isActive: boolean;
  createdAt: string;
}

interface EditForm {
  name: string;
  email: string;
  phone: string;
  district: string;
  specialty: string;
  specialtySi: string;
  yearsExperience: string;
  bio: string;
  bioSi: string;
  qualifications: string;
  specializations: string;
  languages: string;
  isActive: boolean;
}

const EMPTY_FORM: EditForm = {
  name: '', email: '', phone: '', district: '', specialty: '', specialtySi: '',
  yearsExperience: '', bio: '', bioSi: '', qualifications: '', specializations: '',
  languages: '', isActive: true,
};

export default function Experts() {
  const [items, setItems] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState<Expert | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getExperts({ page, search });
      setItems(res.data.data);
      setTotalPages(res.data.pages || 1);
    } catch {
      showToast('Failed to load experts', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleEdit = (item: Expert) => {
    setEditItem(item);
    setEditForm({
      name: item.name,
      email: item.email,
      phone: item.phone || '',
      district: item.district || '',
      specialty: item.specialty || '',
      specialtySi: item.specialtySi || '',
      yearsExperience: String(item.yearsExperience || ''),
      bio: item.bio || '',
      bioSi: item.bioSi || '',
      qualifications: (item.qualifications || []).join(', '),
      specializations: (item.specializations || []).join(', '),
      languages: (item.languages || []).join(', '),
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
      const payload = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        district: editForm.district,
        specialty: editForm.specialty,
        specialtySi: editForm.specialtySi,
        yearsExperience: Number(editForm.yearsExperience) || 0,
        bio: editForm.bio,
        bioSi: editForm.bioSi,
        qualifications: editForm.qualifications.split(',').map((s) => s.trim()).filter(Boolean),
        specializations: editForm.specializations.split(',').map((s) => s.trim()).filter(Boolean),
        languages: editForm.languages.split(',').map((s) => s.trim()).filter(Boolean),
        isActive: editForm.isActive,
      };
      await updateExpert(editItem._id, payload);
      setEditItem(null);
      showToast('Expert updated successfully');
      load();
    } catch {
      showToast('Update failed', 'error');
    }
  };

  const handleToggleActive = async (item: Expert) => {
    try {
      await updateExpert(item._id, { isActive: !item.isActive });
      showToast(`Expert ${item.isActive ? 'deactivated' : 'activated'}`);
      load();
    } catch {
      showToast('Status update failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteExpert(deleteTarget);
      setDeleteTarget(null);
      showToast('Expert deleted');
      load();
    } catch {
      showToast('Delete failed', 'error');
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
      render: (e: Expert) => e.rating ? (
        <span className="inline-flex items-center gap-1">
          {e.rating.toFixed(1)}
          <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
        </span>
      ) : '-',
    },
    { key: 'district', label: 'District' },
    {
      key: 'isActive',
      label: 'Status',
      render: (e: Expert) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
          e.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {e.isActive !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
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
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Expert" size="lg">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <select value={editForm.district} onChange={(e) => setEditForm({ ...editForm, district: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white">
                <option value="">Select district</option>
                {SL_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
              <input type="text" value={editForm.specialty} onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialty (Sinhala)</label>
              <input type="text" value={editForm.specialtySi} onChange={(e) => setEditForm({ ...editForm, specialtySi: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <input type="number" value={editForm.yearsExperience} onChange={(e) => setEditForm({ ...editForm, yearsExperience: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Languages (comma-separated)</label>
              <input type="text" value={editForm.languages} onChange={(e) => setEditForm({ ...editForm, languages: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" placeholder="English, Sinhala" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications (comma-separated)</label>
            <input type="text" value={editForm.qualifications} onChange={(e) => setEditForm({ ...editForm, qualifications: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" placeholder="PhD Agriculture, B.Sc Botany" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specializations (comma-separated)</label>
            <input type="text" value={editForm.specializations} onChange={(e) => setEditForm({ ...editForm, specializations: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" placeholder="Rice farming, Pest control" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio (Sinhala)</label>
            <textarea value={editForm.bioSi} onChange={(e) => setEditForm({ ...editForm, bioSi: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
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

          {/* Read-only stats */}
          {editItem && (
            <div className="bg-gray-50 rounded-lg p-3 mt-2 grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">{editItem.rating?.toFixed(1) || '0.0'}</p>
                <p className="text-[10px] text-gray-500">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">{editItem.totalConsultations || 0}</p>
                <p className="text-[10px] text-gray-500">Consultations</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-purple-600">{editItem.farmersHelped || 0}</p>
                <p className="text-[10px] text-gray-500">Farmers Helped</p>
              </div>
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
        title="Delete Expert"
        message="Are you sure you want to delete this expert? This action cannot be undone. Consider deactivating the account instead."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

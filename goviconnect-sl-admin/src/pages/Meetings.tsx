import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarCheck, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  createMeeting,
  deleteMeeting,
  getExperts,
  getMeetings,
  updateMeeting,
} from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { showToast } from '../components/Toast';

interface PersonRef {
  _id: string;
  name?: string;
  email?: string;
}

interface Meeting {
  _id: string;
  expertId: PersonRef | string;
  farmerId?: PersonRef | string;
  expertName?: string;
  farmerName?: string;
  farmerDistrict?: string;
  type: 'group' | 'personal';
  topic: string;
  topicSi?: string;
  description?: string;
  sessionTitle?: string;
  dateTime: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  meetingLink?: string;
  attendees: number;
  maxAttendees: number;
  registeredUsers?: string[];
  createdAt: string;
}

interface ExpertOption {
  _id: string;
  name: string;
  email: string;
  specialty?: string;
}

interface MeetingForm {
  expertId: string;
  topic: string;
  topicSi: string;
  description: string;
  dateTime: string;
  duration: string;
  maxAttendees: string;
  meetingLink: string;
  status: Meeting['status'];
  notes: string;
}

const EMPTY_FORM: MeetingForm = {
  expertId: '',
  topic: '',
  topicSi: '',
  description: '',
  dateTime: '',
  duration: '60',
  maxAttendees: '50',
  meetingLink: '',
  status: 'pending',
  notes: '',
};

const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none';

const getPersonName = (value: PersonRef | string | undefined, fallback?: string) => {
  if (!value) return fallback || '-';
  if (typeof value === 'string') return fallback || value;
  return value.name || fallback || '-';
};

const toDateTimeInput = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

export default function Meetings() {
  const [items, setItems] = useState<Meeting[]>([]);
  const [experts, setExperts] = useState<ExpertOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Meeting | null>(null);
  const [viewItem, setViewItem] = useState<Meeting | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState<MeetingForm>(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (statusFilter) params.status = statusFilter;
      const res = await getMeetings(params);
      setItems(res.data.data);
      setTotalPages(res.data.pages || 1);
    } catch {
      showToast('Failed to load meetings', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    getExperts({ limit: 100 })
      .then((res) => setExperts(res.data.data || []))
      .catch(() => showToast('Failed to load experts', 'error'));
  }, []);

  const meetingStats = useMemo(() => ({
    pending: items.filter((m) => m.status === 'pending').length,
    confirmed: items.filter((m) => m.status === 'confirmed').length,
    completed: items.filter((m) => m.status === 'completed').length,
  }), [items]);

  const openCreate = () => {
    setEditItem(null);
    setForm({
      ...EMPTY_FORM,
      dateTime: toDateTimeInput(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()),
    });
    setModalOpen(true);
  };

  const openEdit = (item: Meeting) => {
    setEditItem(item);
    setForm({
      expertId: typeof item.expertId === 'string' ? item.expertId : item.expertId?._id || '',
      topic: item.topic || '',
      topicSi: item.topicSi || '',
      description: item.description || '',
      dateTime: toDateTimeInput(item.dateTime),
      duration: String(item.duration || 60),
      maxAttendees: String(item.maxAttendees || 50),
      meetingLink: item.meetingLink || '',
      status: item.status || 'pending',
      notes: item.notes || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.expertId || !form.topic.trim() || !form.dateTime) {
      showToast('Expert, topic, and date/time are required', 'error');
      return;
    }
    const payload = {
      expertId: form.expertId,
      type: 'group',
      topic: form.topic.trim(),
      topicSi: form.topicSi.trim(),
      sessionTitle: form.topic.trim(),
      description: form.description.trim(),
      dateTime: new Date(form.dateTime).toISOString(),
      duration: Number(form.duration) || 60,
      maxAttendees: Number(form.maxAttendees) || 50,
      meetingLink: form.meetingLink.trim(),
      status: form.status,
      notes: form.notes.trim(),
    };
    try {
      if (editItem) {
        await updateMeeting(editItem._id, payload);
        showToast('Meeting updated successfully');
      } else {
        await createMeeting(payload);
        showToast(form.status === 'pending' ? 'Meeting sent to expert for confirmation' : 'Meeting created successfully');
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Save failed', 'error');
    }
  };

  const handleStatus = async (item: Meeting, status: Meeting['status']) => {
    try {
      await updateMeeting(item._id, { status });
      showToast(`Meeting marked as ${status}`);
      load();
    } catch {
      showToast('Status update failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMeeting(deleteTarget);
      setDeleteTarget(null);
      showToast('Meeting deleted');
      load();
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const statusBadge = (status: Meeting['status']) => {
    const colors: Record<Meeting['status'], string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>{status}</span>;
  };

  const columns = [
    { key: 'topic', label: 'Topic', render: (m: Meeting) => <span className="font-medium text-gray-800 whitespace-nowrap">{m.topic}</span> },
    { key: 'expertId', label: 'Expert', render: (m: Meeting) => getPersonName(m.expertId, m.expertName) },
    { key: 'dateTime', label: 'Date & Time', render: (m: Meeting) => new Date(m.dateTime).toLocaleString() },
    { key: 'duration', label: 'Duration', render: (m: Meeting) => `${m.duration || 0} min` },
    { key: 'attendees', label: 'Registrations', render: (m: Meeting) => `${m.attendees || 0}/${m.maxAttendees || 0}` },
    { key: 'status', label: 'Permission', render: (m: Meeting) => statusBadge(m.status) },
    { key: 'meetingLink', label: 'Link', render: (m: Meeting) => m.meetingLink ? <span className="text-green-700 whitespace-nowrap">Available</span> : '-' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Meetings</h1>
          <p className="text-sm text-gray-500 mt-1">Admin schedules group meetings; pending meetings need expert confirmation before farmers can see them.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className={`${inputClass} bg-white w-40`}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
            <Plus size={16} /> Create Meeting
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500">Pending Expert Permission</p>
          <p className="text-2xl font-bold text-yellow-600">{meetingStats.pending}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500">Visible to Farmers</p>
          <p className="text-2xl font-bold text-green-600">{meetingStats.confirmed}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-blue-600">{meetingStats.completed}</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        actions={(item) => (
          <div className="flex gap-2 justify-end">
            <button onClick={() => setViewItem(item)} className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"><Eye size={12} /> View</button>
            {item.status === 'pending' && (
              <button onClick={() => handleStatus(item, 'confirmed')} className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><CalendarCheck size={12} /> Confirm</button>
            )}
            {item.status !== 'cancelled' && (
              <button onClick={() => handleStatus(item, 'cancelled')} className="px-3 py-1 text-xs bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100">Cancel</button>
            )}
            <button onClick={() => openEdit(item)} className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Pencil size={12} /> Edit</button>
            <button onClick={() => setDeleteTarget(item._id)} className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={12} /> Delete</button>
          </div>
        )}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Meeting' : 'Create Meeting'} size="lg">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expert *</label>
              <select value={form.expertId} onChange={(e) => setForm({ ...form, expertId: e.target.value })} className={`${inputClass} bg-white`}>
                <option value="">Select expert</option>
                {experts.map((expert) => (
                  <option key={expert._id} value={expert._id}>{expert.name} {expert.specialty ? `- ${expert.specialty}` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Permission Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Meeting['status'] })} className={`${inputClass} bg-white`}>
                <option value="pending">Pending expert permission</option>
                <option value="confirmed">Confirmed, visible to farmers</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic *</label>
              <input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic (Sinhala)</label>
              <input value={form.topicSi} onChange={(e) => setForm({ ...form, topicSi: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputClass} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
              <input type="datetime-local" value={form.dateTime} onChange={(e) => setForm({ ...form, dateTime: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Farmers</label>
              <input type="number" value={form.maxAttendees} onChange={(e) => setForm({ ...form, maxAttendees: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
            <input value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} className={inputClass} placeholder="Auto-created if blank" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className={inputClass} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700">
              {editItem ? 'Update' : 'Create'}
            </button>
            <button onClick={() => setModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Meeting Details" size="lg">
        {viewItem && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <Detail label="Topic" value={viewItem.topic} />
              <Detail label="Status" value={viewItem.status} />
              <Detail label="Expert" value={getPersonName(viewItem.expertId, viewItem.expertName)} />
              <Detail label="Type" value={viewItem.type} />
              <Detail label="Date & Time" value={new Date(viewItem.dateTime).toLocaleString()} />
              <Detail label="Duration" value={`${viewItem.duration} minutes`} />
              <Detail label="Registrations" value={`${viewItem.attendees || 0}/${viewItem.maxAttendees || 0}`} />
              <Detail label="Created" value={new Date(viewItem.createdAt).toLocaleDateString()} />
            </div>
            <Detail label="Description" value={viewItem.description || '-'} block />
            <Detail label="Meeting Link" value={viewItem.meetingLink || '-'} block />
            <Detail label="Notes" value={viewItem.notes || '-'} block />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Meeting"
        message="Are you sure you want to delete this meeting? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function Detail({ label, value, block = false }: { label: string; value: string; block?: boolean }) {
  return (
    <div className={block ? '' : 'bg-gray-50 rounded-lg p-3'}>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-gray-800 mt-1 whitespace-pre-wrap break-words">{value}</p>
    </div>
  );
}

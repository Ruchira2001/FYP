import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, Image as ImageIcon, ShieldCheck, Stethoscope } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { showToast } from '../components/Toast';
import { getDiagnoses } from '../services/api';

interface UserRef {
  _id: string;
  name?: string;
  email?: string;
}

interface Diagnosis {
  _id: string;
  userId: UserRef | null;
  imageUrl: string;
  diseaseName: string;
  diseaseNameSi?: string;
  confidence: number;
  treatments?: string[];
  treatmentsSi?: string[];
  preventionTips?: string[];
  preventionTipsSi?: string[];
  recommendedChemicals?: string[];
  recommendedChemicalsSi?: string[];
  isHealthy: boolean;
  healthMessage?: string;
  healthMessageSi?: string;
  synced: boolean;
  expertReviewed: boolean;
  expertDiagnosis?: string;
  expertNotes?: string;
  reviewStatus: 'pending_review' | 'verified' | 'corrected';
  reviewedAt?: string;
  createdAt: string;
}

const percent = (value: number) => `${Math.round((value || 0) * 100)}%`;

const statusBadge = (item: Diagnosis) => {
  if (item.isHealthy) return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">Healthy</span>;
  return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">Disease Found</span>;
};

const reviewBadge = (status: Diagnosis['reviewStatus']) => {
  const colors: Record<Diagnosis['reviewStatus'], string> = {
    pending_review: 'bg-yellow-100 text-yellow-700',
    verified: 'bg-green-100 text-green-700',
    corrected: 'bg-blue-100 text-blue-700',
  };
  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${colors[status]}`}>{status.replace('_', ' ')}</span>;
};

const listValue = (items?: string[]) => items?.length ? items.join(', ') : '-';

export default function AICropDoctor() {
  const [items, setItems] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewItem, setViewItem] = useState<Diagnosis | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDiagnoses({ page });
      setItems(res.data.data || []);
      setTotalPages(res.data.pages || 1);
    } catch {
      showToast('Failed to load crop doctor results', 'error');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => ({
    total: items.length,
    healthy: items.filter((i) => i.isHealthy).length,
    pending: items.filter((i) => i.reviewStatus === 'pending_review').length,
  }), [items]);

  const columns = [
    {
      key: 'imageUrl',
      label: 'Image',
      render: (item: Diagnosis) => item.imageUrl ? (
        <img src={item.imageUrl} alt={item.diseaseName} className="h-12 w-12 rounded-md object-cover border border-gray-200" />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-100 text-gray-400"><ImageIcon size={18} /></div>
      ),
    },
    {
      key: 'userId',
      label: 'Farmer',
      render: (item: Diagnosis) => (
        <div className="min-w-44">
          <p className="font-medium text-gray-800">{item.userId?.name || '-'}</p>
          <p className="text-xs text-gray-500">{item.userId?.email || '-'}</p>
        </div>
      ),
    },
    { key: 'diseaseName', label: 'AI Result', render: (item: Diagnosis) => <span className="font-medium text-gray-800">{item.diseaseName}</span> },
    { key: 'confidence', label: 'Confidence', render: (item: Diagnosis) => percent(item.confidence) },
    { key: 'isHealthy', label: 'Crop Status', render: statusBadge },
    { key: 'reviewStatus', label: 'Expert Review', render: (item: Diagnosis) => reviewBadge(item.reviewStatus) },
    { key: 'treatments', label: 'Treatments', render: (item: Diagnosis) => <span className="block min-w-56" title={listValue(item.treatments)}>{listValue(item.treatments).slice(0, 80)}</span> },
    { key: 'synced', label: 'Sync', render: (item: Diagnosis) => item.synced ? 'Synced' : 'Pending' },
    { key: 'createdAt', label: 'Checked', render: (item: Diagnosis) => new Date(item.createdAt).toLocaleString() },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AI Crop Doctor</h1>
          <p className="mt-1 text-sm text-gray-500">Review every crop disease check, AI confidence, image, treatment, prevention, and expert verification detail.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Results on Page" value={stats.total} tone="text-gray-800" />
        <Stat label="Healthy Crops" value={stats.healthy} tone="text-green-600" />
        <Stat label="Pending Reviews" value={stats.pending} tone="text-yellow-600" />
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        minWidth="min-w-[1280px]"
        actions={(item) => (
          <button onClick={() => setViewItem(item)} className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1 text-xs text-green-700 hover:bg-green-100">
            <Eye size={12} /> View
          </button>
        )}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Crop Doctor Details" size="lg">
        {viewItem && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-[160px_1fr] gap-4">
              <img src={viewItem.imageUrl} alt={viewItem.diseaseName} className="h-40 w-40 rounded-lg border border-gray-200 object-cover" />
              <div className="grid grid-cols-2 gap-3">
                <Detail label="Farmer" value={`${viewItem.userId?.name || '-'} (${viewItem.userId?.email || '-'})`} />
                <Detail label="AI Result" value={viewItem.diseaseName} />
                <Detail label="Sinhala Result" value={viewItem.diseaseNameSi || '-'} />
                <Detail label="Confidence" value={percent(viewItem.confidence)} />
                <Detail label="Crop Status" value={viewItem.isHealthy ? 'Healthy' : 'Disease found'} />
                <Detail label="Review Status" value={viewItem.reviewStatus.replace('_', ' ')} />
              </div>
            </div>
            <Detail label="Health Message" value={viewItem.healthMessage || '-'} block />
            <Detail label="Treatments" value={listValue(viewItem.treatments)} block />
            <Detail label="Treatments (Sinhala)" value={listValue(viewItem.treatmentsSi)} block />
            <Detail label="Prevention Tips" value={listValue(viewItem.preventionTips)} block />
            <Detail label="Recommended Chemicals" value={listValue(viewItem.recommendedChemicals)} block />
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="mb-2 flex items-center gap-2 text-gray-700">
                <ShieldCheck size={16} />
                <span className="font-semibold">Expert Review</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Detail label="Reviewed" value={viewItem.expertReviewed ? 'Yes' : 'No'} />
                <Detail label="Reviewed At" value={viewItem.reviewedAt ? new Date(viewItem.reviewedAt).toLocaleString() : '-'} />
              </div>
              <Detail label="Expert Diagnosis" value={viewItem.expertDiagnosis || '-'} block />
              <Detail label="Expert Notes" value={viewItem.expertNotes || '-'} block />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-700">
        <Stethoscope size={18} />
      </div>
      <p className={`text-2xl font-bold ${tone}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function Detail({ label, value, block = false }: { label: string; value: string; block?: boolean }) {
  return (
    <div className={block ? 'rounded-lg border border-gray-100 p-3' : 'rounded-lg bg-gray-50 p-3'}>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 whitespace-pre-wrap break-words text-gray-800">{value}</p>
    </div>
  );
}

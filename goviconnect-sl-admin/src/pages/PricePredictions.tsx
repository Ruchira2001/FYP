import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, MapPin, TrendingUp } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { showToast } from '../components/Toast';
import { getPredictions } from '../services/api';

interface UserRef {
  _id: string;
  name?: string;
  email?: string;
}

interface Prediction {
  _id: string;
  userId: UserRef | null;
  crop: string;
  cropSi?: string;
  variety?: string;
  landSize: number;
  landUnit: 'acres' | 'hectares' | 'perches';
  district?: string;
  season?: 'Maha' | 'Yala' | null;
  expectedYield?: string;
  priceLow: number;
  priceHigh: number;
  summary: string;
  summarySi?: string;
  synced: boolean;
  createdAt: string;
}

const money = (value: number) => `Rs. ${Number(value || 0).toLocaleString()}`;

export default function PricePredictions() {
  const [items, setItems] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewItem, setViewItem] = useState<Prediction | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPredictions({ page });
      setItems(res.data.data || []);
      setTotalPages(res.data.pages || 1);
    } catch {
      showToast('Failed to load price predictions', 'error');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const avgLow = items.length ? items.reduce((sum, item) => sum + (item.priceLow || 0), 0) / items.length : 0;
    const avgHigh = items.length ? items.reduce((sum, item) => sum + (item.priceHigh || 0), 0) / items.length : 0;
    return {
      total: items.length,
      synced: items.filter((item) => item.synced).length,
      avgRange: `${money(avgLow)} - ${money(avgHigh)}`,
    };
  }, [items]);

  const columns = [
    {
      key: 'userId',
      label: 'Farmer',
      render: (item: Prediction) => (
        <div className="min-w-44">
          <p className="font-medium text-gray-800">{item.userId?.name || '-'}</p>
          <p className="text-xs text-gray-500">{item.userId?.email || '-'}</p>
        </div>
      ),
    },
    { key: 'crop', label: 'Crop', render: (item: Prediction) => <span className="font-medium text-gray-800">{item.crop}</span> },
    { key: 'variety', label: 'Variety', render: (item: Prediction) => item.variety || '-' },
    { key: 'landSize', label: 'Land', render: (item: Prediction) => `${item.landSize} ${item.landUnit}` },
    { key: 'district', label: 'District', render: (item: Prediction) => item.district || '-' },
    { key: 'season', label: 'Season', render: (item: Prediction) => item.season || '-' },
    { key: 'expectedYield', label: 'Yield', render: (item: Prediction) => item.expectedYield || '-' },
    { key: 'priceLow', label: 'Low Price', render: (item: Prediction) => money(item.priceLow) },
    { key: 'priceHigh', label: 'High Price', render: (item: Prediction) => money(item.priceHigh) },
    { key: 'synced', label: 'Sync', render: (item: Prediction) => item.synced ? 'Synced' : 'Pending' },
    { key: 'createdAt', label: 'Predicted', render: (item: Prediction) => new Date(item.createdAt).toLocaleString() },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Price Predictions</h1>
          <p className="mt-1 text-sm text-gray-500">Inspect crop, land, season, yield, district, price range, and generated summaries from AI price prediction.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Predictions on Page" value={String(stats.total)} />
        <Stat label="Synced Results" value={String(stats.synced)} />
        <Stat label="Average Range" value={stats.avgRange} />
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        minWidth="min-w-[1320px]"
        actions={(item) => (
          <button onClick={() => setViewItem(item)} className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1 text-xs text-green-700 hover:bg-green-100">
            <Eye size={12} /> View
          </button>
        )}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Price Prediction Details" size="lg">
        {viewItem && (
          <div className="space-y-4 text-sm">
            <div className="rounded-lg border border-green-100 bg-green-50 p-4">
              <div className="flex items-center gap-2 text-green-800">
                <TrendingUp size={18} />
                <span className="font-semibold">{money(viewItem.priceLow)} - {money(viewItem.priceHigh)}</span>
              </div>
              <p className="mt-2 text-green-700">{viewItem.summary}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Detail label="Farmer" value={`${viewItem.userId?.name || '-'} (${viewItem.userId?.email || '-'})`} />
              <Detail label="Crop" value={viewItem.crop} />
              <Detail label="Crop (Sinhala)" value={viewItem.cropSi || '-'} />
              <Detail label="Variety" value={viewItem.variety || '-'} />
              <Detail label="Land Size" value={`${viewItem.landSize} ${viewItem.landUnit}`} />
              <Detail label="District" value={viewItem.district || '-'} />
              <Detail label="Season" value={viewItem.season || '-'} />
              <Detail label="Expected Yield" value={viewItem.expectedYield || '-'} />
              <Detail label="Low Price" value={money(viewItem.priceLow)} />
              <Detail label="High Price" value={money(viewItem.priceHigh)} />
              <Detail label="Sync Status" value={viewItem.synced ? 'Synced' : 'Pending'} />
              <Detail label="Created" value={new Date(viewItem.createdAt).toLocaleString()} />
            </div>
            <Detail label="Summary" value={viewItem.summary} block />
            <Detail label="Summary (Sinhala)" value={viewItem.summarySi || '-'} block />
          </div>
        )}
      </Modal>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-700">
        <MapPin size={18} />
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
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

import { useEffect, useState, useCallback } from 'react';
import { getUserGuides, approveUserGuide, rejectUserGuide, deleteUserGuidePerm } from '../services/api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import { Eye, Check, XCircle, Trash2, Image as ImageIcon, PlayCircle, ExternalLink } from 'lucide-react';
import { getCropImage } from '../utils/cropImages';

interface UGuide {
  _id: string;
  cropId?: string;
  name: string;
  scientificName?: string;
  description: string;
  category: string;
  climate?: string;
  soil?: string;
  season?: string;
  diseases?: string;
  treatments?: string;
  practices?: string;
  videoLink?: string;
  videoLinks?: string[];
  videoUrls?: string[];
  imageUrl?: string;
  images?: string[];
  userId: { name: string; email: string } | null;
  status: string;
  rejectionReason: string;
  createdAt: string;
}

const shortText = (value?: string, max = 60) => {
  if (!value?.trim()) return '-';
  return value.length > max ? `${value.slice(0, max)}...` : value;
};

const mediaCount = (guide: UGuide) => {
  const imageCount = (guide.imageUrl ? 1 : 0) + (guide.images?.length || 0);
  const videoCount = (guide.videoLink ? 1 : 0) + (guide.videoLinks?.length || 0) + (guide.videoUrls?.length || 0);
  return `${imageCount} images / ${videoCount} videos`;
};

const allImages = (guide: UGuide) => [
  ...(guide.imageUrl ? [guide.imageUrl] : []),
  ...(guide.images || []),
].filter(Boolean);

const allVideos = (guide: UGuide) => [
  ...(guide.videoUrls || []),
  ...(guide.videoLinks || []),
  ...(guide.videoLink ? [guide.videoLink] : []),
].filter(Boolean);

const isDirectVideo = (url: string) => /\.(mp4|webm|ogg)(\?|$)/i.test(url) || /\/video\/upload\//i.test(url);

const DetailBlock = ({ label, value }: { label: string; value?: string }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{value?.trim() || '-'}</p>
  </div>
);

export default function UserGuides() {
  const [items, setItems] = useState<UGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [rejectItem, setRejectItem] = useState<UGuide | null>(null);
  const [reason, setReason] = useState('');
  const [viewItem, setViewItem] = useState<UGuide | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (statusFilter) params.status = statusFilter;
      const res = await getUserGuides(params);
      setItems(res.data.data);
      setTotalPages(res.data.pages || 1);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this guide?')) return;
    try {
      await approveUserGuide(id);
      load();
    } catch {
      alert('Approval failed');
    }
  };

  const handleReject = async () => {
    if (!rejectItem || !reason) return alert('Enter a reason');
    try {
      await rejectUserGuide(rejectItem._id, reason);
      setRejectItem(null);
      setReason('');
      load();
    } catch {
      alert('Rejection failed');
    }
  };

  const handleDeletePerm = async (id: string) => {
    if (!confirm('Permanently delete this guide? This cannot be undone.')) return;
    try {
      await deleteUserGuidePerm(id);
      load();
    } catch {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">User Submitted Guides</h1>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="delete_requested">Delete Requested</option>
        </select>
      </div>

      <DataTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'cropId', label: 'Crop ID', render: (g: UGuide) => g.cropId || '-' },
          { key: 'scientificName', label: 'Scientific Name', render: (g: UGuide) => g.scientificName || '-' },
          { key: 'category', label: 'Category' },
          {
            key: 'description',
            label: 'Description',
            render: (g: UGuide) => <span className="block min-w-52" title={g.description}>{shortText(g.description)}</span>,
          },
          { key: 'climate', label: 'Climate', render: (g: UGuide) => <span title={g.climate}>{shortText(g.climate, 40)}</span> },
          { key: 'soil', label: 'Soil', render: (g: UGuide) => <span title={g.soil}>{shortText(g.soil, 40)}</span> },
          { key: 'season', label: 'Season', render: (g: UGuide) => <span title={g.season}>{shortText(g.season, 40)}</span> },
          { key: 'diseases', label: 'Diseases', render: (g: UGuide) => <span title={g.diseases}>{shortText(g.diseases, 40)}</span> },
          { key: 'treatments', label: 'Treatments', render: (g: UGuide) => <span title={g.treatments}>{shortText(g.treatments, 40)}</span> },
          { key: 'practices', label: 'Practices', render: (g: UGuide) => <span title={g.practices}>{shortText(g.practices, 40)}</span> },
          { key: 'media', label: 'Media', render: mediaCount },
          {
            key: 'userId',
            label: 'Author',
            render: (g: UGuide) => (
              <div className="min-w-40">
                <p className="font-medium text-gray-800">{g.userId?.name || '-'}</p>
                <p className="text-xs text-gray-500">{g.userId?.email || '-'}</p>
              </div>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (g: UGuide) => {
              const colors: Record<string, string> = {
                pending: 'bg-yellow-100 text-yellow-700',
                approved: 'bg-green-100 text-green-700',
                rejected: 'bg-red-100 text-red-700',
                delete_requested: 'bg-purple-100 text-purple-700',
              };
              return (
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${colors[g.status] || 'bg-gray-100 text-gray-700'}`}>
                  {g.status.replace('_', ' ')}
                </span>
              );
            },
          },
          {
            key: 'createdAt',
            label: 'Submitted',
            render: (g: UGuide) => new Date(g.createdAt).toLocaleDateString(),
          },
        ]}
        data={items}
        loading={loading}
        actions={(item) => (
          <div className="flex gap-2 justify-end">
            <button onClick={() => setViewItem(item)} className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"><Eye size={12} /> View</button>
            {item.status === 'pending' && (
              <>
                <button onClick={() => handleApprove(item._id)} className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><Check size={12} /> Approve</button>
                <button
                  onClick={() => { setRejectItem(item); setReason(''); }}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                  <XCircle size={12} /> Reject
                </button>
              </>
            )}
            {item.status === 'delete_requested' && (
              <button onClick={() => handleDeletePerm(item._id)} className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100"><Trash2 size={12} /> Confirm Delete</button>
            )}
            <button onClick={() => handleDeletePerm(item._id)} className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Delete Permanently"><Trash2 size={12} /></button>
          </div>
        )}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* View Modal */}
      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Guide Details" size="lg">
        {viewItem && (
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
              <div className="relative h-44 bg-emerald-50">
                {getCropImage(viewItem.cropId, viewItem.name) || allImages(viewItem)[0] ? (
                  <img
                    src={getCropImage(viewItem.cropId, viewItem.name) || allImages(viewItem)[0]}
                    alt={viewItem.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-sm font-semibold text-emerald-700">
                    Crop image unavailable
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-emerald-700">{viewItem.category || 'Guide'}</span>
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700">{viewItem.status.replace('_', ' ')}</span>
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700">{mediaCount(viewItem)}</span>
                  </div>
                  <h3 className="mt-2 text-xl font-bold text-white">{viewItem.name}</h3>
                </div>
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Author</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{viewItem.userId?.name || '-'}</p>
                  <p className="text-xs text-slate-500">{viewItem.userId?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Crop</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{viewItem.cropId || '-'}</p>
                  <p className="text-xs text-slate-500">{viewItem.scientificName || '-'}</p>
                </div>
              </div>
            </div>

            <DetailBlock label="Description" value={viewItem.description} />

            <div className="grid gap-3 md:grid-cols-3">
              <DetailBlock label="Climate" value={viewItem.climate} />
              <DetailBlock label="Soil" value={viewItem.soil} />
              <DetailBlock label="Season" value={viewItem.season} />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <DetailBlock label="Diseases" value={viewItem.diseases} />
              <DetailBlock label="Treatments" value={viewItem.treatments} />
              <DetailBlock label="Practices" value={viewItem.practices} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Uploaded Media</p>
                  <p className="text-sm text-slate-600">{mediaCount(viewItem)}</p>
                </div>
              </div>

              {allImages(viewItem).length > 0 && (
                <div className="mb-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <ImageIcon size={16} className="text-emerald-600" /> Photos
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {allImages(viewItem).map((src, index) => (
                      <a key={`${src}-${index}`} href={src} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <img src={src} alt={`Uploaded photo ${index + 1}`} className="h-40 w-full object-cover transition group-hover:scale-[1.02]" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {allVideos(viewItem).length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <PlayCircle size={16} className="text-red-500" /> Videos
                  </div>
                  <div className="grid gap-3">
                    {allVideos(viewItem).map((url, index) => (
                      <div key={`${url}-${index}`} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        {isDirectVideo(url) ? (
                          <video src={url} controls className="max-h-72 w-full bg-slate-900" />
                        ) : (
                          <a href={url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 p-4 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                            <span className="truncate">{url}</span>
                            <ExternalLink size={16} className="shrink-0 text-slate-400" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {allImages(viewItem).length === 0 && allVideos(viewItem).length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No uploaded photos or videos for this guide.
                </div>
              )}
            </div>

            {viewItem.rejectionReason && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-red-500">Rejection Reason</p>
                <p className="mt-1 text-sm text-red-700">{viewItem.rejectionReason}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal open={!!rejectItem} onClose={() => setRejectItem(null)} title="Reject Guide" size="sm">
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Rejecting: <strong>{rejectItem?.name}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="Enter reason for rejection..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleReject} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700">Reject</button>
            <button onClick={() => setRejectItem(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

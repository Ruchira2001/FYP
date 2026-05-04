import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Store, Phone, MapPin, Mail, Leaf, FlaskConical } from 'lucide-react';
import { getProduct } from '../services/api';
import { socket, connectSocket } from '../services/socket';

interface ShopInfo {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  address?: string;
  type?: string;
}

interface Product {
  _id: string;
  name: string;
  nameSi?: string;
  category: string;
  description?: string;
  targetDisease?: string;
  targetCrops?: string[];
  dosage?: string;
  price: number;
  unit?: string;
  emoji?: string;
  imageUrl?: string;
  stock: number;
  availability: string;
  manufacturer?: string;
  activeIngredient?: string;
  shopId: ShopInfo | null;
  createdAt: string;
  updatedAt: string;
}

const statusClass = (availability: string) => {
  if (availability === 'In Stock') return 'bg-green-100 text-green-800';
  if (availability === 'Low Stock') return 'bg-yellow-100 text-yellow-800';
  if (availability === 'Out of Stock') return 'bg-red-100 text-red-800';
  return 'bg-slate-100 text-slate-700';
};

const Field = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
    <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-medium text-slate-800">{value || '-'}</p>
  </div>
);

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await getProduct(id);
      setProduct(res.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();

    const handleProductUpdate = (payload?: { productId?: string }) => {
      if (!payload?.productId || payload.productId === id) loadProduct();
    };

    connectSocket();
    socket.on('product_changed', handleProductUpdate);
    return () => {
      socket.off('product_changed', handleProductUpdate);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-xl border border-emerald-100 bg-white p-10 text-center text-slate-500">
        <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-2 border-emerald-100 border-t-emerald-600" />
        Loading product...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate('/products')} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </button>
        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm font-medium text-red-700">{error || 'Product not found'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/products')} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </button>

      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-5 border-b border-slate-100 p-6 lg:flex-row lg:items-center">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-28 w-28 rounded-xl object-cover" />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-emerald-50 text-5xl">
              {product.emoji || <Package className="h-10 w-10 text-emerald-700" />}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(product.availability)}`}>
                {product.availability}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {product.category}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
            {product.nameSi && <p className="mt-1 text-sm text-slate-500">{product.nameSi}</p>}
            <p className="mt-3 text-2xl font-bold text-emerald-700">
              Rs. {Number(product.price || 0).toFixed(2)}
              {product.unit && <span className="ml-1 text-sm font-medium text-slate-500">per {product.unit}</span>}
            </p>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-5">
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase text-slate-500">
                <Leaf className="h-4 w-4" />
                Product Details
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Stock" value={product.stock} />
                <Field label="Manufacturer" value={product.manufacturer} />
                <Field label="Active Ingredient" value={product.activeIngredient} />
                <Field label="Dosage" value={product.dosage} />
                <Field label="Target Disease" value={product.targetDisease} />
                <Field label="Updated" value={new Date(product.updatedAt).toLocaleString()} />
              </div>
            </section>

            <section className="rounded-xl border border-slate-100 p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase text-slate-500">
                <FlaskConical className="h-4 w-4" />
                Description
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{product.description || 'No description provided.'}</p>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-bold uppercase text-slate-500">Target Crops</h2>
              <div className="flex flex-wrap gap-2">
                {(product.targetCrops?.length ? product.targetCrops : ['Not specified']).map((crop) => (
                  <span key={crop} className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                    {crop}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <section className="rounded-xl border border-slate-100 bg-slate-50/40 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase text-slate-500">
              <Store className="h-4 w-4" />
              Seller Shop
            </h2>
            <div className="space-y-3 text-sm">
              <p className="text-lg font-bold text-slate-900">{product.shopId?.name || 'Unknown Shop'}</p>
              <p className="text-slate-500">{product.shopId?.type || 'Business'}</p>
              <div className="space-y-2 pt-2">
                <p className="flex items-center gap-2 text-slate-700"><Mail className="h-4 w-4 text-slate-400" />{product.shopId?.email || '-'}</p>
                <p className="flex items-center gap-2 text-slate-700"><Phone className="h-4 w-4 text-slate-400" />{product.shopId?.phone || '-'}</p>
                <p className="flex items-center gap-2 text-slate-700"><MapPin className="h-4 w-4 text-slate-400" />{product.shopId?.address || product.shopId?.location || '-'}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

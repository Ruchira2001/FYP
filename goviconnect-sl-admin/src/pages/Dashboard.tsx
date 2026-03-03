import { useEffect, useState } from 'react';
import { getDashboard } from '../services/api';
import StatCard from '../components/StatCard';
import {
  Users,
  GraduationCap,
  Store,
  Sprout,
  BookOpen,
  Lightbulb,
  ClipboardCheck,
  TrendingUp,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

interface DashData {
  stats: Record<string, number>;
  recentActivity: {
    recentUsers: number;
    recentExperts: number;
    recentMeetings: number;
    recentDiagnoses: number;
  };
  monthlyData: { month: string; farmers: number; experts: number; shops: number }[];
}

const PIE_COLORS = ['#10b981', '#3b82f6', '#8b5cf6'];

/* ---- tiny helper ---- */
function ActiveBar({
  label,
  active,
  total,
  color,
}: {
  label: string;
  active: number;
  total: number;
  color: string;
}) {
  const pct = total ? Math.round((active / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-700">
          {active}<span className="text-gray-400 font-normal">/{total}</span>
          <span className="ml-1.5 text-xs text-gray-400">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((r) => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Activity size={32} className="mb-2" />
        <p className="text-sm">Could not load dashboard data</p>
      </div>
    );
  }

  const { stats, recentActivity, monthlyData } = data;

  const totalUsers = (stats.farmers || 0) + (stats.experts || 0) + (stats.shops || 0);

  const userPieData = [
    { name: 'Farmers', value: stats.farmers || 0 },
    { name: 'Experts', value: stats.experts || 0 },
    { name: 'Shops', value: stats.shops || 0 },
  ];

  /* build cumulative area data */
  const areaData = (monthlyData || []).map((m) => ({
    ...m,
    total: m.farmers + m.experts + m.shops,
  }));

  return (
    <div className="space-y-8 max-w-[1280px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Overview of your GoviConnect platform</p>
      </div>

      {/* ──── User Stats Row ──── */}
      <section>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Users</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Farmers"
            value={stats.farmers || 0}
            icon={<Users size={20} />}
            color="green"
            subtitle={`${stats.activeFarmers ?? stats.farmers ?? 0} active`}
          />
          <StatCard
            title="Experts"
            value={stats.experts || 0}
            icon={<GraduationCap size={20} />}
            color="blue"
            subtitle={`${stats.activeExperts ?? stats.experts ?? 0} active`}
          />
          <StatCard
            title="Shops"
            value={stats.shops || 0}
            icon={<Store size={20} />}
            color="purple"
            subtitle={`${stats.activeShops ?? stats.shops ?? 0} active`}
          />
          <StatCard
            title="Total Users"
            value={totalUsers}
            icon={<TrendingUp size={20} />}
            color="cyan"
          />
        </div>
      </section>

      {/* ──── Active Users + Recent Activity row ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-5">Active Users</h2>
          <div className="space-y-4">
            <ActiveBar
              label="Farmers"
              active={stats.activeFarmers ?? stats.farmers ?? 0}
              total={stats.farmers || 0}
              color="#10b981"
            />
            <ActiveBar
              label="Experts"
              active={stats.activeExperts ?? stats.experts ?? 0}
              total={stats.experts || 0}
              color="#3b82f6"
            />
            <ActiveBar
              label="Shops"
              active={stats.activeShops ?? stats.shops ?? 0}
              total={stats.shops || 0}
              color="#8b5cf6"
            />
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-5">Last 7 Days</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'New Farmers', val: recentActivity.recentUsers, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'New Experts', val: recentActivity.recentExperts, color: 'text-blue-600 bg-blue-50' },
              { label: 'Meetings', val: recentActivity.recentMeetings, color: 'text-violet-600 bg-violet-50' },
              { label: 'Diagnoses', val: recentActivity.recentDiagnoses, color: 'text-rose-600 bg-rose-50' },
            ].map((item) => (
              <div key={item.label} className={`rounded-xl p-4 ${item.color}`}>
                <p className="text-2xl font-semibold">{item.val}</p>
                <p className="text-xs mt-1 opacity-70">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ──── Content Stats ──── */}
      <section>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Content</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard title="Crops" value={stats.crops || 0} icon={<Sprout size={20} />} color="orange" />
          <StatCard title="Guides" value={stats.guides || 0} icon={<BookOpen size={20} />} color="cyan" />
          <StatCard title="Tips" value={stats.tips || 0} icon={<Lightbulb size={20} />} color="yellow" />
          <StatCard title="User Guides" value={stats.userGuides || 0} icon={<ClipboardCheck size={20} />} color="pink" />
        </div>
      </section>

      {/* ──── Charts ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Registration trend — wider */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Registration Trend</h2>
          <p className="text-xs text-gray-400 mb-4">Monthly new users by role</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="gFarm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gShop" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 13 }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Area type="monotone" dataKey="farmers" stroke="#10b981" strokeWidth={2} fill="url(#gFarm)" name="Farmers" />
              <Area type="monotone" dataKey="experts" stroke="#3b82f6" strokeWidth={2} fill="url(#gExp)" name="Experts" />
              <Area type="monotone" dataKey="shops" stroke="#8b5cf6" strokeWidth={2} fill="url(#gShop)" name="Shops" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution donut */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">User Distribution</h2>
          <p className="text-xs text-gray-400 mb-2">By role</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={userPieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {userPieData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 13 }}
              />
              <Legend
                iconType="circle"
                formatter={(val: string) => <span className="text-xs text-gray-500">{val}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

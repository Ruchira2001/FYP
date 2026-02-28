import { useEffect, useState } from 'react';
import { getDashboard } from '../services/api';
import StatCard from '../components/StatCard';
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

const PIE_COLORS = ['#16a34a', '#2563eb', '#9333ea', '#ea580c', '#dc2626', '#ca8a04'];

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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-red-500 py-8">Failed to load dashboard</div>;
  }

  const { stats, recentActivity, monthlyData } = data;

  const userPieData = [
    { name: 'Farmers', value: stats.farmers || 0 },
    { name: 'Experts', value: stats.experts || 0 },
    { name: 'Shops', value: stats.shops || 0 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Farmers" value={stats.farmers || 0} icon="🌾" color="green" />
        <StatCard title="Experts" value={stats.experts || 0} icon="🎓" color="blue" />
        <StatCard title="Shops" value={stats.shops || 0} icon="🏪" color="purple" />
        <StatCard title="Crops" value={stats.crops || 0} icon="🌿" color="orange" />
        <StatCard title="Guides" value={stats.guides || 0} icon="📖" color="cyan" />
        <StatCard title="Meetings" value={stats.meetings || 0} icon="📅" color="yellow" />
        <StatCard title="Diagnoses" value={stats.diagnoses || 0} icon="🔬" color="red" />
        <StatCard title="Products" value={stats.products || 0} icon="📦" color="pink" />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity (Last 7 Days)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{recentActivity.recentUsers}</p>
            <p className="text-xs text-gray-500 mt-1">New Farmers</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{recentActivity.recentExperts}</p>
            <p className="text-xs text-gray-500 mt-1">New Experts</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{recentActivity.recentMeetings}</p>
            <p className="text-xs text-gray-500 mt-1">New Meetings</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{recentActivity.recentDiagnoses}</p>
            <p className="text-xs text-gray-500 mt-1">Diagnoses</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Registrations */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Registrations</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="farmers" fill="#16a34a" name="Farmers" />
              <Bar dataKey="experts" fill="#2563eb" name="Experts" />
              <Bar dataKey="shops" fill="#9333ea" name="Shops" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">User Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userPieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {userPieData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

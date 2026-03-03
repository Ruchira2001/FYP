import { ReactNode } from 'react';

interface Props {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  trend?: string;
}

const bgMap: Record<string, string> = {
  green: 'bg-green-50 border-green-200',
  blue: 'bg-blue-50 border-blue-200',
  purple: 'bg-purple-50 border-purple-200',
  orange: 'bg-orange-50 border-orange-200',
  red: 'bg-red-50 border-red-200',
  yellow: 'bg-yellow-50 border-yellow-200',
  cyan: 'bg-cyan-50 border-cyan-200',
  pink: 'bg-pink-50 border-pink-200',
};

const iconBgMap: Record<string, string> = {
  green: 'bg-green-100 text-green-600',
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
  red: 'bg-red-100 text-red-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  cyan: 'bg-cyan-100 text-cyan-600',
  pink: 'bg-pink-100 text-pink-600',
};

export default function StatCard({ title, value, icon, color = 'green', trend }: Props) {
  return (
    <div className={`rounded-xl border p-5 ${bgMap[color] || bgMap.green}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {trend && <p className="text-xs mt-1 text-gray-400">{trend}</p>}
        </div>
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${iconBgMap[color] || iconBgMap.green}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

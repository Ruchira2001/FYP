import { ReactNode } from 'react';

interface Props {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  trend?: string;
}

export default function StatCard({ title, value, icon, color = 'green', trend }: Props) {
  const colorMap: Record<string, string> = {
    green: 'bg-green-50 text-green-600 border-green-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    pink: 'bg-pink-50 text-pink-600 border-pink-200',
  };

  return (
    <div className={`rounded-xl border p-5 ${colorMap[color] || colorMap.green}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-70">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && <p className="text-xs mt-1 opacity-60">{trend}</p>}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

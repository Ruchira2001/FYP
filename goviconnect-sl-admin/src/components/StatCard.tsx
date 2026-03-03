import { ReactNode } from 'react';

interface Props {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  subtitle?: string;
}

const accentMap: Record<string, string> = {
  green: 'text-emerald-600 bg-emerald-50',
  blue: 'text-blue-600 bg-blue-50',
  purple: 'text-violet-600 bg-violet-50',
  orange: 'text-amber-600 bg-amber-50',
  red: 'text-rose-600 bg-rose-50',
  yellow: 'text-yellow-600 bg-yellow-50',
  cyan: 'text-teal-600 bg-teal-50',
  pink: 'text-pink-600 bg-pink-50',
};

export default function StatCard({ title, value, icon, color = 'green', subtitle }: Props) {
  const accent = accentMap[color] || accentMap.green;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[13px] font-medium text-gray-400 tracking-wide">{title}</p>
          <p className="text-[28px] font-semibold text-gray-800 leading-tight">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

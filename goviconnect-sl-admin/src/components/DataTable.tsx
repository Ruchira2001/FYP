interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  actions?: (item: T) => React.ReactNode;
  minWidth?: string;
}

export default function DataTable<T extends { _id: string }>({
  columns,
  data,
  loading,
  actions,
  minWidth = 'min-w-[920px]',
}: Props<T>) {
  if (loading) {
    return (
      <div className="rounded-xl border border-emerald-100 bg-white/90 p-10 text-center text-slate-500 shadow-sm shadow-emerald-900/5">
        <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-2 border-emerald-100 border-t-emerald-600" />
        <p className="text-sm font-medium">Loading data...</p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 p-12 text-center text-sm text-slate-500">
        <p className="font-medium text-slate-600">No data found</p>
        <p className="mt-1 text-xs text-slate-400">Try changing the filters or search text.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
      <div className="overflow-x-auto">
        <table className={`w-full text-sm ${minWidth}`}>
          <thead>
            <tr className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-teal-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500"
                >
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3.5 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item._id}
                className="border-b border-slate-100 last:border-0 odd:bg-white even:bg-slate-50/45 transition-colors hover:bg-emerald-50/70"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5 align-top text-slate-700">
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key] ?? '-')}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3.5 text-right align-top">{actions(item)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

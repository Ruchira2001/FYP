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
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500 shadow-sm">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-green-200 border-t-green-600" />
        Loading data...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="bg-white rounded-lg border border-dashed border-gray-300 p-10 text-center text-sm text-gray-400">
        No data found
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className={`w-full text-sm ${minWidth}`}>
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item._id}
                className="border-b border-gray-100 last:border-0 hover:bg-green-50/40 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 align-top text-gray-700">
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key] ?? '-')}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 text-right align-top">{actions(item)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

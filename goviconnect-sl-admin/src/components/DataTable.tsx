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
}

export default function DataTable<T extends { _id: string }>({
  columns,
  data,
  loading,
  actions,
}: Props<T>) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
        No data found
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 font-medium text-gray-600"
                >
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className="text-right px-4 py-3 font-medium text-gray-600">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item._id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key] ?? '-')}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 text-right">{actions(item)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

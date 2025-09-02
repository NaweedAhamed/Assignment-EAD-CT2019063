export default function Table({ columns = [], data = [], rowKey = "id", actions }) {
  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
      <table className="min-w-full text-left">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-sm font-semibold text-gray-700 border-b">
                {col.header}
              </th>
            ))}
            {actions ? <th className="px-4 py-3 text-sm font-semibold text-gray-700 border-b">Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-gray-500" colSpan={columns.length + (actions ? 1 : 0)}>
                No records found.
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row[rowKey]} className="odd:bg-white even:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 border-b">
                    {typeof col.render === "function" ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {actions ? (
                  <td className="px-4 py-3 border-b">
                    {actions(row)}
                  </td>
                ) : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

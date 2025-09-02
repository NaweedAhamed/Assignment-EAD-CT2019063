export default function EmptyState({ title = "No data", subtitle = "Nothing to show yet.", action }) {
  return (
    <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg bg-white">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-gray-500 mt-1">{subtitle}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-600 flex items-center justify-between">
        <p>&copy; {year} Course Management</p>
        <p className="text-gray-500">
          Built with React & Tailwind
        </p>
      </div>
    </footer>
  );
}

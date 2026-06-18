export default function StatusBadge({ status }: { status: string }) {
  const colors: any = {
    Received: "bg-orange-500",
    "In Progress": "bg-blue-500",
    Completed: "bg-green-500",
  };

  return (
    <span className={`px-3 py-1 text-xs text-white rounded ${colors[status] || "bg-gray-500"}`}>
      {status}
    </span>
  );
}

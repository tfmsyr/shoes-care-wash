interface ServiceOrder {
  id: string;
  customer: string;
  service: string;
  status: "Pending" | "In Progress" | "Completed";
  date: string;
}

const orders: ServiceOrder[] = [
  { id: "SO-001", customer: "Budi Santoso", service: "AC Repair", status: "Completed", date: "2025-09-12" },
  { id: "SO-002", customer: "Siti Aminah", service: "Car Wash", status: "In Progress", date: "2025-09-14" },
  { id: "SO-003", customer: "Andi Wijaya", service: "Electrical Check", status: "Pending", date: "2025-09-15" },
];

function StatusBadge({ status }: { status: ServiceOrder["status"] }) {
  const color =
    status === "Completed"
      ? "bg-green-100 text-green-700"
      : status === "In Progress"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  );
}

export default function RecentServiceOrders() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Service Orders</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="pb-2">Order ID</th>
            <th className="pb-2">Customer</th>
            <th className="pb-2">Service</th>
            <th className="pb-2">Status</th>
            <th className="pb-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b last:border-0">
              <td className="py-2 font-medium">{order.id}</td>
              <td className="py-2">{order.customer}</td>
              <td className="py-2">{order.service}</td>
              <td className="py-2">
                <StatusBadge status={order.status} />
              </td>
              <td className="py-2 text-gray-500">{order.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

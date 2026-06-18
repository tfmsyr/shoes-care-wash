export default function CardDashboard({ title, value, trend }: { title: string; value: string; trend: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold">{value}</p>
      {trend && <span className={`text-xs ${trend.startsWith("+") ? "text-green-500" : "text-blue-500"}`}>{trend}</span>}
    </div>
  );
}

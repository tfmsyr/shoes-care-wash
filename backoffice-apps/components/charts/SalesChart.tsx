"use client";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", sales: 400 },
  { name: "Feb", sales: 300 },
  { name: "Mar", sales: 200 },
  { name: "Apr", sales: 278 },
  { name: "May", sales: 189 },
];

export default function SalesChart() {
  return (
    <div className="w-full h-64 bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Sales Overview</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} />
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Mon", revenue: 4000 },
  { name: "Tue", revenue: 3000 },
  { name: "Wed", revenue: 5000 },
  { name: "Thu", revenue: 2000 },
  { name: "Fri", revenue: 2780 },
  { name: "Sat", revenue: 1890 },
  { name: "Sun", revenue: 2390 },
];

export default function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

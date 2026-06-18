"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { ReportData } from "@/lib/report";

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);

export default function ServicesTab({ data }: { data: ReportData["services"] }) {
  const totalStatus = data.status_data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Pesanan Layanan</p>
          <h3 className="text-2xl font-black text-blue-600">{data.summary.total_service_order}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Penjualan Produk</p>
          <h3 className="text-2xl font-black text-blue-600">{data.summary.total_product_sale}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Pendapatan</p>
            <h3 className="text-2xl font-black text-green-500">{formatRupiah(data.summary.total_income)}</h3>
          </div>
          <div className="text-[10px] font-bold bg-gray-50 rounded-lg p-2 text-gray-400">Mingguan</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h4 className="font-bold text-gray-600">Tren Performa Layanan</h4>
            <div className="text-xs font-bold bg-gray-50 rounded-xl px-3 py-2 text-gray-500">Mingguan</div>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.performance_data} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill:'#94A3B8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill:'#94A3B8'}} />
                <Tooltip cursor={{fill: 'transparent'}} formatter={(value: number) => formatRupiah(value)} />
                <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={40}>
                  {data.performance_data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isHigh ? "#3B82F6" : "#E2E8F0"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <h4 className="font-bold text-gray-600 mb-6">Distribusi Status Pesanan</h4>
          
          <div className="h-56 relative mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={data.status_data} 
                  innerRadius={65} 
                  outerRadius={85} 
                  paddingAngle={5} 
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {data.status_data.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Total Nilai</span>
              <span className="text-3xl font-black text-gray-800">{totalStatus}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-3 mb-6">
            {data.status_data.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}} />
                <span className="text-[10px] font-bold text-gray-500">{item.name}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto border-t border-gray-50 pt-4">
            <div className="flex justify-between text-[11px] font-bold text-gray-400 mb-4 px-2">
               <span>Jenis Layanan</span>
               <span>Jumlah</span>
            </div>
            <div className="space-y-3">
              {data.order_trend.map((order, i) => (
                <div key={i} className="flex justify-between items-center text-[11px] font-bold bg-gray-50/50 p-2 rounded-lg">
                  <span className="text-gray-600">{order.type}</span>
                  <span className="text-gray-800">{order.count.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h4 className="font-bold text-gray-600 mb-6 px-2">Tren Pesanan</h4>
        <div className="space-y-1">
          {data.order_trend.map((item, i) => (
            <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <span className="text-xs font-bold text-gray-500">{item.type}</span>
              <span className="text-xs font-black text-gray-400 italic">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

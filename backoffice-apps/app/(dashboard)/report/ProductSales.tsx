"use client";

import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie 
} from "recharts";

// Data untuk Grafik Batang (Performa Mingguan)
const PERFORMANCE_DATA = [
  { day: "MON", total: 1600 },
  { day: "TUE", total: 800 },
  { day: "WED", total: 1700 },
  { day: "THU", total: 1000 },
  { day: "FRI", total: 2313, highlight: true }, // Jumat paling tinggi sesuai gambar
  { day: "SAT", total: 600 },
  { day: "SUN", total: 1400 },
];

// Data untuk Donut Chart (Distribusi Status)
const STATUS_DISTRIBUTION = [
  { name: "Completed", value: 40, color: "#4ADE80" },
  { name: "In Progress", value: 25, color: "#FB923C" },
  { name: "Received", value: 20, color: "#3B82F6" },
  { name: "Cancelled", value: 15, color: "#EF4444" },
];

export default function ServicesTab() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. TOP SUMMARY - Versi Web Horizontal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Service Order</p>
          <h3 className="text-3xl font-black text-[#1E2B5F]">25</h3>
        </div>
        <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Product Sale</p>
          <h3 className="text-3xl font-black text-[#1E2B5F]">25</h3>
        </div>
        <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Income</p>
            <h3 className="text-3xl font-black text-green-500">Rp 125k</h3>
          </div>
          <div className="bg-gray-50 px-3 py-1 rounded-lg text-[10px] font-bold text-gray-400 border border-gray-100">Daily ▾</div>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID (2 Kolom di Web) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 italic">
        
        {/* KOLOM KIRI: Service Performance Trend */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h4 className="text-lg font-black text-gray-700">Service Performance Trend</h4>
            <div className="bg-gray-50 px-4 py-2 rounded-2xl text-xs font-black text-gray-400 border border-gray-100 cursor-pointer">
              Weekly ▾
            </div>
          </div>

          <div className="h-87.5 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PERFORMANCE_DATA} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 800, fill: '#94A3B8' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 800, fill: '#94A3B8' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#1E2B5F] text-white p-3 rounded-2xl shadow-xl border-none">
                          <p className="text-xs font-black">{payload[0].value.toLocaleString()}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="total" radius={[12, 12, 12, 12]} barSize={45}>
                  {PERFORMANCE_DATA.map((entry, index) => (
                    <Cell key={index} fill={entry.highlight ? "#3B82F6" : "#DBEAFE"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tabel Order Trend (Pindah ke bawah grafik di versi Web) */}
          <div className="mt-10 pt-8 border-t border-gray-50">
            <h5 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 px-2">Popular Service Type</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Wash", val: "120" },
                { label: "Deep Clean", val: "50" },
                { label: "Midsole", val: "25" },
                { label: "Repaint", val: "15" }
              ].map((item, i) => (
                <div key={i} className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-black text-gray-600">{item.label}</span>
                  <span className="text-xs font-black text-gray-400">{item.val} Orders</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: Order Status Distribution */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm flex flex-col">
          <h4 className="text-lg font-black text-gray-700 mb-8">Order Status Distribution</h4>
          
          <div className="h-64 relative mb-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={STATUS_DISTRIBUTION} 
                  innerRadius={75} 
                  outerRadius={100} 
                  paddingAngle={8} 
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {STATUS_DISTRIBUTION.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Total Value</span>
              <span className="text-4xl font-black text-[#1E2B5F]">72</span>
            </div>
          </div>

          {/* Legend & Detail List */}
          <div className="space-y-4 grow">
            {STATUS_DISTRIBUTION.map((status, i) => (
              <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-gray-50/30 border border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                  <span className="text-xs font-black text-gray-600 uppercase tracking-wide">{status.name}</span>
                </div>
                <span className="text-xs font-black text-[#1E2B5F]">{status.value}%</span>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50/50 rounded-3xl border border-blue-100">
             <div className="flex justify-between items-center italic">
                <span className="text-[10px] font-black text-blue-400 uppercase">Service Issues</span>
                <span className="text-[10px] font-black text-blue-600 underline">View Details</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
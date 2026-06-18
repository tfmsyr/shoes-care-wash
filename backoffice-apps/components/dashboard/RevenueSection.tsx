"use client";
import { useState } from "react";
import { TrendingUp } from "lucide-react"; // ganti heroicons
import { Card } from "@/components/ui/card";

type RevenueKey = "today" | "week" | "month";

const revenueData: Record<
  RevenueKey,
  { amount: number; label: string; subtitle: string; change?: number; compare?: string }
> = {
  today: {
    amount: 250000,
    label: "Today's Revenue",
    subtitle: "Compared to Yesterday",
    change: 12,
    compare: "from Yesterday",
  },
  week: {
    amount: 7000000,
    label: "This Week",
    subtitle: "7 Days Total",
  },
  month: {
    amount: 12000000,
    label: "This Month",
    subtitle: "4 Weeks Total",
  },
};

export default function RevenueSection() {
  const [tab, setTab] = useState<RevenueKey>("today");

  const data = revenueData[tab];

  return (
    <Card className="p-6">
      {/* Header + Tabs */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Total revenue generated</h3>
        <div className="flex gap-1 rounded-full bg-slate-100 p-1">
          {(["today", "week", "month"] as RevenueKey[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1 text-sm transition ${
                tab === t ? "bg-white shadow-sm" : "hover:bg-white/70"
              }`}
            >
              {revenueData[t].label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {/* Left section */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-2xl font-semibold">
            Rp {data.amount.toLocaleString("id-ID")}
          </div>
          {data.change !== undefined && (
            <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              +{data.change}%{" "}
              {data.compare && (
                <span className="text-slate-500">{data.compare}</span>
              )}
            </div>
          )}
        </div>

        {/* Right section */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-slate-500">{data.label}</div>
          <div className="text-2xl font-semibold">
            Rp {data.amount.toLocaleString("id-ID")}
          </div>
          <div className="text-sm text-slate-500">{data.subtitle}</div>
        </div>
      </div>
    </Card>
  );
}

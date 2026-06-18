"use client";

import { Card } from "@/components/ui/card";

export default function RevenueBreakdown() {
  // dummy data
  const data = {
    services: 150000,
    product: 70000,
    totalOrders: 25,
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold">Revenue Breakdown</h3>
      <p className="text-xs text-slate-500 mb-4">Today’s income sources</p>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span>🧰</span>
            <span>Services</span>
          </div>
          <span className="font-medium">
            Rp {data.services.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span>📦</span>
            <span>Product</span>
          </div>
          <span className="font-medium">
            Rp {data.product.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="border-t pt-3 mt-3 flex items-center justify-between text-sm text-slate-600">
          <span>Total Orders</span>
          <span>{data.totalOrders}</span>
        </div>
      </div>
    </Card>
  );
}

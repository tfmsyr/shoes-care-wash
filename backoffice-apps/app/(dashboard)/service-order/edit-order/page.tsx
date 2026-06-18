"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { serviceOrderApi } from "@/lib/service-order";
import { getCustomers, Customer } from "@/lib/customer";
import { searchServices } from "@/lib/servis-management";
import StatusToast from "@/components/ui/StatusToast";
import { saveFlashToast } from "@/lib/flash-toast";

interface ServiceItemForm {
  service_id: string;
  price: number;
  qty: number;
}

function EditOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    order_number: "",
    customer_id: "",
    discount: "" as number | string,
    status: "received",
    notes: "",
    items: [] as ServiceItemForm[],
  });

  useEffect(() => {
    const initData = async () => {
      if (!orderId) return;

      try {
        setIsLoading(true);

        const [resCust, resServ, resOrder] = await Promise.all([
          getCustomers(),
          searchServices({ size: 100 }),
          serviceOrderApi.getById(orderId),
        ]);

        if (Array.isArray(resCust)) setCustomers(resCust);
        else if ((resCust as any)?.data) setCustomers((resCust as any).data);

        if (resServ?.data) setAvailableServices(resServ.data);
        else if (Array.isArray(resServ)) setAvailableServices(resServ);

        const orderData = resOrder?.data || resOrder;
        if (orderData) {
          setFormData({
            order_number: orderData.order_number || "",
            customer_id: orderData.customer_id?.toString() || "",
            discount: orderData.discount || 0,
            status: orderData.status || "received",
            notes: orderData.notes || "",
            items: (orderData.details || []).map((d: any) => ({
              service_id: d.service_id?.toString(),
              price: Number(d.price),
              qty: Number(d.quantity || d.qty),
            })),
          });
        }
      } catch (error) {
        console.error("Gagal load data:", error);
        setToast({
          type: "error",
          text: "Gagal mengambil data order.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [orderId]);

  const addServiceItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { service_id: "", price: 0, qty: 1 }],
    });
  };

  const updateItem = (index: number, serviceId: string) => {
    const selectedService = availableServices.find(
      (s: any) => s.id.toString() === serviceId,
    );
    const newItems = [...formData.items];
    newItems[index] = {
      service_id: serviceId,
      price: selectedService ? Number(selectedService.price || 0) : 0,
      qty: 1,
    };
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce(
      (acc, item) => acc + item.price * item.qty,
      0,
    );
    const discountPercent = Number(formData.discount) || 0;
    const discountAmount = (subtotal * discountPercent) / 100;
    return subtotal - discountAmount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderId) return;
    if (formData.items.length === 0) {
      setToast({
        type: "error",
        text: "Harap tambahkan minimal satu layanan.",
      });
      return;
    }

    try {
      const payload = {
        customer_id: Number(formData.customer_id),
        discount: Number(formData.discount) || 0,
        status: formData.status,
        notes: formData.notes,
        services: formData.items.map((item) => ({
          service_id: Number(item.service_id),
          quantity: Number(item.qty),
          price: Number(item.price),
        })),
      };

      await serviceOrderApi.update(orderId, payload as any);
      saveFlashToast({
        type: "success",
        text: "Service order berhasil diperbarui.",
      });
      router.push("/service-order");
    } catch (error: any) {
      setToast({
        type: "error",
        text: error.message || "Gagal memperbarui service order.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <Loader2 className="animate-spin text-blue-900" size={40} />
        <p className="text-gray-500 font-medium">Sedang memuat data order...</p>
      </div>
    );
  }

  return (
    <div
      className="p-6 md:p-8 bg-gray-50/50 min-h-screen font-sans w-full"
      style={{ fontFamily: "var(--font-plus-jakarta-sans), Arial, Helvetica, sans-serif" }}
    >
      <StatusToast toast={toast} onClose={() => setToast(null)} />

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 w-full">
        <h2 className="text-lg font-bold text-gray-900 mb-6">
          Edit Order: {formData.order_number}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Order Number
            </label>
            <input
              type="text"
              value={formData.order_number}
              readOnly
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Customer
            </label>
            <select
              required
              value={formData.customer_id}
              onChange={(e) =>
                setFormData({ ...formData, customer_id: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
            >
              <option value="">Select Customer</option>
              {customers.map((cust) => (
                <option key={cust.id} value={cust.id}>
                  {cust.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Services Items ({formData.items.length})
            </label>
            {formData.items.map((item, index) => (
              <div
                key={index}
                className="flex gap-2 animate-in fade-in zoom-in duration-200"
              >
                <select
                  required
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm"
                  value={item.service_id}
                  onChange={(e) => updateItem(index, e.target.value)}
                >
                  <option value="">Pilih Layanan</option>
                  {availableServices.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - Rp {Number(s.price).toLocaleString()}
                    </option>
                  ))}
                </select>
                <div className="w-20">
                  <input
                    type="number"
                    className="w-full px-2 py-2 border border-gray-200 rounded-xl text-center"
                    value={item.qty}
                    min="1"
                    onChange={(e) => {
                      const newItems = [...formData.items];
                      newItems[index].qty = Number(e.target.value);
                      setFormData({ ...formData, items: newItems });
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const filtered = formData.items.filter((_, i) => i !== index);
                    setFormData({ ...formData, items: filtered });
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addServiceItem}
              className="w-full py-3 border-dashed border-2 border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50 transition-all text-sm font-medium"
            >
              <Plus size={16} /> Add Service Item
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) =>
                  setFormData({ ...formData, discount: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
              >
                <option value="received">Received</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl min-h-25"
            />
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-100">
            <div className="text-xl font-bold text-[#1E2B5F]">
              Total : Rp {calculateTotal().toLocaleString()}
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link href="/service-order" className="flex-1">
                <button
                  type="button"
                  className="w-full px-8 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                className="flex-1 px-8 py-2.5 bg-[#1E2B5F] text-white rounded-xl font-semibold hover:bg-[#15204d] transition-colors shadow-lg"
              >
                Update Order
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditServiceOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="animate-spin text-blue-900" size={40} />
        </div>
      }
    >
      <EditOrderForm />
    </Suspense>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { LayoutGrid, Boxes } from "lucide-react";

export default function ProductPage() {
  const router = useRouter();

  const menus = [
    {
      id: 1,
      title: "Product Categories",
      description: "Manage product categories for easy organization.",
      icon: <LayoutGrid className="w-8 h-8 text-blue-600" />,
      href: "/products/product-categori",
      color: "bg-blue-50 hover:bg-blue-100",
    },
    {
      id: 2,
      title: "Product Management",
      description: "Add, edit, and manage all your products.",
      icon: <Boxes className="w-8 h-8 text-green-600" />,
      href: "/products/product-mangement",
      color: "bg-green-50 hover:bg-green-100",
    },
  ];

  return (
    <div
      className="p-8"
      style={{ fontFamily: "var(--font-plus-jakarta-sans), Arial, Helvetica, sans-serif" }}
    >
      {/* Header */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-8">
        Product Menu
      </h1>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {menus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => router.push(menu.href)}
            className={`flex flex-col items-start p-6 rounded-xl border shadow-sm transition-all text-left ${menu.color}`}
          >
            <div className="flex items-center gap-3 mb-3">
              {menu.icon}
              <h2 className="text-lg font-semibold text-gray-800">
                {menu.title}
              </h2>
            </div>
            <p className="text-sm text-gray-600">{menu.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

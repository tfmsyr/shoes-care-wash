"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, LogOut, User } from "lucide-react";

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    // Bersihkan data auth dari localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("company");

    // Redirect ke login
    router.push("/login");
  };

  return (
    <div className="relative">
      {/* Avatar Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <UserCircle className="w-8 h-8 text-gray-600" />
        <div className="text-left hidden md:block">
          <p className="text-sm font-medium">Budi Santoso</p>
          <p className="text-xs text-gray-500">Owner</p>
        </div>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-50">
          <button
            onClick={() => {
              setOpen(false);
              router.push("/my-profile");
            }}
            className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100"
          >
            <User className="w-4 h-4 mr-2" /> My Profile
          </button>
          <button
            onClick={() => {
              setOpen(false);
              handleLogout();
            }}
            className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 text-red-600"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </button>
        </div>
      )}
    </div>
  );
}

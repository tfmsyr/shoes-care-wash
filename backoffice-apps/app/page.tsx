"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);
  return (
    <main className="flex h-screen items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </main>
  );
}

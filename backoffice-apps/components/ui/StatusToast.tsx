"use client";

import React, { useEffect } from "react";

type StatusToastProps = {
  toast: {
    type: "success" | "error";
    text: string;
  } | null;
  onClose: () => void;
};

function CloseIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

export default function StatusToast({ toast, onClose }: StatusToastProps) {
  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      onClose();
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex min-w-75 max-w-md items-start justify-between rounded-lg px-6 py-3 text-sm font-medium shadow-md animate-in slide-in-from-top-5 fade-in duration-300 ${
        toast.type === "success"
          ? "bg-[#e6f4ea] text-[#1e8e3e]"
          : "bg-[#fce8e6] text-[#c5221f]"
      }`}
    >
      <div className="pr-6" style={{ whiteSpace: "pre-line" }}>
        {toast.text}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="ml-4 opacity-70 transition-opacity hover:opacity-100"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

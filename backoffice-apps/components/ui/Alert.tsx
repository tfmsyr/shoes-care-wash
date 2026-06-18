// components/ui/Alert.tsx
"use client";

interface AlertProps {
  type: "success" | "error";
  message: string;
}

export default function Alert({ type, message }: AlertProps) {
  const base = "mb-4 p-3 rounded-md text-sm border";
  const styles =
    type === "success"
      ? "bg-green-100 border-green-300 text-green-800"
      : "bg-red-100 border-red-300 text-red-800";

  return <div className={`${base} ${styles}`}>{message}</div>;
}

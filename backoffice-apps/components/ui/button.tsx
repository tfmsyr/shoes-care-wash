"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "sm" | "default" | "lg" | "icon" // ✅ tambahkan icon di sini
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants: Record<string, string> = {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      outline:
        "border border-gray-300 text-gray-700 bg-white hover:bg-gray-100",
      ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
      destructive: "bg-red-600 text-white hover:bg-red-700",
    }

    const sizes: Record<string, string> = {
      sm: "h-8 px-3 text-xs",
      default: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-lg",
      icon: "h-10 w-10", // ✅ tombol berbentuk kotak untuk ikon saja
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button }

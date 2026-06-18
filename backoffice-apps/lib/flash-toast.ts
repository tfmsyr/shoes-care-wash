"use client";

export type FlashToast = {
  type: "success" | "error";
  text: string;
};

const FLASH_TOAST_KEY = "backoffice_flash_toast";

export function saveFlashToast(toast: FlashToast) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(FLASH_TOAST_KEY, JSON.stringify(toast));
}

export function popFlashToast(): FlashToast | null {
  if (typeof window === "undefined") return null;

  const rawToast = sessionStorage.getItem(FLASH_TOAST_KEY);
  if (!rawToast) return null;

  sessionStorage.removeItem(FLASH_TOAST_KEY);

  try {
    return JSON.parse(rawToast) as FlashToast;
  } catch {
    return null;
  }
}

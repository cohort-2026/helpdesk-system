import { useState } from "react";
import Toast, { type ToastType } from "../components/ui/Toast";

/**
 * Helper hook for managing toast notifications.
 * Returns { toastElement, showToast }.
 */
export const useToast = () => {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type });
  };

  const toastElement = toast ? (
    <Toast
      message={toast.message}
      type={toast.type}
      onClose={() => setToast(null)}
    />
  ) : null;

  return { toastElement, showToast };
};

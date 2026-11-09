import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const iconMap: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

const colorMap: Record<
  ToastType,
  { bg: string; border: string; text: string; icon: string }
> = {
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-400",
    text: "text-emerald-800",
    icon: "bg-emerald-500 text-white",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-400",
    text: "text-red-800",
    icon: "bg-red-500 text-white",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-400",
    text: "text-amber-800",
    icon: "bg-amber-500 text-white",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-400",
    text: "text-blue-800",
    icon: "bg-blue-500 text-white",
  },
};

const Toast = ({ message, type = "info", duration = 4000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const colors = colorMap[type];

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setIsVisible(true));

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`
        fixed top-5 right-5 z-[9999] flex items-center gap-3 
        rounded-lg border px-4 py-3 shadow-lg min-w-[320px] max-w-[460px]
        transition-all duration-300 ease-out
        ${colors.bg} ${colors.border}
        ${isVisible && !isExiting ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}
      `}
      role="alert"
    >
      {/* Icon */}
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${colors.icon}`}
      >
        {iconMap[type]}
      </span>

      {/* Message */}
      <p className={`text-sm font-medium flex-1 ${colors.text}`}>{message}</p>

      {/* Close button */}
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(onClose, 300);
        }}
        className={`ml-2 shrink-0 rounded p-1 transition-colors hover:bg-black/5 ${colors.text}`}
        aria-label="Close notification"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;

/**
 * Helper hook for managing toast notifications.
 * Returns a [toast, showToast] tuple.
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

"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from "lucide-react";

type NotificationType = "success" | "error" | "warning" | "info" | "loading";

interface NotificationToastProps {
  type?: NotificationType;
  message: string;
  duration?: number;
  onClose?: () => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
  loading: Loader2,
};

const colors = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-100",
  error: "bg-red-50 border-red-200 text-red-900 dark:bg-red-900/30 dark:border-red-700 dark:text-red-100",
  warning: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-100",
  info: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-100",
  loading: "bg-slate-50 border-slate-200 text-slate-900 dark:bg-slate-900/30 dark:border-slate-700 dark:text-slate-100",
};

const iconColors = {
  success: "text-emerald-600 dark:text-emerald-400",
  error: "text-red-600 dark:text-red-400",
  warning: "text-amber-600 dark:text-amber-400",
  info: "text-blue-600 dark:text-blue-400",
  loading: "text-slate-600 dark:text-slate-400",
};

export function NotificationToast({
  type = "success",
  message,
  duration = 5000,
  onClose,
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Don't auto-close loading notifications
    if (type === "loading") return;

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose, type]);

  if (!isVisible) return null;

  const Icon = icons[type];
  const isLoading = type === "loading";

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out ${
        isExiting ? "opacity-0 translate-x-full scale-95" : "opacity-100 translate-x-0 scale-100"
      }`}
    >
      <div
        className={`flex items-center gap-3 px-5 py-4 rounded-xl border shadow-xl backdrop-blur-sm ${colors[type]}`}
        role="alert"
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${iconColors[type]} ${isLoading ? "animate-spin" : ""}`} />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}

// Hook to manage notifications
export function useNotification() {
  const [notification, setNotification] = useState<{
    type: NotificationType;
    message: string;
  } | null>(null);

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({ type, message });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  const NotificationComponent = (
    <>
      {notification?.type === "loading" ? (
        <div
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[1px]"
          aria-busy="true"
          aria-live="polite"
        />
      ) : null}
      {notification ? (
        <NotificationToast
          type={notification.type}
          message={notification.message}
          onClose={hideNotification}
        />
      ) : null}
    </>
  );

  return {
    showNotification,
    hideNotification,
    NotificationComponent,
  };
}
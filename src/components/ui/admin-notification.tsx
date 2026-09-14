"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, Loader2, X } from "lucide-react";

type NotificationType = "success" | "error" | "warning" | "info" | "loading";

interface AdminNotificationProps {
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
  success: "bg-emerald-50 border-emerald-200 text-emerald-900",
  error: "bg-red-50 border-red-200 text-red-900",
  warning: "bg-amber-50 border-amber-200 text-amber-900",
  info: "bg-blue-50 border-blue-200 text-blue-900",
  loading: "bg-slate-50 border-slate-200 text-slate-900",
};

const iconColors = {
  success: "text-emerald-600",
  error: "text-red-600",
  warning: "text-amber-600",
  info: "text-blue-600",
  loading: "text-slate-600",
};

export function AdminNotification({
  type = "success",
  message,
  duration = 6000,
  onClose,
}: AdminNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  useEffect(() => {
    // Don't auto-close loading notifications
    if (type === "loading") return;

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, type]);

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
        className={`flex items-center justify-between gap-4 px-5 py-4 rounded-xl border shadow-xl backdrop-blur-sm ${colors[type]}`}
        role="alert"
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 flex-shrink-0 ${iconColors[type]} ${isLoading ? "animate-spin" : ""}`} />
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Close notification"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Hook to manage notifications
export function useAdminNotification() {
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
        <AdminNotification
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

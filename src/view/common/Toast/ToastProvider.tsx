import React, { createContext, useContext, useMemo, useState } from "react";

type Toast = {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
};

type ToastContextValue = {
  show: (opts: {
    message: string;
    type?: Toast["type"];
    duration?: number;
  }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = ({
    message,
    type = "info",
    duration = 4000,
  }: {
    message: string;
    type?: Toast["type"];
    duration?: number;
  }) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const t: Toast = { id, message, type, duration };
    setToasts((s) => [t, ...s]);
    setTimeout(() => {
      setToasts((s) => s.filter((x) => x.id !== id));
    }, duration);
  };

  const ctx = useMemo(() => ({ show }), []);

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-xs">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-lg px-4 py-3 shadow-lg text-sm animate-slide-in ${t.type === "success" ? "bg-emerald-500 text-white" : t.type === "error" ? "bg-red-500 text-white" : "bg-gray-800 text-white"}`}
          >
            {t.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn { from { transform: translateY(-8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        .animate-slide-in { animation: slideIn 200ms ease; }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

export default ToastProvider;

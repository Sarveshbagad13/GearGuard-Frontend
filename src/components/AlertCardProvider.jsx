import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

const AUTO_DISMISS_MS = 4200;

const AlertCardProvider = () => {
  const [alerts, setAlerts] = useState([]);
  const idRef = useRef(0);

  useEffect(() => {
    const originalAlert = window.alert;

    window.alert = (message) => {
      const text = String(message ?? '').trim() || 'Notification';
      const nextId = ++idRef.current;

      const nextAlert = {
        id: nextId,
        message: text,
        variant: /failed|error|invalid|unable|denied|unavailable/i.test(text) ? 'error' : 'success',
      };

      setAlerts((prev) => [...prev, nextAlert]);
    };

    return () => {
      window.alert = originalAlert;
    };
  }, []);

  useEffect(() => {
    if (alerts.length === 0) return undefined;

    const timers = alerts.map((item) =>
      window.setTimeout(() => {
        setAlerts((prev) => prev.filter((entry) => entry.id !== item.id));
      }, AUTO_DISMISS_MS)
    );

    return () => {
      timers.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, [alerts]);

  const dismiss = (id) => {
    setAlerts((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-120 w-[min(92vw,22rem)] space-y-3 pointer-events-none">
      {alerts.map((item) => {
        const isError = item.variant === 'error';
        const Icon = isError ? AlertCircle : CheckCircle2;

        return (
          <div
            key={item.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-xl backdrop-blur-sm animate-fadeInRight ${
              isError
                ? 'bg-red-950/90 border-red-500/50 shadow-red-500/20'
                : 'bg-emerald-950/90 border-emerald-500/40 shadow-emerald-500/20'
            }`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${isError ? 'text-red-300' : 'text-emerald-300'}`} />
              <p className="text-sm leading-5 text-gray-100 flex-1">{item.message}</p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AlertCardProvider;

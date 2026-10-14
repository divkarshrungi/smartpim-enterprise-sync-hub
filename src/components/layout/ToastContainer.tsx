import React from 'react';
import { usePim } from '../../context/PimContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = usePim();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bgStyle = 'bg-slate-900 text-white border-slate-700';
        let icon = 'check_circle';
        let iconColor = 'text-emerald-400';

        if (toast.type === 'warning') {
          bgStyle = 'bg-amber-900 text-amber-50 border-amber-700';
          icon = 'warning';
          iconColor = 'text-amber-300';
        } else if (toast.type === 'error') {
          bgStyle = 'bg-rose-950 text-rose-50 border-rose-800';
          icon = 'error';
          iconColor = 'text-rose-400';
        } else if (toast.type === 'info') {
          bgStyle = 'bg-slate-800 text-slate-100 border-slate-700';
          icon = 'info';
          iconColor = 'text-indigo-300';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 p-3 rounded-lg border shadow-xl transition-all duration-200 transform translate-y-0 text-xs ${bgStyle}`}
          >
            <span className={`material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5 ${iconColor}`}>
              {icon}
            </span>
            <div className="flex-1">
              {toast.title && <div className="font-semibold">{toast.title}</div>}
              <div>{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 ml-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};

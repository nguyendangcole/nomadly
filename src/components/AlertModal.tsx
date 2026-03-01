import React from 'react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export default function AlertModal({ isOpen, onClose, title, message, type = 'info' }: AlertModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-y2k-green text-black border-black';
      case 'error':
        return 'bg-red-500 text-white border-black';
      case 'warning':
        return 'bg-y2k-yellow text-black border-black';
      default:
        return 'bg-y2k-blue text-white border-black';
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 min-h-screen">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-4 border-black dark:border-white shadow-[12px_12px_0_#000] dark:shadow-[12px_12px_0_#fff] max-w-md w-full mx-4 p-8 relative animate-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${getColors()} rounded-2xl flex items-center justify-center shadow-[4px_4px_0_#000]`}>
              <span className="material-symbols-outlined text-2xl">{getIcon()}</span>
            </div>
            <h3 className="text-2xl font-black dark:text-white font-bold italic uppercase">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-black bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="text-center">
          <p className="text-lg text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <button
            onClick={onClose}
            className={`px-6 py-3 rounded-full text-lg font-black uppercase italic border-4 border-black shadow-[4px_4px_0_#000] hover:scale-105 transition-transform ${getColors()}`}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

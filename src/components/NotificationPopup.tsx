import React from 'react';

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export default function NotificationPopup({ isOpen, onClose, title, message, type }: NotificationPopupProps) {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          border: 'border-green-600',
          text: 'text-white',
          icon: 'check_circle'
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          border: 'border-red-600',
          text: 'text-white',
          icon: 'error'
        };
      case 'warning':
        return {
          bg: 'bg-y2k-yellow',
          border: 'border-yellow-600',
          text: 'text-black',
          icon: 'warning'
        };
      default:
        return {
          bg: 'bg-primary',
          border: 'border-primary/80',
          text: 'text-black',
          icon: 'info'
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`${colors.bg} ${colors.border} ${colors.text} border-4 border-black max-w-md w-full p-6 rounded-2xl shadow-[8px_8px_0_#000] relative animate-bounce-in`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl">
              {colors.icon}
            </span>
            <h3 className="text-xl font-black italic uppercase">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-all hover:scale-110"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Message */}
        <p className="font-bold text-lg leading-relaxed">
          {message}
        </p>

        {/* Action Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-black/20 hover:bg-black/40 px-6 py-2 rounded-full font-black text-sm border-2 border-black/50 transition-all hover:scale-105"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

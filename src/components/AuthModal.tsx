import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}

export default function AuthModal({ isOpen, onClose, message }: AuthModalProps) {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-900 border-4 border-black dark:border-white rounded-3xl p-8 max-w-sm w-full shadow-[8px_8px_0_#000] dark:shadow-[8px_8px_0_#fff] y2k-card animate-in fade-in zoom-in duration-200">
                <h3 className="text-3xl font-black uppercase italic mb-4 text-slate-900 dark:text-white">Oops! 🔒</h3>
                <p className="text-slate-600 dark:text-slate-300 font-bold mb-8 text-lg leading-snug">{message}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => navigate('/auth')}
                        className="flex-1 y2k-button bg-primary text-black px-6 py-3 rounded-xl font-black uppercase tracking-wider border-2 border-black shadow-[4px_4px_0_#000]"
                    >
                        Log In Now
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 font-bold text-slate-500 hover:text-black dark:hover:text-white transition-colors"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
}

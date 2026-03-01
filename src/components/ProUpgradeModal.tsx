import React, { useState } from 'react';
import AlertModal from './AlertModal';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProUpgradeModal({ isOpen, onClose }: ProUpgradeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Gửi request lên admin (mock implementation)
      console.log('Pro upgrade request:', { email, message });
      
      // Hiển thị success modal
      setAlertModal({
        isOpen: true,
        title: 'Request Sent!',
        message: '🎉 Your Pro upgrade request has been sent successfully! We\'ll review your request and contact you soon.\n\nThank you for your interest in Nomadly Pro!',
        type: 'success'
      });
      
      // Reset form
      setEmail('');
      setMessage('');
      setTimeout(() => {
        setAlertModal(null);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error sending request:', error);
      setAlertModal({
        isOpen: true,
        title: 'Request Failed',
        message: '❌ Failed to send your request. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 min-h-screen">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-4 border-black dark:border-white shadow-[12px_12px_0_#000] dark:shadow-[12px_12px_0_#fff] max-w-2xl w-full mx-4 p-8 relative animate-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black dark:text-white font-bold italic uppercase">
            🚀 Request <span className="text-transparent bg-clip-text bg-gradient-to-r from-y2k-pink to-primary text-primary">Nomadly Pro</span>
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-black bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-y2k-pink rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0_#000]">
              <span className="material-symbols-outlined text-3xl text-black">workspace_premium</span>
            </div>
            <h4 className="text-xl font-black dark:text-white font-bold mb-2">
              Request Pro Access
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Submit your request and we'll review it for Pro upgrade
            </p>
          </div>

          {/* Request Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-black dark:text-white font-bold mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-black rounded-xl bg-white dark:bg-slate-800 dark:text-white font-bold focus:ring-4 focus:ring-primary/50 transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-black dark:text-white font-bold mb-2">
                Why do you want Pro?
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-3 border-2 border-black rounded-xl bg-white dark:bg-slate-800 dark:text-white font-bold focus:ring-4 focus:ring-primary/50 transition-colors resize-none"
                placeholder="Tell us why you'd like to upgrade to Pro..."
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-y2k-pink text-black px-8 py-4 rounded-full text-lg font-black uppercase italic border-4 border-black shadow-[4px_4px_0_#000] hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                    Sending...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined mr-2">send</span>
                    Send Request
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            <p>🎉 We'll review your request within 24-48 hours</p>
            <p className="mt-2">Current free users enjoy all core features!</p>
          </div>
        </div>
      </div>
      
      {/* Alert Modal */}
      {alertModal && (
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={() => setAlertModal(null)}
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
        />
      )}
    </div>
  );
}

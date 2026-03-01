import React, { useState } from 'react';
import { useTravel } from '../context/TravelContext';
import NotificationPopup from './NotificationPopup';

interface TravelBuddyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  trip: any;
  currentUser: any;
}

export default function TravelBuddyDialog({ isOpen, onClose, trip, currentUser }: TravelBuddyDialogProps) {
  const { user, createTravelBuddyRequest } = useTravel();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({ isOpen: true, title, message, type });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentUser) return;

    setIsSubmitting(true);
    try {
      await createTravelBuddyRequest({
        tripId: trip.id,
        requesterId: currentUser.id,
        message: message.trim(),
      });
      
      // Show success notification
      showNotification('Success!', 'Travel buddy request sent successfully! 🎉', 'success');
      onClose();
      setMessage('');
    } catch (error) {
      console.error('Error sending buddy request:', error);
      showNotification('Error!', 'Failed to send request. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !trip || !currentUser) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border-4 border-black dark:border-white max-w-md w-full p-6 rounded-2xl shadow-[8px_8px_0_#000] dark:shadow-[8px_8px_0_#fff] relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black italic uppercase text-black dark:text-white">
            🤝 Invite Travel Buddy
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-black text-white rounded-full hover:bg-white hover:text-black border-2 border-black transition-all hover:scale-110 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Trip Info */}
        <div className="mb-6 p-4 bg-y2k-pink/20 border-2 border-y2k-pink rounded-xl">
          <h3 className="font-black text-lg mb-2 text-black dark:text-white">
            🌍 {trip.title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {trip.destinationSummary}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            📅 {trip.startDate} - {trip.endDate}
          </p>
        </div>

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-black uppercase mb-2 text-black dark:text-white">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hey! I'm planning this trip and would love for you to join me. Let's explore together! 🎒✈️"
              className="w-full p-3 border-2 border-black dark:border-white rounded-xl font-bold resize-none h-24 focus:outline-none focus:ring-4 focus:ring-primary/30 bg-white dark:bg-slate-800 text-black dark:text-white"
              required
            />
          </div>

          {/* User Preview */}
          <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <img
              src={currentUser.avatar || '/assets/default-avatar.png'}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full border-2 border-black"
            />
            <div className="flex-1">
              <p className="font-black text-sm text-black dark:text-white">
                {currentUser.name}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Sending invitation...
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-black dark:text-white rounded-xl font-bold border-2 border-black dark:border-white hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="flex-1 px-4 py-3 bg-primary text-black rounded-xl font-bold border-2 border-black hover:bg-primary/80 transition-all shadow-[2px_2px_0_#000] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  Sending...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">send</span>
                  Send Invite
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-4 p-3 bg-y2k-yellow/20 border border-y2k-yellow rounded-lg">
          <p className="text-xs text-black dark:text-white font-bold">
            💡 Tip: Personalize your message to increase your chances of finding the perfect travel buddy!
          </p>
        </div>
      </div>

      {/* Notification Popup */}
      <NotificationPopup
        isOpen={notification.isOpen}
        onClose={closeNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}

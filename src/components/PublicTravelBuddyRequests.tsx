import React, { useState, useEffect } from 'react';
import { useTravel } from '../context/TravelContext';
import type { TravelBuddyRequest } from '../context/TravelContext';
import TravelBuddyDialog from './TravelBuddyDialog';
import NotificationPopup from './NotificationPopup';

interface PublicTravelBuddyRequestsProps {
  tripId: string;
  currentUser: any;
}

export default function PublicTravelBuddyRequests({ tripId, currentUser }: PublicTravelBuddyRequestsProps) {
  const { user, travelBuddyRequests, createTravelBuddyRequest, deleteTravelBuddyRequest, getTravelBuddyRequests } = useTravel();
  const [showAll, setShowAll] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
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

  // Filter pending requests for this trip
  const tripRequests = travelBuddyRequests.filter(req => 
    req.trip_id === tripId && req.status === 'pending'
  );

  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({ isOpen: true, title, message, type });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      await deleteTravelBuddyRequest(requestId);
      showNotification('Success!', 'Travel buddy request deleted successfully!', 'success');
    } catch (err) {
      console.error('Error deleting request:', err);
      showNotification('Error!', 'Failed to delete request. Please try again.', 'error');
    }
  };

  // Show only first 3 by default
  const displayRequests = showAll ? tripRequests : tripRequests.slice(0, 3);

  const handleSendRequest = () => {
    if (!currentUser) {
      showNotification('Login Required', 'Please login to send travel buddy requests!', 'warning');
      return;
    }
    setShowDialog(true);
  };

  if (tripRequests.length === 0 && !currentUser) {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-y2k-pink/20 border-2 border-y2k-pink rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-lg text-black dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-xl">group</span>
          Travel Buddy Requests
        </h3>
        <div className="flex items-center gap-3">
          {tripRequests.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs font-black text-y2k-pink hover:text-y2k-pink/80 transition-colors"
            >
              {showAll ? 'Show Less' : `Show All (${tripRequests.length})`}
            </button>
          )}
          {currentUser && (
            <button
              onClick={handleSendRequest}
              className="bg-y2k-pink text-black px-3 py-1 rounded-full text-xs font-black border-2 border-black hover:scale-105 transition-all shadow-[1px_1px_0_#000]"
            >
              + Join Trip
            </button>
          )}
        </div>
      </div>

      {/* Requests List */}
      {tripRequests.length > 0 ? (
        <div className="space-y-3">
          {displayRequests.map((request) => (
            <div key={request.id} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-black dark:border-white relative">
              {/* Delete button for request owner */}
              {currentUser && request.requester_id === currentUser.id && (
                <button
                  onClick={() => handleDeleteRequest(request.id)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors border border-black"
                  title="Delete your request"
                >
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              )}
              
              {/* Avatar */}
              <img
                src="/assets/default-avatar.png"
                alt="User"
                className="w-10 h-10 rounded-full border-2 border-black flex-shrink-0"
              />
              
              {/* Content */}
              <div className="flex-1 min-w-0 pr-8">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-black text-sm text-black dark:text-white">
                    User {request.requester_id?.slice(0, 8)}...
                  </p>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    wants to join this trip! 🎒
                  </span>
                  {currentUser && request.requester_id === currentUser.id && (
                    <span className="text-xs bg-y2k-pink px-2 py-1 rounded-full font-black text-black">
                      Your Request
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 p-2 rounded-lg">
                  "{request.message}"
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  📅 {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}

          {tripRequests.length > 3 && !showAll && (
            <div className="text-center">
              <button
                onClick={() => setShowAll(true)}
                className="text-xs font-black text-y2k-pink hover:text-y2k-pink/80 transition-colors"
              >
                +{tripRequests.length - 3} more requests...
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-6">
          <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">group_add</span>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-black mb-3">
            No travel buddy requests yet
          </p>
          {currentUser && (
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Be the first to request to join this trip! 🌟
            </p>
          )}
        </div>
      )}

      {/* Travel Buddy Dialog */}
      <TravelBuddyDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        trip={{ id: tripId }}
        currentUser={currentUser}
      />

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

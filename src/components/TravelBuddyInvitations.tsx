import React, { useState, useEffect } from 'react';
import { useTravel } from '../context/TravelContext';
import type { TravelBuddyRequest } from '../context/TravelContext';

interface TravelBuddyInvitationsProps {
  tripId: string;
  isTripOwner: boolean;
}

export default function TravelBuddyInvitations({ tripId, isTripOwner }: TravelBuddyInvitationsProps) {
  const { user, travelBuddyRequests, updateTravelBuddyRequest } = useTravel();
  const [showAll, setShowAll] = useState(false);

  // Filter requests for this trip
  const tripRequests = travelBuddyRequests.filter(req => 
    req.tripId === tripId && req.status === 'pending'
  );

  // Show only first 2 by default
  const displayRequests = showAll ? tripRequests : tripRequests.slice(0, 2);

  if (!isTripOwner || tripRequests.length === 0) {
    return null;
  }

  const handleResponse = async (requestId: string, action: 'accepted' | 'declined') => {
    try {
      await updateTravelBuddyRequest(requestId, action);
    } catch (error) {
      console.error('Error responding to request:', error);
    }
  };

  return (
    <div className="mt-4 p-4 bg-y2k-yellow/20 border-2 border-y2k-yellow rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-sm text-black dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">group_add</span>
          Travel Buddy Requests ({tripRequests.length})
        </h3>
        {tripRequests.length > 2 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-black text-y2k-pink hover:text-y2k-pink/80 transition-colors"
          >
            {showAll ? 'Show Less' : `Show All (${tripRequests.length})`}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayRequests.map((request) => (
          <div key={request.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-black dark:border-white">
            {/* Avatar */}
            <img
              src={request.requester?.avatar_url || '/assets/default-avatar.png'}
              alt={request.requester?.name || 'User'}
              className="w-10 h-10 rounded-full border-2 border-black"
            />
            
            {/* Message */}
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm text-black dark:text-white truncate">
                {request.requester?.name || 'Someone'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                {request.message}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleResponse(request.id, 'declined')}
                className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-black border border-black hover:bg-red-600 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={() => handleResponse(request.id, 'accepted')}
                className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-black border border-black hover:bg-green-600 transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        ))}
      </div>

      {tripRequests.length > 2 && !showAll && (
        <div className="mt-3 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="text-xs font-black text-y2k-pink hover:text-y2k-pink/80 transition-colors"
          >
            +{tripRequests.length - 2} more requests...
          </button>
        </div>
      )}

      {/* Empty State */}
      {tripRequests.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 font-black">
            No travel buddy requests yet
          </p>
        </div>
      )}
    </div>
  );
}

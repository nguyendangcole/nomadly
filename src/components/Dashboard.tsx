import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import Sidebar from './Sidebar';
import NotificationsDropdown from './NotificationsDropdown';

export default function Dashboard() {
  const { user, trips, locations, reviews, followedUserIds, deleteTrip, toggleTripLike, savedTripIds } = useTravel();
  const navigate = useNavigate();

  const myDashboardTrips = useMemo(() => {
    return trips.filter(t => t.user_id === user?.id || savedTripIds.includes(t.id));
  }, [trips, user, savedTripIds]);

  // Upcoming Trip (simply the first active trip for this demo)
  const upcomingTrip = useMemo(() => {
    return myDashboardTrips.find(t => !t.isArchived) || null;
  }, [myDashboardTrips]);

  const totalTrips = myDashboardTrips.length;
  const activeTrips = myDashboardTrips.filter((t) => !t.isArchived).length;
  const savedTrips = myDashboardTrips.filter(t => savedTripIds.includes(t.id)).length;

  // Friends Activity
  const friendsActivity = useMemo(() => {
    if (!followedUserIds || followedUserIds.length === 0) return [];

    // Get all reviews made by followed users
    const followedReviews = reviews.filter(r => followedUserIds.includes(r.userId));

    // Get all public trips made by followed users
    const followedTrips = trips.filter(t => followedUserIds.includes(t.userId) && t.isPublic);

    // Map to activity format
    const reviewActivities = followedReviews.map(review => {
      const loc = locations.find(l => l.id === review.locationId);
      return {
        id: `rev-${review.id}`,
        type: 'review' as const,
        userId: review.userId,
        tripId: loc?.tripId || '',
        locationName: loc?.name || 'an unknown location',
        tripTitle: '',
        coverImage: '',
        rating: review.rating,
        comment: review.comment,
        createdAt: new Date(review.createdAt || 0).getTime()
      };
    });

    const tripActivities = followedTrips.map(trip => {
      return {
        id: `trip-${trip.id}`,
        type: 'trip' as const,
        userId: trip.userId,
        tripId: trip.id,
        locationName: '',
        tripTitle: trip.title,
        coverImage: trip.coverImage,
        rating: 0,
        comment: trip.destinationSummary,
        createdAt: new Date(trip.createdAt || 0).getTime()
      };
    });

    const allActivities = [...reviewActivities, ...tripActivities];

    // Sort newest first, take top 5
    return allActivities.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
  }, [reviews, locations, trips, followedUserIds]);

  // Actual total cost based on locations
  const totalCost = locations.reduce((sum, l) => sum + (l.cost || 0), 0);
  const totalBudget = trips.reduce((sum, t) => sum + (t.budget || 0), 0);
  const budgetCap = Math.max(1, totalBudget); // Avoid div by 0
  const budgetUsagePercent = totalBudget > 0 ? Math.min(100, Math.round((totalCost / budgetCap) * 100)) : 0;

  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showProModal, setShowProModal] = useState(false);

  const SUGGESTIONS = useMemo(() => [
    {
      id: 1,
      title: "Hôtel Plaza Athénée",
      subtitle: "15% Discount for Pro",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&auto=format",
      code: "VIBEPRO15"
    },
    {
      id: 2,
      title: "Le Meurice",
      subtitle: "Free Breakfast Included",
      image: "https://images.unsplash.com/photo-1551882547-ff40c0d509af?w=400&h=300&fit=crop&auto=format",
      code: "CROISSANT"
    },
    {
      id: 3,
      title: "Ritz Paris",
      subtitle: "Free Room Upgrade",
      image: "https://images.unsplash.com/photo-1542314831-c6a420325142?w=400&h=300&fit=crop&auto=format",
      code: "BOUJEE"
    },
    {
      id: 4,
      title: "Four Seasons",
      subtitle: "20% Off Weekend Stays",
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop&auto=format",
      code: "LUXURY20"
    },
    {
      id: 5,
      title: "Mandarin Oriental",
      subtitle: "Spa Credit Included",
      image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop&auto=format",
      code: "SPA50"
    }
  ], []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  useEffect(() => {
    if (friendsActivity.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentActivityIndex(prev => (prev + 1) % friendsActivity.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [friendsActivity.length]);

  const activeFriendActivity = friendsActivity[currentActivityIndex];


  return (
    <div className="flex h-screen overflow-hidden font-display bg-white dark:bg-slate-900 transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b-4 border-black dark:border-white transition-colors">
          <div className="flex-1 max-w-md hidden md:block">
            <h2 className="text-xl font-bold tracking-tight italic uppercase dark:text-white transition-colors">Dashboard</h2>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <NotificationsDropdown />
            {user?.isAdmin && (
              <Link to="/admin" className="bg-black text-white px-6 py-2 rounded-full text-sm font-black uppercase italic flex items-center gap-2 hover:scale-105 transition-transform border-2 border-transparent">
                <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                Admin Panel
              </Link>
            )}
            {user?.plan !== 'pro' && (
              <button onClick={() => setShowProModal(true)} className="glossy-green text-black dark:border-white px-6 py-2 rounded-full text-sm font-black uppercase italic flex items-center gap-2 hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-sm">upgrade</span>
                Go Pro
              </button>
            )}
          </div>
        </header>

        <div className="px-8 py-8 space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-6xl font-black tracking-tighter mb-2 italic uppercase dark:text-white transition-colors">
              Hey {user?.name ? user.name : 'Explorer'} 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 transition-colors">
              {totalTrips > 0
                ? 'Your next adventure is just one plan away. Where to next?'
                : 'No trips planned yet. Let’s create your first iconic getaway.'}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/my-trips" className="block y2k-card p-6 rounded-2xl flex flex-col justify-between bg-y2k-pink group hover:scale-[1.02] transition-transform">
              <div className="flex items-center justify-between mb-4">
                <div className="size-12 bg-black rounded-xl flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">map</span>
                </div>
                <span className="text-black text-sm font-black uppercase italic">+{totalTrips} Total</span>
              </div>
              <div>
                <p className="text-black/70 font-bold uppercase text-xs">Total Trips</p>
                <h3 className="text-5xl font-black tracking-tighter italic">{totalTrips}</h3>
              </div>
            </Link>
            <Link to="/my-trips" className="block y2k-card p-6 rounded-2xl flex flex-col justify-between bg-y2k-blue group hover:scale-[1.02] transition-transform">
              <div className="flex items-center justify-between mb-4">
                <div className="size-12 bg-black rounded-xl flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <span className="text-black text-sm font-black uppercase italic">Budget Tracker</span>
              </div>
              <div>
                <p className="text-black/70 font-bold uppercase text-xs">Budget Usage</p>
                <h3 className="text-5xl font-black tracking-tighter italic">{budgetUsagePercent}%</h3>
                <div className="w-full bg-black/20 rounded-full h-3 mt-3 overflow-hidden border border-black">
                  <div className="bg-black h-full" style={{ width: `${budgetUsagePercent}%` }}></div>
                </div>
              </div>
            </Link>

            {/* Saved Trips Widget */}
            <Link to="/my-trips" className="block y2k-card p-6 rounded-2xl flex flex-col justify-between bg-y2k-orange group hover:scale-[1.02] transition-transform">
              <div className="flex items-center justify-between mb-4">
                <div className="size-12 bg-black rounded-xl flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">bookmark</span>
                </div>
                <span className="text-black text-sm font-black uppercase italic">+{savedTrips} Saved</span>
              </div>
              <div>
                <p className="text-black/70 font-bold uppercase text-xs">Saved Trips</p>
                <h3 className="text-5xl font-black tracking-tighter italic">{savedTrips}</h3>
              </div>
            </Link>
          </div>

          {/* Friends Activity Widget (if follows any users) */}
          {followedUserIds.length > 0 && friendsActivity.length > 0 && activeFriendActivity && (
            <div className="bg-white rounded-3xl border-4 border-black p-6 shadow-[6px_6px_0_#000] mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-black">Friends Activity</h2>
                <Link to="/vibe-feed" className="text-primary font-bold hover:underline">View All</Link>
              </div>
              <div>
                <div
                  onClick={() => navigate(`/itinerary/${activeFriendActivity.tripId}`)}
                  className="flex gap-4 group transition-opacity duration-500 cursor-pointer"
                  key={activeFriendActivity.id} // Forces re-render/animation on change if you add css
                >
                  <object data={`/profile/${activeFriendActivity.userId}`} type="text/html" className="hidden" />
                  <Link to={`/profile/${activeFriendActivity.userId}`} className="shrink-0 hover:scale-105 transition-transform size-[54px] rounded-full overflow-hidden inline-block" onClick={(e) => e.stopPropagation()}>
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeFriendActivity.userId}`}
                      alt="avatar"
                      className="w-full h-full bg-[#ffccb0] object-cover"
                    />
                  </Link>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1 text-black group-hover:opacity-80 transition-opacity">
                      <span className="font-bold">Traveler_{activeFriendActivity.userId.substring(0, 6)}</span>
                      {activeFriendActivity.type === 'review' ? (
                        <> reviewed <span className="text-primary font-bold">{activeFriendActivity.locationName}</span></>
                      ) : (
                        <> posted a new trip: <span className="text-primary font-bold">{activeFriendActivity.tripTitle}</span></>
                      )}
                    </p>
                    {activeFriendActivity.type === 'review' && (
                      <div className="flex items-center gap-2 mb-2">
                        {/* Rating Stars (simplified for brevity) */}
                        <span className="text-xs text-[#a0aabf] font-bold">{activeFriendActivity.rating.toFixed(1)}/5 stars</span>
                      </div>
                    )}
                    {activeFriendActivity.comment && (
                      <p className="text-sm text-[#8c9cb3] font-medium italic line-clamp-2">"{activeFriendActivity.comment}"</p>
                    )}
                    {activeFriendActivity.type === 'trip' && activeFriendActivity.coverImage && (
                      <div className="mt-2 h-24 w-full rounded-xl overflow-hidden border-2 border-black">
                        <img src={activeFriendActivity.coverImage} alt="Trip cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Trips Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold dark:text-white transition-colors">Your Trips</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-full bg-primary text-black text-sm font-black uppercase italic border-2 border-black dark:border-white">Recent</button>
                <button className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 text-sm font-bold transition-colors">Archived</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {myDashboardTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all y2k-card dark:shadow-[4px_4px_0_#fff] bg-white dark:bg-slate-900 relative"
                >
                  <button
                    onClick={() => deleteTrip(trip.id)}
                    className="absolute top-4 right-4 z-20 size-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110 shadow-lg"
                    title="Delete Trip"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                  <Link to={`/itinerary/${trip.id}`} className="block relative h-48 overflow-hidden">
                    <img
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      alt={trip.title}
                      src={trip.coverImage}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border border-white/20">
                      {trip.isPublic ? 'Public' : 'Private'}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <div className="bg-black/40 backdrop-blur-md p-2 rounded-lg border border-white/10 text-white">
                        <p className="text-[10px] uppercase opacity-70">Budget</p>
                        <p className="text-sm font-bold">
                          ${trip.budget.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div className="bg-primary px-3 py-1 rounded-full text-white text-xs font-bold shadow-[0_0_15px_rgba(138,206,0,0.4)]">
                        {trip.days} Days
                      </div>
                    </div>
                  </Link>
                  <Link to={`/itinerary/${trip.id}`} className="block p-5">
                    <h3 className="text-lg font-bold mb-1 group-hover:text-primary dark:text-white transition-colors">
                      {trip.title}
                    </h3>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mb-4 line-clamp-2 transition-colors">
                      {trip.destinationSummary}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors">
                      <div className="flex -space-x-2">
                        <img
                          className="size-6 rounded-full border-2 border-white"
                          alt="User"
                          src={
                            user?.avatarUrl ??
                            'https://lh3.googleusercontent.com/aida-public/AB6AXuBYqWGEWCZ4H3UTBzGHGbN1dMiuZIQA3umMy9lQEucTMw1ijWhj7n8TEE0UMWYXAbCtu4nJ-N407CbELOgYR6Vw1UWskVnI7CgreIaGVbOYU7pfuM1HrucbiGckrqqJnc24N6PUjHd3GNO3O2ShwtDtk2FTZhfhT2oAY6Dm87KQ6ehQXDHVg1MXcWrwT2C91bOWuJtxklx9JASz-MMb99Ya9F_WDsrrrWbMhAMdTPw8QaYHZJ0SZcyGL70vADxwhWWUvRvkaEpo4qA'
                          }
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex items-center gap-4 text-slate-400">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="material-symbols-outlined text-sm">favorite</span>{' '}
                          {trip.likes >= 1000
                            ? `${(trip.likes / 1000).toFixed(1)}k`
                            : trip.likes}
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="material-symbols-outlined text-sm">chat_bubble</span>{' '}
                          {trip.comments}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}

              {/* Placeholder Create Card */}
              <Link to="/create-trip" className="group rounded-2xl border-2 border-dashed border-slate-400 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center p-8 cursor-pointer min-h-[400px]">
                <div className="size-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 mb-4 group-hover:bg-primary group-hover:text-white transition-all group-hover:scale-110">
                  <span className="material-symbols-outlined text-3xl">add</span>
                </div>
                <h3 className="text-lg font-bold mb-2 dark:text-white transition-colors">Plan New Adventure</h3>
                <p className="text-slate-500 text-center text-sm">Start from scratch or use an AI-powered template</p>
              </Link>
            </div>
          </div>

          {/* Activity Feed & Suggestions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {upcomingTrip ? (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl border-4 border-black dark:border-slate-700 p-6 shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#475569] transition-colors flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-full md:w-1/3 h-40 rounded-2xl overflow-hidden border-2 border-black dark:border-slate-700 shrink-0">
                    <img src={upcomingTrip.coverImage} alt={upcomingTrip.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-y2k-pink text-black text-[10px] font-black uppercase px-2 py-1 border-2 border-black rounded-md">Up Next</span>
                      <span className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-widest">{upcomingTrip.days} Days Itinerary</span>
                    </div>
                    <h2 className="text-3xl font-black dark:text-white mb-2 leading-tight">{upcomingTrip.title}</h2>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-6">{upcomingTrip.destinationSummary}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                          <div className="size-8 rounded-full border-2 border-black bg-blue-400"></div>
                          <div className="size-8 rounded-full border-2 border-black bg-yellow-400"></div>
                          <div className="size-8 rounded-full border-2 border-black bg-emerald-400 flex items-center justify-center text-[10px] font-black">+2</div>
                        </div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Friends joining</span>
                      </div>
                      <Link to={`/itinerary/${upcomingTrip.id}`} className="bg-primary text-black px-6 py-2 rounded-xl border-2 border-black font-black uppercase italic shadow-[3px_3px_0_#000] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[5px_5px_0_#000] transition-all">
                        Open Planner
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border-2 border-black dark:border-slate-700 shadow-[4px_4px_0_#000] transition-colors h-full flex items-center justify-center text-slate-500 font-bold">
                  No upcoming trips yet. Plan one!
                </div>
              )}
            </div>
            <div className="y2k-card rounded-2xl p-6 bg-primary flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-black font-black text-xl">Nomadly Suggestions</h3>
                  <div className="flex gap-2">
                    <button onClick={() => setSuggestionIdx((prev) => (prev - 1 + SUGGESTIONS.length) % SUGGESTIONS.length)} className="size-6 flex items-center justify-center bg-black text-primary rounded-full hover:scale-110 transition-transform shadow-[2px_2px_0_#fff]">
                      <span className="material-symbols-outlined text-[14px] font-black">chevron_left</span>
                    </button>
                    <button onClick={() => setSuggestionIdx((prev) => (prev + 1) % SUGGESTIONS.length)} className="size-6 flex items-center justify-center bg-black text-primary rounded-full hover:scale-110 transition-transform shadow-[2px_2px_0_#fff]">
                      <span className="material-symbols-outlined text-[14px] font-black">chevron_right</span>
                    </button>
                  </div>
                </div>
                <p className="text-black/80 font-bold mb-4 text-sm">
                  {upcomingTrip
                    ? `Based on your upcoming "${upcomingTrip.title}" trip, we found these matches:`
                    : "Curated deals for your next iconic getaway:"}
                </p>

                <div className="space-y-4 relative overflow-hidden h-24">
                  {SUGGESTIONS.map((sug, idx) => (
                    <div
                      key={sug.id}
                      className={`absolute inset-0 flex items-center gap-4 p-3 bg-white/30 rounded-xl transition-all duration-300 ${idx === suggestionIdx ? 'opacity-100 translate-x-0 cursor-pointer hover:bg-white/40 shadow-[4px_4px_0_rgba(0,0,0,0.2)]' : 'opacity-0 translate-x-12 pointer-events-none'}`}
                    >
                      <div className="size-16 rounded-lg overflow-hidden shrink-0 border-2 border-black">
                        <img 
                          className="w-full h-full object-cover" 
                          alt={sug.title} 
                          src={sug.image} 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            // Fallback to beautiful hotel images
                            const fallbackImages = [
                              'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&auto=format',
                              'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop&auto=format',
                              'https://images.unsplash.com/photo-1551882547-ff40c0d509af?w=400&h=300&fit=crop&auto=format'
                            ];
                            e.currentTarget.src = fallbackImages[sug.id % fallbackImages.length];
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-black font-black text-base truncate">{sug.title}</p>
                        <p className="text-black/80 font-bold text-[10px] uppercase tracking-wider bg-white/50 inline-block px-2 py-0.5 rounded-sm mt-1 border border-black/20">{sug.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleCopyCode(SUGGESTIONS[suggestionIdx].code)}
                className="mt-6 w-full bg-black text-primary font-black uppercase italic py-3 rounded-xl border-2 border-transparent hover:border-black hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 shadow-[0_4px_0_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-none"
              >
                {copiedCode === SUGGESTIONS[suggestionIdx].code ? (
                  <>
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Code: {SUGGESTIONS[suggestionIdx].code}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">local_activity</span>
                    Reveal Discount Code
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <Link to="/create-trip" className="fixed bottom-10 right-10 size-16 bg-primary text-black rounded-full flex items-center justify-center border-4 border-black shadow-[8px_8px_0px_rgba(138,206,0,0.3)] hover:scale-110 transition-transform z-50 group">
          <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform">add</span>
        </Link>

        {/* Pro Upgrade Modal */}
        {showProModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowProModal(false)}
          >
            <div
              className="bg-slate-900 border-8 border-primary text-white max-w-2xl w-full p-8 relative rounded-3xl shadow-[16px_16px_0_#ff00ff] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >

              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl rounded-none pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-pink/20 rounded-full blur-3xl pointer-events-none"></div>

              <button
                onClick={(e) => { e.stopPropagation(); setShowProModal(false); }}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-black text-white rounded-full hover:bg-white hover:text-black border-2 border-white transition-all hover:scale-110 z-50 cursor-pointer"
              >
                <span className="material-symbols-outlined font-black">close</span>
              </button>

              <div className="relative z-10 text-center flex flex-col items-center">
                <div className="inline-flex items-center justify-center gap-2 bg-black text-primary px-6 py-2 border-2 border-primary rounded-full mb-6 shadow-[0_0_15px_rgba(138,206,0,0.5)]">
                  <span className="material-symbols-outlined">hotel_class</span>
                  <span className="font-black uppercase tracking-widest text-sm italic">Nomadly Pro</span>
                </div>

                <h2 className="text-4xl md:text-6xl font-black uppercase italic mb-4 tracking-tighter text-white">
                  Unlock the <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-pink">Ultimate Vibe</span>
                </h2>
                <p className="text-slate-400 font-bold mb-8 max-w-md mx-auto">
                  Take your travel planning to the next level with exclusive features, AI superpower, and zero limits.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left mb-10">
                  <div className="bg-black/50 p-4 border-2 border-slate-700 rounded-xl flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary">auto_awesome</span>
                    <div>
                      <h4 className="font-black text-sm uppercase">Unlimited AI Magic</h4>
                      <p className="text-xs text-slate-500 font-bold mt-1">Generate endless itineraries in seconds.</p>
                    </div>
                  </div>
                  <div className="bg-black/50 p-4 border-2 border-slate-700 rounded-xl flex items-start gap-3">
                    <span className="material-symbols-outlined text-accent-pink">group_add</span>
                    <div>
                      <h4 className="font-black text-sm uppercase">Co-op Mode</h4>
                      <p className="text-xs text-slate-500 font-bold mt-1">Invite 10+ friends to edit the trip together.</p>
                    </div>
                  </div>
                  <div className="bg-black/50 p-4 border-2 border-slate-700 rounded-xl flex items-start gap-3">
                    <span className="material-symbols-outlined text-white">loyalty</span>
                    <div>
                      <h4 className="font-black text-sm uppercase">Pro Discounts</h4>
                      <p className="text-xs text-slate-500 font-bold mt-1">Access to exclusive hotel & flight deals.</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (user) {
                      const raw = localStorage.getItem('nomadly:pro_requests');
                      const pending = raw ? JSON.parse(raw) : [];
                      if (!pending.includes(user.id)) {
                        localStorage.setItem('nomadly:pro_requests', JSON.stringify([...pending, user.id]));
                      }
                    }
                    alert('Pro request received! Please wait for Admin approval. ✨');
                    setShowProModal(false);
                  }}
                  className="w-full glossy-green text-black text-xl font-black uppercase italic py-4 rounded-full border-4 border-black hover:scale-105 active:scale-95 transition-all shadow-[0_8px_0_#000] active:shadow-[0_0_0_#000] active:translate-y-2 flex justify-center items-center gap-2"
                >
                  <span className="material-symbols-outlined text-2xl">rocket_launch</span>
                  Request Pro Access
                </button>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-4">No credit card required for waitlist</p>
              </div>
            </div>
          </div>
        )}
      </main >
    </div >
  );
}

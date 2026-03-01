import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import TravelBuddyDialog from './TravelBuddyDialog';
import Sidebar from './Sidebar';
import AuthModal from './AuthModal';
import NotificationsDropdown from './NotificationsDropdown';

export default function Explore() {
  const { user, trips, locations, reviews, isLoading, error, savedTripIds, saveTrip, unsaveTrip, followedUserIds, followUser, unfollowUser, toggleTripLike } = useTravel();
  const navigate = useNavigate();
  const [authModal, setAuthModal] = useState({ isOpen: false, message: '' });
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showBuddyModal, setShowBuddyModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showBuddyDialog, setShowBuddyDialog] = useState(false);
  const [priceRange, setPriceRange] = useState('Any');
  const [forceLoad, setForceLoad] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isLoading) {
      timer = setTimeout(() => setForceLoad(true), 5000); // 5 seconds fail-safe
    } else {
      setForceLoad(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  const publicTrips = useMemo(() => {
    console.log('[DEBUG-EXPLORE] Raw trips from context:', trips);
    let list = trips.filter(t => t.isPublic);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.destinationSummary.toLowerCase().includes(q)
      );
    }

    // Mock filtering logic based on description/title words
    if (activeFilter === 'Adventure') {
      list = list.filter(t => t.category === 'Adventure' || t.title.toLowerCase().includes('adventure') || t.title.toLowerCase().includes('trail') || t.title.toLowerCase().includes('hike'));
    } else if (activeFilter === 'Luxury') {
      list = list.filter(t => t.category === 'Luxury' || t.budget > 3000 || t.title.toLowerCase().includes('luxury') || t.title.toLowerCase().includes('resort'));
    } else if (activeFilter === 'Budget') {
      list = list.filter(t => t.category === 'Budget' || t.budget <= 500 || t.title.toLowerCase().includes('budget') || t.title.toLowerCase().includes('cheap'));
    } else if (activeFilter === 'Chill') {
      list = list.filter(t => t.category === 'Chill' || t.title.toLowerCase().includes('chill') || t.title.toLowerCase().includes('relax') || t.title.toLowerCase().includes('beach'));
    }

    // Apply Price Filter
    if (priceRange === 'Under $500') {
      list = list.filter(t => t.budget <= 500);
    } else if (priceRange === '$500 - $2000') {
      list = list.filter(t => t.budget > 500 && t.budget <= 2000);
    } else if (priceRange === 'Over $2000') {
      list = list.filter(t => t.budget > 2000);
    }

    // Sort by popularity (likes + comments)
    console.log('[DEBUG-EXPLORE] Filtered publicTrips length:', list.length);
    return list.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
  }, [trips, search, activeFilter, priceRange]);

  return (
    <div className="flex h-screen overflow-hidden font-display bg-white dark:bg-slate-900 transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto relative bg-[#f8f9fa] dark:bg-slate-900 transition-colors">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b-4 border-black dark:border-white transition-colors">
          <div className="flex-1 max-w-md hidden md:block">
            <h2 className="text-xl font-bold tracking-tight italic uppercase dark:text-white transition-colors">Explore The World</h2>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <NotificationsDropdown />
            <button 
              onClick={() => {
                alert('🚀 Pro features coming soon! \n\nFuture Pro benefits:\n• Unlimited AI trip generation\n• Advanced travel analytics\n• Priority support\n• Exclusive trip templates\n• Ad-free experience\n\nFor now, enjoy all free features! 🎉');
              }}
              className="glossy-green text-black dark:border-white px-6 py-2 rounded-full text-sm font-black uppercase italic flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <span className="material-symbols-outlined text-sm">upgrade</span>
              Go Pro
            </button>
          </div>
        </header>

        <div className="px-6 lg:px-12 py-10 max-w-[1400px] mx-auto w-full">
          {isLoading && !forceLoad ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl animate-spin text-primary mb-4">progress_activity</span>
                <p className="text-xl font-bold text-slate-600 dark:text-slate-400">Loading amazing trips...</p>
              </div>
            </div>
          ) : error ? (
            <div className="mb-8 p-6 bg-red-100 dark:bg-red-900/30 border-2 border-red-500 rounded-xl text-red-700 dark:text-red-400 font-bold">
              <h3 className="text-xl black uppercase italic mb-2">Error Loading Data</h3>
              <p>{error}</p>
              <p className="mt-2 text-sm">Please refresh the page or check your database settings.</p>
            </div>
          ) : null}

          <div className="mb-12">
            <h1 className="text-black dark:text-white text-6xl md:text-8xl font-bold tracking-tighter mb-8 max-w-3xl italic uppercase transition-colors">
              🔥 Trending <span className="text-primary">This Week</span>
            </h1>

            {/* Filter & Search Toolbar */}
            <div className="flex flex-col gap-4 bg-white dark:bg-slate-800 p-4 rounded-3xl border-4 border-black shadow-[8px_8px_0_#000] dark:border-white dark:shadow-[8px_8px_0_#fff] mb-12">
              <div className="relative w-full group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input
                  className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 dark:text-white rounded-2xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-primary/30 placeholder:text-slate-400 font-bold text-lg transition-colors focus:border-primary outline-none"
                  placeholder="Search destinations or vibes..."
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap md:flex-nowrap gap-3 items-center justify-between w-full">
                {/* Category Filters */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
                  {[
                    { label: 'All', icon: 'grade' },
                    { label: 'Adventure', icon: 'hiking' },
                    { label: 'Luxury', icon: 'diamond' },
                    { label: 'Budget', icon: 'savings' },
                    { label: 'Chill', icon: 'sunny' }
                  ].map(filterBtn => (
                    <button
                      key={filterBtn.label}
                      onClick={() => setActiveFilter(filterBtn.label)}
                      className={`whitespace-nowrap flex h-14 items-center gap-1.5 px-6 rounded-2xl text-sm font-black uppercase transition-all border-2 border-black
                        ${activeFilter === filterBtn.label
                          ? 'bg-y2k-pink text-black shadow-[4px_4px_0_#000] translate-y-[-2px]'
                          : 'bg-white text-black hover:bg-slate-50 dark:bg-slate-900 dark:text-white dark:border-white hover:translate-y-[-2px] hover:shadow-[4px_4px_0_#000] dark:hover:shadow-[4px_4px_0_#fff]'
                        }`}
                    >
                      <span className="material-symbols-outlined">{filterBtn.icon}</span>
                      {filterBtn.label}
                    </button>
                  ))}
                </div>

                {/* Price Divider */}
                <div className="hidden md:block w-px h-10 bg-slate-200 dark:bg-slate-700 mx-2"></div>

                {/* Price Filter */}
                <div className="relative w-full md:w-48 shrink-0">
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full h-14 bg-white dark:bg-slate-900 text-black dark:text-white font-bold uppercase text-sm px-4 rounded-2xl border-2 border-black dark:border-white appearance-none cursor-pointer hover:shadow-[4px_4px_0_#000] dark:hover:shadow-[4px_4px_0_#fff] transition-all"
                  >
                    <option value="Any">Any Price</option>
                    <option value="Under $500">&lt; $500</option>
                    <option value="$500 - $2000">$500 - $2000</option>
                    <option value="Over $2000">&gt; $2000</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>
          </div>

          <div className="masonry-grid">
            {isLoading && !forceLoad ? (
              <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 font-bold text-xl uppercase italic">
                Loading Vibes...
              </div>
            ) : publicTrips.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 font-bold transition-colors">
                No trips found matching your criteria.
              </div>
            ) : (
              publicTrips.map((trip, index) => (
                <div key={trip.id} className="masonry-item group cursor-pointer">
                  <div className="block relative overflow-hidden rounded-3xl bg-slate-200 dark:bg-slate-800 dark:border-slate-800 y2k-card dark:shadow-[4px_4px_0_#fff]">
                    {/* Travel Buddy Button - Top Right */}
                    <div className="absolute top-4 right-4 z-10">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!user) {
                            setAuthModal({ isOpen: true, message: 'Please log in to invite travel buddies!' });
                            return;
                          }
                          setSelectedTrip(trip);
                          setShowBuddyDialog(true);
                        }}
                        title="Invite Travel Buddy"
                        className="bg-y2k-pink text-black px-3 py-2 rounded-full border-2 border-black hover:scale-105 transition-all font-black text-xs shadow-[2px_2px_0_#000] flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">group_add</span>
                        BUDDY
                      </button>
                    </div>
                    
                    {index === 0 && ( /* Mark the #1 trip as trending */
                      <div className="absolute top-4 left-4 z-10 bg-primary border-2 border-black dark:border-white px-3 py-1 flex items-center gap-1.5 shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff]">
                        <span className="text-black text-xs font-black uppercase tracking-tighter">🔥 Trending</span>
                      </div>
                    )}
                    <Link to={`/itinerary/${trip.id}`}>
                      <img 
                        className="w-full h-auto transition-transform duration-500 group-hover:scale-105" 
                        alt={trip.title} 
                        src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop&auto=format'} 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          // Fallback if image fails to load
                          const fallbackImages = [
                            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop&auto=format',
                            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&auto=format',
                            'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop&auto=format'
                          ];
                          const randomFallback = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
                          e.currentTarget.src = randomFallback;
                        }}
                      />
                    </Link>
                    <div className="p-6 bg-white dark:bg-slate-800 transition-colors">
                      <Link to={`/itinerary/${trip.id}`}>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 leading-tight transition-colors group-hover:text-primary">{trip.title}</h3>
                      </Link>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Link to={`/profile/${trip.userId}`} title="View Profile" className="hover:scale-110 transition-transform">
                            <div className="size-8 rounded-full border border-black dark:border-white bg-primary flex items-center justify-center text-xs font-bold text-black uppercase transition-colors">
                              {trip.title.charAt(0)}
                            </div>
                          </Link>
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate max-w-[100px] transition-colors">{trip.days} Days</span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 transition-colors">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (!user) {
                                setAuthModal({ isOpen: true, message: 'Please log in to like this trip!' });
                                return;
                              }
                              toggleTripLike(trip.id);
                            }}
                            className="flex items-center gap-1 hover:text-primary transition-colors z-20"
                          >
                            <span className="material-symbols-outlined text-[18px]">favorite</span>
                            <span className="text-xs font-bold">{trip.likes > 1000 ? (trip.likes / 1000).toFixed(1) + 'k' : trip.likes}</span>
                          </button>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                            <span className="text-xs font-bold">{trip.comments}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (!user) {
                                setAuthModal({ isOpen: true, message: 'Please log in to save this trip!' });
                                return;
                              }
                              savedTripIds.includes(trip.id) ? unsaveTrip(trip.id) : saveTrip(trip.id);
                            }}
                            title={savedTripIds.includes(trip.id) ? 'Đã lưu' : 'Lưu trip'}
                            className={`flex items-center gap-1 transition-colors z-20 ${savedTripIds.includes(trip.id) ? 'text-primary' : 'hover:text-primary'}`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {savedTripIds.includes(trip.id) ? 'bookmark' : 'bookmark_border'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-16 text-center">
            <button className="glossy-button text-black border-2 border-black dark:border-white px-12 py-5 rounded-xl font-black text-xl inline-flex items-center gap-3 uppercase italic">
              <span>Load More Discoveries</span>
              <span className="material-symbols-outlined">expand_more</span>
            </button>
          </div>
        </div>
      </main>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        message={authModal.message}
      />
      
      <TravelBuddyDialog
        isOpen={showBuddyDialog}
        onClose={() => {
          setShowBuddyDialog(false);
          setSelectedTrip(null);
        }}
        trip={selectedTrip}
        currentUser={user}
      />
    </div>
  );
}

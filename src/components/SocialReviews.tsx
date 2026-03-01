import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import { supabase } from '../lib/supabase';
import Sidebar from './Sidebar';
import AuthModal from './AuthModal';
import NotificationsDropdown from './NotificationsDropdown';

type FeedTab = 'following' | 'discover';

export default function SocialReviews() {
    const { user, trips, reviews, locations, followedUserIds, followUser, unfollowUser, toggleTripLike, savedTripIds, saveTrip, unsaveTrip } = useTravel();
    const [activeTab, setActiveTab] = useState<FeedTab>('following');
    const [authModal, setAuthModal] = useState({ isOpen: false, message: '' });

    const [searchUserQuery, setSearchUserQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        let active = true;
        const searchUsers = async () => {
            if (!searchUserQuery.trim()) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('id, name, avatar_url')
                .ilike('name', `%${searchUserQuery}%`)
                .limit(5);

            if (active) {
                if (!error && data) {
                    setSearchResults(data);
                }
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(searchUsers, 500); // 500ms debounce
        return () => {
            active = false;
            clearTimeout(timeoutId);
        };
    }, [searchUserQuery]);

    // Trips the user follows
    const followingFeed = useMemo(() => {
        const publicTrips = trips.filter(t => t.isPublic);
        if (followedUserIds.length === 0) return [];
        return publicTrips
            .filter(t => followedUserIds.includes(t.user_id))
            .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }, [trips, followedUserIds]);

    // Suggested users to follow (who have public trips, not the current user, not already followed)
    const suggestedUsers = useMemo(() => {
        const publicTrips = trips.filter(t => t.isPublic && t.user_id !== user?.id && !followedUserIds.includes(t.user_id));
        const seen = new Set<string>();
        const usersWithTrips: { userId: string; trip: typeof trips[0]; tripCount: number }[] = [];
        for (const t of publicTrips) {
            if (t.user_id && !seen.has(t.user_id)) {
                seen.add(t.user_id);
                usersWithTrips.push({
                    userId: t.user_id,
                    trip: t,
                    tripCount: publicTrips.filter(x => x.user_id === t.user_id).length
                });
            }
        }
        return usersWithTrips.slice(0, 8);
    }, [trips, user, followedUserIds]);

    // Discover all public trips sorted by likes
    const discoverFeed = useMemo(() => {
        return trips.filter(t => t.isPublic && t.user_id !== user?.id)
            .sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
    }, [trips, user]);

    const handleFollow = (userId: string) => {
        if (!user) { setAuthModal({ isOpen: true, message: 'Please log in to follow!' }); return; }
        followedUserIds.includes(userId) ? unfollowUser(userId) : followUser(userId);
    };

    const handleLike = (tripId: string) => {
        if (!user) { setAuthModal({ isOpen: true, message: 'Please log in to like this trip!' }); return; }
        toggleTripLike(tripId);
    };

    const handleSave = (tripId: string) => {
        if (!user) { setAuthModal({ isOpen: true, message: 'Please log in to save this trip!' }); return; }
        savedTripIds.includes(tripId) ? unsaveTrip(tripId) : saveTrip(tripId);
    };

    const feed = activeTab === 'following' ? followingFeed : discoverFeed;

    return (
        <div className="flex h-screen overflow-hidden font-display bg-white dark:bg-slate-900 transition-colors">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-y-auto relative bg-[#f8f9fa] dark:bg-slate-900 transition-colors">
                {/* Header */}
                <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b-4 border-black dark:border-white transition-colors">
                    <h2 className="text-xl font-bold tracking-tight italic uppercase dark:text-white">Social Vibe Feed</h2>
                    <div className="flex items-center gap-4">
                        <NotificationsDropdown />
                        <button className="glossy-green text-black px-6 py-2 rounded-full text-sm font-black uppercase italic flex items-center gap-2 hover:scale-105 transition-transform">
                            <span className="material-symbols-outlined text-sm">upgrade</span>Go Pro
                        </button>
                    </div>
                </header>

                <div className="flex gap-8 px-6 lg:px-12 py-8 max-w-[1300px] mx-auto w-full">
                    {/* ---- MAIN FEED ---- */}
                    <div className="flex-1 min-w-0 space-y-6">
                        {/* Hero title */}
                        <div className="mb-6">
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase dark:text-white">
                                The <span className="text-primary bg-black px-3 pb-1 inline-block transform -rotate-2">Vibe</span> Feed
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">See where the tribe is going ✈️</p>
                        </div>

                        {/* Tab toggle */}
                        <div className="flex gap-0 border-b-4 border-black dark:border-white mb-6">
                            <button
                                onClick={() => setActiveTab('following')}
                                className={`px-6 py-3 font-black uppercase italic text-sm transition-colors ${activeTab === 'following' ? 'border-b-4 border-primary -mb-1 text-black dark:text-white' : 'text-slate-400 hover:text-black dark:hover:text-white'}`}
                            >
                                <span className="material-symbols-outlined text-sm align-middle mr-1">group</span>
                                Following ({followedUserIds.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('discover')}
                                className={`px-6 py-3 font-black uppercase italic text-sm transition-colors ${activeTab === 'discover' ? 'border-b-4 border-primary -mb-1 text-black dark:text-white' : 'text-slate-400 hover:text-black dark:hover:text-white'}`}
                            >
                                <span className="material-symbols-outlined text-sm align-middle mr-1">explore</span>
                                Discover
                            </button>
                        </div>

                        {/* Feed Cards */}
                        {feed.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border-4 border-slate-100 dark:border-slate-700">
                                <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4 block">
                                    {activeTab === 'following' ? 'group_add' : 'explore'}
                                </span>
                                {activeTab === 'following' ? (
                                    <>
                                        <p className="text-xl font-bold text-slate-500 dark:text-slate-400 mb-3">You're not following anyone yet.</p>
                                        <p className="text-sm font-bold text-slate-400">
                                            Follow travelers in the <button onClick={() => setActiveTab('discover')} className="underline text-primary hover:opacity-80">Discover</button> tab or from trip pages.
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-xl font-bold text-slate-500 dark:text-slate-400">No public trips available yet. Be the first!</p>
                                )}
                            </div>
                        ) : (
                            feed.map(trip => {
                                const tripReviews = reviews.filter(r => {
                                    const loc = locations.find(l => l.id === r.locationId);
                                    return loc?.tripId === trip.id;
                                });
                                const avgRating = tripReviews.length
                                    ? (tripReviews.reduce((s, r) => s + r.rating, 0) / tripReviews.length).toFixed(1)
                                    : null;
                                const authorId = trip.user_id;
                                const isFollowing = followedUserIds.includes(authorId);

                                return (
                                    <div key={trip.id} className="bg-white dark:bg-slate-800 rounded-3xl border-4 border-black dark:border-white shadow-[6px_6px_0_#000] dark:shadow-[6px_6px_0_#fff] hover:shadow-[2px_2px_0_#000] dark:hover:shadow-[2px_2px_0_#fff] hover:translate-x-1 hover:translate-y-1 overflow-hidden transition-all">
                                        {/* Author row */}
                                        <div className="flex items-center justify-between px-6 pt-5 pb-3">
                                            <div className="flex items-center gap-3">
                                                <Link to={`/profile/${authorId}`} className="shrink-0 hover:scale-105 transition-transform size-12 rounded-full overflow-hidden inline-block" onClick={(e) => e.stopPropagation()}>
                                                    <img
                                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${authorId}`}
                                                        alt="avatar"
                                                        className="w-full h-full bg-slate-100 dark:bg-slate-700 object-cover"
                                                    />
                                                </Link>
                                                <div>
                                                    <p className="font-black italic uppercase text-sm dark:text-white">Traveler_{authorId?.substring(0, 6)}</p>
                                                    <p className="text-xs font-bold text-slate-400">{trip.days} day trip · {trip.destinationSummary?.substring(0, 40)}</p>
                                                </div>
                                            </div>
                                            {authorId && authorId !== user?.id && (
                                                <button
                                                    onClick={() => handleFollow(authorId)}
                                                    className={`px-4 py-1.5 rounded-full font-black text-xs uppercase border-2 border-black transition-all ${isFollowing ? 'bg-slate-100 dark:bg-slate-700 dark:text-white hover:bg-red-50 hover:text-red-500 hover:border-red-300' : 'bg-primary text-black hover:brightness-110'}`}
                                                >
                                                    {isFollowing ? 'Following ✓' : '+ Follow'}
                                                </button>
                                            )}
                                        </div>

                                        {/* Cover Image */}
                                        <Link to={`/itinerary/${trip.id}`} className="block relative h-72 overflow-hidden border-y-2 border-black dark:border-white group">
                                            <img
                                                src={trip.coverImage || '/assets/branding/logo-mark.png'}
                                                alt={trip.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                referrerPolicy="no-referrer"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                                            <div className="absolute bottom-0 left-0 p-5 z-20">
                                                <h3 className="text-2xl font-black italic uppercase text-white leading-tight">{trip.title}</h3>
                                                {avgRating && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <span className="material-symbols-outlined text-primary text-sm fill-1">star</span>
                                                        <span className="text-white text-sm font-bold">{avgRating} avg rating · {tripReviews.length} reviews</span>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>

                                        {/* Action Row */}
                                        <div className="flex items-center justify-between px-6 py-4">
                                            <div className="flex items-center gap-5">
                                                <button
                                                    onClick={() => handleLike(trip.id)}
                                                    className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-y2k-pink transition-colors font-bold"
                                                >
                                                    <span className="material-symbols-outlined">favorite</span>
                                                    <span>{trip.likes > 1000 ? `${(trip.likes / 1000).toFixed(1)}k` : trip.likes}</span>
                                                </button>
                                                <Link
                                                    to={`/itinerary/${trip.id}#comments`}
                                                    className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors font-bold"
                                                >
                                                    <span className="material-symbols-outlined">chat_bubble</span>
                                                    <span>{trip.comments}</span>
                                                </Link>
                                            </div>
                                            <button
                                                onClick={() => handleSave(trip.id)}
                                                className={`flex items-center gap-1.5 font-bold transition-colors ${savedTripIds.includes(trip.id) ? 'text-primary' : 'text-slate-600 dark:text-slate-300 hover:text-primary'}`}
                                            >
                                                <span className="material-symbols-outlined">{savedTripIds.includes(trip.id) ? 'bookmark' : 'bookmark_border'}</span>
                                            </button>
                                        </div>

                                        {/* Caption */}
                                        <div className="px-6 pb-5">
                                            <p className="text-slate-600 dark:text-slate-400 font-bold text-sm line-clamp-2">{trip.destinationSummary}</p>
                                            <Link to={`/itinerary/${trip.id}`} className="text-primary font-black text-xs uppercase mt-1 block hover:opacity-80">View full trip →</Link>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* ---- RIGHT SIDEBAR: Suggested Users ---- */}
                    <aside className="hidden lg:block w-80 shrink-0 space-y-6">
                        {/* User Profile Widget */}
                        {user && (
                            <div className="bg-white dark:bg-slate-800 border-4 border-black dark:border-white rounded-2xl p-5 shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff]">
                                <div className="flex items-center gap-3 mb-4">
                                    <Link to={`/profile/${user.id}`} title="View Profile" className="shrink-0 hover:scale-105 transition-transform size-12 rounded-full overflow-hidden inline-block">
                                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover border-2 border-black dark:border-white" referrerPolicy="no-referrer" />
                                    </Link>
                                    <div>
                                        <p className="font-black italic uppercase dark:text-white">{user.name}</p>
                                        <p className="text-xs font-bold text-slate-400">{user.email}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-center">
                                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl py-2">
                                        <p className="font-black text-xl dark:text-white">{followedUserIds.length}</p>
                                        <p className="text-xs font-bold text-slate-400">Following</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl py-2">
                                        <p className="font-black text-xl dark:text-white">{savedTripIds.length}</p>
                                        <p className="text-xs font-bold text-slate-400">Saved</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Search Users */}
                        <div className="bg-white dark:bg-slate-800 border-4 border-black dark:border-white rounded-2xl p-5 shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff]">
                            <h3 className="font-black uppercase italic text-sm mb-4 dark:text-white">🔍 Search Users</h3>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchUserQuery}
                                    onChange={(e) => setSearchUserQuery(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-black dark:border-white rounded-xl pl-10 pr-4 py-2 text-sm font-bold focus:ring-2 focus:ring-primary outline-none dark:text-white"
                                />
                                {isSearching && <span className="material-symbols-outlined animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">progress_activity</span>}
                            </div>

                            {/* Search Results */}
                            {searchUserQuery.trim() !== '' && (
                                <div className="mt-4 space-y-3 max-h-48 overflow-y-auto">
                                    {searchResults.length > 0 ? (
                                        searchResults.map(result => (
                                            <div key={result.id} className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Link to={`/profile/${result.id}`} className="shrink-0 hover:scale-105 transition-transform size-8 rounded-full overflow-hidden inline-block" onClick={(e) => e.stopPropagation()}>
                                                        <img src={result.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.id}`} alt="avatar" className="w-full h-full object-cover bg-slate-100 dark:bg-slate-700" />
                                                    </Link>
                                                    <div className="min-w-0">
                                                        <Link to={`/profile/${result.id}`} className="hover:underline">
                                                            <p className="font-bold text-xs dark:text-white truncate">{result.name}</p>
                                                        </Link>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleFollow(result.id)}
                                                    className={`shrink-0 px-2 py-1 rounded-full font-black text-[10px] uppercase border-2 border-black transition-all ${followedUserIds.includes(result.id) ? 'bg-slate-100 dark:bg-slate-700 dark:text-white' : 'bg-primary text-black hover:brightness-110'}`}
                                                >
                                                    {followedUserIds.includes(result.id) ? '✓' : 'Follow'}
                                                </button>
                                            </div>
                                        ))
                                    ) : !isSearching ? (
                                        <p className="text-xs font-bold text-slate-400 text-center py-2">No users found.</p>
                                    ) : null}
                                </div>
                            )}
                        </div>

                        {/* Suggested to Follow */}
                        {suggestedUsers.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 border-4 border-black dark:border-white rounded-2xl p-5 shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff]">
                                <h3 className="font-black uppercase italic text-sm mb-4 dark:text-white">✨ Suggested Travelers</h3>
                                <div className="space-y-4">
                                    {suggestedUsers.map(({ userId, trip, tripCount }) => (
                                        <div key={userId} className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <img
                                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`}
                                                    alt="avatar"
                                                    className="size-10 rounded-full border-2 border-black dark:border-white bg-slate-100 dark:bg-slate-700 shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <Link to={`/profile/${userId}`} className="hover:underline block">
                                                        <p className="font-black italic uppercase text-xs dark:text-white truncate">Traveler_{userId.substring(0, 6)}</p>
                                                    </Link>
                                                    <p className="text-[10px] font-bold text-slate-400 truncate">{tripCount} trip{tripCount > 1 ? 's' : ''} · {trip.destinationSummary?.substring(0, 25)}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleFollow(userId)}
                                                className={`shrink-0 px-3 py-1 rounded-full font-black text-[11px] uppercase border-2 border-black transition-all ${followedUserIds.includes(userId) ? 'bg-slate-100 dark:bg-slate-700 dark:text-white' : 'bg-primary text-black hover:brightness-110'}`}
                                            >
                                                {followedUserIds.includes(userId) ? '✓' : 'Follow'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Trending this week */}
                        <div className="bg-white dark:bg-slate-800 border-4 border-black dark:border-white rounded-2xl p-5 shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff]">
                            <h3 className="font-black uppercase italic text-sm mb-4 dark:text-white">🔥 Trending Trips</h3>
                            <div className="space-y-3">
                                {discoverFeed.slice(0, 4).map(trip => (
                                    <Link key={trip.id} to={`/itinerary/${trip.id}`} className="flex items-center gap-3 group">
                                        <div className="size-12 rounded-xl overflow-hidden border-2 border-black dark:border-white shrink-0">
                                            <img src={trip.coverImage || '/assets/branding/logo-mark.png'} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-black uppercase italic text-xs dark:text-white truncate group-hover:text-primary transition-colors">{trip.title}</p>
                                            <p className="text-[10px] font-bold text-slate-400">❤️ {trip.likes > 1000 ? `${(trip.likes / 1000).toFixed(1)}k` : trip.likes} likes</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <AuthModal
                isOpen={authModal.isOpen}
                onClose={() => setAuthModal({ ...authModal, isOpen: false })}
                message={authModal.message}
            />
        </div>
    );
}

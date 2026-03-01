import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import Sidebar from './Sidebar';
import NotificationsDropdown from './NotificationsDropdown';

type Tab = 'myTrips' | 'saved';

export default function MyTrips() {
    const { user, trips, deleteTrip, savedTripIds, unsaveTrip } = useTravel();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<Tab>('myTrips');

    const myTrips = useMemo(() => {
        const q = search.trim().toLowerCase();
        const owned = trips.filter(t => t.user_id === user?.id || !t.user_id); // own trips
        if (!q) return owned;
        return owned.filter(t =>
            t.title.toLowerCase().includes(q) ||
            t.destinationSummary.toLowerCase().includes(q)
        );
    }, [trips, search, user]);

    const savedTrips = useMemo(() => {
        const q = search.trim().toLowerCase();
        const saved = trips.filter(t => savedTripIds.includes(t.id));
        if (!q) return saved;
        return saved.filter(t =>
            t.title.toLowerCase().includes(q) ||
            t.destinationSummary.toLowerCase().includes(q)
        );
    }, [trips, savedTripIds, search]);

    const displayTrips = activeTab === 'myTrips' ? myTrips : savedTrips;

    return (
        <div className="flex h-screen overflow-hidden font-display bg-white dark:bg-slate-900 transition-colors">
            {/* Sidebar Navigation */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-y-auto relative bg-[#f8f9fa] dark:bg-slate-900 transition-colors">
                {/* Top Header */}
                <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b-4 border-black dark:border-white transition-colors">
                    <div className="flex-1 max-w-md">
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input
                                className="w-full bg-white dark:bg-slate-800 dark:text-white border-2 border-black dark:border-white rounded-xl pl-10 pr-4 py-2 focus:ring-4 focus:ring-primary/50 text-sm font-bold transition-colors"
                                placeholder="Search your trips..."
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationsDropdown />
                        <button className="glossy-green text-black dark:border-white px-6 py-2 rounded-full text-sm font-black uppercase italic flex items-center gap-2 hover:scale-105 transition-transform">
                            <span className="material-symbols-outlined text-sm">upgrade</span>
                            Go Pro
                        </button>
                    </div>
                </header>

                <div className="px-8 py-8 space-y-8">
                    <div>
                        <h1 className="text-6xl font-black tracking-tighter mb-2 italic uppercase dark:text-white transition-colors">
                            My Trips 🗺️
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 transition-colors">
                            {trips.length > 0
                                ? 'All your amazing adventures mapped out in one place.'
                                : 'No trips planned yet. Let\'s create your first iconic getaway.'}
                        </p>
                    </div>

                    {/* Tab Toggle */}
                    <div className="flex gap-2 border-b-4 border-black dark:border-white">
                        <button
                            onClick={() => setActiveTab('myTrips')}
                            className={`px-6 py-3 font-black uppercase italic text-sm transition-colors ${activeTab === 'myTrips' ? 'border-b-4 border-primary text-black dark:text-white -mb-1' : 'text-slate-400 hover:text-black dark:hover:text-white'}`}
                        >
                            <span className="material-symbols-outlined text-sm mr-1">luggage</span>
                            My Trips ({myTrips.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('saved')}
                            className={`px-6 py-3 font-black uppercase italic text-sm transition-colors ${activeTab === 'saved' ? 'border-b-4 border-primary text-black dark:text-white -mb-1' : 'text-slate-400 hover:text-black dark:hover:text-white'}`}
                        >
                            <span className="material-symbols-outlined text-sm mr-1">bookmark</span>
                            Saved ({savedTrips.length})
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {/* Create Card — only on My Trips tab */}
                        {activeTab === 'myTrips' && (
                            <Link to="/create-trip" className="group rounded-2xl border-2 border-dashed border-slate-400 dark:border-slate-500 hover:border-primary/50 dark:hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center p-8 cursor-pointer min-h-[360px]">
                                <div className="size-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 mb-4 group-hover:bg-primary group-hover:text-black transition-all group-hover:scale-110 border-2 border-transparent group-hover:border-black dark:group-hover:border-white">
                                    <span className="material-symbols-outlined text-3xl">add</span>
                                </div>
                                <h3 className="text-lg font-bold mb-2 uppercase italic text-center dark:text-white transition-colors">Plan New Adventure</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-center text-sm font-bold transition-colors">From the couch to the coast</p>
                            </Link>
                        )}

                        {displayTrips.length === 0 && (
                            <div className="col-span-full py-16 text-center text-slate-400 dark:text-slate-500">
                                <span className="material-symbols-outlined text-6xl mb-4 block">{activeTab === 'myTrips' ? 'luggage' : 'bookmark_border'}</span>
                                <p className="font-bold italic text-xl">
                                    {activeTab === 'myTrips' ? 'No trips yet. Start planning!' : 'No saved trips yet. Explore and bookmark some!'}
                                </p>
                            </div>
                        )}

                        {displayTrips.map((trip) => (
                            <div
                                key={trip.id}
                                className="group rounded-2xl overflow-hidden border-2 border-black dark:border-white hover:border-primary dark:hover:border-primary transition-all shadow-[6px_6px_0_#000] dark:shadow-[6px_6px_0_#fff] hover:shadow-[2px_2px_0_#000] dark:hover:shadow-[2px_2px_0_#fff] hover:translate-x-1 hover:translate-y-1 bg-white dark:bg-slate-900 relative flex flex-col h-full min-h-[360px]"
                            >
                                {/* Delete button — own trips only */}
                                {activeTab === 'myTrips' && (
                                    <button
                                        onClick={() => deleteTrip(trip.id)}
                                        className="absolute top-4 right-4 z-20 size-8 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110 border-2 border-transparent hover:border-primary hover:text-primary dark:hover:text-primary"
                                        title="Delete Trip"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                )}
                                {/* Unsave button — saved tab */}
                                {activeTab === 'saved' && (
                                    <button
                                        onClick={() => unsaveTrip(trip.id)}
                                        className="absolute top-4 right-4 z-20 size-8 bg-primary text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110 border-2 border-black"
                                        title="Bỏ lưu"
                                    >
                                        <span className="material-symbols-outlined text-sm">bookmark_remove</span>
                                    </button>
                                )}
                                <Link to={`/itinerary/${trip.id}`} className="block relative h-48 overflow-hidden shrink-0">
                                    <img
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        alt={trip.title}
                                        src={trip.coverImage}
                                        referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute top-4 left-4 bg-white dark:bg-slate-800 text-black dark:text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff] transition-colors">
                                        {activeTab === 'saved' ? 'Saved' : (trip.isPublic ? 'Public' : 'Private')}
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                        <div className="bg-primary/90 text-black px-3 py-1 rounded-full text-xs font-black uppercase italic border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                                            {trip.days} Days
                                        </div>
                                    </div>
                                </Link>
                                <Link to={`/itinerary/${trip.id}`} className="p-5 flex flex-col flex-1">
                                    <h3 className="text-xl font-black mb-1 italic uppercase line-clamp-2 leading-tight group-hover:text-primary dark:text-white transition-colors">
                                        {trip.title}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2 font-medium flex-1 transition-colors">
                                        {trip.destinationSummary}
                                    </p>
                                    <div className="mt-auto pt-4 border-t-2 border-slate-100 dark:border-slate-800 flex items-center justify-between pointer-events-none transition-colors">
                                        <p className="text-xl font-black dark:text-white">${trip.budget.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                        <div className="flex gap-2">
                                            <div className="flex items-center gap-1 text-xs font-black bg-slate-100 dark:bg-slate-800 dark:text-white px-2 py-1 rounded-lg transition-colors">
                                                <span className="material-symbols-outlined text-[14px] text-y2k-pink">favorite</span>
                                                {trip.likes >= 1000 ? `${(trip.likes / 1000).toFixed(1)}k` : trip.likes}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

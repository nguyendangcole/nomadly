import React, { useMemo, useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTravel, LocationCategory } from '../context/TravelContext';
import AuthModal from './AuthModal';
import NotificationsDropdown from './NotificationsDropdown';
import PublicTravelBuddyRequests from './PublicTravelBuddyRequests';

export default function Itinerary() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, trips, locations, reviews, tripComments, notifications, isLoading, isAuthLoading, error, convertCurrency, addTripComment, updateTrip, uploadImage, addLocation, followedUserIds, unfollowUser, followUser, toggleTripLike, savedTripIds, unsaveTrip, saveTrip, getTravelBuddyRequests } = useTravel();

  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'budget' | 'comments'>('overview');

  const trip = trips.find((t) => t.id === id);

  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocCategory, setNewLocCategory] = useState<LocationCategory>('Fun');
  const [newLocCost, setNewLocCost] = useState<number | ''>('');
  const [newLocDay, setNewLocDay] = useState<number>(1);
  const [newComment, setNewComment] = useState('');
  const [authModal, setAuthModal] = useState({ isOpen: false, message: '' });
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Edit Trip state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editDays, setEditDays] = useState(1);
  const [editBudget, setEditBudget] = useState(0);
  const [editCover, setEditCover] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleOpenLocationModal = (location: any) => {
    setSelectedLocation(location);
    setIsLocationModalOpen(true);
  };

  const handleCloseLocationModal = () => {
    setSelectedLocation(null);
    setIsLocationModalOpen(false);
  };

  const handlePostComment = async () => {
    if (!user) {
      setAuthModal({ isOpen: true, message: 'Please log in to comment.' });
      return;
    }
    if (!newComment.trim()) return;
    const ok = await addTripComment({ tripId: trip!.id, comment: newComment.trim() });
    if (ok) setNewComment('');
  };

  // Load travel buddy requests when user and trip are available
  useEffect(() => {
    if (user && trip) {
      // Load requests for all users to see public requests
      getTravelBuddyRequests(user.id);
    }
  }, [user, trip, getTravelBuddyRequests]);

  // If trip is not found, render fallback
  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center font-display">
        <div className="text-center">
          <h2 className="text-4xl font-black mb-4 uppercase italic">Trip Not Found</h2>
          <Link to="/dashboard" className="text-primary font-bold hover:underline">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  const handleOpenEdit = () => {
    setEditTitle(trip.title);
    setEditSummary(trip.destinationSummary || '');
    setEditDays(trip.days || 1);
    setEditBudget(trip.budget || 0);
    setEditCover(trip.coverImage || '');
    setEditIsPublic(trip.isPublic || false);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateTrip(trip.id, {
        title: editTitle,
        destinationSummary: editSummary,
        days: editDays,
        budget: editBudget,
        coverImage: editCover,
        isPublic: editIsPublic
      });
      setIsEditDialogOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update trip.');
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const publicUrl = await uploadImage(file, 'trip-covers');
      setEditCover(publicUrl);
    } catch (err) {
      console.error(err);
      alert('Failed to upload cover image.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const tripLocations = locations.filter((l) => l.tripId === trip.id);

  // Group locations by day
  const days = Array.from({ length: trip.days }, (_, i) => i + 1);
  const locationsByDay = useMemo(() => {
    const map = new Map<number, typeof tripLocations>();
    days.forEach(d => map.set(d, []));
    tripLocations.forEach(l => {
      const dayList = map.get(l.dayNumber);
      if (dayList) dayList.push(l);
    });
    return map;
  }, [tripLocations, days]);

  // Calculate Budget Breakdown
  const { totalSpent, stayCost, foodCost, funCost } = useMemo(() => {
    let stay = 0, food = 0, fun = 0;
    tripLocations.forEach(l => {
      if (l.category === 'Stay') stay += l.cost;
      if (l.category === 'Food') food += l.cost;
      if (l.category === 'Fun') fun += l.cost;
    });
    return {
      totalSpent: stay + food + fun,
      stayCost: stay,
      foodCost: food,
      funCost: fun
    };
  }, [tripLocations]);

  // SVG calculations for circle graph
  const radius = 15.9155; // For a 100 perimeter circle
  const perimeter = 100;
  const stayPer = totalSpent ? (stayCost / totalSpent) * 100 : 0;
  const foodPer = totalSpent ? (foodCost / totalSpent) * 100 : 0;
  const funPer = totalSpent ? (funCost / totalSpent) * 100 : 0;

  // Get relevant trips (public, not this one, sorted by likes)
  const relevantTrips = useMemo(() => {
    return trips
      .filter((t) => t.isPublic && t.id !== trip.id)
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 3);
  }, [trips, trip.id]);

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim() || newLocCost === '') return;

    const loc = await addLocation({
      tripId: trip.id,
      name: newLocName.trim(),
      category: newLocCategory,
      cost: Number(newLocCost),
      dayNumber: newLocDay
    });

    if (loc) {
      setNewLocName('');
      setNewLocCost('');
      setIsAddingLocation(false);
    } else {
      alert('Error adding location. Are you logged in?');
    }
  };

  return (
    <div className="min-h-screen bg-white font-display">
      <header className="flex items-center justify-between border-b border-slate-200 px-6 md:px-20 py-4 bg-white sticky top-0 z-50">
        <Link to="/dashboard" className="flex items-center gap-3 font-bold text-xl text-black dark:text-white hover:text-primary transition-colors">
          <img 
            src="/assets/branding/logo-wordmark.png" 
            alt="Nomadly" 
            className="h-8 w-auto"
          />
          <h2 className="text-xl font-bold tracking-tight">Nomadly</h2>
        </Link>
        <div className="flex items-center gap-4">
          <NotificationsDropdown />
          <Link to={user ? `/profile/${user.id}` : "/"} className="size-10 rounded-full border-2 border-primary overflow-hidden hover:scale-105 transition-transform block bg-slate-100 shrink-0">
            <img src={user?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'} alt="Avatar" className="w-full h-full object-cover" />
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 md:px-6 py-6 gap-8 flex flex-col">
        {/* Trip Creator Info */}
        <section className="bg-white border-4 border-black rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to={`/profile/${trip.userId}`}
                className="w-16 h-16 rounded-full border-4 border-black overflow-hidden hover:scale-105 transition-transform block"
              >
                <img 
                  src={trip.userId === user?.id ? user.avatarUrl : `https://api.dicebear.com/7.x/avataaars/svg?seed=${trip.userId}`} 
                  alt="Creator" 
                  className="w-full h-full object-cover" 
                />
              </Link>
              <div>
                <h3 className="font-black text-lg font-bold">Created by</h3>
                <Link 
                  to={`/profile/${trip.userId}`}
                  className="text-primary font-black uppercase hover:underline transition-colors"
                >
                  {trip.userId === user?.id ? 'You' : `Explorer ${trip.userId.slice(-4)}`}
                </Link>
                <p className="text-sm text-slate-500">
                  {new Date(trip.createdAt || '').toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            {trip.userId !== user?.id && (
              <button
                onClick={() => {
                  if (!user) {
                    setAuthModal({ isOpen: true, message: 'Please log in to follow this traveler!' });
                    return;
                  }
                  followedUserIds.includes(trip.userId) ? unfollowUser(trip.userId) : followUser(trip.userId);
                }}
                className={`px-6 py-3 rounded-full font-black uppercase text-sm transition-all ${
                  followedUserIds.includes(trip.userId) 
                    ? 'bg-black text-white hover:bg-slate-800' 
                    : 'bg-primary text-black hover:bg-primary/80'
                }`}
              >
                <span className="material-symbols-outlined mr-2">
                  {followedUserIds.includes(trip.userId) ? 'person_check' : 'person_add'}
                </span>
                {followedUserIds.includes(trip.userId) ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </section>

        {/* Hero Section */}
        <section className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-2xl y2k-card">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
          <img className="w-full h-full object-cover" alt={trip.title} src={trip.coverImage} referrerPolicy="no-referrer" />
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 z-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              {trip.isPublic && (
                <div className="inline-flex items-center gap-2 bg-y2k-pink px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white border-2 border-black">
                  <span className="material-symbols-outlined text-sm">public</span>
                  Public Vibe
                </div>
              )}
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">{trip.title}</h1>
              <div className="flex items-center gap-4 text-white">
                <p className="text-white/80">{trip.days} Days • {trip.destinationSummary}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (!user) {
                    setAuthModal({ isOpen: true, message: 'Please log in to like this trip!' });
                    return;
                  }
                  toggleTripLike(trip.id);
                }}
                className="y2k-button bg-white/10 backdrop-blur-md text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2"
              >
                <span className="material-symbols-outlined">favorite</span> {trip.likes > 1000 ? (trip.likes / 1000).toFixed(1) + 'k' : trip.likes}
              </button>
              {trip.userId !== user?.id && (
                <button
                  onClick={() => {
                    if (!user) {
                      setAuthModal({ isOpen: true, message: 'Please log in to save this trip!' });
                      return;
                    }
                    savedTripIds.includes(trip.id) ? unsaveTrip(trip.id) : saveTrip(trip.id);
                  }}
                  className={`y2k-button backdrop-blur-md px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 ${savedTripIds.includes(trip.id) ? 'bg-primary text-black' : 'bg-white/10 text-white'
                    }`}
                >
                  <span className="material-symbols-outlined">{savedTripIds.includes(trip.id) ? 'bookmark' : 'bookmark_border'}</span>
                  {savedTripIds.includes(trip.id) ? 'Saved' : 'Save'}
                </button>
              )}
              {user?.id === trip.userId && (
                <button
                  onClick={handleOpenEdit}
                  className="y2k-button bg-white text-black px-5 py-2.5 rounded-xl font-bold flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">edit</span>
                  Edit Trip
                </button>
              )}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="y2k-button bg-primary text-black hover:bg-white size-12 rounded-xl flex items-center justify-center transition-colors"
                title="Share Trip"
              >
                <span className="material-symbols-outlined">share</span>
              </button>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <nav className="border-b border-slate-200 flex overflow-x-auto scrollbar-hide shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-4 text-sm whitespace-nowrap transition-colors ${activeTab === 'overview' ? 'font-black border-b-4 border-primary text-black uppercase tracking-widest' : 'font-bold text-slate-500 hover:text-black'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`px-6 py-4 text-sm whitespace-nowrap transition-colors ${activeTab === 'itinerary' ? 'font-black border-b-4 border-primary text-black uppercase tracking-widest' : 'font-bold text-slate-500 hover:text-black'}`}
          >
            Locations & Itinerary
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            className={`px-6 py-4 text-sm whitespace-nowrap transition-colors ${activeTab === 'budget' ? 'font-black border-b-4 border-primary text-black uppercase tracking-widest' : 'font-bold text-slate-500 hover:text-black'}`}
          >
            Budget Breakdown
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-6 py-4 text-sm whitespace-nowrap transition-colors ${activeTab === 'comments' ? 'font-black border-b-4 border-primary text-black uppercase tracking-widest' : 'font-bold text-slate-500 hover:text-black'}`}
          >
            Comments & Vibes
          </button>
        </nav>

        {/* Content & Sidebar Layout */}
        <div className="flex flex-col lg:flex-row gap-8 mt-4 items-start">

          {/* Main Content Area */}
          <div className="flex-1 w-full min-w-0">
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fade-in max-w-3xl">
                <div className="y2k-card p-8 rounded-xl bg-white shadow-xl">
                  <h3 className="text-3xl font-black italic uppercase mb-6 border-b-4 border-black pb-4">Trip <span className="text-primary">Overview</span></h3>
                  <p className="text-lg font-medium leading-relaxed text-slate-700">
                    {trip.destinationSummary || 'No summary provided for this trip yet. Time to get packing!'}
                  </p>
                  <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 border-2 border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-center">
                      <span className="material-symbols-outlined text-3xl mb-2 text-primary">calendar_month</span>
                      <span className="font-black text-xl">{trip.days}</span>
                      <span className="text-xs font-bold text-slate-500 uppercase">Days</span>
                    </div>
                    <div className="p-4 border-2 border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-center">
                      <span className="material-symbols-outlined text-3xl mb-2 text-primary">payments</span>
                      <span className="font-black text-xl">{convertCurrency(trip.budget)}</span>
                      <span className="text-xs font-bold text-slate-500 uppercase">Budget</span>
                    </div>
                    <div className="p-4 border-2 border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-center">
                      <span className="material-symbols-outlined text-3xl mb-2 text-primary">pin_drop</span>
                      <span className="font-black text-xl">{locations.filter(l => l.tripId === trip.id).length}</span>
                      <span className="text-xs font-bold text-slate-500 uppercase">Stops</span>
                    </div>
                    <div className="p-4 border-2 border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-center">
                      <span className="material-symbols-outlined text-3xl mb-2 text-primary">favorite</span>
                      <span className="font-black text-xl">{trip.likes}</span>
                      <span className="text-xs font-bold text-slate-500 uppercase">Likes</span>
                    </div>
                  </div>

                  {/* Public Travel Buddy Requests */}
                  <PublicTravelBuddyRequests 
                    tripId={trip.id} 
                    currentUser={user}
                  />
                </div>
              </div>
            )}

            {activeTab === 'itinerary' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                <div className="lg:col-span-2 space-y-10">
                  {days.filter(dayNum => (locationsByDay.get(dayNum)?.length ?? 0) > 0).map((dayNum) => (
                    <div key={dayNum} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold flex items-center gap-3">
                          <span className="bg-primary/10 text-primary size-10 flex items-center justify-center rounded-lg text-lg">
                            {String(dayNum).padStart(2, '0')}
                          </span>
                          Day {dayNum} Itinerary
                        </h3>
                        <button
                          onClick={() => {
                            setNewLocDay(dayNum);
                            setIsAddingLocation(true);
                          }}
                          className="text-primary font-bold text-sm uppercase tracking-widest border-2 border-black px-3 py-1 rounded-lg hover:bg-primary hover:text-white transition-colors"
                        >
                          + Add Act
                        </button>
                      </div>

                      <div className="grid gap-4">
                        {locationsByDay.get(dayNum)?.length === 0 ? (
                          <div className="text-slate-400 font-bold italic py-4">No acts planned for this day yet. Keep it chill or add some chaos.</div>
                        ) : (
                          locationsByDay.get(dayNum)?.map(loc => (
                            <div key={loc.id} className="y2k-card flex items-center p-4 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleOpenLocationModal(loc)}>
                              <div className="ml-4 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-black uppercase tracking-widest" style={{ color: loc.category === 'Stay' ? '#00e1ff' : loc.category === 'Food' ? '#ff00ff' : '#8ace00' }}>
                                    {loc.category}
                                  </span>
                                  {loc.rating && (
                                    <span className="flex items-center text-amber-500 text-xs font-bold">
                                      <span className="material-symbols-outlined text-[14px]">star</span> {loc.rating}
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-black text-lg group-hover:underline decoration-2 underline-offset-4">{loc.name}</h4>
                              </div>
                              <div className="text-right ml-4">
                                <p className="font-black text-xl">{convertCurrency(loc.cost)}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'budget' && (
              <div className="animate-fade-in max-w-md mx-auto w-full">
                <div className="glass-panel p-6 rounded-xl space-y-6">
                  <h4 className="text-2xl font-black uppercase tracking-tighter">Budget <span className="text-primary">Breakdown</span></h4>

                  <div className="mb-2 text-center text-sm font-bold border-b-2 border-black pb-2">
                    Overall Budget: <span className="text-primary">{convertCurrency(trip.budget)}</span>
                  </div>

                  <div className="relative size-52 mx-auto">
                    <svg className="size-full drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] -rotate-90" viewBox="0 0 36 36">
                      {/* Background Circle */}
                      <path className="text-slate-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="5"></path>
                      {/* Category Circles */}
                      {stayPer > 0 && <path className="text-y2k-blue" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${stayPer}, 100`} strokeWidth="5"></path>}
                      {foodPer > 0 && <path className="text-y2k-pink" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${foodPer}, 100`} strokeDashoffset={` - ${stayPer} `} strokeWidth="5"></path>}
                      {funPer > 0 && <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${funPer}, 100`} strokeDashoffset={` - ${stayPer + foodPer} `} strokeWidth="5"></path>}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-black">{convertCurrency(totalSpent)}</span>
                      <span className="text-[10px] text-black uppercase font-black tracking-widest">Total Spent</span>
                    </div>
                  </div>
                  <div className="space-y-3 pt-4">
                    <div className="flex justify-between items-center bg-white/50 p-2 border-2 border-black rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="size-4 border-2 border-black bg-y2k-blue"></div>
                        <span className="font-bold">Stay</span>
                      </div>
                      <span className="font-black">{convertCurrency(stayCost)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/50 p-2 border-2 border-black rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="size-4 border-2 border-black bg-y2k-pink"></div>
                        <span className="font-bold">Food</span>
                      </div>
                      <span className="font-black">{convertCurrency(foodCost)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/50 p-2 border-2 border-black rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="size-4 border-2 border-black bg-primary"></div>
                        <span className="font-bold">Fun</span>
                      </div>
                      <span className="font-black">{convertCurrency(funCost)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="animate-fade-in max-w-3xl space-y-8">
                <div className="y2k-card p-8 rounded-xl bg-white shadow-xl">
                  <h3 className="text-3xl font-black italic uppercase mb-2 border-b-4 border-black pb-4">Drop a <span className="text-y2k-pink">Vibe</span> Check</h3>
                  <p className="font-bold text-slate-500 mb-6">Let the community know what you think about this trip itinerary.</p>

                  <div className="flex gap-4 mb-8">
                    <div className="w-12 h-12 rounded-full border-2 border-black bg-slate-200 shrink-0 overflow-hidden">
                      <img src={user?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=You"} alt="user" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <textarea
                        className="w-full bg-slate-50 border-2 border-black rounded-xl p-4 font-bold outline-none focus:ring-4 focus:ring-primary/20 min-h-[120px]"
                        placeholder={user ? "Spill the tea..." : "Please log in to comment..."}
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        disabled={!user}
                      />
                      <button
                        onClick={handlePostComment}
                        disabled={!user || !newComment.trim()}
                        className="y2k-button bg-black text-primary font-black uppercase px-6 py-3 rounded-lg shadow-[4px_4px_0_#bbff33] disabled:opacity-50"
                      >
                        Post Comment
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6 pt-6 border-t-2 border-slate-100">
                    <div className="font-black text-xl italic uppercase mb-4">Community Voices</div>

                    {tripComments.filter(c => c.tripId === trip?.id).length === 0 ? (
                      <div className="font-bold text-slate-400 italic">No comments yet. Be the first to start the vibe check!</div>
                    ) : (
                      <div className="flex-1 space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {tripComments.filter(c => c.tripId === trip?.id).map((cmt) => (
                          <div key={cmt.id} className="flex gap-4">
                            <Link to={`/ profile / ${cmt.userId} `} className="size-10 rounded-full border-2 border-black shrink-0 overflow-hidden hover:scale-105 transition-transform">
                              <img src={cmt.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cmt.userId}`} alt="user" className="w-full h-full object-cover" />
                            </Link >
                            <div className="bg-slate-50 border-2 border-black p-4 rounded-xl rounded-tl-none flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-black italic uppercase text-sm">{cmt.profiles?.name || 'Explorer'}</span>
                                <span className="text-xs font-bold text-slate-400">
                                  {new Date(cmt.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="font-bold text-slate-700">{cmt.comment}</p>
                            </div>
                          </div >
                        ))}
                      </div >
                    )}
                  </div >
                </div >
              </div >
            )}

          </div >

          {/* Right Sidebar: Relevant Trips */}
          < aside className="w-full lg:w-[350px] shrink-0 space-y-6 animate-fade-in-up" >
            <h3 className="text-xl font-black italic uppercase border-b-4 border-black pb-2">More <span className="text-primary">Vibes</span></h3>
            {
              relevantTrips.length === 0 ? (
                <p className="font-bold text-slate-400 italic text-sm">No similar trips found.</p>
              ) : (
                <div className="flex flex-col gap-5">
                  {relevantTrips.map(rt => (
                    <Link key={rt.id} to={`/itinerary/${rt.id}`} className="block y2k-card rounded-2xl overflow-hidden bg-white shadow-[4px_4px_0_#000] border-2 border-black group hover:-translate-y-1 hover:shadow-none hover:bg-slate-50 transition-all">
                      <div className="h-36 w-full overflow-hidden border-b-2 border-black relative">
                        <img src={rt.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={rt.title} referrerPolicy="no-referrer" />
                        <div className="absolute top-2 right-2 bg-y2k-pink px-2.5 py-1 flex items-center gap-1 rounded-full font-black text-xs text-white uppercase border-2 border-black shadow-[2px_2px_0_#000]">
                          <span className="material-symbols-outlined text-[14px]">favorite</span>
                          {rt.likes > 1000 ? (rt.likes / 1000).toFixed(1) + 'k' : rt.likes}
                        </div>
                      </div>
                      <div className="p-4 space-y-1">
                        <h4 className="font-black text-[15px] uppercase truncate group-hover:text-primary transition-colors leading-tight">{rt.title}</h4>
                        <p className="text-xs font-bold text-slate-500 truncate">{rt.days} Days • {rt.destinationSummary}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            }
          </aside >
        </div >
      </main >

      {/* Add Location Modal */}
      {
        isAddingLocation && (
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border-4 border-black p-8 rounded-xl max-w-md w-full shadow-[8px_8px_0_#000]">
              <h3 className="text-2xl font-black italic uppercase mb-6">Add Act to Day {newLocDay}</h3>
              <form onSubmit={handleAddLocation} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Name</label>
                  <input required className="w-full y2k-input px-4 py-3 rounded-lg" value={newLocName} onChange={e => setNewLocName(e.target.value)} placeholder="e.g. Trendy Cafe" />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Category</label>
                  <select className="w-full y2k-input px-4 py-3 rounded-lg bg-white" value={newLocCategory} onChange={e => setNewLocCategory(e.target.value as LocationCategory)}>
                    <option value="Stay">Stay</option>
                    <option value="Food">Food</option>
                    <option value="Fun">Fun</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Est. Cost ($)</label>
                  <input required type="number" className="w-full y2k-input px-4 py-3 rounded-lg" value={newLocCost} onChange={e => setNewLocCost(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsAddingLocation(false)} className="flex-1 border-2 border-black rounded-lg font-bold py-3 hover:bg-slate-100">Cancel</button>
                  <button type="submit" className="flex-1 bg-primary border-2 border-black rounded-lg font-black uppercase py-3 shadow-[4px_4px_0_#000] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all">Save Act</button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Location Detail Modal */}
      {isLocationModalOpen && selectedLocation && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[8px_8px_0_#000]">
            <div className="relative">
              <button
                onClick={handleCloseLocationModal}
                className="absolute right-6 top-6 size-10 rounded-full border-2 border-black flex items-center justify-center hover:bg-slate-100 transition-colors z-10"
              >
                <span className="material-symbols-outlined font-black">close</span>
              </button>
              
              <div className="p-8">
                {/* Location Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-full border-4 border-black flex items-center justify-center`} style={{ backgroundColor: 
                    selectedLocation.category === 'Stay' ? '#00e1ff' : 
                    selectedLocation.category === 'Food' ? '#ff00ff' : '#8ace00' 
                  }}>
                    <span className="text-white text-2xl font-black">
                      {selectedLocation.category === 'Stay' ? '🏨' : 
                       selectedLocation.category === 'Food' ? '🍜' : '🎉'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black mb-2">{selectedLocation.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-widest" style={{ color: 
                        selectedLocation.category === 'Stay' ? '#00e1ff' : 
                        selectedLocation.category === 'Food' ? '#ff00ff' : '#8ace00' 
                      }}>
                        {selectedLocation.category}
                      </span>
                      {selectedLocation.rating && (
                        <div className="flex items-center text-amber-500 text-sm font-bold">
                          <span className="material-symbols-outlined text-[14px]">star</span>
                          <span className="ml-1">{selectedLocation.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location Details */}
                <div className="space-y-6">
                  <div className="bg-slate-50 border-2 border-black rounded-xl p-6">
                    <h4 className="font-black text-lg mb-4">Description</h4>
                    <p className="text-slate-700 font-bold leading-relaxed">
                      {selectedLocation.description || `Amazing ${selectedLocation.category.toLowerCase()} spot in ${selectedLocation.name}. Perfect for creating unforgettable memories and capturing those Instagram-worthy moments.`}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-slate-50 border-2 border-black rounded-xl p-6 text-center">
                      <span className="material-symbols-outlined text-3xl mb-2 text-primary">payments</span>
                      <div className="text-2xl font-black">${selectedLocation.cost}</div>
                      <div className="text-sm font-bold text-slate-500 uppercase">Cost</div>
                    </div>
                    <div className="bg-slate-50 border-2 border-black rounded-xl p-6 text-center">
                      <span className="material-symbols-outlined text-3xl mb-2 text-primary">schedule</span>
                      <div className="text-2xl font-black">Day {selectedLocation.dayNumber}</div>
                      <div className="text-sm font-bold text-slate-500 uppercase">Schedule</div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-primary/10 border-2 border-black rounded-xl p-6">
                    <h4 className="font-black text-lg mb-4">Pro Tips</h4>
                    <ul className="space-y-2 text-slate-700 font-bold">
                      {selectedLocation.category === 'Stay' && (
                        <>
                          <li>• Book in advance for better rates</li>
                          <li>• Check cancellation policy</li>
                          <li>• Bring your own toiletries</li>
                        </>
                      )}
                      {selectedLocation.category === 'Food' && (
                        <>
                          <li>• Try local specialties</li>
                          <li>• Check opening hours</li>
                          <li>• Make reservations for popular spots</li>
                        </>
                      )}
                      {selectedLocation.category === 'Fun' && (
                        <>
                          <li>• Buy tickets online to skip queues</li>
                          <li>• Check weather forecast</li>
                          <li>• Bring comfortable walking shoes</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t-2 border-slate-200">
                  <button
                    onClick={handleCloseLocationModal}
                    className="flex-1 bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-bold hover:bg-slate-300 transition-colors"
                  >
                    Close
                  </button>
                  {user?.id === trip.userId && (
                    <button
                      className="flex-1 bg-primary text-black px-6 py-3 rounded-lg font-bold hover:bg-primary/80 transition-colors"
                    >
                      Edit Location
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        message={authModal.message}
      />

      {/* Edit Trip Modal */}
      {
        isEditDialogOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl border-4 border-black shadow-[8px_8px_0_#000] p-8 max-h-[90vh] flex flex-col relative">
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="absolute right-6 top-6 size-10 rounded-full border-2 border-black flex items-center justify-center hover:bg-slate-100 transition-colors z-10 dark:text-white dark:border-white dark:hover:bg-slate-800"
              >
                <span className="material-symbols-outlined font-black">close</span>
              </button>
              <h2 className="text-3xl font-black italic uppercase mb-6 dark:text-white">Edit Trip</h2>

              <div className="flex-1 overflow-y-auto pr-4 space-y-5">
                <div>
                  <label className="block text-sm font-bold mb-2 dark:text-white">Trip Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full border-2 border-black rounded-xl px-4 py-3 font-bold bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-white"
                    placeholder="E.g., Summer in Paris"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 dark:text-white">Destination Summary</label>
                  <textarea
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    className="w-full border-2 border-black rounded-xl px-4 py-3 font-bold bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-white h-24 resize-none"
                    placeholder="Describe your trip vibe..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 dark:text-white">Duration (Days)</label>
                    <input
                      type="number"
                      min="1"
                      value={editDays}
                      onChange={(e) => setEditDays(Number(e.target.value))}
                      className="w-full border-2 border-black rounded-xl px-4 py-3 font-bold bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 dark:text-white">Budget ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={editBudget}
                      onChange={(e) => setEditBudget(Number(e.target.value))}
                      className="w-full border-2 border-black rounded-xl px-4 py-3 font-bold bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold flex justify-between items-center mb-2 dark:text-white">
                    <span>Cover Image</span>
                    <label className="text-primary font-black uppercase text-xs cursor-pointer hover:underline flex items-center gap-1">
                      <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" disabled={isUploadingCover} />
                      {isUploadingCover ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : <span className="material-symbols-outlined text-sm">upload</span>}
                      {isUploadingCover ? 'Uploading...' : 'Upload Image'}
                    </label>
                  </label>
                  <div className="h-40 rounded-xl border-2 border-black overflow-hidden dark:border-white relative bg-slate-100">
                    <img src={editCover || '/assets/branding/logo-mark.png'} className="w-full h-full object-cover" alt="Cover" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white font-black italic tracking-widest">CURRENT COVER</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-4 border-2 border-black dark:border-white rounded-xl">
                  <input
                    type="checkbox"
                    id="editIsPublic"
                    checked={editIsPublic}
                    onChange={(e) => setEditIsPublic(e.target.checked)}
                    className="w-6 h-6 border-2 border-black dark:border-white text-primary rounded-md focus:ring-0 focus:ring-offset-0 bg-white"
                  />
                  <label htmlFor="editIsPublic" className="font-bold text-sm cursor-pointer select-none dark:text-white">
                    Make trip public (Visible on Vibe Feed)
                  </label>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleSaveEdit}
                  className="w-full y2k-button glossy-green py-4 rounded-xl text-black font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2"
                >
                  Save Changes <span className="material-symbols-outlined">check_circle</span>
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-4 border-black dark:border-white rounded-3xl p-8 max-w-lg w-full shadow-[8px_8px_0_#000] dark:shadow-[8px_8px_0_#fff]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black uppercase italic tracking-tight dark:text-white">Share Vibe</h2>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="size-10 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
              >
                <span className="material-symbols-outlined text-slate-500 group-hover:text-black dark:group-hover:text-white">close</span>
              </button>
            </div>

            <p className="text-slate-600 dark:text-slate-400 font-bold mb-4">
              Copy this link to share the trip with your friends!
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3 font-medium focus:outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied!');
                }}
                className="y2k-button bg-primary text-black px-6 rounded-xl font-bold uppercase whitespace-nowrap"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
}

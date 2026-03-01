import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Trip, Review, User } from '../context/TravelContext';
import { useTravel } from '../context/TravelContext';

export default function UserProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, followedUserIds, followUser, unfollowUser } = useTravel();
    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [publicTrips, setPublicTrips] = useState<Trip[]>([]);
    const [userReviews, setUserReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!id) return;
            
            setIsLoading(true);
            setError(null);
            try {
                // 1. Fetch Profile
                let profileData = null;
                let profileErr = null;
                
                try {
                    const result = await supabase
                        .from('profiles')
                        .select('id, name, avatar_url, plan')
                        .eq('id', id)
                        .maybeSingle();
                    profileData = result.data;
                    profileErr = result.error;
                } catch (err) {
                    console.warn('[UserProfile] Profile query failed, using fallback:', err);
                    profileErr = err;
                }

                if (profileErr) {
                    console.warn('[UserProfile] Profile error, using user data as fallback:', profileErr);
                    // Fallback: Use current user data if viewing own profile
                    if (user && user.id === id) {
                        setProfileUser({
                            id: user.id,
                            name: user.name,
                            email: '',
                            avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
                            bio: '',
                            plan: user.plan || 'free'
                        });
                        setIsLoading(false);
                        return;
                    } else {
                        throw profileErr;
                    }
                }
                
                // If profile doesn't exist and user is viewing their own profile, create it
                if (!profileData && user && user.id === id) {
                    console.log('[UserProfile] Creating missing profile for current user');
                    const newProfile = {
                        id: user.id,
                        name: user.name,
                        avatar_url: user.avatarUrl,
                        plan: user.plan || 'free'
                    };
                    
                    const { data: createdProfile, error: createErr } = await supabase
                        .from('profiles')
                        .insert(newProfile)
                        .select('id, name, avatar_url, plan')
                        .single();
                        
                    if (createErr) throw createErr;
                    setProfileUser({
                        id: createdProfile.id,
                        name: createdProfile.name || 'Unknown User',
                        email: '',
                        avatarUrl: createdProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
                        bio: '',
                        plan: createdProfile.plan as any || 'free'
                    });
                } else if (!profileData) {
                    throw new Error("User not found");
                } else {
                    setProfileUser({
                        id: profileData.id,
                        name: profileData.name || 'Unknown User',
                        email: '', // Don't expose email publicly ideally
                        avatarUrl: profileData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
                        bio: '', // Bio not supported in database yet
                        plan: profileData.plan as any || 'free'
                    });
                }

                // 2. Fetch Public Trips
                const { data: tripsData, error: tripsErr } = await supabase
                    .from('trips')
                    .select('*')
                    .eq('user_id', id)
                    .eq('is_public', true)
                    .order('created_at', { ascending: false });

                if (tripsErr) throw tripsErr;

                const formattedTrips = (tripsData || []).map((t: any, index: number) => {
                    // Use same placeholder images as TravelContext for consistency
                    const placeholderImages = [
                        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop',
                        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
                        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop',
                        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
                        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
                        'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop',
                        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop',
                        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop'
                    ];
                    
                    let coverImage = t.cover_image;
                    
                    // If no cover image or it's the default logo, use a random beautiful image
                    if (!coverImage || coverImage === '/logo-mark.svg' || coverImage.includes('logo-mark')) {
                        coverImage = placeholderImages[index % placeholderImages.length];
                    }
                    
                    return {
                        ...t,
                        destinationSummary: t.destination_summary,
                        coverImage,
                        isPublic: t.is_public,
                    };
                }) as Trip[];

                setPublicTrips(formattedTrips);

                // 3. Fetch Reviews
                const { data: reviewsData, error: revErr } = await supabase
                    .from('reviews')
                    .select('*, locations(name)')
                    .eq('user_id', id)
                    .order('created_at', { ascending: false });

                if (revErr) throw revErr;

                const formattedReviews = (reviewsData || []).map((r: any) => ({
                    id: r.id,
                    locationId: r.location_id,
                    userId: r.user_id,
                    rating: r.rating,
                    comment: r.comment,
                    locationName: r.locations?.name || 'Unknown Location'
                })) as (Review & { locationName?: string })[];

                setUserReviews(formattedReviews);

            } catch (err: any) {
                console.error("Error fetching profile", err);
                setError(err.message || "Failed to load profile.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [id]);

    const handleFollow = () => {
        if (!user) {
            window.location.href = '/auth';
            return;
        }

        if (followedUserIds.includes(id)) {
            unfollowUser(id);
        } else {
            followUser(id);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
            </div>
        );
    }

    if (error || !profileUser) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-black text-black dark:text-white mb-4">User Not Found</h2>
                <p className="text-slate-500 mb-6">
                    {error || "This user profile doesn't exist or hasn't been created yet."}
                </p>
                {user?.id === id && (
                    <p className="text-sm text-slate-400 mb-4">
                        It looks like you're trying to view your own profile, but it hasn't been set up yet. Try logging out and logging back in to create your profile.
                    </p>
                )}
                <Link to="/explore" className="text-primary font-bold hover:underline mt-4 inline-block">
                    Go Back to Explore
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="mb-6 flex items-center gap-2 text-slate-600 hover:text-black font-bold transition-colors group"
            >
                <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Back
            </button>
            
            {/* Current User Card - Only show when viewing someone else's profile */}
            {user && user.id !== id && (
                <div className="bg-primary dark:bg-primary/90 rounded-2xl border-4 border-black dark:border-white shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff] p-6 mb-8 transition-colors">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <img
                                    src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                                    alt={user.name}
                                    className="size-12 rounded-full border-2 border-black object-cover"
                                    referrerPolicy="no-referrer"
                                />
                                <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-black rounded-full p-1">
                                    <span className="material-symbols-outlined text-white text-[10px]">check</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-black text-black/80 uppercase tracking-wider">You are viewing as</p>
                                <p className="text-lg font-black text-black">{user.name}</p>
                                <p className="text-xs text-black/70">This is your profile</p>
                            </div>
                        </div>
                        <Link
                            to={`/profile/${user.id}`}
                            className="bg-white text-black px-4 py-2 rounded-full font-black uppercase text-xs hover:bg-slate-100 transition-colors flex items-center gap-2 border-2 border-black"
                        >
                            <span className="material-symbols-outlined text-sm">home</span>
                            Go to Your Profile
                        </Link>
                    </div>
                </div>
            )}

            {/* Profile Header */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border-4 border-black dark:border-white shadow-[8px_8px_0_#000] dark:shadow-[8px_8px_0_#fff] p-8 md:p-12 mb-12 relative overflow-hidden transition-colors">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="relative">
                        <img
                            src={profileUser.avatarUrl}
                            alt={profileUser.name}
                            className="size-32 md:size-48 rounded-full border-4 border-black dark:border-white shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff] object-cover bg-slate-100"
                            referrerPolicy="no-referrer"
                        />
                        {user?.id === id && (
                            <div className="absolute -bottom-2 -right-2 bg-primary border-2 border-black rounded-full p-2 animate-pulse">
                                <span className="material-symbols-outlined text-sm">edit</span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                            <h1 className="text-4xl md:text-6xl font-black italic tracking-tight dark:text-white">
                                {profileUser.name}
                            </h1>
                            {user?.id === id && (
                                <span className="bg-yellow-400 text-black text-xs font-black uppercase px-2 py-1 rounded-full animate-bounce">
                                    NEW
                                </span>
                            )}
                        </div>
                        <div className="inline-block bg-black text-white text-xs font-black uppercase px-3 py-1 rounded-full mb-6">
                            {profileUser.plan === 'pro' ? 'PRO NOMAD' : 'EXPLORER'}
                        </div>
                        
                        {/* Bio Section */}
                        <div className="mb-6">
                            {profileUser.bio ? (
                                <p className="text-slate-600 dark:text-slate-300 font-medium text-lg max-w-2xl leading-relaxed whitespace-pre-wrap">
                                    {profileUser.bio}
                                </p>
                            ) : (
                                <div className="bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center">
                                    {user?.id === id ? (
                                        <>
                                            <span className="material-symbols-outlined text-4xl text-slate-400 mb-3 block">edit_note</span>
                                            <p className="text-slate-500 dark:text-slate-400 font-bold mb-2">
                                                No bio yet? Tell your story!
                                            </p>
                                            <p className="text-sm text-slate-400 dark:text-slate-500">
                                                Share your travel adventures and connect with fellow explorers
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-4xl text-slate-400 mb-3 block">person_off</span>
                                            <p className="text-slate-400 italic">
                                                This traveler hasn't written a bio yet.
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-6 justify-center md:justify-start mb-6">
                            <div className="text-center">
                                <div className="text-2xl font-black text-primary">{publicTrips.length}</div>
                                <div className="text-sm text-slate-500 font-bold uppercase">Trips</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-black text-primary">{userReviews.length}</div>
                                <div className="text-sm text-slate-500 font-bold uppercase">Reviews</div>
                            </div>
                            {user?.id !== id && (
                                <div className="text-center">
                                    <div className="text-2xl font-black text-primary">
                                        {followedUserIds.includes(id) ? 'Following' : 'Not Following'}
                                    </div>
                                    <div className="text-sm text-slate-500 font-bold uppercase">Status</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-12">
                {user?.id === id && (
                    <>
                        <button
                            onClick={() => navigate('/settings')}
                            className="px-8 py-4 rounded-full font-black uppercase text-sm bg-primary text-black hover:bg-primary/80 transition-all shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">edit</span>
                            Edit Profile
                        </button>
                        <button
                            onClick={() => navigate('/create-trip')}
                            className="px-8 py-4 rounded-full font-black uppercase text-sm bg-black text-white hover:bg-slate-800 transition-all shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Create Trip
                        </button>
                        <button
                            onClick={() => navigate('/my-trips')}
                            className="px-8 py-4 rounded-full font-black uppercase text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">travel_explore</span>
                            My Trips
                        </button>
                    </>
                )}
                
                {user?.id !== id && (
                    <button
                        onClick={handleFollow}
                        className={`px-8 py-4 rounded-full font-black uppercase text-sm transition-all shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] flex items-center gap-2 ${
                            followedUserIds.includes(id) 
                                ? 'bg-black text-white hover:bg-slate-800' 
                                : 'bg-primary text-black hover:bg-primary/80'
                        }`}
                    >
                        <span className="material-symbols-outlined">
                            {followedUserIds.includes(id) ? 'person_check' : 'person_add'}
                        </span>
                        {followedUserIds.includes(id) ? 'Following' : 'Follow'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Public Trips */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-black dark:text-white mb-6 uppercase italic flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-3xl">map</span>
                        Public Trips ({publicTrips.length})
                    </h2>
                    {publicTrips.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {publicTrips.map(trip => (
                                <Link key={trip.id} to={`/itinerary/${trip.id}`} className="group y2k-card rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border-2 border-black dark:border-white dark:shadow-[4px_4px_0_#fff] transition-all hover:-translate-y-1 block">
                                    <div className="h-40 overflow-hidden relative border-b-2 border-black dark:border-white">
                                        <img src={trip.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={trip.title} />
                                        <div className="absolute top-3 left-3 bg-white text-black text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border-2 border-black shadow-[2px_2px_0_#000]">
                                            {trip.days} Days
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-lg font-bold mb-1 group-hover:text-primary dark:text-white transition-colors">{trip.title}</h3>
                                        <p className="text-slate-500 text-sm line-clamp-2">{trip.destinationSummary}</p>
                                        <div className="mt-4 flex items-center gap-3 text-sm font-bold text-slate-400">
                                            <div className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">favorite</span> {trip.likes}</div>
                                            <div className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">chat_bubble</span> {trip.comments}</div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 text-center">
                            <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">flight_off</span>
                            <h3 className="text-lg font-bold dark:text-white text-slate-600">No public trips yet</h3>
                        </div>
                    )}
                </div>

                {/* Recent Reviews */}
                <div>
                    <h2 className="text-2xl font-black dark:text-white mb-6 uppercase italic flex items-center gap-2">
                        <span className="material-symbols-outlined text-y2k-orange text-3xl">star</span>
                        Reviews ({userReviews.length})
                    </h2>
                    <div className="space-y-4">
                        {userReviews.length > 0 ? (
                            userReviews.map((review: any) => (
                                <div key={review.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-2 border-black dark:border-white shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff] transition-colors">
                                    <p className="font-bold text-primary mb-1 text-sm">{review.locationName}</p>
                                    <div className="flex text-y2k-orange mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span key={star} className={`material-symbols-outlined text-[16px] ${review.rating >= star ? 'fill-1' : ''}`}>star</span>
                                        ))}
                                    </div>
                                    {review.comment && (
                                        <p className="text-sm dark:text-slate-300 italic">"{review.comment}"</p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center text-slate-500 font-bold text-sm">
                                No reviews yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

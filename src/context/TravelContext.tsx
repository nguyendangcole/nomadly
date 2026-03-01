import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type Plan = 'free' | 'pro';

// Currency conversion rates (base: USD)
const CURRENCY_RATES = {
  USD: 1,
  VND: 25500,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 150
};

const CURRENCY_SYMBOLS = {
  USD: '$',
  VND: '₫',
  EUR: '€',
  GBP: '£',
  JPY: '¥'
};

// Currency converter function
const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to USD first, then to target currency
  const amountInUSD = amount / CURRENCY_RATES[fromCurrency as keyof typeof CURRENCY_RATES];
  return amountInUSD * CURRENCY_RATES[toCurrency as keyof typeof CURRENCY_RATES];
};

// Format currency with symbol
const formatCurrency = (amount: number, currency: string): string => {
  const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS];
  const formattedAmount = currency === 'JPY' ? Math.round(amount).toLocaleString() : amount.toFixed(2);
  return `${symbol}${formattedAmount}`;
};

// Get user's preferred currency from localStorage
const getUserCurrency = (): string => {
  try {
    const settings = localStorage.getItem('nomadly:settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      return parsed.currency || 'USD';
    }
  } catch (error) {
    console.error('Failed to load currency setting:', error);
  }
  return 'USD';
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio?: string;
  plan: Plan;
  isAdmin?: boolean;
};

export type Trip = {
  id: string;
  userId: string;
  title: string;
  destinationSummary: string;
  coverImage: string;
  days: number;
  budget: number;
  isPublic: boolean;
  isArchived?: boolean;
  likes: number;
  comments: number;
  createdAt?: string;
};

export type LocationCategory = 'Stay' | 'Food' | 'Fun';

export type Location = {
  id: string;
  tripId: string;
  name: string;
  category: LocationCategory;
  cost: number;
  dayNumber: number;
  rating?: number;
  description?: string;
  imageUrl?: string;
};

export type Review = {
  id: string;
  locationId: string;
  userId: string;
  rating: number; // 1-5
  comment: string;
  createdAt?: string;
};

export type TripComment = {
  id: string;
  tripId: string;
  userId: string;
  comment: string;
  createdAt: string;
  profiles?: {
    name: string;
    avatar_url: string;
  };
};

export type NotificationType = 'follow' | 'comment' | 'post';

export type TravelBuddyRequest = {
  id: string;
  tripId: string;
  requesterId: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  trip?: {
    title: string;
    destinationSummary: string;
    startDate: string;
    endDate: string;
  };
  requester?: {
    name: string;
    avatar_url: string;
  };
};

export type TripNotification = {
  id: string;
  userId: string; // The user receiving the notification
  actorId: string; // The user who performed the action
  type: NotificationType;
  tripId?: string; // Related trip if type is comment/post
  isRead: boolean;
  createdAt: string;
  actorProfile?: {
    name: string;
    avatar_url: string;
  };
};

type TravelContextValue = {
  user: User | null;
  trips: Trip[];
  locations: Location[];
  reviews: Review[];
  tripComments: TripComment[];
  notifications: TripNotification[];
  travelBuddyRequests: TravelBuddyRequest[];
  isLoading: boolean;
  isAuthLoading: boolean;
  error: string | null;

  // Auth actions
  login: (params: { email: string; password: string; name?: string; isRegister?: boolean }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;

  // Trip actions
  createTrip: (input: Omit<Trip, 'id' | 'likes' | 'comments'>) => Promise<Trip>;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => Promise<boolean>;
  toggleTripLike: (id: string) => void;
  addTripComment: (params: { tripId: string; comment: string }) => Promise<boolean>;

  // Utilities
  uploadImage: (file: File, bucket?: string) => Promise<string>;

  // Profile actions
  updateUserProfile: (updates: Partial<User>) => void;

  // Location actions
  addLocation: (input: Omit<Location, 'id'>) => Promise<Location>;
  deleteLocation: (id: string) => void;

  // Review actions
  addReview: (input: Omit<Review, 'id'>) => Promise<Review>;

  // Save actions
  savedTripIds: string[];
  saveTrip: (id: string) => void;
  unsaveTrip: (id: string) => void;

  // Follow actions
  followedUserIds: string[];
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;

  // Notification actions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Travel Buddy actions
  createTravelBuddyRequest: (params: { tripId: string; requesterId: string; message: string }) => Promise<void>;
  updateTravelBuddyRequest: (id: string, status: 'accepted' | 'declined') => Promise<void>;
  deleteTravelBuddyRequest: (id: string) => Promise<void>;
  getTravelBuddyRequests: (userId: string) => Promise<void>;

  // Theme actions
  isDarkMode: boolean;
  toggleTheme: () => void;

  // Currency actions
  convertCurrency: (amount: number, fromCurrency?: string) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  getUserCurrency: () => string;
};

const TravelContext = createContext<TravelContextValue | undefined>(undefined);

const STORAGE_KEY_THEME = 'nomadly:theme';

function loadThemeFromStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_THEME);
    return raw ? JSON.parse(raw) : false;
  } catch {
    return false;
  }
}

export const TravelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tripComments, setTripComments] = useState<TripComment[]>([]);
  const [notifications, setNotifications] = useState<TripNotification[]>([]);
  const [travelBuddyRequests, setTravelBuddyRequests] = useState<TravelBuddyRequest[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => loadThemeFromStorage());
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedTripIds, setSavedTripIds] = useState<string[]>([]);

  // Load savedTripIds for current user when user changes
  useEffect(() => {
    if (user) {
      try {
        const raw = localStorage.getItem(`nomadly:savedTrips:${user.id}`);
        setSavedTripIds(raw ? JSON.parse(raw) : []);
        
        // Cleanup old keys if they exist
        localStorage.removeItem('nomadly:savedTrips');
        localStorage.removeItem('nomadly:following');
        localStorage.removeItem('nomadly:notifications');
      } catch { 
        setSavedTripIds([]);
      }
    } else {
      setSavedTripIds([]);
    }
  }, [user]);

  // Fetch initial data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('[DEBUG] Fetch timeout - setting loading to false');
        setIsLoading(false);
      }, 8000); // Reduced from 10s to 8s
      
      try {
        console.log('[DEBUG] Starting fetchData...');

        // Execute queries in parallel for better performance
        const [tripsRes, locsRes, reviewsRes, commentsRes] = await Promise.all([
          supabase.from('trips').select('*').order('created_at', { ascending: false }),
          supabase.from('locations').select('*').order('created_at', { ascending: true }),
          supabase.from('reviews').select('*').order('created_at', { ascending: false }),
          supabase.from('trip_comments').select(`
              id, trip_id, user_id, comment, created_at,
              profiles(name, avatar_url)
            `).order('created_at', { ascending: false })
        ]);

        // Check for errors
        if (tripsRes.error) throw tripsRes.error;
        if (locsRes.error) throw locsRes.error;
        if (reviewsRes.error) throw reviewsRes.error;
        if (commentsRes.error) throw commentsRes.error;

        console.log('[DEBUG] Data fetched:', { tripsRes, locsRes, reviewsRes, commentsRes });
        clearTimeout(timeoutId); // Clear timeout on success

        const formattedTrips = (tripsRes?.data || []).map((t: any, index: number) => {
          // Generate beautiful placeholder images for trips without covers
          const placeholderImages = [
            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop&auto=format'
          ];
          
          let coverImage = t.cover_image;
          
          // Enhanced fallback logic
          if (!coverImage || 
              coverImage === '/logo-mark.svg' || 
              coverImage.includes('logo-mark') ||
              coverImage === '' ||
              coverImage === null ||
              coverImage === undefined) {
            coverImage = placeholderImages[index % placeholderImages.length];
            console.log(`[DEBUG] Using placeholder for trip "${t.title}": ${coverImage}`);
          } else {
            console.log(`[DEBUG] Using original image for trip "${t.title}": ${coverImage}`);
          }
          
          return {
            ...t,
            userId: t.user_id,
            destinationSummary: t.destination_summary,
            coverImage,
            isPublic: t.is_public,
            createdAt: t.created_at,
          };
        }) as Trip[];

        const formattedLocs = (locsRes?.data || []).map((l: any) => ({
          ...l,
          tripId: l.trip_id,
          dayNumber: l.day_number,
          description: l.description,
          imageUrl: l.image_url,
        })) as Location[];

        const formattedReviews = (reviewsRes?.data || []).map((r: any) => ({
          ...r,
          locationId: r.location_id,
          userId: r.user_id,
          createdAt: r.created_at,
        })) as Review[];

        const formattedComments = (commentsRes?.data || []).map((c: any) => ({
          ...c,
          tripId: c.trip_id,
          userId: c.user_id,
          createdAt: c.created_at,
          profiles: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles
        })) as unknown as TripComment[];

        setTrips(formattedTrips);
        setLocations(formattedLocs);
        setReviews(formattedReviews);
        setTripComments(formattedComments);
        console.log('[DEBUG] States updated with formatted data.');
      } catch (err: any) {
        console.error('Error fetching data from Supabase:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        clearTimeout(timeoutId); // Clear timeout on error too
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY_THEME, JSON.stringify(isDarkMode));
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  // Persist saved trips in localStorage for current user
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(`nomadly:savedTrips:${user.id}`, JSON.stringify(savedTripIds));
      } catch { }
    }
  }, [savedTripIds, user]);

  // Load notifications for current user when user changes
  useEffect(() => {
    if (user) {
      try {
        const raw = localStorage.getItem(`nomadly:notifications:${user.id}`);
        setNotifications(raw ? JSON.parse(raw) : []);
      } catch { 
        setNotifications([]);
      }
    } else {
      setNotifications([]);
    }
  }, [user]);

  // Save notifications for current user
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(`nomadly:notifications:${user.id}`, JSON.stringify(notifications));
      } catch { }
    }
  }, [notifications, user]);

  const saveTrip = (id: string) => setSavedTripIds(prev => prev.includes(id) ? prev : [...prev, id]);
  const unsaveTrip = (id: string) => setSavedTripIds(prev => prev.filter(s => s !== id));

  const [followedUserIds, setFollowedUserIds] = useState<string[]>([]);

  // Load followedUserIds for current user when user changes
  useEffect(() => {
    if (user) {
      try {
        const raw = localStorage.getItem(`nomadly:following:${user.id}`);
        setFollowedUserIds(raw ? JSON.parse(raw) : []);
      } catch { 
        setFollowedUserIds([]);
      }
    } else {
      setFollowedUserIds([]);
    }
  }, [user]);

  // Save followedUserIds for current user
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(`nomadly:following:${user.id}`, JSON.stringify(followedUserIds));
      } catch { }
    }
  }, [followedUserIds, user]);

  const followUser = (userId: string) => {
    // Prevent users from following themselves
    if (user && user.id === userId) {
      console.warn('[TravelContext] User cannot follow themselves');
      // Show a friendly message (you could also use a toast notification here)
      alert('You cannot follow yourself! 😊');
      return;
    }
    
    setFollowedUserIds(prev => prev.includes(userId) ? prev : [...prev, userId]);
    // Mock Notification - In real app, this would create notification for the person being followed
    if (user) {
      setNotifications(prev => [{
        id: Math.random().toString(),
        userId: userId, // Notification goes to the person being followed
        actorId: user.id, // The person who is following
        type: 'follow',
        isRead: false,
        createdAt: new Date().toISOString(),
        actorProfile: { 
          name: user.name, 
          avatar_url: user.avatarUrl 
        }
      }, ...prev]);
    }
  };
  const unfollowUser = (userId: string) => setFollowedUserIds(prev => prev.filter(id => id !== userId));

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  useEffect(() => {
    // Keep auth state in sync with Supabase session manager automatically!
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsAuthLoading(true);
      
      if (session?.user) {
        // Fetch their profile with timeout
        const profilePromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        const timeoutId = setTimeout(() => {
          console.warn('[DEBUG] Profile fetch timeout');
          setIsAuthLoading(false);
        }, 5000); // 5s timeout for profile fetch

        try {
          const { data: profile } = await profilePromise;
          clearTimeout(timeoutId);
          
          if (profile) {
            setUser({
              id: profile.id,
              name: profile.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              avatarUrl: profile.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
              bio: profile.bio || '',
              plan: (profile.plan as Plan) || 'free',
              isAdmin: profile.is_admin === true,
            });
          } else {
            // Create basic user if no profile exists
            setUser({
              id: session.user.id,
              name: session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
              bio: '',
              plan: 'free',
              isAdmin: false,
            });
          }
        } catch (error) {
          console.error('Profile fetch error:', error);
          clearTimeout(timeoutId);
          // Set basic user even on error
          setUser({
            id: session.user.id,
            name: session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
            bio: '',
            plan: 'free',
            isAdmin: false,
          });
        } finally {
          setIsAuthLoading(false);
        }
      } else {
        setUser(null);
        setIsAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async ({ email, password, name, isRegister }: { email: string; password: string; name?: string; isRegister?: boolean }) => {
    setIsLoading(true);
    setError(null);
    try {
      let authResult;
      let userId: string | undefined;

      if (isRegister) {
        // Attempt to sign up
        console.log('[DEBUG] Calling auth.signUp');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
        console.log('[DEBUG] auth.signUp resolved', { signUpData, signUpError });

        if (signUpError) {
          // If signup fails, check if it's because the user already exists
          if (signUpError.message.includes('User already registered') || signUpError.message.includes('duplicate key value violates unique constraint')) {
            // Try to sign in instead
            console.log('[DEBUG] Calling auth.signInWithPassword (fallback from signUp)');
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            console.log('[DEBUG] auth.signInWithPassword resolved', { signInData, signInError });
            if (signInError) {
              if (signInError.message.toLowerCase().includes('email not confirmed')) {
                throw new Error("This account's email has not been confirmed. Please check your email and confirm.");
              } else if (signInError.message.toLowerCase().includes('invalid login credentials')) {
                throw new Error("Email already exists but password is incorrect. Please try again or reset your password.");
              }
              throw signInError; // Other sign-in errors
            }
            authResult = signInData;
          } else {
            throw signUpError; // Other sign-up errors
          }
        } else {
          authResult = signUpData;
        }
      } else {
        // Regular sign-in
        console.log('[DEBUG] Calling auth.signInWithPassword (direct)');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        console.log('[DEBUG] auth.signInWithPassword resolved', { signInData, signInError });
        if (signInError) {
          if (signInError.message.toLowerCase().includes('email not confirmed')) {
            throw new Error("This account's email has not been confirmed. Please check your email and confirm.");
          } else if (signInError.message.toLowerCase().includes('invalid login credentials')) {
            throw new Error("Invalid email or password. Please try again.");
          }
          throw signInError; // Other sign-in errors
        }
        authResult = signInData;
      }

      userId = authResult?.user?.id;

      if (!userId) {
        throw new Error("Unable to authenticate user - No user ID returned from Supabase.");
      }

      // Upsert profile
      const displayName = name && name.trim().length > 0 ? name.trim() : email.split('@')[0];
      const newProfile = {
        id: userId,
        name: displayName,
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        plan: 'free'
      };

      console.log('[DEBUG] Calling profiles upsert with', newProfile);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert(newProfile, { onConflict: 'id' })
        .select('id, name, avatar_url, plan')
        .single();
      console.log('[DEBUG] profiles upsert resolved', { profileData, profileError });

      if (profileError) throw profileError;

      setUser({
        id: profileData.id,
        name: profileData.name || email.split('@')[0],
        email,
        avatarUrl: profileData.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        plan: (profileData.plan as Plan) || 'free',
        isAdmin: false, // Default to false since is_admin column might not exist
      });
      console.log('[DEBUG] login function complete!');

    } catch (err: any) {
      console.error('Login error:', err);
      if (err?.message?.includes('Lock broken by another request') || err?.name === 'AbortError') {
        console.warn("Ignored Supabase Auth Lock Error (Safe in Dev/HMR)");
        setError("Server syncing, please try logging in again.");
      } else {
        setError(err.message || 'Login failed, please try again.');
      }
      throw err; // Re-throw so the caller can catch it and stop loading state
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/explore'
        }
      });
      if (error) throw error;
      // Note: The actual redirect and session handling will be caught by the onAuthStateChange listener
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Google Login failed');
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) return;

    // Optimistic update
    const oldUser = { ...user };
    setUser({ ...user, ...updates });

    try {
      const dbUpdates = {
        name: updates.name,
        avatar_url: updates.avatarUrl
      };
      const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', user.id);
      if (error) throw error;
    } catch (err) {
      console.error('Update profile error:', err);
      // Revert on failure
      setUser(oldUser);
    }
  };

  const createTrip = async (input: Omit<Trip, 'id' | 'likes' | 'comments'>) => {
    if (!user) throw new Error("Please log in before creating a trip.");

    try {
      const dbTrip = {
        user_id: user.id,
        title: input.title,
        destination_summary: input.destinationSummary,
        cover_image: input.coverImage,
        days: input.days,
        budget: input.budget,
        is_public: input.isPublic,
      };

      const { data, error } = await supabase.from('trips').insert([dbTrip]).select().single();
      if (error) throw error;

      const newTrip: Trip = {
        id: data.id,
        userId: user.id,
        title: input.title,
        destinationSummary: input.destinationSummary,
        coverImage: data.cover_image,
        days: data.days,
        budget: data.budget,
        isPublic: data.is_public,
        likes: data.likes,
        comments: data.comments,
        createdAt: data.created_at || new Date().toISOString(),
      };

      setTrips((prev) => [newTrip, ...prev]);

      // Trigger notification for followers when a new public trip is created
      if (input.isPublic) {
        // In a real app we would query followers from the DB. 
        // Here we mock inserting a notification to "all followers"
        setNotifications(prev => [{
          id: Math.random().toString(),
          userId: 'followers-mock-id', // Would map to each follower
          actorId: user.id,
          type: 'post',
          tripId: data.id,
          isRead: false,
          createdAt: new Date().toISOString(),
          actorProfile: { name: user.name, avatar_url: user.avatarUrl }
        }, ...prev]);
      }

      return newTrip;
    } catch (err) {
      console.error('Error creating trip:', err);
      throw err;
    }
  };

  const updateTrip = async (id: string, updates: Partial<Trip>) => {
    // Optimistic update
    const oldTrips = [...trips];
    setTrips((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));

    try {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.destinationSummary !== undefined) dbUpdates.destination_summary = updates.destinationSummary;
      if (updates.coverImage !== undefined) dbUpdates.cover_image = updates.coverImage;
      if (updates.days !== undefined) dbUpdates.days = updates.days;
      if (updates.budget !== undefined) dbUpdates.budget = updates.budget;
      if (updates.isPublic !== undefined) dbUpdates.is_public = updates.isPublic;

      const { error } = await supabase.from('trips').update(dbUpdates).eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating trip:', err);
      // Revert on failure
      setTrips(oldTrips);
    }
  };

  const deleteTrip = async (id: string) => {
    // Optimistic delete
    const oldTrips = [...trips];
    const oldLocs = [...locations];

    setTrips((prev) => prev.filter((t) => t.id !== id));
    setLocations((prev) => prev.filter((l) => l.tripId !== id));

    try {
      const { error } = await supabase.from('trips').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting trip:', err);
      // Revert on failure
      setTrips(oldTrips);
      setLocations(oldLocs);
    }
  };

  const toggleTripLike = async (id: string) => {
    if (!user) return;

    // Find the trip
    const trip = trips.find(t => t.id === id);
    if (!trip) return;

    // Optimistic update
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return { ...t, likes: t.likes + 1 };
        }
        return t;
      })
    );

    try {
      // Simplistic mock real backend increment logic
      const { error } = await supabase.from('trips').update({ likes: trip.likes + 1 }).eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error liking trip:', err);
    }
  };

  const uploadImage = async (file: File, bucket: string = 'trip-images'): Promise<string> => {
    try {
      if (!user) throw new Error("Please log in to upload an image.");

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      throw err; // Re-throw so CreateTrip can catch it
    }
  };

  const addLocation = async (input: Omit<Location, 'id'>) => {
    try {
      const dbLoc: any = {
        trip_id: input.tripId,
        name: input.name,
        category: input.category,
        cost: input.cost,
        day_number: input.dayNumber
      };

      if (input.description) dbLoc.description = input.description;
      if (input.imageUrl) dbLoc.image_url = input.imageUrl;

      const { data, error } = await supabase.from('locations').insert([dbLoc]).select().single();
      if (error) throw error;

      const newLoc: Location = {
        id: data.id,
        tripId: data.trip_id,
        name: data.name,
        category: data.category as LocationCategory,
        cost: data.cost,
        dayNumber: data.day_number,
        rating: data.rating,
        description: data.description,
        imageUrl: data.image_url,
      };

      setLocations((prev) => [...prev, newLoc]);
      return newLoc;
    } catch (err) {
      console.error('Error adding location:', err);
      throw err;
    }
  };

  const deleteLocation = async (id: string) => {
    // Optimistic delete
    const oldLocs = [...locations];
    const oldRevs = [...reviews];

    setLocations((prev) => prev.filter((l) => l.id !== id));
    setReviews((prev) => prev.filter((r) => r.locationId !== id));

    try {
      const { error } = await supabase.from('locations').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting location:', err);
      setLocations(oldLocs);
      setReviews(oldRevs);
    }
  };

  const addReview = async (input: Omit<Review, 'id'>) => {
    if (!user) throw new Error("Please log in to add a review.");
    try {
      const dbReview = {
        location_id: input.locationId,
        user_id: user.id,
        rating: input.rating,
        comment: input.comment,
      };

      const { data, error } = await supabase.from('reviews').insert([dbReview]).select().single();
      if (error) throw error;

      const newRev: Review = {
        id: data.id,
        locationId: data.location_id,
        userId: data.user_id,
        rating: data.rating,
        comment: data.comment,
        createdAt: data.created_at || new Date().toISOString(),
      };

      setReviews((prev) => [newRev, ...prev]);

      // Trigger location average rating update locally
      const locReviews = reviews.filter((r) => r.locationId === input.locationId).concat(newRev);
      const avgRating = locReviews.reduce((sum, r) => sum + r.rating, 0) / locReviews.length;

      setLocations((prev) =>
        prev.map((l) => (l.id === input.locationId ? { ...l, rating: Number(avgRating.toFixed(1)) } : l))
      );

      // Update location rating in Supabase too
      await supabase.from('locations').update({ rating: Number(avgRating.toFixed(1)) }).eq('id', input.locationId);

      return newRev;
    } catch (err) {
      console.error('Error adding review:', err);
      throw err;
    }
  };

  const addTripComment = async (params: { tripId: string; comment: string }) => {
    if (!user) {
      setError("Please log in to comment.");
      return false;
    }
    try {
      const dbComment = {
        trip_id: params.tripId,
        user_id: user.id,
        comment: params.comment,
      };

      const { data, error: err } = await supabase.from('trip_comments').insert([dbComment]).select(`
        id, trip_id, user_id, comment, created_at,
        profiles(name, avatar_url)
      `).single();

      if (err) throw err;

      const newComment = {
        id: data.id,
        tripId: data.trip_id,
        userId: data.user_id,
        comment: data.comment,
        createdAt: data.created_at,
        profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
      } as unknown as TripComment;

      setTripComments((prev) => [newComment, ...prev]);

      // Optimitistic update for trip comments counter if it exists
      setTrips((prev) => prev.map(t => t.id === params.tripId ? { ...t, comments: (t.comments || 0) + 1 } : t));

      // Trigger notification to the trip owner
      const tripOwnerId = trips.find(t => t.id === params.tripId)?.userId;
      if (tripOwnerId && tripOwnerId !== user.id) {
        setNotifications(prev => [{
          id: Math.random().toString(),
          userId: tripOwnerId,
          actorId: user.id,
          type: 'comment',
          tripId: params.tripId,
          isRead: false,
          createdAt: new Date().toISOString(),
          actorProfile: { name: user.name, avatar_url: user.avatarUrl }
        }, ...prev]);
      }

      return true;
    } catch (err: any) {
      console.error('Error adding trip comment:', err);
      setError(err.message || 'Failed to post comment.');
      return false;
    }
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Travel Buddy functions
  const createTravelBuddyRequest = async (params: { tripId: string; requesterId: string; message: string }) => {
    try {
      const { data, error } = await supabase
        .from('travel_buddy_requests')
        .insert([{
          trip_id: params.tripId,
          requester_id: params.requesterId,
          message: params.message,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setTravelBuddyRequests(prev => [data, ...prev]);

      // Refresh requests to get full data with joins
      await getTravelBuddyRequests(params.requesterId);
    } catch (err: any) {
      console.error('Error creating travel buddy request:', err);
      throw err;
    }
  };

  const updateTravelBuddyRequest = async (id: string, status: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('travel_buddy_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setTravelBuddyRequests(prev => 
        prev.map(req => req.id === id ? { ...req, status } : req)
      );

      console.log(`Travel buddy request ${id} ${status}`);
    } catch (err: any) {
      console.error('Error updating travel buddy request:', err);
      throw err;
    }
  };

  const deleteTravelBuddyRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('travel_buddy_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from local state
      setTravelBuddyRequests(prev => prev.filter(req => req.id !== id));

      console.log(`Travel buddy request ${id} deleted`);
    } catch (err: any) {
      console.error('Error deleting travel buddy request:', err);
      throw err;
    }
  };

  const getTravelBuddyRequests = async (userId: string) => {
    try {
      // Simple query first to test
      const { data, error } = await supabase
        .from('travel_buddy_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Travel Buddy] Simple query error:', error);
        throw error;
      }

      setTravelBuddyRequests(data || []);
    } catch (err: any) {
      console.error('Error fetching travel buddy requests:', err);
      // Try without status filter as fallback
      try {
        const { data, error } = await supabase
          .from('travel_buddy_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error) {
          setTravelBuddyRequests(data || []);
        }
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
    }
  };

  const value: TravelContextValue = useMemo(
    () => ({
      user,
      trips,
      locations,
      reviews,
      tripComments,
      notifications,
      travelBuddyRequests,
      isLoading,
      isAuthLoading,
      error,
      login,
      loginWithGoogle,
      logout,
      updateUserProfile,
      createTrip,
      updateTrip,
      deleteTrip,
      toggleTripLike,
      addTripComment,
      uploadImage,
      addLocation,
      deleteLocation,
      addReview,
      isDarkMode,
      toggleTheme,
      savedTripIds,
      saveTrip,
      unsaveTrip,
      followedUserIds,
      followUser,
      unfollowUser,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      
      // Travel Buddy functions
      createTravelBuddyRequest,
      updateTravelBuddyRequest,
      deleteTravelBuddyRequest,
      getTravelBuddyRequests,
      
      // Currency functions
      convertCurrency: (amount: number, fromCurrency: string = 'USD') => {
        const userCurrency = getUserCurrency();
        const convertedAmount = convertCurrency(amount, fromCurrency, userCurrency);
        return formatCurrency(convertedAmount, userCurrency);
      },
      formatCurrency,
      getUserCurrency,
    }),
    [user, trips, locations, reviews, tripComments, notifications, travelBuddyRequests, isLoading, isAuthLoading, error, savedTripIds, followedUserIds]
  );

  return <TravelContext.Provider value={value}>{children}</TravelContext.Provider>;
};

export function useTravel() {
  const ctx = useContext(TravelContext);
  if (!ctx) {
    throw new Error('useTravel phải được dùng bên trong TravelProvider');
  }
  return ctx;
}


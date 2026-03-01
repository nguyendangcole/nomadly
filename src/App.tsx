import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Itinerary from './components/Itinerary';
import Explore from './components/Explore';
import CreateTrip from './components/CreateTrip';
import Review from './components/Review';
import SocialReviews from './components/SocialReviews';
import MyTrips from './components/MyTrips';
import UserProfile from './components/UserProfile';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import Settings from './components/Settings';
import TourGuide from './components/TourGuide';
import { TravelProvider, useTravel } from './context/TravelContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthLoading } = useTravel();
  if (isAuthLoading) return <div className="h-screen w-screen flex items-center justify-center font-display font-black text-2xl uppercase">Loading...</div>;
  if (!user) return <Navigate to="/auth" state={{ from: window.location.pathname }} replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <TravelProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/vibe-feed" element={<ProtectedRoute><SocialReviews /></ProtectedRoute>} />
          <Route path="/itinerary/:id" element={<ProtectedRoute><Itinerary /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/my-trips" element={<ProtectedRoute><MyTrips /></ProtectedRoute>} />
          <Route path="/create-trip" element={<ProtectedRoute><CreateTrip /></ProtectedRoute>} />
          <Route path="/review/:locationId" element={<ProtectedRoute><Review /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-white font-display">
              <div className="text-center">
                <h1 className="text-4xl font-black mb-4">404</h1>
                <p className="text-slate-600 mb-8">Page not found</p>
                <Link to="/auth" className="bg-primary text-black px-6 py-3 rounded-full font-black uppercase hover:scale-105 transition-transform">
                  Go Home
                </Link>
              </div>
            </div>
          } />
        </Routes>
        <TourGuide />
      </TravelProvider>
    </Router>
  );
}

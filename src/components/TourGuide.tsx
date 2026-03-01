import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for target element
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void; // Optional action to perform
}

const TourGuide: React.FC = () => {
  const { user } = useTravel();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const navigate = useNavigate();

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: '🎉 Welcome to Nomadly!',
      content: 'This is your travel planning platform where you can create trips, share experiences, and connect with fellow travelers worldwide. Let\'s explore together!',
      position: 'center'
    },
    {
      id: 'dashboard',
      title: '📊 Your Dashboard',
      content: 'This is your command center. Here you\'ll see upcoming trips, recent activity, and personalized travel recommendations to inspire your next adventure.',
      target: '.dashboard-overview',
      position: 'bottom'
    },
    {
      id: 'create-trip',
      title: '✨ Create New Trip',
      content: 'Start planning your dream trip! Add destinations, itineraries, and photos to create an unforgettable travel journey that you can share with others.',
      target: '.create-trip-btn',
      position: 'bottom',
      action: () => navigate('/create-trip')
    },
    {
      id: 'explore',
      title: '🔍 Explore Community',
      content: 'Discover amazing trips from our community, get inspired by other travelers\' experiences, and save your favorite trips for future reference.',
      target: '.explore-link',
      position: 'bottom',
      action: () => navigate('/explore')
    },
    {
      id: 'profile',
      title: '👤 Your Profile',
      content: 'Customize your profile, add your avatar, write your bio, and connect with other travelers who follow your journeys.',
      target: '.profile-link',
      position: 'bottom',
      action: () => {
        if (user?.id) {
          navigate(`/profile/${user.id}`);
        }
      }
    },
    {
      id: 'social',
      title: '🌙 Connect & Share',
      content: 'Follow other travelers, write reviews, and get notifications about community activities. Share your adventures and inspire others!',
      target: '.social-features',
      position: 'top'
    },
    {
      id: 'complete',
      title: '🎉 All Set!',
      content: 'Awesome! You\'re ready to start your journey with Nomadly. Feel free to explore all features and connect with our amazing travel community!',
      position: 'center'
    }
  ];

  useEffect(() => {
    // Only show tour if user is logged in
    if (!user) {
      console.log('[TourGuide] User not logged in, skipping tour');
      return;
    }
    
    // Check if it's user's first visit
    const hasSeenTour = localStorage.getItem('nomadly:hasSeenTour');
    console.log('[TourGuide] Debug:', { 
      userId: user.id, 
      userEmail: user.email,
      hasSeenTour, 
      isFirstVisit: !hasSeenTour 
    });
    
    if (!hasSeenTour) {
      setIsFirstVisit(true);
      console.log('[TourGuide] Starting tour for new user...');
      // Show tour after a short delay to let page load
      setTimeout(() => {
        console.log('[TourGuide] Setting isActive to true');
        setIsActive(true);
      }, 1500);
    } else {
      console.log('[TourGuide] User has already seen tour');
    }
  }, [user]);

  const startTour = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      const step = tourSteps[currentStep];
      if (step.action) {
        step.action();
      }
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    setIsActive(false);
    localStorage.setItem('nomadly:hasSeenTour', 'true');
  };

  const skipTour = () => {
    setIsActive(false);
    localStorage.setItem('nomadly:hasSeenTour', 'true');
  };

  const highlightTarget = (target?: string) => {
    if (!target) return;
    
    const element = document.querySelector(target);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('tour-highlight');
      setTimeout(() => {
        element.classList.remove('tour-highlight');
      }, 3000);
    }
  };

  useEffect(() => {
    if (isActive && tourSteps[currentStep].target) {
      setTimeout(() => highlightTarget(tourSteps[currentStep].target), 300);
    }
  }, [currentStep, isActive]);

  // Don't render if user is not logged in
  if (!user) {
    console.log('[TourGuide] Not rendering: User not logged in');
    return null;
  }
  
  if (!isActive) {
    console.log('[TourGuide] Not rendering: Tour not active');
    return null;
  }

  console.log('[TourGuide] Rendering tour component, step:', currentStep);
  const currentTourStep = tourSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={skipTour} />
      
      {/* Tour Content */}
      <div className={`fixed z-[60] max-w-md bg-white dark:bg-slate-900 rounded-2xl border-4 border-black dark:border-white shadow-[8px_8px_0_#000] dark:shadow-[8px_8px_0_#fff] p-6 ${
        currentTourStep.position === 'center' 
          ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' 
          : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
      }`}>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex gap-1">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-1 rounded-full ${
                  index <= currentStep ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3">
            {currentTourStep.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {currentTourStep.content}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              currentStep === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            ← Previous
          </button>

          <div className="text-sm text-slate-500 dark:text-slate-400">
            {currentStep + 1} / {tourSteps.length}
          </div>

          <div className="flex gap-2">
            <button
              onClick={skipTour}
              className="px-4 py-2 rounded-lg font-bold text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-primary text-black rounded-lg font-bold text-sm hover:bg-primary/80 transition-colors shadow-[2px_2px_0_#000]"
            >
              {currentStep === tourSteps.length - 1 ? 'Complete' : 'Next →'}
            </button>
          </div>
        </div>

        {/* Tour Badge */}
        <div className="absolute -top-3 -right-3 bg-y2k-pink text-black text-xs font-black px-2 py-1 rounded-full border-2 border-black">
          TOUR GUIDE
        </div>
      </div>

      {/* Highlight Styles */}
      <style jsx>{`
        .tour-highlight {
          position: relative;
          z-index: 51;
          box-shadow: 0 0 0 4px #fbbf24, 0 0 0 8px #000;
          border-radius: 0.5rem;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px #fbbf24, 0 0 0 8px #000;
          }
          50% {
            box-shadow: 0 0 0 8px #fbbf24, 0 0 0 12px #000;
          }
        }
      `}</style>
    </>
  );
};

export default TourGuide;

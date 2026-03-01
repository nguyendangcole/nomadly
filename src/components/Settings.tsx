import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';

type Currency = 'VND' | 'USD' | 'EUR' | 'GBP' | 'JPY';
type CalendarProvider = 'none' | 'google' | 'outlook';

interface SettingsState {
  currency: Currency;
  calendarProvider: CalendarProvider;
  emailNotifications: boolean;
  pushNotifications: boolean;
  profileVisibility: 'public' | 'friends' | 'private';
}

const CURRENCIES = [
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' }
];

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout, updateUserProfile, uploadImage } = useTravel();
  const [activeTab, setActiveTab] = useState<'account' | 'preferences' | 'notifications'>('account');
  const [settings, setSettings] = useState<SettingsState>({
    currency: 'VND',
    calendarProvider: 'none',
    emailNotifications: true,
    pushNotifications: true,
    profileVisibility: 'public'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Profile edit state
  const [editName, setEditName] = useState(user?.name || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatarUrl || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nomadly:settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = async (newSettings: Partial<SettingsState>) => {
    setIsSaving(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      localStorage.setItem('nomadly:settings', JSON.stringify(updatedSettings));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('nomadly:settings');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleCalendarConnect = async (provider: CalendarProvider) => {
    if (provider === 'google') {
      // Simulate Google Calendar OAuth
      window.open('https://accounts.google.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=' + window.location.origin + '/settings/calendar&response_type=code&scope=https://www.googleapis.com/auth/calendar', '_blank');
    } else if (provider === 'outlook') {
      // Simulate Outlook OAuth
      window.open('https://login.microsoft.com/common/oauth2/v2.0/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=' + window.location.origin + '/settings/calendar&response_type=code&scope=https://graph.microsoft.com/calendars.readwrite', '_blank');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const publicUrl = await uploadImage(file, 'avatars');
      setEditAvatar(publicUrl);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile({
        name: editName,
        avatarUrl: editAvatar
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f4f4f0] font-display flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-black mb-4">Please log in</h1>
          <p className="text-slate-600 mb-8">You need to be logged in to access settings</p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-primary text-black px-8 py-3 rounded-full font-black uppercase hover:scale-105 transition-transform"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f0] font-display">
      {/* Header */}
      <header className="bg-white border-b-4 border-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">arrow_back</span>
              </button>
              <h1 className="text-2xl font-black">Settings</h1>
            </div>
            
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="bg-red-500 text-white px-6 py-2 rounded-full font-black uppercase text-sm hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined">logout</span>
              Log Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 bg-slate-200 p-1 rounded-xl">
          {[
            { id: 'account', label: 'Account', icon: 'person' },
            { id: 'preferences', label: 'Preferences', icon: 'tune' },
            { id: 'notifications', label: 'Notifications', icon: 'notifications' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 rounded-lg font-black uppercase text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Profile Edit */}
            <div className="bg-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0_#000]">
              <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">edit</span>
                Edit Profile
              </h2>
              
              <div className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img
                      src={editAvatar}
                      alt="Profile"
                      className="w-20 h-20 rounded-full border-4 border-black object-cover bg-slate-100"
                    />
                    <label className="absolute bottom-0 right-0 bg-primary border-2 border-black rounded-full p-2 cursor-pointer hover:bg-primary/80 transition-colors">
                      <span className="material-symbols-outlined text-sm">camera_alt</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-lg">Profile Picture</h3>
                    <p className="text-sm text-slate-500">Click the camera icon to upload a new photo</p>
                  </div>
                </div>

                {/* Name Input */}
                <div>
                  <label className="block font-black text-slate-700 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-primary focus:outline-none font-bold"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Save Button */}
                <div className="flex gap-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="bg-primary text-black px-6 py-3 rounded-full font-black uppercase hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        Saving...
                      </span>
                    ) : (
                      'Save Profile'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0_#000]">
              <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">account_circle</span>
                Account Information
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-200">
                  <span className="font-bold text-slate-700">Email</span>
                  <span className="text-slate-600">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-200">
                  <span className="font-bold text-slate-700">Plan</span>
                  <span className="text-primary font-bold uppercase">{user?.plan || 'Free'}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-bold hover:bg-slate-200 transition-colors">
                  Change Password
                </button>
                <button className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-bold hover:bg-slate-200 transition-colors">
                  Change Email
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Currency Settings */}
            <div className="bg-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0_#000]">
              <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">currency_exchange</span>
                Default Currency
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CURRENCIES.map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => saveSettings({ currency: currency.code as Currency })}
                    className={`p-4 rounded-xl border-2 font-bold transition-all ${
                      settings.currency === currency.code
                        ? 'border-primary bg-primary text-black'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="text-2xl mb-1">{currency.symbol}</div>
                    <div className="text-sm">{currency.code}</div>
                    <div className="text-xs text-slate-500">{currency.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar Sync */}
            <div className="bg-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0_#000]">
              <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">calendar_month</span>
                Calendar Sync
              </h2>
              
              <div className="space-y-4">
                <div className="text-slate-600 mb-4">
                  Connect your calendar to automatically sync trip dates and reminders
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleCalendarConnect('google')}
                    className={`p-4 rounded-xl border-2 font-bold transition-all flex items-center gap-3 ${
                      settings.calendarProvider === 'google'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-xl">calendar_today</span>
                    </div>
                    <div className="text-left">
                      <div className="font-bold">Google Calendar</div>
                      <div className="text-sm text-slate-500">
                        {settings.calendarProvider === 'google' ? 'Connected' : 'Connect'}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleCalendarConnect('outlook')}
                    className={`p-4 rounded-xl border-2 font-bold transition-all flex items-center gap-3 ${
                      settings.calendarProvider === 'outlook'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-xl">event</span>
                    </div>
                    <div className="text-left">
                      <div className="font-bold">Outlook Calendar</div>
                      <div className="text-sm text-slate-500">
                        {settings.calendarProvider === 'outlook' ? 'Connected' : 'Connect'}
                      </div>
                    </div>
                  </button>
                </div>

                {settings.calendarProvider !== 'none' && (
                  <button
                    onClick={() => saveSettings({ calendarProvider: 'none' })}
                    className="w-full mt-4 bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-200 transition-colors"
                  >
                    Disconnect Calendar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0_#000]">
              <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">notifications</span>
                Notification Settings
              </h2>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                  <span className="font-bold text-slate-700">Email Notifications</span>
                  <button
                    onClick={() => saveSettings({ emailNotifications: !settings.emailNotifications })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.emailNotifications ? 'bg-primary' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.emailNotifications ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </label>

                <label className="flex items-center justify-between p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                  <span className="font-bold text-slate-700">Push Notifications</span>
                  <button
                    onClick={() => saveSettings({ pushNotifications: !settings.pushNotifications })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.pushNotifications ? 'bg-primary' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.pushNotifications ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Save Status */}
        {isSaving && (
          <div className="fixed bottom-8 right-8 bg-primary text-black px-6 py-3 rounded-full font-black uppercase shadow-lg animate-bounce">
            Saving...
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl border-4 border-black shadow-[8px_8px_0_#000] max-w-md w-full mx-6">
            <h3 className="text-xl font-black mb-4">Confirm Logout</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-slate-200 text-slate-700 px-4 py-3 rounded-lg font-bold hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg font-bold hover:bg-red-600 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

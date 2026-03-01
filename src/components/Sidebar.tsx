import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';

const AVATAR_OPTIONS = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Boots',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Mittens',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
];

export default function Sidebar() {
    const { user, isDarkMode, toggleTheme, updateUserProfile, uploadImage, logout } = useTravel();
    const [isExpanded, setIsExpanded] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Profile Edit State
    const [editName, setEditName] = useState(user?.name || '');
    const [editAvatar, setEditAvatar] = useState(user?.avatarUrl || AVATAR_OPTIONS[0]);
    const [editBio, setEditBio] = useState(user?.bio || '');
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    useEffect(() => {
        if (isProfileOpen && user) {
            setEditName(user.name);
            setEditAvatar(user.avatarUrl);
            setEditBio(user.bio || '');
        }
    }, [isProfileOpen, user]);

    // Define nav items to map over them
    const navItems = [
        ...(user ? [{ to: '/dashboard', icon: 'dashboard', label: 'Dashboard' }] : []),
        { to: '/explore', icon: 'map', label: 'Explore' },
        ...(user ? [{ to: '/my-trips', icon: 'travel_explore', label: 'My Trips' }] : []),
        { to: '/vibe-feed', icon: 'group', label: 'Vibe Feed' },
    ];

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingAvatar(true);
        try {
            const publicUrl = await uploadImage(file, 'avatars');
            setEditAvatar(publicUrl);
        } catch (err) {
            console.error('Failed to upload avatar', err);
            alert('Failed to upload avatar image. Make sure the file is an image and < 5MB.');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        await updateUserProfile({
            name: editName,
            avatarUrl: editAvatar,
            bio: editBio
        });
        setIsProfileOpen(false);
    };



    return (
        <aside
            className={`hidden md:flex flex-col bg-[#f0f0f0] dark:bg-slate-900 border-r-4 border-black dark:border-white shrink-0 transition-all duration-300 relative z-40 ${isExpanded ? 'w-64' : 'w-24'
                }`}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute -right-5 top-8 bg-primary text-black border-2 border-black dark:border-white rounded-full flex items-center justify-center size-10 z-50 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]"
                title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
            >
                <span className="material-symbols-outlined text-[20px] font-black">
                    {isExpanded ? 'keyboard_double_arrow_left' : 'keyboard_double_arrow_right'}
                </span>
            </button>

            {/* Logo Area */}
            <div className={`p-6 flex items-center ${isExpanded ? 'gap-3' : 'justify-center border-b border-transparent'}`}>
                <img
                    src="/assets/branding/logo1.png"
                    alt="Nomadly"
                    className="h-8 w-8 object-cover shrink-0"
                />
                {isExpanded && (
                    <h2 className="text-xl font-bold tracking-tight truncate dark:text-white">Nomadly</h2>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto overflow-x-hidden">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center rounded-xl transition-colors ${isExpanded ? 'px-4 py-3 gap-3' : 'p-3 justify-center'
                            } ${isActive
                                ? 'bg-primary text-black border-2 border-black dark:border-white font-black uppercase italic shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff] ' + (!isExpanded && 'mx-auto w-12 h-12')
                                : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium ' + (!isExpanded && 'mx-auto w-12 h-12')
                            }`
                        }
                        title={!isExpanded ? item.label : undefined}
                    >
                        {({ isActive }) => (
                            <>
                                <span className={`material-symbols-outlined shrink-0 ${isActive ? 'fill-1' : ''}`}>
                                    {item.icon}
                                </span>
                                {isExpanded && <span className="truncate">{item.label}</span>}
                            </>
                        )}
                    </NavLink>
                ))}

                <NavLink
                    to="/settings"
                    className={`flex items-center rounded-xl transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium ${isExpanded ? 'px-4 py-3 gap-3' : 'p-3 justify-center mx-auto w-12 h-12'
                        }`}
                    title={!isExpanded ? 'Settings' : undefined}
                >
                    <span className="material-symbols-outlined shrink-0">settings</span>
                    {isExpanded && <span className="truncate">Settings</span>}
                </NavLink>
            </nav>

            {/* User Profile or Login */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                {user ? (
                    <NavLink
                        to={`/profile/${user.id}`}
                        className={`w-full flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-transparent hover:border-black dark:hover:border-white transition-colors cursor-pointer ${isExpanded ? 'gap-3 p-2' : 'p-2 justify-center'
                            }`}
                    >
                        <img
                            className="size-10 rounded-full border-2 border-primary/30 shrink-0 object-cover bg-white"
                            alt="User profile"
                            src={user.avatarUrl}
                            referrerPolicy="no-referrer"
                        />
                        {isExpanded && (
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-bold truncate dark:text-white">
                                    {user.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {user.plan === 'pro' ? 'Pro' : 'Free'}
                                </p>
                            </div>
                        )}
                    </NavLink>
                ) : (
                    <NavLink
                        to="/auth"
                        className={`w-full flex items-center justify-center bg-primary text-black rounded-xl border-2 border-black shadow-[2px_2px_0_#000] hover:bg-white transition-colors cursor-pointer font-black uppercase text-sm ${isExpanded ? 'gap-2 p-3' : 'size-12 mx-auto p-0'
                            }`}
                        title={!isExpanded ? 'Log In / Sign Up' : undefined}
                    >
                        <span className="material-symbols-outlined shrink-0 text-xl text-black">login</span>
                        {isExpanded && <span>Log In / Sign Up</span>}
                    </NavLink>
                )}
            </div>

            {/* Profile Edit Modal Overlay */}
            {isProfileOpen && createPortal(
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md border-4 border-black dark:border-white shadow-[8px_8px_0_#000] dark:shadow-[8px_8px_0_#fff] p-8 relative flex flex-col gap-6">
                        <button
                            onClick={() => setIsProfileOpen(false)}
                            className="absolute right-6 top-6 size-10 rounded-full border-2 border-black dark:border-white flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900 font-black z-10 dark:text-white"
                            title="Close Profile"
                        >
                            <span className="material-symbols-outlined font-black">close</span>
                        </button>

                        <div className="mb-2">
                            <h2 className="text-3xl font-black italic uppercase dark:text-white">Profile</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">Customize your public persona.</p>
                        </div>

                        <div className="flex flex-col gap-4 overflow-y-auto max-h-[60vh] pr-2">
                            <div>
                                <label className="block text-sm font-bold mb-2 dark:text-white">Display Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full border-2 border-black dark:border-white bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl px-4 py-3 font-bold focus:ring-4 focus:ring-primary/50 transition-colors"
                                    placeholder="Your name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 dark:text-white">Bio</label>
                                <textarea
                                    value={editBio}
                                    onChange={(e) => setEditBio(e.target.value)}
                                    className="w-full border-2 border-black dark:border-white bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl px-4 py-3 font-bold focus:ring-4 focus:ring-primary/50 transition-colors resize-none"
                                    placeholder="Tell us about your travel style..."
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold flex justify-between items-center mb-2 dark:text-white">
                                    <span>Choose Avatar</span>
                                    <label className="text-primary font-black uppercase text-xs cursor-pointer hover:underline flex items-center gap-1">
                                        <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={isUploadingAvatar} />
                                        {isUploadingAvatar ? (
                                            <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                                        ) : (
                                            <span className="material-symbols-outlined text-sm">upload</span>
                                        )}
                                        {isUploadingAvatar ? 'Uploading...' : 'Upload Image'}
                                    </label>
                                </label>

                                {editAvatar && !AVATAR_OPTIONS.includes(editAvatar) && (
                                    <div className="mb-4 flex items-center gap-4 p-4 border-2 border-black dark:border-white rounded-xl bg-slate-50 dark:bg-slate-800">
                                        <img src={editAvatar} alt="Current" className="size-16 rounded-full object-cover border-2 border-primary" referrerPolicy="no-referrer" />
                                        <div className="text-sm font-bold dark:text-white">Current Custom Avatar</div>
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-3">
                                    {AVATAR_OPTIONS.map((avatar) => (
                                        <button
                                            key={avatar}
                                            onClick={() => setEditAvatar(avatar)}
                                            className={`rounded-xl border-2 overflow-hidden aspect-square ${editAvatar === avatar ? 'border-primary ring-2 ring-primary bg-primary/10' : 'border-slate-200 dark:border-slate-700 hover:border-black dark:hover:border-white'}`}
                                        >
                                            <img src={avatar} alt="Avatar option" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveProfile}
                            className="w-full flex items-center justify-center gap-2 glossy-green py-4 rounded-xl text-black font-black uppercase tracking-wider text-sm mt-2 hover:scale-[1.02] transition-transform active:scale-95"
                        >
                            Save Changes
                            <span className="material-symbols-outlined">check_circle</span>
                        </button>
                    </div>
                </div>, document.body
            )}
        </aside>
    );
}

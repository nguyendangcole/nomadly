import React, { useState, useRef, useEffect } from 'react';
import { useTravel } from '../context/TravelContext';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsDropdown() {
    const { user, notifications, markNotificationAsRead, markAllNotificationsAsRead } = useTravel();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter notifications for current user only
    const myNotifications = notifications.filter(n => n.userId === user?.id);
    const unreadCount = myNotifications.filter(n => !n.isRead).length;

    const renderNotificationIcon = (type: string) => {
        switch (type) {
            case 'follow': return <span className="material-symbols-outlined text-sm text-y2k-blue">person_add</span>;
            case 'comment': return <span className="material-symbols-outlined text-sm text-y2k-pink">chat_bubble</span>;
            case 'post': return <span className="material-symbols-outlined text-sm text-primary">campaign</span>;
            default: return <span className="material-symbols-outlined text-sm">notifications</span>;
        }
    };

    const renderNotificationText = (n: any) => {
        const actorName = n.actorProfile?.name || 'Someone';
        switch (n.type) {
            case 'follow': return <span><span className="font-black">{actorName}</span> started following you.</span>;
            case 'comment': return <span><span className="font-black">{actorName}</span> commented on your trip.</span>;
            case 'post': return <span><span className="font-black">{actorName}</span> published a new public trip.</span>;
            default: return <span>New notification from {actorName}</span>;
        }
    };

    const getLinkForNotification = (n: any) => {
        if (n.type === 'follow') return `/profile/${n.actorId}`;
        if (n.type === 'comment' || n.type === 'post') return `/itinerary/${n.tripId}`;
        return '#';
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white hover:bg-primary/10 transition-colors relative"
            >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 size-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-[8px] text-white font-black hover:scale-110 object-cover"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border-4 border-black dark:border-white shadow-[6px_6px_0_#000] rounded-2xl overflow-hidden z-[100] animate-fade-in-up origin-top-right">
                    <div className="flex items-center justify-between p-4 border-b-2 border-slate-100 dark:border-slate-800">
                        <h3 className="font-black text-lg italic uppercase dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllNotificationsAsRead}
                                className="text-xs font-bold text-primary hover:underline hover:text-black dark:hover:text-white uppercase transition-colors"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {myNotifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 font-bold flex flex-col items-center">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-20">notifications_paused</span>
                                <p>All caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {myNotifications.map((notification) => (
                                    <Link
                                        key={notification.id}
                                        to={getLinkForNotification(notification)}
                                        onClick={() => {
                                            markNotificationAsRead(notification.id);
                                            setIsOpen(false);
                                        }}
                                        className={`block p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!notification.isRead ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                    >
                                        <div className="flex gap-4">
                                            <div className="relative shrink-0">
                                                <div className="size-12 rounded-full overflow-hidden border-2 border-black dark:border-slate-700 bg-slate-200">
                                                    <img
                                                        src={notification.actorProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notification.actorId}`}
                                                        alt="avatar"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 size-5 bg-white dark:bg-slate-900 rounded-full border border-black flex items-center justify-center">
                                                    {renderNotificationIcon(notification.type)}
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm tracking-tight leading-snug dark:text-white ${!notification.isRead ? 'font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
                                                    {renderNotificationText(notification)}
                                                </p>
                                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>

                                            {!notification.isRead && (
                                                <div className="size-2 bg-primary rounded-full shrink-0 mt-2"></div>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

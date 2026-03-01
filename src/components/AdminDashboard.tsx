import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, Navigate } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';

export default function AdminDashboard() {
    const { user } = useTravel();
    const [activeTab, setActiveTab] = useState<'users' | 'reviews' | 'comments'>('users');

    const [users, setUsers] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [comments, setComments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Pro requests mock
    const [pendingProRequests, setPendingProRequests] = useState<string[]>(() => {
        try {
            const raw = localStorage.getItem('nomadly:pro_requests');
            return raw ? JSON.parse(raw) : [];
        } catch { return []; }
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'users') {
                const { data } = await supabase.from('profiles').select('*');
                if (data) setUsers(data);
            } else if (activeTab === 'reviews') {
                const { data } = await supabase.from('reviews').select(`*, locations(name)`).order('created_at', { ascending: false });
                if (data) setReviews(data);
            } else if (activeTab === 'comments') {
                const { data } = await supabase.from('trip_comments').select(`*, profiles(name, avatar_url)`).order('created_at', { ascending: false });
                if (data) setComments(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const approvePro = async (userId: string) => {
        try {
            await supabase.from('profiles').update({ plan: 'pro' }).eq('id', userId);
            setUsers(users.map(u => u.id === userId ? { ...u, plan: 'pro' } : u));
            // Remove from pending
            const updatedPending = pendingProRequests.filter(id => id !== userId);
            setPendingProRequests(updatedPending);
            localStorage.setItem('nomadly:pro_requests', JSON.stringify(updatedPending));
            alert('Approved to PRO successfully!');
        } catch (err) {
            console.error(err);
        }
    };

    const deleteReview = async (id: string) => {
        if (!window.confirm("Delete this review (violation)?")) return;
        try {
            await supabase.from('reviews').delete().eq('id', id);
            setReviews(reviews.filter(r => r.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const deleteComment = async (id: string) => {
        if (!window.confirm("Delete this comment (violation)?")) return;
        try {
            await supabase.from('trip_comments').delete().eq('id', id);
            setComments(comments.filter(c => c.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    if (!user || !user.isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-[#f4f4f0] font-sans selection:bg-primary selection:text-black pb-20">
            <header className="border-b-4 border-black bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <Link to="/dashboard" className="flex items-center gap-3">
                    <div className="bg-primary p-2 border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <span className="material-symbols-outlined text-black font-bold">admin_panel_settings</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tighter uppercase italic">Admin Panel</h1>
                </Link>
                <Link to="/dashboard">
                    <button className="bg-white px-6 py-2 rounded-xl font-bold border-2 border-black shadow-[2px_2px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
                        Exit
                    </button>
                </Link>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex gap-4 mb-8">
                    {['users', 'reviews', 'comments'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-6 py-3 rounded-xl border-2 border-black font-bold uppercase transition-all ${activeTab === tab ? 'bg-primary shadow-[4px_4px_0_#000]' : 'bg-white hover:bg-slate-50 shadow-[2px_2px_0_#000]'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="text-center font-bold animate-pulse text-2xl">Loading data...</div>
                ) : (
                    <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0_#000]">

                        {activeTab === 'users' && (
                            <div>
                                <h2 className="text-2xl font-black uppercase mb-4">Manage Users & Pro Requests</h2>
                                <div className="space-y-4">
                                    {users.map(u => (
                                        <div key={u.id} className="flex flex-col sm:flex-row items-center justify-between p-4 border-2 border-slate-200 rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`} className="w-12 h-12 rounded-full border-2 border-black" />
                                                <div>
                                                    <p className="font-bold">{u.name}</p>
                                                    <p className="text-sm text-slate-500">{u.id.substring(0, 8)}... | Plan: <span className="uppercase text-primary font-black">{u.plan || 'Free'}</span></p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-4 sm:mt-0">
                                                {pendingProRequests.includes(u.id) && u.plan !== 'pro' && (
                                                    <button onClick={() => approvePro(u.id)} className="bg-green-400 text-black px-4 py-2 rounded-lg border-2 border-black font-bold text-sm shadow-[2px_2px_0_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none">
                                                        Approve PRO
                                                    </button>
                                                )}
                                                {u.plan === 'free' && !pendingProRequests.includes(u.id) && (
                                                    <button onClick={() => approvePro(u.id)} className="bg-slate-200 text-black px-4 py-2 rounded-lg border-2 border-black font-bold text-sm hover:bg-slate-300">
                                                        Force PRO
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div>
                                <h2 className="text-2xl font-black uppercase mb-4">Content Moderation: Reviews</h2>
                                <div className="space-y-4">
                                    {reviews.map(r => (
                                        <div key={r.id} className="p-4 border-2 border-slate-200 rounded-xl relative">
                                            <span className="absolute top-4 right-4 text-xs font-bold text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
                                            <p className="font-bold text-primary mb-1">{r.locations?.name || 'Unknown Location'} - {r.rating}/5 Stars</p>
                                            <p className="text-sm font-medium italic mb-4">"{r.comment}"</p>
                                            <button onClick={() => deleteReview(r.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg border-2 border-black font-bold text-sm shadow-[2px_2px_0_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none">
                                                Delete (Violation)
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'comments' && (
                            <div>
                                <h2 className="text-2xl font-black uppercase mb-4">Content Moderation: Trip Comments</h2>
                                <div className="space-y-4">
                                    {comments.map(c => {
                                        const profileName = Array.isArray(c.profiles) ? c.profiles[0]?.name : c.profiles?.name;
                                        return (
                                            <div key={c.id} className="p-4 border-2 border-slate-200 rounded-xl relative">
                                                <span className="absolute top-4 right-4 text-xs font-bold text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                                                <p className="font-bold mb-1">Author: {profileName || 'Unknown'}</p>
                                                <p className="text-sm font-medium italic mb-4">"{c.comment}"</p>
                                                <button onClick={() => deleteComment(c.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg border-2 border-black font-bold text-sm shadow-[2px_2px_0_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none">
                                                    Delete (Violation)
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </main>
        </div>
    );
}

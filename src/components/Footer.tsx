import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    const [showTerms, setShowTerms] = useState(false);

    return (
        <>
            <footer className="bg-black text-white font-display border-t-8 border-primary py-12 px-6 sm:px-12 relative overflow-hidden z-20">
                {/* Decorative dots background */}
                <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-4 gap-10">

                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
                            <div className="bg-primary p-2 border-2 border-transparent group-hover:border-white rounded-lg transition-colors">
                                <img src="/assets/branding/logo1.png" alt="Nomadly" className="w-6 h-6" />
                            </div>
                            <h2 className="text-3xl font-black tracking-tighter uppercase italic group-hover:text-primary transition-colors">Nomadly</h2>
                        </Link>
                        <p className="text-slate-400 font-bold max-w-sm leading-relaxed">
                            The ultimate vibe check for modern explorers. Ditch the spreadsheets and join the tribe.
                        </p>
                        <div className="pt-4 flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full border-2 border-slate-700 font-black flex justify-center items-center hover:bg-primary hover:text-black hover:border-primary transition-all shadow-[2px_2px_0_#fff]">Fb</a>
                            <a href="#" className="w-10 h-10 rounded-full border-2 border-slate-700 font-black flex justify-center items-center hover:bg-primary hover:text-black hover:border-primary transition-all shadow-[2px_2px_0_#fff]">Ig</a>
                            <a href="#" className="w-10 h-10 rounded-full border-2 border-slate-700 font-black flex justify-center items-center hover:bg-primary hover:text-black hover:border-primary transition-all shadow-[2px_2px_0_#fff]">X</a>
                        </div>
                    </div>

                    {/* Links Column 1 */}
                    <div className="space-y-4">
                        <h3 className="text-primary font-black uppercase tracking-widest text-sm mb-4">Explore</h3>
                        <ul className="space-y-3 font-bold text-slate-300">
                            <li><Link to="/explore" className="hover:text-white hover:underline decoration-primary decoration-2 underline-offset-4 transition-all">Trending Trips</Link></li>
                            <li><Link to="/vibe-feed" className="hover:text-white hover:underline decoration-primary decoration-2 underline-offset-4 transition-all">Vibe Feed</Link></li>
                            <li><a href="#" className="hover:text-white hover:underline decoration-primary decoration-2 underline-offset-4 transition-all">Top Destinations</a></li>
                            <li><a href="#" className="hover:text-white hover:underline decoration-primary decoration-2 underline-offset-4 transition-all">Travel Hacks</a></li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div className="space-y-4">
                        <h3 className="text-primary font-black uppercase tracking-widest text-sm mb-4">Nomadly</h3>
                        <ul className="space-y-3 font-bold text-slate-300">
                            <li><a href="#" className="hover:text-white hover:underline decoration-primary decoration-2 underline-offset-4 transition-all">About Us</a></li>
                            <li><a href="#" className="hover:text-white hover:underline decoration-primary decoration-2 underline-offset-4 transition-all">Careers <span className="ml-2 text-[10px] bg-accent-pink px-2 py-0.5 rounded-full text-white uppercase">Hiring</span></a></li>
                            <li><a href="#" className="hover:text-white hover:underline decoration-primary decoration-2 underline-offset-4 transition-all">Contact</a></li>
                            <li><button onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="hover:text-white hover:underline decoration-primary decoration-2 underline-offset-4 transition-all text-left">Privacy & Terms</button></li>
                        </ul>
                    </div>

                </div>

                <div className="max-w-7xl mx-auto mt-16 pt-8 border-t-2 border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest gap-4">
                    <p>&copy; {new Date().getFullYear()} Nomadly Inc. All rights reserved.</p>
                    <div className="flex items-center gap-2">
                        <span>Crafted with</span>
                        <span className="material-symbols-outlined text-primary text-[1rem]">favorite</span>
                        <span>for the Vanguard</span>
                    </div>
                </div>
            </footer>

            {/* --- TERMS AND PRIVACY MODAL --- */}
            {showTerms && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white border-8 border-black text-black max-w-3xl w-full max-h-[85vh] overflow-y-auto p-8 relative rounded-2xl shadow-[16px_16px_0_#primary]">

                        <button
                            onClick={() => setShowTerms(false)}
                            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-black text-white rounded-full hover:bg-accent-pink hover:text-black border-2 border-black transition-all hover:-translate-y-1 shadow-[4px_4px_0_#000]"
                        >
                            <span className="material-symbols-outlined font-black">close</span>
                        </button>

                        <div className="inline-block bg-primary text-black px-4 py-1 text-sm font-black uppercase tracking-widest border-2 border-black shadow-[4px_4px_0_#000] -rotate-2 mb-6">
                            Legal Stuff
                        </div>

                        <h2 className="text-4xl md:text-5xl font-black uppercase italic mb-8 tracking-tighter text-slate-900 border-b-4 border-black pb-6">
                            Privacy & <span className="text-primary">Terms</span>
                        </h2>

                        <div className="space-y-6 font-bold text-slate-600 leading-relaxed text-lg pr-4 border-l-4 border-slate-200 pl-4">
                            <p>
                                Welcome to the tribe. By using Nomadly, you agree that you are ready to explore the world with immaculate vibes. Keep it respectful, both online and abroad.
                            </p>

                            <h3 className="text-2xl font-black uppercase text-black mt-8 italic tracking-tight">1. User Guidelines</h3>
                            <p>
                                You agree not to use the service for any illegal or unauthorized purpose. You must not, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws). Be cool, don't spam.
                            </p>

                            <h3 className="text-2xl font-black uppercase text-black mt-8 italic tracking-tight">2. The Vibe Feed</h3>
                            <p>
                                Any itineraries, reviews, or photos you share on the platform remain yours, but by posting them, you grant us a license to show them off to other users. You are responsible for the vibes you bring to the community.
                            </p>

                            <h3 className="text-2xl font-black uppercase text-black mt-8 italic tracking-tight">3. Account Termination</h3>
                            <p>
                                We may suspend or terminate your access immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                            </p>

                            <div className="mt-12 pt-8 flex justify-end">
                                <button
                                    onClick={() => setShowTerms(false)}
                                    className="bg-black text-white px-10 py-4 text-xl rounded-full font-black uppercase italic hover:bg-primary hover:text-black hover:shadow-[8px_8px_0_#000] border-4 border-black hover:-translate-y-1 transition-all"
                                >
                                    I Understand
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

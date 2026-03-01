import React from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer';

const FEATURED_TRIPS = [
    {
        id: '1',
        title: 'Neon Nights in Tokyo',
        author: 'CyberSamurai',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop',
        rating: 4.9,
    },
    {
        id: '2',
        title: 'Santorini Sunsets',
        author: 'AegeanDreamer',
        image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=800&auto=format&fit=crop',
        rating: 4.8,
    },
    {
        id: '3',
        title: 'NYC Pizza Tour',
        author: 'SliceHunter',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop',
        rating: 4.7,
    }
];

const COMMUNITY_REVIEWS = [
    {
        text: "Nomadly completely changed how my friend group plans. No more messy spreadsheets!",
        author: "@WanderWoman",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Annie"
    },
    {
        text: "Found the sickest hidden ramen spot in Kyoto thanks to Vibe Feed. 10/10.",
        author: "@RamenGod",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ken"
    },
    {
        text: "The budget tracker is a lifesaver. I actually came back with money this time.",
        author: "@BrokeBackpacker",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam"
    }
];

const PRESS_COVERAGE = [
    {
        outlet: "TechCrunch",
        logo: "",
        headline: "Nomadly is TikTok's answer to travel planning",
        excerpt: "Gen Z is ditching boring spreadsheets for this AI-powered travel app that feels like a social media platform.",
        category: "Tech",
        date: "2 days ago",
        accent: "bg-blue-500"
    },
    {
        outlet: "Vogue",
        logo: "",
        headline: "The aesthetic travel app taking over Instagram",
        excerpt: "Finally, a travel planner that understands Gen Z's obsession with vibes and visual storytelling.",
        category: "Lifestyle",
        date: "1 week ago",
        accent: "bg-pink-500"
    },
    {
        outlet: "Forbes",
        logo: "",
        headline: "How Nomadly is making travel accessible for Gen Z",
        excerpt: "This startup is democratizing travel planning with AI and community-driven recommendations.",
        category: "Business",
        date: "2 weeks ago",
        accent: "bg-green-500"
    },
    {
        outlet: "The Verge",
        logo: "",
        headline: "Nomadly's retro-futuristic design is a masterclass in Gen Z branding",
        excerpt: "The Y2K aesthetic isn't just for show – it's creating an emotional connection with young travelers.",
        category: "Design",
        date: "3 weeks ago",
        accent: "bg-orange-500"
    }
];

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#f4f4f0] font-display overflow-x-hidden">

            {/* --- HERO SECTION --- */}
            <section className="relative min-h-screen flex flex-col justify-center items-center p-6 bg-[#ffbb00] overflow-hidden border-b-8 border-black z-10">
                {/* Background Retro Elements */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-accent-pink rounded-full blur-3xl mix-blend-multiply animate-pulse"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary rounded-full blur-3xl mix-blend-multiply animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white rounded-full blur-3xl opacity-50"></div>
                </div>

                <div className="absolute inset-0 z-0 pointer-events-none opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

                {/* Hero Content Container */}
                <div className="relative z-10 w-full max-w-5xl y2k-card bg-white p-8 md:p-16 text-center flex flex-col items-center animate-in zoom-in fade-in duration-700 mx-4 shadow-[12px_12px_0_#000] hover:shadow-[16px_16px_0_#000] transition-all duration-300">
                    {/* Floating Badge */}
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border-4 border-black bg-primary text-black font-black uppercase tracking-widest shadow-[4px_4px_0_#000] rotate-2 hover:-rotate-2 transition-transform mb-8 animate-bounce" style={{ animationDuration: '3s' }}>
                        <span className="size-3 rounded-full bg-black animate-ping"></span>
                        The Future of Travel
                    </div>

                    {/* Hero Headline */}
                    <h1 className="text-6xl sm:text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.8] text-slate-900 mb-6 drop-shadow-sm hover:scale-105 transition-transform duration-300">
                        Welcome to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-pink via-primary to-accent-blue filter hue-rotate-15 hover:hue-rotate-45 transition-all duration-500">Nomadly</span>
                    </h1>

                    <p className="text-xl md:text-2xl font-bold text-slate-600 max-w-2xl mb-12 leading-snug hover:text-slate-700 transition-colors duration-300">
                        Ditch boring spreadsheets. Build iconic getaways, discover hidden gems, and vibe out with ultimate travel community.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-6 items-center">
                        <Link to="/dashboard" className="w-full sm:w-auto peer">
                            <button className="w-full glossy-green text-black px-12 py-6 rounded-full text-2xl font-black uppercase italic tracking-wider flex items-center justify-center gap-3 hover:scale-110 active:scale-95 transition-all duration-300 shadow-[0_8px_0_0_#000] active:shadow-[0_0px_0_0_#000] active:translate-y-2 border-4 border-black hover:shadow-[0_12px_0_0_#000] hover:-translate-y-1">
                                <span className="material-symbols-outlined text-3xl animate-pulse">rocket_launch</span>
                                Enter Website
                            </button>
                        </Link>

                        <Link to="/explore" className="w-full sm:w-auto">
                            <button className="w-full bg-white text-black px-10 py-6 rounded-full text-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-4 border-black shadow-[6px_6px_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-300 hover:bg-slate-100 hover:scale-105">
                                <span className="material-symbols-outlined hover:rotate-12 transition-transform duration-300">map</span>
                                Explore Vibes
                            </button>
                        </Link>
                    </div>

                    {/* Floating Images (Decorative) */}
                    <div className="absolute -top-10 -left-10 w-32 h-32 md:-top-16 md:-left-20 md:w-48 md:h-48 rounded-full border-4 border-black overflow-hidden shadow-[8px_8px_0_#000] animate-bounce hover:animate-spin" style={{ animationDuration: '4s' }}>
                        <img src="https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=600&auto=format&fit=crop" alt="Travel" className="w-full h-full object-cover hover:scale-125 transition-transform duration-500" />
                    </div>

                    <div className="absolute -bottom-10 -right-10 w-24 h-24 md:-bottom-12 md:-right-16 md:w-40 md:h-40 rounded-full border-4 border-black overflow-hidden shadow-[8px_8px_0_#000] animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}>
                        <img src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=600&auto=format&fit=crop" alt="Vibe" className="w-full h-full object-cover hover:scale-125 transition-transform duration-500" />
                    </div>
                </div>
            </section>

            {/* --- TRAVEL BUDDY SECTION --- */}
            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto z-20 relative">
                <div className="text-center mb-16 animate-in fade-in duration-700">
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-y2k-pink text-black font-black uppercase tracking-widest text-sm mb-6 shadow-[4px_4px_0_#000] hover:scale-105 transition-transform duration-300">
                        <span className="material-symbols-outlined animate-pulse">group_add</span>
                        Find Your Travel Buddy
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-6">
                        Never Travel <span className="text-transparent bg-clip-text bg-gradient-to-r from-y2k-pink to-primary">Alone</span> Again
                    </h2>
                    <p className="font-bold text-xl text-slate-600 max-w-3xl mx-auto">
                        Connect with like-minded travelers, join amazing trips, and create unforgettable memories together. Your perfect travel companion is just a click away!
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {/* Feature 1 */}
                    <div className="group cursor-pointer animate-in slide-in-from-bottom duration-700" style={{ animationDelay: '100ms' }}>
                        <div className="bg-white border-4 border-black rounded-2xl p-8 hover:border-y2k-pink transition-all hover:shadow-[8px_8px_0_#000] hover:-translate-y-1 hover:scale-[1.02] text-center">
                            <div className="w-16 h-16 bg-y2k-pink rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg group-hover:rotate-12 transition-transform duration-300">
                                <span className="material-symbols-outlined text-black">search</span>
                            </div>
                            <h3 className="font-black text-2xl uppercase mb-4 group-hover:text-y2k-pink transition-colors">Discover Trips</h3>
                            <p className="text-slate-600 font-bold leading-relaxed">
                                Browse amazing trips from other travelers and find adventures that match your vibe and interests.
                            </p>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="group cursor-pointer animate-in slide-in-from-bottom duration-700" style={{ animationDelay: '200ms' }}>
                        <div className="bg-white border-4 border-black rounded-2xl p-8 hover:border-y2k-pink transition-all hover:shadow-[8px_8px_0_#000] hover:-translate-y-1 hover:scale-[1.02] text-center">
                            <div className="w-16 h-16 bg-y2k-pink rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg group-hover:rotate-12 transition-transform duration-300">
                                <span className="material-symbols-outlined text-black">send</span>
                            </div>
                            <h3 className="font-black text-2xl uppercase mb-4 group-hover:text-y2k-pink transition-colors">Send Requests</h3>
                            <p className="text-slate-600 font-bold leading-relaxed">
                                Send personalized travel buddy requests and tell trip owners why you'd be the perfect addition to their adventure.
                            </p>
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="group cursor-pointer animate-in slide-in-from-bottom duration-700" style={{ animationDelay: '300ms' }}>
                        <div className="bg-white border-4 border-black rounded-2xl p-8 hover:border-y2k-pink transition-all hover:shadow-[8px_8px_0_#000] hover:-translate-y-1 hover:scale-[1.02] text-center">
                            <div className="w-16 h-16 bg-y2k-pink rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg group-hover:rotate-12 transition-transform duration-300">
                                <span className="material-symbols-outlined text-black">diversity_3</span>
                            </div>
                            <h3 className="font-black text-2xl uppercase mb-4 group-hover:text-y2k-pink transition-colors">Connect & Travel</h3>
                            <p className="text-slate-600 font-bold leading-relaxed">
                                Get accepted, connect with your travel buddies, and embark on unforgettable adventures together!
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <Link to="/explore" className="inline-flex items-center gap-3 bg-y2k-pink text-black px-8 py-4 rounded-full font-black uppercase tracking-wider text-lg border-4 border-black shadow-[6px_6px_0_#000] hover:scale-110 hover:shadow-[8px_8px_0_#000] hover:-translate-y-1 transition-all duration-300">
                        <span className="material-symbols-outlined">explore</span>
                        Find Travel Buddies Now
                    </Link>
                </div>
            </section>

            {/* --- ABOUT / INFO SECTION --- */}
            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto z-20 relative">
                <div className="flex flex-col md:flex-row items-center gap-16">
                    <div className="md:w-1/2 flex flex-col items-start space-y-8 animate-in slide-in-from-left duration-700">
                        <div className="bg-black text-white px-4 py-1 text-sm font-black uppercase tracking-widest border-2 border-transparent shadow-[4px_4px_0_#ff00ff] -rotate-2 hover:rotate-0 transition-transform duration-300">
                            What is Nomadly?
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black uppercase italic leading-none tracking-tighter hover:scale-105 transition-transform duration-300">
                            Plan <span className="text-primary hover:text-accent-pink transition-colors duration-300">Smarter.</span> <br /> Travel <span className="text-accent-blue hover:text-primary transition-colors duration-300">Louder.</span>
                        </h2>
                        <p className="text-xl font-bold text-slate-600 leading-relaxed border-l-8 border-black pl-6 hover:border-primary transition-colors duration-300">
                            Nomadly is your digital travel companion. We took boring out of itinerary planning and injected it with community vibes, aesthetic maps, and seamless budget tracking. Whether you're a luxury traveler or a broke backpacker, we've got you covered.
                        </p>
                        <div className="grid grid-cols-2 gap-6 w-full mt-4">
                            <div className="bg-accent-pink p-6 border-4 border-black shadow-[4px_4px_0_#000] rounded-xl text-center transform hover:scale-105 hover:rotate-1 transition-all duration-300 hover:shadow-[6px_6px_0_#000]">
                                <span className="material-symbols-outlined text-4xl mb-2 hover:rotate-12 transition-transform duration-300">calculate</span>
                                <h3 className="font-black uppercase italic">Budget Tracker</h3>
                            </div>
                            <div className="bg-primary p-6 border-4 border-black shadow-[4px_4px_0_#000] rounded-xl text-center transform hover:scale-105 hover:-rotate-1 transition-all duration-300 hover:shadow-[6px_6px_0_#000]">
                                <span className="material-symbols-outlined text-4xl mb-2 hover:rotate-12 transition-transform duration-300">groups</span>
                                <h3 className="font-black uppercase italic">Social Feed</h3>
                            </div>
                        </div>
                    </div>
                    <div className="md:w-1/2 w-full relative animate-in slide-in-from-right duration-700">
                        <div className="aspect-square bg-slate-200 border-8 border-black rounded-[3rem] overflow-hidden shadow-[16px_16px_0_#000] rotate-3 transition-all duration-500 hover:rotate-0 hover:shadow-[20px_20px_0_#000] group">
                            <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop" alt="Travelers" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500 group-hover:scale-110" />
                        </div>
                        {/* Decorative sticker */}
                        <div className="absolute -bottom-8 -left-8 bg-white border-4 border-black rounded-full p-4 shadow-[4px_4px_0_#000] -rotate-12 animate-pulse hover:rotate-0 transition-transform duration-300">
                            <span className="text-3xl font-black uppercase tracking-tighter text-accent-pink hover:text-primary transition-colors duration-300">100% Vibe</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEATURED TRIPS (MARQUEE / CARDS) --- */}
            <section className="py-24 bg-black text-white relative border-y-8 border-primary overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
                    <h2 className="text-5xl md:text-7xl font-black uppercase italic mb-16 text-center animate-in fade-in duration-700">
                        Iconic <span className="text-primary underline decoration-8 underline-offset-8 hover:text-accent-pink transition-colors duration-300">Journeys</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                        {FEATURED_TRIPS.map((trip, idx) => (
                            <div key={trip.id} className="bg-slate-900 border-4 border-white rounded-3xl overflow-hidden shadow-[8px_8px_0_#primary] hover:-translate-y-2 hover:shadow-[12px_12px_0_#primary] transition-all group animate-in slide-in-from-bottom duration-700" style={{ animationDelay: `${idx * 150}ms` }}>
                                <div className="h-48 border-b-4 border-white overflow-hidden relative">
                                    <div className="absolute top-2 right-2 bg-black text-white z-10 font-black px-2 py-1 rounded-md text-xs uppercase flex items-center gap-1 border-2 border-white hover:bg-primary transition-colors duration-300">
                                        <span className="material-symbols-outlined text-[14px] text-primary">star</span>
                                        {trip.rating}
                                    </div>
                                    <img src={trip.image} alt={trip.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-2xl font-black uppercase italic truncate mb-2 group-hover:text-primary transition-colors duration-300">{trip.title}</h3>
                                    <p className="text-slate-400 font-bold text-sm uppercase hover:text-white transition-colors duration-300">By {trip.author}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Link to="/explore" className="mt-16">
                        <button className="bg-transparent text-white border-4 border-white font-black uppercase tracking-widest px-8 py-4 hover:bg-white hover:text-black transition-all duration-300 rounded-xl flex items-center gap-2 hover:scale-105 hover:shadow-[4px_4px_0_#000]">
                            Explore More <span className="material-symbols-outlined hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
                        </button>
                    </Link>
                </div>
            </section>

            {/* --- PRESS / NEWS SECTION --- */}
            <section className="py-24 bg-white border-y-8 border-black relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
                
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16 animate-in fade-in duration-700">
                        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-black text-white font-black uppercase tracking-widest text-sm mb-6 shadow-[4px_4px_0_#ff00ff] hover:scale-105 transition-transform duration-300">
                            <span className="material-symbols-outlined text-yellow-400 animate-pulse">campaign</span>
                            As Featured In
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">
                            The <span className="text-primary hover:text-accent-pink transition-colors duration-300">Vibe</span> is Real
                        </h2>
                        <p className="font-bold text-xl text-slate-500 mt-4">See what press is saying about Gen Z's favorite travel app</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        {PRESS_COVERAGE.map((article, idx) => (
                            <div key={idx} className="group cursor-pointer animate-in slide-in-from-bottom duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                                <div className="bg-slate-50 border-4 border-black rounded-2xl p-8 hover:border-primary transition-all hover:shadow-[8px_8px_0_#000] hover:-translate-y-1 hover:scale-[1.02]">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 ${article.accent} rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:rotate-12 transition-transform duration-300`}>
                                                {article.logo}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-lg uppercase group-hover:text-primary transition-colors duration-300">{article.outlet}</h3>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{article.category} • {article.date}</p>
                                            </div>
                                        </div>
                                        <div className="bg-black text-white px-3 py-1 rounded-full text-xs font-black uppercase hover:bg-primary transition-colors duration-300">
                                            Featured
                                        </div>
                                    </div>
                                    
                                    {/* Content */}
                                    <h4 className="text-xl font-black text-slate-900 mb-3 group-hover:text-primary transition-colors duration-300">
                                        {article.headline}
                                    </h4>
                                    <p className="text-slate-600 font-bold leading-relaxed mb-4 group-hover:text-slate-700 transition-colors duration-300">
                                        {article.excerpt}
                                    </p>
                                    
                                    {/* CTA */}
                                    <div className="flex items-center gap-2 text-primary font-black uppercase text-sm tracking-widest group-hover:gap-3 transition-all">
                                        Read Full Story
                                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Stats Bar */}
                    <div className="bg-black text-white rounded-3xl p-8 border-4 border-black shadow-[8px_8px_0_#000] animate-in slide-in-from-bottom duration-700" style={{ animationDelay: '400ms' }}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            <div className="group">
                                <div className="text-4xl md:text-5xl font-black text-primary mb-2 group-hover:scale-110 transition-transform duration-300">500K+</div>
                                <p className="text-sm font-bold uppercase tracking-widest text-white/80 group-hover:text-white transition-colors duration-300">Gen Z Users</p>
                            </div>
                            <div className="group">
                                <div className="text-4xl md:text-5xl font-black text-accent-pink mb-2 group-hover:scale-110 transition-transform duration-300">2M+</div>
                                <p className="text-sm font-bold uppercase tracking-widest text-white/80 group-hover:text-white transition-colors duration-300">Trips Planned</p>
                            </div>
                            <div className="group">
                                <div className="text-4xl md:text-5xl font-black text-accent-blue mb-2 group-hover:scale-110 transition-transform duration-300">50+</div>
                                <p className="text-sm font-bold uppercase tracking-widest text-white/80 group-hover:text-white transition-colors duration-300">Countries</p>
                            </div>
                            <div className="group">
                                <div className="text-4xl md:text-5xl font-black text-yellow-400 mb-2 group-hover:scale-110 transition-transform duration-300">4.9⭐</div>
                                <p className="text-sm font-bold uppercase tracking-widest text-white/80 group-hover:text-white transition-colors duration-300">App Rating</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- COMMUNITY VIBES / REVIEWS --- */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16 animate-in fade-in duration-700">
                    <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">
                        The <span className="text-accent-pink hover:text-primary transition-colors duration-300">Tribe</span> Has Spoken
                    </h2>
                    <p className="font-bold text-xl text-slate-500 mt-4">Don't just take our word for it.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {COMMUNITY_REVIEWS.map((review, idx) => (
                        <div key={idx} className="bg-white border-4 border-black p-8 rounded-2xl shadow-[8px_8px_0_#000] relative animate-in slide-in-from-bottom duration-700" style={{ animationDelay: `${idx * 150}ms` }}>
                            {/* Quote mark decoration */}
                            <span className="material-symbols-outlined absolute -top-6 -left-4 text-6xl text-primary drop-shadow-[2px_2px_0_#000] animate-pulse">format_quote</span>

                            <p className="text-lg font-bold leading-snug mb-8 relative z-10 text-slate-800 hover:text-slate-900 transition-colors duration-300">
                                "{review.text}"
                            </p>
                            <div className="flex items-center gap-4">
                                <img src={review.avatar} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-black bg-slate-200 hover:scale-110 transition-transform duration-300" />
                                <span className="font-black uppercase text-sm italic hover:text-primary transition-colors duration-300">{review.author}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- PRO VERSION SECTION --- */}
            <section className="py-24 bg-gradient-to-br from-primary via-accent-pink to-accent-blue relative overflow-hidden border-y-8 border-black">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
                
                {/* Floating Elements */}
                <div className="absolute top-10 right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute bottom-10 left-10 w-48 h-48 bg-white/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16 animate-in fade-in duration-700">
                        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-black text-white font-black uppercase tracking-widest text-sm mb-6 shadow-[4px_4px_0_#fff] hover:scale-105 transition-transform duration-300">
                            <span className="material-symbols-outlined text-yellow-400 animate-pulse">workspace_premium</span>
                            Level Up Your Travel Game
                        </div>
                        <h2 className="text-5xl md:text-8xl font-black uppercase italic text-white mb-6 leading-[0.9]">
                            Go <span className="text-yellow-300 hover:text-yellow-200 transition-colors duration-300">PRO</span>
                        </h2>
                        <p className="text-xl md:text-2xl font-bold text-white/90 max-w-3xl mx-auto">
                            Unlock unlimited AI magic, exclusive deals, and travel like a true nomad
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        {[
                            { icon: 'auto_awesome', color: 'bg-yellow-400', title: 'Unlimited AI', desc: 'Generate endless itineraries in seconds with our advanced AI. No limits, no boundaries.' },
                            { icon: 'group_add', color: 'bg-pink-400', title: 'Co-op Mode', desc: 'Invite 10+ friends to edit trips together. Plan as a squad, vibe as a tribe.' },
                            { icon: 'loyalty', color: 'bg-blue-400', title: 'Pro Deals', desc: 'Access exclusive hotel & flight discounts. Save money while traveling in style.' }
                        ].map((feature, idx) => (
                            <div key={idx} className="bg-white/10 backdrop-blur-md border-4 border-white rounded-3xl p-8 text-white hover:bg-white/20 transition-all hover:scale-105 group animate-in slide-in-from-bottom duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300`}>
                                    <span className="material-symbols-outlined text-3xl text-black">{feature.icon}</span>
                                </div>
                                <h3 className="text-2xl font-black uppercase mb-4 group-hover:text-yellow-300 transition-colors duration-300">{feature.title}</h3>
                                <p className="text-white/80 font-bold leading-relaxed group-hover:text-white transition-colors duration-300">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center animate-in slide-in-from-bottom duration-700" style={{ animationDelay: '400ms' }}>
                        <div className="bg-black/30 backdrop-blur-md border-4 border-white rounded-3xl p-8 max-w-2xl mx-auto hover:bg-black/40 transition-colors duration-300 hover:scale-105">
                            <div className="flex items-center justify-center gap-4 mb-6">
                                <span className="text-6xl font-black text-yellow-300 animate-pulse hover:animate-spin transition-all duration-300">⚡</span>
                                <div className="text-left">
                                    <h4 className="text-3xl font-black uppercase text-white hover:text-yellow-300 transition-colors duration-300">Limited Time</h4>
                                    <p className="text-white/80 font-bold">Join waitlist today</p>
                                </div>
                            </div>
                            <Link to="/auth" className="inline-block">
                                <button className="bg-yellow-400 text-black px-12 py-6 rounded-full text-2xl font-black uppercase italic tracking-wider shadow-[0_8px_0_#000] hover:scale-110 active:scale-95 transition-all border-4 border-black hover:bg-yellow-300 hover:shadow-[0_12px_0_#000] hover:-translate-y-1">
                                    <span className="material-symbols-outlined text-3xl align-middle mr-3 animate-bounce" style={{ animationDuration: '2s' }}>rocket_launch</span>
                                    Request Pro Access
                                </button>
                            </Link>
                            <p className="text-white/70 font-bold mt-4 text-sm uppercase tracking-widest hover:text-white transition-colors duration-300">
                                No credit card required • Be the first to experience the future
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- GLOBAL FOOTER --- */}
            <Footer />

        </div>
    );
}

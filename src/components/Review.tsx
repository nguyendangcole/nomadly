import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';

export default function Review() {
  const { locationId } = useParams<{ locationId: string }>();
  const { locations, reviews, addReview } = useTravel();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const loc = locations.find((l) => l.id === locationId);

  if (!loc) {
    return (
      <div className="min-h-screen flex items-center justify-center font-display">
        <h2 className="text-4xl font-black italic uppercase">Location Not Found</h2>
      </div>
    );
  }

  const locReviews = reviews.filter((r) => r.locationId === locationId);

  // Calculate stats
  const totalReviews = locReviews.length;
  const avgRating = totalReviews > 0 ? (locReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) : 0;

  const handlePostReview = async () => {
    if (rating === 0) return;
    const res = await addReview({
      locationId: loc.id,
      rating,
      comment: comment.trim()
    });

    if (res) {
      setRating(0);
      setHoverRating(0);
      setComment('');
    } else {
      alert('Error saving review. Are you logged in?');
    }
  };

  return (
    <div className="bg-slate-50 font-display text-slate-900 min-h-screen">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b-4 border-black bg-white px-6 py-4">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="bg-primary y2k-border p-1">
            <img src="/assets/branding/logo1.png" alt="Nomadly" className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black italic tracking-tighter uppercase">Nomadly</h2>
        </Link>
        <div className="hidden md:flex flex-1 justify-center gap-10">
          <Link to="/explore" className="text-sm font-black uppercase hover:text-accent underline decoration-4 decoration-primary">Explore</Link>
          <a className="text-sm font-black uppercase hover:text-accent" href="#">Feed</a>
          <a className="text-sm font-black uppercase hover:text-accent" href="#">Map</a>
        </div>
        <div className="flex gap-4">
          <button className="y2k-border bg-white p-2 y2k-shadow active:translate-x-1 active:translate-y-1 active:shadow-none">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="size-10 y2k-border bg-accent overflow-hidden">
            <img className="h-full w-full object-cover" alt="User" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAS8NcBSUSXpuK6cp5dmSs_C7Ey_t7-xqewnuIe3TDUg175Yp_myN6TZNplRFBolEokmCqJ5hcRF7P3VyJPisw4DDc85TIzjF-RnLa1cZrUBUVqNeGniYpH-AO_oFeibKzFd8OlPs-Vgl38sgDQG8lTam3VLR1315XwEcMHj1I4tfUFiisKAV31FHPle_QpOEvpWqb_uGgRDL2so48nN2T9QiC503KewB37kd1wOWu3XqE9IMjPVgGHujJXGCGe1_dba6wjp-d3wc0" referrerPolicy="no-referrer" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-10 md:px-10">
        <div className="mb-12 flex flex-col items-start gap-4">
          <span className="bg-accent text-white px-4 py-1 font-black uppercase text-xs y2k-border">Location Review</span>
          <h1 className="text-6xl font-black italic tracking-tighter uppercase md:text-8xl">{loc.name}</h1>
          <p className="max-w-md text-lg font-bold leading-tight">The ultimate vibe check for {loc.name}. Rated by the community.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="y2k-border bg-white p-8 y2k-shadow">
              <h3 className="text-xl font-black uppercase mb-6 italic underline decoration-primary decoration-8">The Stats</h3>
              <div className="flex items-end gap-4 mb-8">
                <span className="text-8xl font-black leading-none">{avgRating.toFixed(1)}</span>
                <div className="flex flex-col mb-2">
                  <div className="flex text-primary">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`material-symbols-outlined ${star <= Math.round(avgRating) ? 'fill-1' : ''}`}>
                        star
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">Based on {totalReviews} vibes</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-[1rem_1fr_3rem] items-center gap-4">
                  <span className="font-black text-sm">5</span>
                  <div className="h-4 y2k-border bg-slate-100">
                    <div className="h-full bg-primary" style={{ width: '82%' }}></div>
                  </div>
                  <span className="text-right text-xs font-bold">82%</span>
                </div>
              </div>
            </div>

            <div className="y2k-border bg-primary p-8 y2k-shadow">
              <h3 className="text-xl font-black uppercase mb-4 italic">Drop your rating</h3>
              <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4, 5].map(i => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i)}
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={`size-12 y2k-border flex items-center justify-center transition-colors ${i <= (hoverRating || rating) ? 'bg-black text-primary' : 'bg-white text-black'
                      }`}
                  >
                    <span className="material-symbols-outlined text-3xl">star</span>
                  </button>
                ))}
              </div>
              <textarea
                className="w-full y2k-border p-4 bg-white font-bold focus:ring-0 focus:outline-none h-32 mb-4"
                placeholder="Was it brat or not?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
              <button
                onClick={handlePostReview}
                disabled={rating === 0}
                className="w-full bg-black text-primary font-black uppercase py-4 y2k-border y2k-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
              >
                Post Review
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b-4 border-black pb-2">
              <h3 className="text-2xl font-black italic uppercase">Latest Reviews</h3>
              <div className="flex gap-2">
                <span className="material-symbols-outlined">sort</span>
                <span className="text-sm font-black uppercase">Recent</span>
              </div>
            </div>
            <div className="space-y-4">
              {locReviews.length === 0 ? (
                <div className="y2k-border bg-white p-6 font-bold italic text-slate-400">No reviews yet. Be the first to drop a vibe check!</div>
              ) : (
                locReviews.map((r) => (
                  <div key={r.id} className="y2k-border bg-white p-6 relative">
                    {r.rating === 5 && <div className="absolute -top-3 -right-3 bg-accent text-white px-3 py-1 text-xs font-black uppercase y2k-border transform rotate-3">Verified Vibe</div>}
                    <div className="flex gap-4 items-start">
                      <div className="size-14 shrink-0 y2k-border overflow-hidden bg-slate-200">
                        <img className="h-full w-full object-cover" alt="User" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${r.userId}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-black text-lg uppercase italic">Explorer</h4>
                          <span className="text-xs font-bold text-slate-400">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex text-primary mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={`material-symbols-outlined ${star <= r.rating ? 'fill-1' : ''}`}>star</span>
                          ))}
                        </div>
                        {r.comment && <p className="font-bold leading-tight mb-4">{r.comment}</p>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

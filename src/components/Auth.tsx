import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';

type Mode = 'login' | 'register';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, loginWithGoogle } = useTravel();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);
      await login({
        email: email.trim(),
        password,
        name: mode === 'register' ? name : undefined,
        isRegister: mode === 'register',
      });

      if (!remember && typeof window !== 'undefined') {
        window.sessionStorage.setItem('nomadly:session', 'active');
      }

      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      const message = err.message || err?.message || 'An error occurred, please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-display">
      {/* Left Section: Abstract Illustration (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden y2k-gradient-bg">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full h-full">
          <div className="flex items-center gap-2">
            <div className="p-3 bg-white rounded-full shadow-lg">
              <img src="/assets/branding/logo1.png" alt="Nomadly Logo" className="w-8 h-8 object-contain" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white drop-shadow-md">NOMADLY</h1>
          </div>
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-primary text-xs font-black uppercase tracking-widest shadow-xl">
              <span className="size-3 rounded-full bg-primary animate-ping"></span>
              Retro-Future Active
            </div>
            <h2 className="text-8xl font-black leading-[0.9] text-white tracking-tighter italic">
              THE <br /> <span className="text-primary bg-white px-4 py-2 rounded-full inline-block mt-2">VIBE</span> <br /> TRIBE
            </h2>
            <p className="text-white/90 text-xl font-medium max-w-sm leading-relaxed">
              Step into the next dimension of travel. Log in to sync your reality.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex -space-x-4">
              <div className="size-14 rounded-full border-4 border-white bg-accent-pink shadow-lg flex items-center justify-center text-white font-bold">A</div>
              <div className="size-14 rounded-full border-4 border-white bg-accent-blue shadow-lg flex items-center justify-center text-white font-bold">B</div>
              <div className="size-14 rounded-full border-4 border-white bg-primary shadow-lg flex items-center justify-center text-white font-bold">C</div>
            </div>
            <p className="text-lg font-bold text-white uppercase tracking-tighter">12K+ Explorers Online</p>
          </div>
        </div>
        {/* Retro Shapes */}
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-accent-pink/30 rounded-full blur-3xl"></div>
      </div>

      {/* Right Section: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-20 bg-white">
        <div className="w-full max-w-md space-y-10">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="p-3 bg-primary rounded-full shadow-lg">
              <img src="/assets/branding/logo1.png" alt="Nomadly Logo" className="w-7 h-7 object-contain" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900">NOMADLY</h1>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">Enter Portal</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Access your travel dimension</p>
          </div>
          {/* Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-full">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-3 text-sm font-black rounded-full transition-all ${mode === 'login'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              LOGIN
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-3 text-sm font-black rounded-full transition-all ${mode === 'register'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              REGISTER
            </button>
          </div>
          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {mode === 'register' && (
                <div className="relative">
                  <input
                    className="w-full rounded-full border-2 border-slate-100 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    placeholder="DISPLAY NAME"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div className="relative">
                <input
                  className="w-full rounded-full border-2 border-slate-100 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="EMAIL ADDRESS"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <input
                  className="w-full rounded-full border-2 border-slate-100 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="PASSWORD"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400"
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between px-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  className="size-5 rounded-full border-2 border-slate-200 text-primary focus:ring-primary"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="text-xs font-black uppercase text-slate-500">Stay Synced</span>
              </label>
              <a className="text-xs font-black uppercase text-primary hover:text-accent-pink transition-colors" href="#">Forgot?</a>
            </div>
            {/* Y2K Glossy Button */}
            <div className="block w-full">
              <button
                className="w-full py-5 rounded-full bg-primary text-white text-sm font-black uppercase tracking-widest shadow-[0_10px_0_0_#6fa600] active:shadow-none active:translate-y-[10px] transition-all hover:bg-[#9BE300] disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Syncing...' : mode === 'login' ? 'Enter the Portal' : 'Create Portal Access'}
              </button>
            </div>
            {error && (
              <p className="text-xs font-bold text-red-500 text-center uppercase tracking-widest">
                {error}
              </p>
            )}
            <div className="relative flex items-center py-4">
              <div className="grow border-t-2 border-slate-100"></div>
              <span className="mx-4 shrink text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Alternative Sync</span>
              <div className="grow border-t-2 border-slate-100"></div>
            </div>
            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => loginWithGoogle()} className="flex items-center justify-center gap-3 rounded-full border-2 border-slate-100 bg-white py-4 text-xs font-black uppercase transition-all hover:border-primary hover:scale-[1.02]" type="button">
                <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path></svg>
                Google
              </button>
              <button className="flex items-center justify-center gap-3 rounded-full border-2 border-slate-100 bg-white py-4 text-xs font-black uppercase transition-all hover:border-primary hover:scale-[1.02]" type="button">
                <span className="material-symbols-outlined text-xl">ios</span>
                Apple
              </button>
            </div>
          </form>
          <p className="text-center text-[10px] font-bold text-slate-400 uppercase leading-relaxed">
            By entering, you accept our
            <a className="text-primary hover:underline underline-offset-4 ml-1" href="#">Terms</a>
            &
            <a className="text-primary hover:underline underline-offset-4 ml-1" href="#">Privacy Protocol</a>
          </p>
        </div>
      </div>
    </div>
  );
}

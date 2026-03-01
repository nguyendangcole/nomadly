import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useTravel, LocationCategory } from '../context/TravelContext';

type NewLocation = {
  name: string;
  category: LocationCategory;
  cost: number;
  dayNumber: number;
  description: string;
  imageUrl: string;
  imageFile?: File | null;
};

export default function CreateTrip() {
  const navigate = useNavigate();
  const { user, login, loginWithGoogle, createTrip, addLocation, uploadImage } = useTravel();

  const [step, setStep] = useState(1);

  // Budget filter options
  const budgetOptions = [
    { label: 'Budget Friendly', value: 500, description: 'Under $500' },
    { label: 'Mid-Range', value: 1500, description: '$500 - $2,000' },
    { label: 'Comfortable', value: 3000, description: '$2,000 - $4,000' },
    { label: 'Luxury', value: 5000, description: '$4,000 - $6,000' },
    { label: 'Ultra Luxury', value: 10000, description: '$6,000+' }
  ];

  // Step 1 State
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState<number | ''>('');
  const [isPublic, setIsPublic] = useState(true);

  // Step 2 State
  const [destinationSummary, setDestinationSummary] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');

  // Step 3 State (Itinerary)
  const [itinerary, setItinerary] = useState<NewLocation[]>([]);
  const [locName, setLocName] = useState('');
  const [locCategory, setLocCategory] = useState<LocationCategory>('Fun');
  const [locCost, setLocCost] = useState<number | ''>('');
  const [locDay, setLocDay] = useState(1);
  const [locDesc, setLocDesc] = useState('');
  const [locImg, setLocImg] = useState('');
  const [locImgFile, setLocImgFile] = useState<File | null>(null);
  const [locImgPreview, setLocImgPreview] = useState<string>('');

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI Modal State
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Login Prompt State (if user is not logged in when trying to save)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleNextStep1 = () => {
    if (!title.trim()) {
      setError('Please enter a trip title.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key is missing. Please set VITE_GEMINI_API_KEY.');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `You are an expert travel planner for Nomadly, a trendy app. Generate an itinerary for: "${aiPrompt}". Return the response as pure JSON without any markdown formatting or code blocks. Ensure the structure perfectly matches this:
{
  "title": "A catchy title (e.g. The Great Tokyo Expedition)",
  "destinationSummary": "A perfectly curated vibe-check of the place...",
  "coverImageKeyword": "tokyo city night",
  "budget": 2500,
  "days": 4,
  "itinerary": [
    {
       "name": "Name of the place",
       "category": "Stay" | "Food" | "Fun",
       "cost": 150,
       "dayNumber": 1,
       "description": "Aesthetic vibes...",
       "imageKeyword": "matcha dessert"
    }
  ]
}
Return ONLY valid JSON. Make the trip at least 4 locations across the days. Constraints: category MUST be "Stay", "Food", or "Fun". cost MUST be a number. dayNumber MUST be a number from 1 to days. No backticks.`;

      const result = await model.generateContent(prompt);
      const output = result.response.text();

      let parsed;
      try {
        const cleanedOutput = output.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
        parsed = JSON.parse(cleanedOutput);
      } catch (e) {
        console.error("Failed to parse AI response:", output);
        throw new Error("Failed to parse AI response. Please try again.");
      }

      setTitle(parsed.title || `The Great ${aiPrompt} Expedition`);

      const start = new Date();
      start.setDate(start.getDate() + 14);
      const end = new Date(start);
      end.setDate(start.getDate() + (parsed.days || 3));
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);

      setBudget(parsed.budget || 2500);
      setIsPublic(true);
      setDestinationSummary(parsed.destinationSummary || "A perfectly curated vibe-check generated by Nomadly AI.");

      setCoverImage(`https://source.unsplash.com/1200x800/?${encodeURIComponent(parsed.coverImageKeyword || parsed.title)}`);

      if (parsed.itinerary && Array.isArray(parsed.itinerary)) {
        setItinerary(parsed.itinerary.map((item: any) => ({
          name: item.name || "Unknown Place",
          category: ["Stay", "Food", "Fun"].includes(item.category) ? item.category : "Fun",
          cost: item.cost || 0,
          dayNumber: item.dayNumber || 1,
          description: item.description || "",
          imageUrl: `https://source.unsplash.com/800x600/?${encodeURIComponent(item.imageKeyword || item.name)}`
        })));
      }

      setShowAIModal(false);
      setStep(3);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'AI Generation failed');
      setShowAIModal(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNextStep2 = () => {
    if (!destinationSummary.trim() || (!coverImage.trim() && !coverImageFile)) {
      setError('Please enter a destination summary and choose a cover image.');
      return;
    }
    setError(null);
    setStep(3);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
      setCoverImage(''); // Clear URL if they choose file
    }
  };

  const handleAddLocationToDraft = () => {
    if (!locName.trim() || locCost === '') {
      setError('Please enter the location name and estimated cost.');
      return;
    }
    const newLoc = {
      name: locName.trim(),
      category: locCategory,
      cost: Number(locCost),
      dayNumber: locDay,
      description: locDesc.trim(),
      imageUrl: locImg.trim(),
      imageFile: locImgFile,
    };
    if (editingIndex !== null) {
      const updated = [...itinerary];
      updated[editingIndex] = newLoc;
      setItinerary(updated);
      setEditingIndex(null);
    } else {
      setItinerary([...itinerary, newLoc]);
    }
    // Reset form
    setLocName('');
    setLocCost('');
    setLocDesc('');
    setLocImg('');
    setLocImgFile(null);
    setLocImgPreview('');
    setError(null);
  };

  const handleEditLocation = (index: number) => {
    const loc = itinerary[index];
    setLocName(loc.name);
    setLocCategory(loc.category);
    setLocCost(loc.cost);
    setLocDay(loc.dayNumber);
    setLocDesc(loc.description);
    setLocImg(loc.imageUrl);
    setLocImgFile(loc.imageFile || null);
    setLocImgPreview(loc.imageFile ? URL.createObjectURL(loc.imageFile) : '');
    setEditingIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
  };

  const handleRemoveLocation = (index: number) => {
    setItinerary(itinerary.filter((_, i) => i !== index));
    if (editingIndex === index) {
      // If we deleted what we are editing, clear form
      setLocName('');
      setLocCost('');
      setLocDesc('');
      setLocImg('');
      setLocImgFile(null);
      setLocImgPreview('');
      setEditingIndex(null);
    } else if (editingIndex !== null && index < editingIndex) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const days =
        startDate && endDate
          ? Math.max(
            1,
            Math.round(
              (new Date(endDate).getTime() - new Date(startDate).getTime()) /
              (1000 * 60 * 60 * 24),
            ) + 1,
          )
          : 3;

      let finalCoverImageUrl = coverImage.trim();

      // If a file was selected, we need to upload it to Supabase Storage
      if (coverImageFile) {
        setIsSaving(true);
        const uploadedUrl = await uploadImage(coverImageFile, 'trip-images');
        finalCoverImageUrl = uploadedUrl;
      }

      const newTrip = await createTrip({
        userId: user.id,
        title: title.trim(),
        destinationSummary: destinationSummary.trim(),
        coverImage: finalCoverImageUrl,
        days,
        budget: typeof budget === 'number' ? budget : 0,
        isPublic,
      });

      if (!newTrip) {
        throw new Error('Error saving data. Please open F12 -> Console to see details.');
      }

      // Add itinerary sequentially if any
      for (const loc of itinerary) {
        let finalLocImageUrl = loc.imageUrl;
        if (loc.imageFile) {
          const uploadedUrl = await uploadImage(loc.imageFile, 'trip-images');
          finalLocImageUrl = uploadedUrl;
        }

        await addLocation({
          tripId: newTrip.id,
          name: loc.name,
          category: loc.category,
          cost: loc.cost,
          dayNumber: loc.dayNumber,
          description: loc.description,
          imageUrl: finalLocImageUrl,
        });
      }

      navigate(`/itinerary/${newTrip.id}`);
    } catch (err: any) {
      console.error('CRITICAL SAVE ERROR:', err);
      const message = err?.message || 'Cannot save the trip, please try again.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      if (!loginEmail || !loginPassword) throw new Error("Please enter your email and password");

      try {
        // Try to sign in first
        await login({ email: loginEmail, password: loginPassword, isRegister: false });
      } catch (err: any) {
        const msg = err.message?.toLowerCase() || '';
        // If the account doesn't exist (or wrong password for existing, but we can't distinguish perfectly without breaking the seamless flow)
        // We will attempt to register them. If they actually exist and just typed wrong pass, register will fallback to sign-in and still fail correctly with "Sai mật khẩu".
        if (msg.includes('không đúng') || msg.includes('tin đăng nhập') || msg.includes('invalid login')) {
          await login({ email: loginEmail, password: loginPassword, isRegister: true });
        } else {
          throw err;
        }
      }

      setShowLoginPrompt(false);
      // Let the user click 'Create Trip' again manually to be safe
    } catch (err: any) {
      setLoginError(err.message || 'Login failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <div className="bg-slate-50 font-display text-slate-900 min-h-screen">
      <header className="border-b-4 border-black bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="bg-primary p-2 border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="material-symbols-outlined text-black font-bold">flight_takeoff</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tighter uppercase italic">Nomadly</h1>
        </Link>
        <Link to="/dashboard">
          <button className="bg-white px-6 py-2 rounded-xl font-bold border-2 border-black shadow-[2px_2px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
            Exit
          </button>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-10">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-4xl font-black italic uppercase leading-none">
              Step 0{step}: {step === 1 ? 'Basics' : step === 2 ? 'Details' : 'Itinerary'}
            </h2>
            <span className="text-xl font-bold bg-primary px-3 py-1 border-2 border-black text-black">
              {progress}%
            </span>
          </div>
          <div className="h-4 w-full bg-white border-2 border-black rounded-full p-0.5 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="border-4 border-black bg-white p-6 md:p-10 rounded-2xl shadow-[8px_8px_0_#000]">
          <div className="flex flex-col md:flex-row gap-6 items-center border-b-4 border-black pb-8 mb-8">
            <label className="cursor-pointer w-full md:w-1/3 aspect-square bg-primary border-4 border-black rounded-xl overflow-hidden relative shadow-[4px_4px_0_#000] group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                title="Upload cover image"
              />
              <img alt="Display" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" src={coverImagePreview || coverImage || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600&auto=format&fit=crop"} referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-primary/20 mix-blend-multiply opacity-100 group-hover:opacity-0 transition-opacity duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                <div className="flex flex-col items-center">
                  <span className="material-symbols-outlined text-white text-5xl font-black mb-2">add_a_photo</span>
                  <span className="text-white font-bold uppercase tracking-wider">Change Image</span>
                </div>
              </div>
            </label>
            <div className="w-full md:w-2/3">
              <h3 className="text-5xl font-black italic uppercase leading-none mb-2">Create New Trip</h3>
              <p className="text-xl font-medium">Let's set the foundation for your next iconic getaway.</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 text-red-600 font-bold rounded-xl text-center">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xl font-black uppercase mb-2 italic">Trip Title *</label>
                  <input
                    autoFocus
                    className="w-full text-xl font-bold border-2 border-black rounded-xl p-4 focus:ring-4 focus:ring-primary/30 outline-none"
                    placeholder="E.g., Euro Summer '25"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xl font-black uppercase mb-2 italic text-[#ff00ff]">Start Date</label>
                  <input
                    type="date"
                    className="w-full font-bold border-2 border-black rounded-xl p-4 outline-none focus:ring-4 focus:ring-primary/30"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xl font-black uppercase mb-2 italic text-[#ff00ff]">End Date</label>
                  <input
                    type="date"
                    className="w-full font-bold border-2 border-black rounded-xl p-4 outline-none focus:ring-4 focus:ring-primary/30"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xl font-black uppercase mb-2 italic text-[#ff00ff]">Budget Range</label>
                  <div className="space-y-3">
                    {budgetOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setBudget(option.value)}
                        className={`w-full p-4 rounded-xl border-2 font-bold transition-all text-left ${
                          budget === option.value
                            ? 'bg-primary text-black border-black shadow-[4px_4px_0_#000]'
                            : 'bg-white border-slate-300 hover:border-black hover:shadow-[2px_2px_0_#000]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-black text-lg">{option.label}</div>
                            <div className="text-sm opacity-75">{option.description}</div>
                          </div>
                          <div className="text-2xl font-black">
                            ${option.value.toLocaleString()}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <input
                      type="number"
                      className="w-full font-bold border-2 border-black rounded-xl p-3 outline-none focus:ring-4 focus:ring-primary/30"
                      placeholder="Or enter custom amount..."
                      value={budget}
                      onChange={(e) => setBudget(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <label className="block text-xl font-black uppercase mb-2">Visibility</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPublic(true)}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${isPublic ? 'bg-black text-white border-black' : 'bg-white border-slate-300 text-slate-500 hover:border-black'
                        }`}
                    >
                      Public
                    </button>
                    <button
                      onClick={() => setIsPublic(false)}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${!isPublic ? 'bg-black text-white border-black' : 'bg-white border-slate-300 text-slate-500 hover:border-black'
                        }`}
                    >
                      Private
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  onClick={() => setShowAIModal(true)}
                  className="w-full sm:w-auto bg-black text-primary font-black uppercase italic px-6 py-4 rounded-xl shadow-[4px_4px_0_#primary] border-2 border-black hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">auto_awesome</span>
                  Auto-fill with AI
                </button>
                <button
                  onClick={handleNextStep1}
                  className="w-full sm:w-auto bg-primary text-black font-black uppercase italic px-10 py-4 rounded-xl shadow-[4px_4px_0_#000] border-2 border-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-xl"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div>
                <label className="block text-xl font-black uppercase mb-2 italic text-[#001f3f]">Cover Image Upload *</label>

                <div className="relative w-full border-2 border-primary rounded-xl overflow-hidden bg-[#f8ffed] transition-colors focus-within:ring-4 focus-within:ring-primary/30">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="Upload an image"
                  />
                  <div className="p-4 flex items-center justify-between pointer-events-none">
                    <span className="text-slate-500 font-bold truncate">
                      {coverImageFile ? coverImageFile.name : 'Click to upload an image from your device...'}
                    </span>
                    <span className="material-symbols-outlined text-primary font-bold">upload_file</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <hr className="flex-1 border-t-2 border-slate-200" />
                  <span className="text-slate-400 font-bold uppercase text-sm">OR PASTE URL</span>
                  <hr className="flex-1 border-t-2 border-slate-200" />
                </div>

                <div className="mt-4 border-2 border-primary bg-[#f8ffed] rounded-xl overflow-hidden focus-within:ring-4 focus-within:ring-primary/30">
                  <input
                    className="w-full font-bold bg-transparent p-4 outline-none text-slate-700 placeholder:text-slate-400"
                    placeholder="Paste an image URL (e.g., https://unsplash.com/...)"
                    value={coverImage}
                    onChange={(e) => {
                      setCoverImage(e.target.value);
                      if (e.target.value) {
                        setCoverImageFile(null);
                        setCoverImagePreview('');
                      }
                    }}
                  />
                </div>

                {(coverImagePreview || coverImage) && (
                  <div className="mt-4 h-48 w-full border-2 border-black rounded-xl overflow-hidden bg-slate-100 shadow-[4px_4px_0_#000]">
                    <img src={coverImagePreview || coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xl font-black uppercase mb-2 italic text-[#001f3f]">Destination Summary *</label>
                <textarea
                  className="w-full h-32 font-bold border-2 border-black rounded-xl p-4 focus:ring-4 focus:ring-primary/30 outline-none resize-none"
                  placeholder="What's the vibe? (e.g. Exploring hidden cafes and chasing sunsets...)"
                  value={destinationSummary}
                  onChange={(e) => setDestinationSummary(e.target.value)}
                />
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="bg-slate-200 text-black font-bold px-8 py-4 rounded-xl border-2 border-black hover:bg-slate-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStep2}
                  className="bg-primary text-black font-black uppercase italic px-10 py-4 rounded-xl shadow-[4px_4px_0_#000] border-2 border-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-xl"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="bg-slate-100 border-2 border-black p-6 rounded-xl space-y-4">
                <h3 className="text-xl font-black uppercase mb-2">Quick Add Itinerary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">Location Name</label>
                    <input className="w-full border-2 border-black rounded-lg p-2 font-bold" value={locName} onChange={e => setLocName(e.target.value)} placeholder="Louvre Museum" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Category & Day</label>
                    <div className="flex gap-2">
                      <select className="flex-1 border-2 border-black rounded-lg p-2 font-bold" value={locCategory} onChange={e => setLocCategory(e.target.value as LocationCategory)}>
                        <option value="Stay">Stay</option>
                        <option value="Food">Food</option>
                        <option value="Fun">Fun</option>
                      </select>
                      <input type="number" min="1" className="w-20 border-2 border-black rounded-lg p-2 font-bold" value={locDay} onChange={e => setLocDay(Number(e.target.value))} title="Day" />
                    </div>
                  </div>
                  <div className="md:col-span-2 flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-bold mb-1">Est. Cost ($)</label>
                      <input type="number" className="w-full border-2 border-black rounded-lg p-2 font-bold" value={locCost} onChange={e => setLocCost(e.target.value === '' ? '' : Number(e.target.value))} placeholder="50" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold mb-1">Image Upload (Optional)</label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer border-2 border-black rounded-lg p-2 font-bold text-sm bg-white hover:bg-slate-50 truncate text-center">
                        {locImgFile ? locImgFile.name : 'Choose File...'}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setLocImgFile(e.target.files[0]);
                            setLocImgPreview(URL.createObjectURL(e.target.files[0]));
                            setLocImg('');
                          }
                        }} />
                      </label>
                      <span className="text-xs font-bold text-slate-400">OR</span>
                      <input className="flex-1 border-2 border-black rounded-lg p-2 font-bold text-sm" value={locImg} onChange={e => { setLocImg(e.target.value); setLocImgFile(null); setLocImgPreview(''); }} placeholder="Paste URL https://..." />
                    </div>
                    {/* Location Image Preview Mini */}
                    {(locImgPreview || locImg) && (
                      <div className="mt-2 h-20 w-32 border-2 border-black rounded-lg overflow-hidden bg-slate-100 shadow-[2px_2px_0_#000]">
                        <img src={locImgPreview || locImg} alt="Location Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold mb-1">Description (Optional)</label>
                    <textarea className="w-full border-2 border-black rounded-lg p-2 font-bold text-sm h-20 resize-none" value={locDesc} onChange={e => setLocDesc(e.target.value)} placeholder="Notes for this location..." />
                  </div>
                  <div className="md:col-span-2">
                    <button onClick={handleAddLocationToDraft} className="w-full bg-black text-white font-bold py-3 rounded-lg border-2 border-black hover:bg-slate-800 transition-colors uppercase">
                      {editingIndex !== null ? '✓ Save Changes' : '+ Add Location'}
                    </button>
                    {editingIndex !== null && (
                      <button onClick={() => {
                        setEditingIndex(null);
                        setLocName('');
                        setLocCost('');
                        setLocDesc('');
                        setLocImg('');
                        setLocImgFile(null);
                        setLocImgPreview('');
                      }} className="w-full mt-2 bg-slate-200 text-slate-700 font-bold py-2 rounded-lg border-2 border-slate-300 hover:bg-slate-300 transition-colors uppercase">
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {itinerary.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-black uppercase italic">Draft Itinerary ({itinerary.length})</h4>
                  {itinerary.map((loc, i) => (
                    <div key={i} className="flex items-center justify-between border-2 border-slate-300 p-3 rounded-xl bg-white">
                      <div>
                        <div className="flex gap-2 items-center">
                          <span className="text-xs bg-slate-200 px-2 py-1 rounded font-black">Day {loc.dayNumber}</span>
                          <span className="font-bold">{loc.name}</span>
                        </div>
                        <span className="text-sm text-slate-500">{loc.category} • ${loc.cost}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditLocation(i)} className="text-primary hover:text-green-600 bg-slate-100 rounded p-1 hover:bg-green-50 transition-colors" title="Edit location">
                          <span className="material-symbols-outlined text-sm m-1">edit</span>
                        </button>
                        <button onClick={() => handleRemoveLocation(i)} className="text-red-500 hover:text-red-700 bg-red-50 rounded p-1 transition-colors" title="Delete location">
                          <span className="material-symbols-outlined text-sm m-1">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 flex justify-between items-center pt-6 border-t-2 border-black border-dashed">
                <button
                  onClick={() => setStep(2)}
                  className="bg-slate-200 text-black font-bold px-8 py-4 rounded-xl border-2 border-black hover:bg-slate-300 transition-colors"
                  disabled={isSaving}
                >
                  Back
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-primary text-black font-black uppercase italic px-10 py-4 rounded-xl shadow-[4px_4px_0_#000] border-2 border-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-xl disabled:opacity-50"
                >
                  {isSaving ? 'Creating...' : 'Create Trip'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-4 border-black rounded-2xl p-6 md:p-10 max-w-md w-full shadow-[8px_8px_0_#000] relative">
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="absolute top-4 right-4 text-black hover:text-red-500 transition-colors"
            >
              <span className="material-symbols-outlined font-bold text-3xl">close</span>
            </button>
            <p className="font-medium text-slate-600 mb-6">You need to log in so we can save this trip to your account.</p>

            {loginError && (
              <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-600 font-bold rounded-lg text-sm">
                {loginError}
              </div>
            )}

            <form onSubmit={handleQuickLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold uppercase mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border-2 border-black rounded-xl p-3 font-bold focus:ring-4 focus:ring-primary/30 outline-none"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase mb-1">Password</label>
                <input
                  type="password"
                  minLength={6}
                  className="w-full border-2 border-black rounded-xl p-3 font-bold focus:ring-4 focus:ring-primary/30 outline-none"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-primary text-black font-black uppercase italic py-4 rounded-xl border-2 border-black hover:bg-[#e0ffb3] transition-colors mt-2"
              >
                {isLoggingIn ? 'Processing...' : 'Log In / Sign Up'}
              </button>
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t-2 border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 font-bold text-xs uppercase">or</span>
                <div className="flex-grow border-t-2 border-slate-200"></div>
              </div>

              <button
                type="button"
                onClick={() => loginWithGoogle()}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-2 bg-white text-black font-black uppercase py-4 rounded-xl border-2 border-black hover:shadow-[4px_4px_0_#000] hover:-translate-y-1 transition-all"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 pointer-events-none" />
                Log in with Google
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Generate Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-8 border-black rounded-3xl p-8 md:p-12 max-w-xl w-full shadow-[16px_16px_0_#primary] relative overflow-hidden">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12 text-center relative z-10">
                <div className="size-24 border-8 border-primary border-t-black rounded-full animate-spin mb-8 shadow-lg"></div>
                <h3 className="text-3xl font-black uppercase italic text-black mb-2 animate-pulse">Generating Magic...</h3>
                <p className="text-slate-500 font-bold">Scanning the globe for immaculate vibes</p>
              </div>
            ) : (
              <div className="relative z-10">
                <button
                  onClick={() => setShowAIModal(false)}
                  className="absolute -top-4 -right-4 w-10 h-10 flex items-center justify-center bg-black text-white rounded-full hover:bg-accent-pink hover:text-black border-2 border-black transition-all hover:scale-110"
                >
                  <span className="material-symbols-outlined font-black">close</span>
                </button>

                <div className="inline-flex items-center justify-center gap-2 bg-black text-primary px-4 py-1 border-2 border-black rounded-full mb-6">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  <span className="font-black uppercase tracking-widest text-xs italic">AI Powered</span>
                </div>

                <h2 className="text-4xl font-black uppercase italic mb-2 tracking-tighter text-black">
                  Lazy? Let AI do the work.
                </h2>
                <p className="text-slate-500 font-bold mb-8">
                  Just tell us where you want to go, and we'll create a full itinerary, add images, and set a budget for you.
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-black uppercase mb-2 text-primary bg-black inline-block px-2 py-1 rotate-1">Dream Destination / Vibe</label>
                    <input
                      autoFocus
                      className="w-full border-4 border-black rounded-2xl p-4 font-black text-xl focus:outline-none focus:border-primary focus:shadow-[4px_4px_0_#primary] transition-all bg-slate-50"
                      placeholder="e.g. A romantic weekend in Paris"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAIGenerate()}
                    />
                  </div>

                  <button
                    onClick={handleAIGenerate}
                    disabled={!aiPrompt.trim()}
                    className="w-full bg-primary text-black font-black uppercase italic py-5 rounded-2xl border-4 border-black hover:bg-black hover:text-primary transition-all shadow-[0_6px_0_#000] active:translate-y-2 active:shadow-none text-xl flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Trip <span className="material-symbols-outlined font-black">bolt</span>
                  </button>
                </div>
              </div>
            )}

            {/* Decorative background shapes */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent-pink rounded-full blur-3xl opacity-30 pointer-events-none"></div>
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-y2k-blue rounded-full blur-3xl opacity-30 pointer-events-none"></div>
          </div>
        </div>
      )}
    </div>
  );
}

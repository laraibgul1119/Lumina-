import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stars, GalleryVertical as GalleryAdd, ArrowRight, Upload, Link as LinkIcon, AlertCircle, LogOut, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../components/AuthProvider';

export default function LandingPage() {
  const { user, logout } = useAuth();
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleAnalyze = (imageSource: string) => {
    if (imageSource) {
      navigate(`/dashboard?url=${encodeURIComponent(imageSource)}`);
    } else {
      setError("Please upload a valid image or paste a valid image URL.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please upload a valid image file.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleAnalyze(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please upload a valid image file.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleAnalyze(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCFB]">
      {/* Navigation */}
      <nav className="fixed z-50 bg-[#FDFCFB]/80 w-full border-stone-200/50 border-b top-0 backdrop-blur-md">
        <div className="flex h-16 max-w-7xl mx-auto px-6 items-center justify-between">
          <div className="uppercase text-lg font-medium text-stone-900 tracking-tighter">LUMINA</div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-stone-200" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center border border-stone-200">
                  <UserIcon className="w-4 h-4 text-stone-400" />
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-stone-900 leading-none">{user?.displayName}</p>
                <p className="text-[10px] text-stone-400 leading-none mt-1">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="p-2 rounded-xl hover:bg-stone-50 text-stone-400 hover:text-stone-900 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-32 pb-20 flex flex-col items-center">
        
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto px-6 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm text-xs font-medium mb-8 bg-white border-stone-200/80 text-stone-600"
          >
            <Stars className="w-3.5 h-3.5" />
            AI Fashion Analysis 2.0
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:text-7xl leading-[1.1] text-5xl font-normal text-stone-900 tracking-tight mb-6 font-serif"
          >
            Don't just pin it.<br /> <span className="italic text-stone-500">Wear it. Or make it.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg font-normal text-stone-500 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Upload any style inspiration. We'll instantly locate exact matches from online boutiques, or generate a comprehensive technical blueprint to recreate it yourself.
          </motion.p>
        </section>

        {/* Input Area */}
        <section className="w-full max-w-2xl px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Drag & Drop Zone */}
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative aspect-[16/9] rounded-[2rem] border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center p-8 text-center
                ${isDragging ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-400 bg-white'}
              `}
            >
              <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="text-lg font-medium text-stone-900">Drop your inspiration here</h3>
              <p className="text-sm text-stone-400 mt-1">or click to browse files</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-stone-200"></div>
              <span className="text-xs font-medium text-stone-400 uppercase tracking-widest">or paste link</span>
              <div className="h-px flex-1 bg-stone-200"></div>
            </div>

            {/* URL Input */}
            <div className="p-2 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border flex items-center gap-2 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white border-stone-200">
              <div className="flex-1 flex items-center gap-3 pl-4">
                <LinkIcon className="w-5 h-5 text-stone-400" />
                <input 
                  type="text" 
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setError(null); }}
                  placeholder="Paste image URL..." 
                  className="w-full bg-transparent border-none outline-none text-sm placeholder:text-stone-400 font-normal text-stone-700"
                />
              </div>
              <button 
                onClick={() => handleAnalyze(url)}
                className="px-8 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors bg-stone-900 text-white hover:bg-stone-800"
              >
                Search
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Error Banner */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-10 mt-auto border-stone-200/60">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm font-medium tracking-tighter uppercase text-stone-900">LUMINA</div>
          <div className="flex gap-6">
            <a href="#" className="text-xs font-normal text-stone-500 transition-colors hover:text-stone-900">Terms</a>
            <a href="#" className="text-xs font-normal text-stone-500 transition-colors hover:text-stone-900">Privacy</a>
            <a href="#" className="text-xs font-normal text-stone-500 transition-colors hover:text-stone-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

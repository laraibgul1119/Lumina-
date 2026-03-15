import React from 'react';
import { useAuth } from '../components/AuthProvider';
import { motion } from 'motion/react';
import { LogIn, Sparkles } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-xl border border-stone-100 text-center"
      >
        <div className="w-20 h-20 bg-stone-900 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-lg">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl font-serif text-stone-900 mb-4 tracking-tight">LUMINA</h1>
        <p className="text-stone-500 mb-12 leading-relaxed">
          Sign in to unlock the future of fashion analysis and technical blueprints.
        </p>

        <button
          onClick={login}
          className="w-full py-4 px-6 bg-stone-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-stone-800 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          <LogIn className="w-5 h-5" />
          Continue with Google
        </button>

        <p className="mt-8 text-[10px] text-stone-400 uppercase tracking-widest">
          Secure authentication powered by Firebase
        </p>
      </motion.div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/supabase';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  // Styling Input disesuaikan dengan Dark Mode
  const inputStyle = "w-full px-4 py-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm placeholder:text-slate-500";
  const labelStyle = "text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1 block";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Tombol Kembali ke Beranda */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold group bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800/50 backdrop-blur-md">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Beranda
        </Link>
      </div>

      {/* Aksen background dekoratif (Senada dengan Landing Page) */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/20 blur-[120px] pointer-events-none"></div>

      {/* Container utama (Card Glassmorphism) */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md p-8 sm:p-10 rounded-[2rem] bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-indigo-500/5 border border-slate-800/60 relative z-10"
      >
        
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-2xl flex items-center justify-center font-bold text-3xl shadow-lg shadow-indigo-500/20 mx-auto mb-6"
          >
            S
          </motion.div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Tim SkillSync</h1>
          <p className="text-slate-400 mt-2 text-sm">Masuk ke pusat kendali portofolio tim.</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          
          <div>
            <label className={labelStyle}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputStyle}
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3.5 rounded-xl text-center font-medium"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-4 rounded-xl font-bold text-white tracking-wide transition-all duration-300 bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Otentikasi...
              </>
            ) : 'Masuk Dashboard'}
          </button>

        </form>
      </motion.div>
    </div>
  );
}
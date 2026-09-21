import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { Upload, LogOut, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Admin() {
  const [user, setUser]         = useState<User | null>(null);
  const [loading, setLoading]   = useState(true);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) setError(authError.message);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden -mx-6 px-6">
        {/* Background glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-accent/8 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/6 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Glass card */}
          <div className="p-8 md:p-10 rounded-3xl border border-white/12 dark:border-white/6 bg-white/70 dark:bg-black/40 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
                <Sparkles size={18} className="text-accent" />
              </div>
              <div>
                <h1 className="text-2xl font-serif leading-none">Owner Login</h1>
                <p className="text-xs font-mono opacity-40 mt-0.5 tracking-widest uppercase">Artville Admin</p>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono tracking-widest uppercase opacity-50">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-ink/5 dark:bg-white/8 border border-ink/10 dark:border-white/10 outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-mono tracking-widest uppercase opacity-50">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-ink/5 dark:bg-white/8 border border-ink/10 dark:border-white/10 outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-accent text-white font-medium text-sm tracking-wide hover:bg-accent-light transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] disabled:opacity-50 mt-2"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // Logged-in dashboard
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between mb-12">
        <div>
          <p className="text-xs font-mono tracking-[0.3em] uppercase text-accent/70 mb-2">Artville Admin</p>
          <h1 className="text-4xl md:text-5xl font-serif">Dashboard</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-red-400 hover:text-red-500 transition-colors p-3 rounded-full hover:bg-red-500/10"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>

      <div className="p-10 border border-dashed border-ink/15 dark:border-white/15 rounded-3xl flex flex-col items-center justify-center text-center gap-4 hover:border-accent/30 transition-colors">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
          <Upload className="text-accent" size={28} />
        </div>
        <p className="text-xl font-serif">Upload Dashboard</p>
        <p className="text-sm opacity-40 font-mono max-w-xs">
          Use the ✦ floating upload button in the bottom-right corner to upload artworks to any section.
        </p>
      </div>
    </motion.div>
  );
}

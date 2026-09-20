import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Upload } from 'lucide-react';

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setError(error.message);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <div className="animate-pulse">Loading...</div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 rounded-2xl bg-white dark:bg-ink shadow-2xl border border-ink/5 dark:border-white/5">
        <h1 className="text-3xl mb-8 font-serif">Owner Login</h1>
        
        {error && <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 opacity-80">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-ink/5 dark:bg-white/5 border-none outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1 opacity-80">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-ink/5 dark:bg-white/5 border-none outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full p-3 rounded-lg bg-ink text-paper dark:bg-paper dark:text-ink font-medium mt-4 hover:bg-accent hover:text-white transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-serif">Dashboard</h1>
        <button 
          onClick={handleLogout}
          className="text-sm uppercase tracking-wide opacity-80 hover:text-accent transition-colors"
        >
          Sign Out
        </button>
      </div>
      
      <div className="p-12 border-2 border-dashed border-ink/20 dark:border-white/20 rounded-2xl flex flex-col items-center justify-center text-center opacity-80">
        <Upload className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-xl mb-2 font-serif">Upload Dashboard</p>
        <p className="text-sm">Global FAB will handle the actual upload flow.</p>
      </div>
    </div>
  );
}

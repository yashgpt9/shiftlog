"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SupervisorLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') {
      document.cookie = "supervisor=true; path=/; max-age=86400";
      router.push('/supervisor');
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Supervisor Login</h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">Enter your credentials to access the secure dashboard</p>
        </div>
        <form onSubmit={handleLogin}>
          {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm font-semibold text-center">{error}</div>}
          <div className="mb-6">
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-900/50 border border-slate-600 text-white rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500" placeholder="Password" />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-lg shadow-blue-900/20">Sign In</button>
        </form>
      </div>
    </div>
  );
}

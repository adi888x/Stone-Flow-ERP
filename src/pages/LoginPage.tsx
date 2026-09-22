import React, { useState, useEffect } from 'react';
import { useStoreContext } from '../App';

export function LoginPage() {
  const store = useStoreContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Simulate loading then reveal the form
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }
    const success = store.login(email, password);
    if (!success) {
      setError('Invalid credentials. Try: admin@balajiwashsand.com');
    }
  };

  const handleDemo = () => {
    store.enterDemo();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {loading ? (
          // Skeleton loading state
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            {/* Logo skeleton */}
            <div className="flex flex-col items-center mb-8">
              <div className="skeleton-dark w-16 h-16 rounded-2xl mb-4" />
              <div className="skeleton-dark w-48 h-6 rounded mb-2" />
              <div className="skeleton-dark w-32 h-4 rounded" />
            </div>

            {/* Form skeleton */}
            <div className="space-y-4">
              <div>
                <div className="skeleton-dark w-16 h-3 rounded mb-2" />
                <div className="skeleton-dark w-full h-11 rounded-lg" />
              </div>
              <div>
                <div className="skeleton-dark w-20 h-3 rounded mb-2" />
                <div className="skeleton-dark w-full h-11 rounded-lg" />
              </div>
              <div className="skeleton-dark w-full h-11 rounded-lg" />
            </div>

            {/* Demo button skeleton */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="skeleton-dark w-full h-11 rounded-lg" />
              <div className="skeleton-dark w-48 h-3 rounded mx-auto mt-3" />
            </div>
          </div>
        ) : (
          // Actual login form
          <div className="animate-[fadeIn_0.4s_ease-out]">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
                <span className="text-white font-bold text-xl">BW</span>
              </div>
              <h1 className="text-2xl font-bold text-white">BALAJI WASH SAND</h1>
              <p className="text-blue-200 text-sm mt-1">Enterprise Resource Planning</p>
            </div>

            {/* Login Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-6">Sign In</h2>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@balajiwashsand.com"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors"
                >
                  LOGIN
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <button
                  onClick={handleDemo}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition-colors border border-slate-300"
                >
                  DEMO ACCOUNT
                </button>
                <p className="text-xs text-slate-500 text-center mt-2">
                  Demo mode is read-only with sample data
                </p>
              </div>

              {/* Demo credentials hint */}
              <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-medium text-blue-800 mb-1">Demo Credentials:</p>
                <p className="text-xs text-blue-700">Email: admin@balajiwashsand.com</p>
                <p className="text-xs text-blue-700">Password: admin123</p>
              </div>
            </div>

            <p className="text-center text-blue-200/60 text-xs mt-6">
              © 2026 Balaji Wash Sand. All rights reserved.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { useLifeOS } from '../context/LifeOSContext';
import { Infinity, LogIn, Mail, Lock, AlertCircle, Loader, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

type AuthMode = 'options' | 'email-signin' | 'email-signup';

const Auth: React.FC = () => {
  const { login, loginWithEmail, signUpWithEmail } = useLifeOS();
  const [mode, setMode] = useState<AuthMode>('options');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [storedEmail, setStoredEmail] = useState<string>('');

  // Load stored credentials on mount
  useEffect(() => {
    const stored = localStorage.getItem('lifeos_remember_email');
    if (stored) {
      setStoredEmail(stored);
      setRememberMe(true);
    }
  }, []);

  // Email form state
  const [email, setEmail] = useState(storedEmail);
  const [password, setPassword] = useState('');

  // Email sign-in handler
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await loginWithEmail(email, password);
      if (rememberMe) {
        localStorage.setItem('lifeos_remember_email', email);
      } else {
        localStorage.removeItem('lifeos_remember_email');
      }
    } catch (err: any) {
      setError(err.message || 'Sign-in failed');
      setIsLoading(false);
    }
  };

  // Email sign-up handler
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await signUpWithEmail(email, password);
      if (rememberMe) {
        localStorage.setItem('lifeos_remember_email', email);
      }
    } catch (err: any) {
      setError(err.message || 'Sign-up failed');
      setIsLoading(false);
    }
  };

  // Google sign-in handler
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await login();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-bg-primary relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>

      <div className="glass-card p-8 md:p-12 rounded-3xl flex flex-col items-center max-w-md w-full mx-4 border border-white/10 shadow-2xl relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6">
          <Infinity className="text-white" size={40} />
        </div>

        {mode === 'options' ? (
          <>
            {/* Welcome Screen */}
            <h1 className="text-3xl font-bold mb-2 tracking-tight text-center">Welcome to LifeOS</h1>
            <p className="text-gray-400 text-center mb-8 text-sm">
              Your personal operating system for mastering goals, habits, and finance
            </p>

            {error && (
              <div className="w-full bg-red-500/20 border border-red-500 rounded-lg p-3 flex items-start gap-2 mb-4">
                <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            {/* Google Sign-In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white text-black font-bold py-3 md:py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="w-full flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-600"></div>
              <span className="text-xs text-gray-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-600"></div>
            </div>

            {/* Email/Password Options */}
            <button
              onClick={() => { setMode('email-signin'); setError(null); }}
              className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/50 hover:border-indigo-500 text-white font-bold py-3 md:py-4 rounded-xl flex items-center justify-center gap-3 transition-all"
            >
              <Mail size={18} />
              <span>Sign In with Email</span>
            </button>

            <button
              onClick={() => { setMode('email-signup'); setError(null); }}
              className="w-full mt-3 bg-transparent border border-gray-500 hover:border-purple-500 text-gray-300 hover:text-white font-bold py-3 md:py-4 rounded-xl transition-all"
            >
              Create New Account
            </button>

            {/* Features */}
            <div className="w-full mt-8 pt-6 border-t border-gray-700 space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-400">Secure cloud sync across all devices</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-400">Real-time data updates with Firebase</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-400">Your data is encrypted and private</p>
              </div>
            </div>
          </>
        ) : mode === 'email-signin' ? (
          <>
            {/* Email Sign-In Form */}
            <h2 className="text-2xl font-bold mb-1 tracking-tight">Sign In</h2>
            <p className="text-gray-400 text-center mb-6 text-sm">Enter your credentials to continue</p>

            {error && (
              <div className="w-full bg-red-500/20 border border-red-500 rounded-lg p-3 flex items-start gap-2 mb-4">
                <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleEmailSignIn} className="w-full space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-bg-tertiary border border-gray-600 focus:border-indigo-500 outline-none text-white placeholder-gray-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-lg bg-bg-tertiary border border-gray-600 focus:border-indigo-500 outline-none text-white placeholder-gray-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-bg-tertiary border border-gray-600 accent-indigo-500 cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs text-gray-400 cursor-pointer">
                  Remember me for next time
                </label>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Back to Options */}
            <button
              onClick={() => { setMode('options'); setError(null); }}
              className="w-full mt-4 text-gray-400 hover:text-white text-sm font-medium transition-colors"
            >
              ← Back to Options
            </button>
          </>
        ) : (
          <>
            {/* Email Sign-Up Form */}
            <h2 className="text-2xl font-bold mb-1 tracking-tight">Create Account</h2>
            <p className="text-gray-400 text-center mb-6 text-sm">Join LifeOS and start organizing your life</p>

            {error && (
              <div className="w-full bg-red-500/20 border border-red-500 rounded-lg p-3 flex items-start gap-2 mb-4">
                <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleEmailSignUp} className="w-full space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-bg-tertiary border border-gray-600 focus:border-indigo-500 outline-none text-white placeholder-gray-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">Password (min 6 characters)</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-lg bg-bg-tertiary border border-gray-600 focus:border-indigo-500 outline-none text-white placeholder-gray-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-bg-tertiary border border-gray-600 accent-indigo-500 cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs text-gray-400 cursor-pointer">
                  Remember me for next time
                </label>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>

            {/* Back to Options */}
            <button
              onClick={() => { setMode('options'); setError(null); }}
              className="w-full mt-4 text-gray-400 hover:text-white text-sm font-medium transition-colors"
            >
              ← Back to Options
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;

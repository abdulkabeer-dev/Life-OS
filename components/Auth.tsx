import React, { useState, useEffect } from 'react';
import { useLifeOS } from '../context/LifeOSContext';
import { Infinity, LogIn, Mail, UserPlus, ArrowRight } from 'lucide-react';

const Auth: React.FC = () => {
    const { login, loginWithEmail, registerWithEmail } = useLifeOS();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                await loginWithEmail(email, password);
            } else {
                await registerWithEmail(email, password);
            }
        } catch (err: any) {
            setError(err.message || "Authentication failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center bg-bg-primary relative overflow-hidden text-white font-sans">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>

            <div className="glass-card p-12 rounded-3xl flex flex-col items-center max-w-md w-full mx-4 border border-white/10 shadow-2xl relative z-10 animate-fade-in bg-bg-secondary/50 backdrop-blur-md">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-8">
                    <Infinity className="text-white" size={48} />
                </div>

                <h1 className="text-3xl font-bold mb-2 tracking-tight">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                <p className="text-gray-400 text-center mb-8">
                    {isLogin ? 'Sign in to access your LifeOS' : 'Start your journey with LifeOS'}
                </p>

                {error && (
                    <div className="w-full bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="w-full space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full bg-bg-tertiary border border-border rounded-xl py-3 pl-10 pr-4 text-white focus:border-accent outline-none transition-colors"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔒</div>
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full bg-bg-tertiary border border-border rounded-xl py-3 pl-10 pr-4 text-white focus:border-accent outline-none transition-colors"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                    >
                        {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (isLogin ? 'Sign In' : 'Create Account')}
                        {!isLoading && <ArrowRight size={18} />}
                    </button>
                </form>

                <div className="w-full flex items-center gap-4 my-6">
                    <div className="h-px bg-border flex-1"></div>
                    <span className="text-gray-500 text-sm">Or continue with</span>
                    <div className="h-px bg-border flex-1"></div>
                </div>

                <button
                    onClick={login}
                    className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-all hover:scale-[1.02] active:scale-95"
                >
                    <LogIn size={20} />
                    <span>Google</span>
                </button>

                <p className="mt-8 text-center text-sm text-gray-400">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="ml-2 text-accent hover:underline font-medium"
                    >
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Auth;

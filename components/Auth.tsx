
import React from 'react';
import { useLifeOS } from '../context/LifeOSContext';
import { Infinity, LogIn, Smartphone } from 'lucide-react';

const Auth: React.FC = () => {
  const { login } = useLifeOS();

  return (
    <div className="h-screen w-full flex items-center justify-center bg-bg-primary relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>

        <div className="glass-card p-12 rounded-3xl flex flex-col items-center max-w-md w-full mx-4 border border-white/10 shadow-2xl relative z-10 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-8">
                <Infinity className="text-white" size={48} />
            </div>
            
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Welcome to LifeOS</h1>
            <p className="text-gray-400 text-center mb-8">
                Your personal operating system for mastering goals, habits, and finance across all your devices.
            </p>

            <button 
                onClick={login}
                className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-all hover:scale-[1.02] active:scale-95"
            >
                <LogIn size={20} />
                <span>Sign In with Google</span>
            </button>

            <div className="w-full mt-8 pt-8 border-t border-white/10 space-y-4">
                <div className="flex items-start gap-3">
                    <Smartphone className="text-indigo-400 mt-1 flex-shrink-0" size={18} />
                    <div>
                        <p className="text-sm font-semibold text-white">Access Anywhere</p>
                        <p className="text-xs text-gray-400">Use on mobile, tablet, or desktop</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs flex-shrink-0">✓</div>
                    <div>
                        <p className="text-sm font-semibold text-white">Secure Cloud Sync</p>
                        <p className="text-xs text-gray-400">Your data is encrypted and synced in real-time</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs flex-shrink-0">✓</div>
                    <div>
                        <p className="text-sm font-semibold text-white">Google Sign-In</p>
                        <p className="text-xs text-gray-400">One account for all your life tracking</p>
                    </div>
                </div>
            </div>

            <p className="text-xs text-gray-500 mt-8 text-center">
                By signing in, you agree to our terms and privacy policy. Your data is stored securely in Firebase.
            </p>
        </div>
    </div>
  );
};

export default Auth;

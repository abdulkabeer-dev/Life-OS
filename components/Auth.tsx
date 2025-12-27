
import React from 'react';
import { useLifeOS } from '../context/LifeOSContext';
import { Infinity, LogIn } from 'lucide-react';

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
                <span>Continue with Google</span>
            </button>

            <p className="text-xs text-gray-500 mt-8 text-center">
                By continuing, you agree to sync your data securely across devices using Firebase.
            </p>
        </div>
    </div>
  );
};

export default Auth;

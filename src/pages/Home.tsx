import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user, userData } = useAuth();

  return (
    <>
      {/* Brand Logo Area */}
      <div className="absolute top-48 left-10 md:left-20 z-40">
        <h2 
          className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-normal text-white select-none pointer-events-none drop-shadow-[0_8px_8px_rgba(0,0,0,0.6)]" 
          style={{ 
            fontFamily: "'Dancing Script', cursive",
            WebkitTextStroke: '4px #000',
            paintOrder: 'stroke fill',
            textShadow: '0 0 10px rgba(255,255,255,0.8)'
          }}
        >
          UniFlow
        </h2>
      </div>

      {/* Hero Content Area */}
      <main className="relative z-30 flex-1 flex flex-col items-center justify-end pb-24 px-6 text-center">
        <h1 
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-gray-900 dark:text-white mb-10 tracking-tight transition-colors" 
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Click. Notify. Simplify
        </h1>
        {user && (
          <Link
            to={userData?.role === 'faculty' ? '/faculty-dashboard' : '/student-dashboard'}
            className="mt-8 liquid-glass rounded-full px-8 py-4 text-gray-900 dark:text-white text-lg font-medium hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shadow-lg border border-gray-200 dark:border-white/10"
          >
            Go to Dashboard
          </Link>
        )}
      </main>
    </>
  );
}

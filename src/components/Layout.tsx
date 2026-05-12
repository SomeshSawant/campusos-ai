import React, { useEffect, useRef } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Layout() {
  const { user, userData, logout } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fadingOutRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const DURATION_FADE = 500;
    const END_OFFSET = 0.55;

    const runFade = (targetOpacity: number, duration: number, callback?: () => void) => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
      
      let startOpacity = parseFloat(video.style.opacity);
      if (isNaN(startOpacity)) startOpacity = 0;
      
      const startTime = performance.now();

      const animate = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        video.style.opacity = (startOpacity + (targetOpacity - startOpacity) * progress).toString();

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          animFrameRef.current = null;
          if (callback) callback();
        }
      };
      animFrameRef.current = requestAnimationFrame(animate);
    };

    const handleTimeUpdate = () => {
      if (!video.duration || isNaN(video.duration)) return;
      const timeRemaining = video.duration - video.currentTime;

      if (timeRemaining <= END_OFFSET && !fadingOutRef.current) {
        fadingOutRef.current = true;
        runFade(0, DURATION_FADE);
      }
    };

    const handleEnded = () => {
      video.style.opacity = '0';
      setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => {});
        fadingOutRef.current = false;
        runFade(1, DURATION_FADE);
      }, 100);
    };

    const handleLoadedData = () => {
      video.style.opacity = '0';
      fadingOutRef.current = false;
    };

    const handlePlaying = () => {
      if (video.currentTime < 0.2 && !fadingOutRef.current) {
        runFade(1, DURATION_FADE);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('playing', handlePlaying);

    video.style.opacity = '0';

    return () => {
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('playing', handlePlaying);
    };
  }, []);

  return (
    <div className="relative h-screen w-screen bg-white dark:bg-black overflow-hidden flex flex-col transition-colors duration-300">
      {/* Background Video (Only in Dark Mode) */}
      <div className="absolute inset-0 z-0 dark:block hidden">
        <video
          ref={videoRef}
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4"
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        />
        <div className="cinematic-overlay"></div>
      </div>

      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-50 w-full px-6 py-6 border-b border-gray-200 dark:border-white/5 bg-white/10 dark:bg-black/10 backdrop-blur-sm transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-8">
            <img src="/logo.png" alt="Parul University GOA" className="h-12 w-auto object-contain dark:invert-0 invert transition-all" />
          </Link>
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <div className="flex flex-col items-end pr-2">
                    <span className="text-gray-900 dark:text-white/80 text-sm font-medium transition-colors">
                      Welcome, {user.displayName || user.email?.split('@')[0]}
                    </span>
                    {userData?.role && (
                      <span className="text-[#E97262] text-xs font-semibold uppercase tracking-widest mt-0.5">
                        {userData.role}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={logout}
                    className="liquid-glass rounded-full px-6 py-2 text-gray-900 dark:text-white text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer text-center border border-gray-200 dark:border-white/10"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signup" className="text-gray-900 dark:text-white text-sm font-medium px-4 hover:opacity-80 transition-all">Sign Up</Link>
                  <Link to="/login" className="liquid-glass rounded-full px-6 py-2 text-gray-900 dark:text-white text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer text-center border border-gray-200 dark:border-white/10">Login</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative z-30 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}

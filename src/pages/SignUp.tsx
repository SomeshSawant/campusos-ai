import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import ThemeToggle from '../components/ThemeToggle';

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`
      });
      
      // Store user role and info in firestore
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          firstName,
          lastName,
          email,
          role,
          createdAt: new Date().toISOString()
        });
      } catch (firestoreErr: any) {
        console.warn("Firestore might be offline. Proceeding...", firestoreErr);
      }

      // Redirect or show success
      if (role === 'faculty') {
        navigate('/faculty-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already in use. Please log in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError('An error occurred during sign up: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      
      let userRole = role;
      try {
        // Check if user exists in firestore
        const userRef = doc(db, 'users', result.user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          const names = result.user.displayName?.split(' ') || ['', ''];
          await setDoc(userRef, {
            firstName: names[0] || '',
            lastName: names.slice(1).join(' ') || '',
            email: result.user.email,
            role,
            createdAt: new Date().toISOString()
          });
        } else {
          userRole = userSnap.data().role || 'student';
        }
      } catch (firestoreErr: any) {
        console.warn("Firestore might be offline. Proceeding...", firestoreErr);
      }

      if (userRole === 'faculty') {
        navigate('/faculty-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err: any) {
      // You can implement `handleFirestoreError` if it was from firestore, but this is auth
      setError('Google sign-in failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-black flex overflow-y-auto transition-colors duration-300">
      {/* Background Video */}
      <div className="dark:block hidden">
        <video
          className="fixed inset-0 z-0 w-full h-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_155101_f2540600-6fe9-433e-8e48-b3f4b72f0727.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        {/* Dark Overlay for Readability */}
        <div className="fixed inset-0 bg-black/50 z-0 pointer-events-none"></div>
      </div>
      
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <Link 
        to="/" 
        className="absolute top-6 left-6 z-20 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-colors text-sm font-medium bg-gray-100/50 dark:bg-black/20 px-4 py-2 rounded-full backdrop-blur-md border border-gray-200 dark:border-white/5"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 w-full h-full py-24">
        {/* Form Container */}
        <div className="w-full max-w-md mx-auto p-8 bg-white dark:bg-black/40 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl mt-8 transition-colors">
          <h2 
            className="text-4xl md:text-5xl text-gray-900 dark:text-white mb-3 tracking-tight transition-colors"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Create Account
          </h2>
          <p className="text-gray-500 dark:text-white/60 mb-8 text-sm transition-colors">
            Already have an account? <Link to="/login" className="text-[#E97262] hover:underline">Log in</Link>
          </p>

          <button 
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full bg-white dark:bg-white text-gray-800 font-medium rounded-xl px-4 py-3 mb-6 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed border border-gray-200 dark:border-none"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-gray-200 dark:bg-white/20 flex-1"></div>
            <span className="text-gray-400 dark:text-white/40 text-sm">Or</span>
            <div className="h-px bg-gray-200 dark:bg-white/20 flex-1"></div>
          </div>

          {error && (
            <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleEmailSignUp}>
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="First name" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-transparent border border-gray-200 dark:border-white/20 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:border-gray-400 dark:focus:border-white/50 transition-all text-sm"
              />
              <input 
                type="text" 
                placeholder="Last name" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-transparent border border-gray-200 dark:border-white/20 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:border-gray-400 dark:focus:border-white/50 transition-all text-sm"
              />
            </div>
            
            <input 
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-gray-200 dark:border-white/20 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:border-gray-400 dark:focus:border-white/50 transition-all text-sm"
            />

            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border border-gray-200 dark:border-white/20 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:border-gray-400 dark:focus:border-white/50 transition-all text-sm pr-12"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white/80 transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex gap-6 py-2">
              <label className="flex items-center gap-2 text-gray-700 dark:text-white/80 text-sm cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors">
                <input 
                  type="radio" 
                  name="role" 
                  value="student" 
                  checked={role === 'student'} 
                  onChange={() => setRole('student')}
                  className="w-4 h-4 accent-[#E97262] bg-gray-100 dark:bg-white/10 border-gray-200 dark:border-white/20 cursor-pointer"
                />
                Student
              </label>
              <label className="flex items-center gap-2 text-gray-700 dark:text-white/80 text-sm cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors">
                <input 
                  type="radio" 
                  name="role" 
                  value="faculty" 
                  checked={role === 'faculty'} 
                  onChange={() => setRole('faculty')}
                  className="w-4 h-4 accent-[#E97262] bg-gray-100 dark:bg-white/10 border-gray-200 dark:border-white/20 cursor-pointer"
                />
                Faculty
              </label>
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-[#E97262] text-white font-medium rounded-xl px-4 py-3 hover:bg-[#E97262]/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <div className="pt-4">
              <p className="text-xs text-gray-500 dark:text-white/50 leading-relaxed text-center">
                By creating an account, I agree with Anima's <br/>
                <Link to="#" className="text-[#E97262] hover:underline">Privacy Policy</Link> and <Link to="#" className="text-[#E97262] hover:underline">Terms of Service</Link>.
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

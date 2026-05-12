import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CalendarDays, 
  BookOpen, 
  History, 
  LogOut, 
  Home,
  CheckCircle2,
  Building2,
  ChevronRight,
  Search,
  Sparkles,
  Zap,
  BellRing,
  Layers,
  Activity,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { doc, updateDoc, collection, query, where, orderBy, getDocs, limit, deleteField, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ThemeToggle from '../components/ThemeToggle';
import { motion, AnimatePresence } from 'motion/react';

import WeeklyTimetable from '../components/WeeklyTimetable';

type Tab = 'feed' | 'timetable' | 'classes' | 'history';

const DEPARTMENT_PROGRAMS: Record<string, string[]> = {
  'Computer Science': ['MCA', 'BCA', 'BTech CSE 1', 'BTech CSE 2'],
  'Management': ['MBA', 'BBA'],
  'Pharmacy': [], 
  'Physiotherapy': ['BPT - A', 'BPT - B'],
  'Nursing': ['GNM', 'B.Sc. Nursing'],
  'Applied Health Science': ['MLT', 'B.AOTT', 'Microbiology', 'Biotechnology']
};

export default function StudentDashboard() {
  const { user, userData, loading: authLoading, logout, refreshUserData } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [isUpdatingDept, setIsUpdatingDept] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // If auth is done loading but userData is still null, try one more time
    // This handles the race condition after sign up
    const initialize = async () => {
      if (!authLoading) {
        if (user && !userData) {
          await refreshUserData();
        }
        setIsInitialLoading(false);
      }
    };
    initialize();
  }, [authLoading, user, userData, refreshUserData]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSelectDepartment = async (dept: string) => {
    const programs = DEPARTMENT_PROGRAMS[dept];
    if (programs && programs.length > 0) {
      setSelectedDept(dept);
    } else {
      // Pharmacy or others with no sub-programs
      await saveSelection(dept);
    }
  };

  const handleSelectProgram = async (program: string) => {
    if (!selectedDept) return;
    await saveSelection(selectedDept, program);
  };

  const saveSelection = async (dept: string, program?: string) => {
    if (!user) return;
    setIsUpdatingDept(true);
    try {
      const updateData: any = { department: dept };
      if (program) {
        updateData.program = program;
      } else {
        updateData.program = deleteField();
      }
      
      await updateDoc(doc(db, 'users', user.uid), updateData);
      await refreshUserData();
    } catch (error) {
      console.error("Failed to update selection", error);
    } finally {
      setIsUpdatingDept(false);
    }
  };

  const fetchNotifications = async () => {
    if (!userData || !userData.department) return;
    try {
      const targetFilters = [userData.department, 'All Departments'];
      if (userData.program) {
        targetFilters.push(userData.program);
      }

      const q = query(
        collection(db, 'notifications'), 
        where('department', 'in', targetFilters),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(notifs);

      // Record views for notifications seen in this session
      notifs.forEach(async (notif: any) => {
        const viewedKey = `v_${notif.id}`;
        if (!sessionStorage.getItem(viewedKey)) {
          try {
            await updateDoc(doc(db, 'notifications', notif.id), {
              views: increment(1)
            });
            sessionStorage.setItem(viewedKey, 'true');
          } catch (e) {
            console.error("View count error", e);
          }
        }
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (activeTab === 'feed' || activeTab === 'history') {
      fetchNotifications();
    }
  }, [activeTab, userData?.department]);

  const navItems = [
    { id: 'feed', label: 'Broadcasts', icon: Bell, color: 'text-indigo-500' },
    { id: 'timetable', label: 'Schedule', icon: CalendarDays, color: 'text-rose-500' },
    { id: 'classes', label: 'Timeline', icon: BookOpen, color: 'text-amber-500' },
    { id: 'history', label: 'Archives', icon: History, color: 'text-slate-500' },
  ];

  if (authLoading || isInitialLoading) {
    return (
      <div className="h-screen w-full bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#4f46e5]/20 border-t-[#4f46e5] rounded-full animate-spin"></div>
          <p className="text-white/40 text-sm animate-pulse">Loading your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white overflow-hidden font-sans transition-colors duration-300">
      {/* Department Selection Popup */}
      {userData && userData.role === 'student' && !userData.department && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-3xl p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-black border border-slate-200 dark:border-neutral-900 rounded-[3rem] p-10 max-w-lg w-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden my-auto"
          >
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-600/5 blur-[80px] rounded-full pointer-events-none -translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/40 rotate-3">
                <Building2 size={36} className="text-white fill-current/20" />
              </div>

              <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic mb-4 leading-none">
                {!selectedDept ? 'Initialize Access' : `${selectedDept} SEGMENT`}
              </h2>
              
              <p className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-[0.2em] mb-10 max-w-[280px]">
                {!selectedDept 
                  ? 'Select your operational sector to sync academy broadcasts.'
                  : 'Specify your academic branch for precise data streaming.'}
              </p>

              <div className="w-full space-y-3">
                {!selectedDept ? (
                  Object.keys(DEPARTMENT_PROGRAMS).map((dept, i) => (
                    <motion.button
                      key={dept}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isUpdatingDept}
                      onClick={() => handleSelectDepartment(dept)}
                      className="w-full group flex items-center justify-between px-6 py-5 rounded-2xl bg-slate-50 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-800 hover:border-indigo-600 hover:bg-white dark:hover:bg-neutral-800 transition-all duration-300 disabled:opacity-50"
                    >
                      <span className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-neutral-300 group-hover:text-indigo-600 transition-colors uppercase italic">{dept}</span>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    </motion.button>
                  ))
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-3">
                      {DEPARTMENT_PROGRAMS[selectedDept].map((program, i) => (
                        <motion.button
                          key={program}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={isUpdatingDept}
                          onClick={() => handleSelectProgram(program)}
                          className="w-full text-center px-6 py-5 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all italic"
                        >
                          {program}
                        </motion.button>
                      ))}
                    </div>
                    <button
                      onClick={() => setSelectedDept(null)}
                      className="w-full text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-neutral-700 mt-8 hover:text-indigo-600 transition-colors"
                    >
                      / Reset Sector Selection
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Left Sidebar */}
      <aside className="w-20 lg:w-72 bg-white dark:bg-black border-r border-slate-200 dark:border-neutral-900 flex flex-col pt-10 pb-8 transition-all duration-500 relative z-50">
        <div className="px-6 mb-12 flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 shrink-0 transform group-hover:rotate-6 transition-transform duration-500">
            <BookOpen size={24} className="text-white fill-current/20" />
          </div>
          <div className="hidden lg:block overflow-hidden">
            <h1 className="text-lg font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">Quantum Portal</h1>
            <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.25em] mt-1 whitespace-nowrap">
              {userData?.program ? (
                <>
                  {userData.program} / {userData.department}
                </>
              ) : 'Student Authority'}
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-500 group relative ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-500/20' 
                    : 'text-slate-500 dark:text-neutral-500 hover:text-slate-900 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-white/[0.03]'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : `group-hover:${item.color} transition-colors`} />
                <span className="hidden lg:block text-sm font-bold tracking-tight">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activePillStudent"
                    className="absolute -right-4 w-1 h-6 bg-indigo-600 rounded-l-full hidden lg:block"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        <div className="px-4 mt-auto space-y-3">
          <ThemeToggle />
          <Link
            to="/"
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 text-sm font-bold text-slate-400 dark:text-neutral-500 hover:text-slate-900 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-white/[0.03]"
          >
            <Home size={18} />
            <span className="hidden lg:block">Home</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 text-sm font-bold text-slate-400 dark:text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
          >
            <LogOut size={18} />
            <span className="hidden lg:block">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Experience */}
      <main className="flex-1 overflow-hidden relative">
        {/* Animated Background Atmosphere */}
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/5 dark:bg-indigo-500/[0.05] blur-[150px] rounded-full pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-500/5 dark:bg-rose-500/[0.03] blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 h-full flex flex-col px-6 lg:px-12 py-10">
          
          {/* Header Bar */}
          <header className="flex justify-between items-center mb-12 shrink-0">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-6"
            >
              <div>
                <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
                  {navItems.find(i => i.id === activeTab)?.label}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-neutral-500">Neural Link Active / Secure Session</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 bg-white dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-800 p-1.5 rounded-2xl shadow-xl shadow-black/5"
            >
              <div className="px-4 py-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                  {user?.displayName?.charAt(0) || 'S'}
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{user?.displayName || 'Student User'}</p>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-neutral-600 uppercase tracking-widest leading-none">Rank: High Priority</p>
                </div>
              </div>
            </motion.div>
          </header>

          {/* Dynamic Stage */}
          <div className="flex-1 min-h-0 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "circOut" }}
                className="h-full flex flex-col"
              >
                {activeTab === 'feed' && (
                  <div className="flex flex-col h-full bg-white dark:bg-neutral-900/40 border border-slate-200 dark:border-neutral-800 rounded-[2.5rem] p-8 shadow-2xl">
                    <div className="flex items-center justify-between shrink-0 mb-8">
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-neutral-500 flex items-center gap-3">
                        <Sparkles size={14} className="text-indigo-600" /> Pulse Broadcasts
                      </h3>
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[9px] font-black text-green-500 uppercase tracking-widest leading-none">Signal Live</span>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar pb-10">
                      {notifications.length > 0 ? notifications.slice(0, 10).map((notif: any, i: number) => (
                        <motion.div 
                          key={notif.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="group p-6 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-neutral-800 rounded-3xl hover:border-indigo-600/50 hover:bg-white dark:hover:bg-neutral-800/80 transition-all duration-500 relative overflow-hidden"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]"></div>
                          <div className="flex items-start gap-6">
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase italic group-hover:text-indigo-600 transition-colors leading-none truncate pr-4">{notif.title}</h4>
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest whitespace-nowrap pt-1">New Sync</span>
                              </div>
                              <p className="text-sm font-medium text-slate-500 dark:text-neutral-400 mb-6 whitespace-pre-line leading-relaxed">{notif.content}</p>
                              <div className="flex items-center gap-3">
                                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-indigo-600/10 text-indigo-600 rounded-lg">{notif.category}</span>
                                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-slate-200 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 rounded-lg">{notif.department}</span>
                                <div className="ml-auto text-[9px] font-black text-slate-300 dark:text-neutral-700 uppercase tracking-widest pt-1">
                                  {notif.createdAt ? new Date(notif.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'NOW'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-20">
                          <BellRing size={64} className="mb-4" />
                          <p className="text-xs font-black uppercase tracking-widest">No Signals Detected</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'timetable' && (
                  <div className="flex flex-col h-full bg-white dark:bg-neutral-900/40 border border-slate-200 dark:border-neutral-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
                    <div className="flex justify-between items-center mb-8 shrink-0">
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-neutral-500 flex items-center gap-3">
                        <CalendarDays className="text-rose-500" size={14} /> Matrix Map
                      </h3>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] bg-rose-500/10 px-4 py-1.5 rounded-full border border-rose-500/10 italic">Semester II - 2026</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-auto custom-scrollbar rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-neutral-800 p-6 shadow-inner">
                       {userData?.program === 'MCA' ? (
                         <div className="min-w-[900px]">
                           <WeeklyTimetable />
                         </div>
                       ) : (
                         <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-40">
                           <CalendarDays size={48} className="text-slate-300 mb-4" />
                           <h4 className="text-xs font-black uppercase tracking-widest mb-2">Subject Mapping Unavailable</h4>
                           <p className="text-[10px] font-bold text-slate-400 max-w-xs transition-colors uppercase tracking-tight">
                             Personalized grids currently restricted to MCA segments. Contact System Admin.
                           </p>
                         </div>
                       )}
                    </div>
                  </div>
                )}                {activeTab === 'classes' && (
                  <div className="flex flex-col h-full bg-white dark:bg-neutral-900/40 border border-slate-200 dark:border-neutral-800 rounded-[2.5rem] p-8 shadow-2xl">
                    <div className="flex items-center justify-between shrink-0 mb-10">
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-neutral-500 flex items-center gap-3">
                        <Activity className="text-amber-500" size={14} /> Chrono Stream
                      </h3>
                      <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-wider">Active Stream</span>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar pb-10">
                      {(() => {
                        const classes = [
                          { title: 'Data Communication & Networking', type: 'Lecture', code: 'DCN', time: '09:30 AM - 10:30 AM', room: 'Room 104', startTime: '09:30', endTime: '10:30' },
                          { title: 'Advanced Java', type: 'Lecture', code: 'AJ', time: '10:30 AM - 11:30 AM', room: 'Room 104', startTime: '10:30', endTime: '11:30' },
                          { title: 'Advanced Java Lab', type: 'Lab', code: 'AJ LAB', time: '09:30 AM - 11:30 AM', room: 'Room 103', startTime: '09:30', endTime: '11:30' },
                          { title: 'Skills Training', type: 'Training', code: 'TRAINING', time: '11:45 AM - 01:45 PM', room: 'Room 102', startTime: '11:45', endTime: '13:45' },
                          { title: 'Artificial Intelligence', type: 'Lecture', code: 'AI-1', time: '02:30 PM - 03:30 PM', room: 'Room 103', startTime: '14:30', endTime: '15:30' },
                          { title: 'Computer Graphics', type: 'Lecture', code: 'CG', time: '03:30 PM - 04:30 PM', room: 'Room 104', startTime: '15:30', endTime: '16:30' },
                        ];

                        const getStatus = (start: string, end: string) => {
                          const now = new Date();
                          const currentHours = now.getHours();
                          const currentMinutes = now.getMinutes();
                          const currentTimeInMinutes = currentHours * 60 + currentMinutes;

                          const [sH, sM] = start.split(':').map(Number);
                          const [eH, eM] = end.split(':').map(Number);
                          const startTimeInMinutes = sH * 60 + sM;
                          const endTimeInMinutes = eH * 60 + eM;

                          if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes) return 'current';
                          if (currentTimeInMinutes < startTimeInMinutes) return 'upcoming';
                          return 'past';
                        };

                        const sortedClasses = [...classes].sort((a, b) => {
                          const statusA = getStatus(a.startTime, a.endTime);
                          const statusB = getStatus(b.startTime, b.endTime);
                          const priority = { current: 0, upcoming: 1, past: 2 };
                          return priority[statusA] - priority[statusB];
                        });

                        return sortedClasses.map((cls, i) => {
                          const status = getStatus(cls.startTime, cls.endTime);
                          const isCurrent = status === 'current';
                          const isPast = status === 'past';

                          return (
                            <motion.div 
                              key={i} 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className={`relative group transition-all duration-700 rounded-[2rem] border ${
                                isCurrent 
                                  ? 'bg-white dark:bg-black border-indigo-600 shadow-2xl shadow-indigo-500/20 p-8' 
                                  : isPast
                                  ? 'bg-slate-50 dark:bg-neutral-900/20 border-transparent opacity-30 p-5'
                                  : 'bg-slate-50 dark:bg-neutral-900/40 border-slate-200 dark:border-neutral-800 p-6'
                              }`}
                            >
                              <div className="flex items-center gap-8">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-700 ${
                                  isCurrent 
                                    ? 'bg-indigo-600 text-white rotate-6 shadow-xl shadow-indigo-500/40 scale-110' 
                                    : 'bg-slate-200 dark:bg-neutral-800 text-slate-400'
                                }`}>
                                  {isCurrent ? (
                                    <div className="relative">
                                      <BookOpen size={28} />
                                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></div>
                                    </div>
                                  ) : isPast ? (
                                    <CheckCircle2 size={28} />
                                  ) : (
                                    <Zap size={22} className="fill-current" />
                                  )}
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-4 mb-2">
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isCurrent ? 'text-indigo-600' : 'text-slate-400'}`}>
                                      {cls.time}
                                    </span>
                                    {isCurrent && (
                                      <span className="bg-rose-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase italic tracking-[0.2em]">Live Session</span>
                                    )}
                                  </div>

                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                      <h4 className={`text-xl font-black tracking-tight uppercase italic leading-none group-hover:text-indigo-600 transition-colors ${isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-neutral-500'}`}>
                                        {cls.title}
                                      </h4>
                                      <div className="flex items-center gap-4 mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        <span>{cls.code}</span>
                                        {cls.room && (
                                          <div className="flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                            <span>{cls.room}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border transition-colors ${
                                      isCurrent 
                                        ? 'bg-indigo-600/5 text-indigo-600 border-indigo-600/20' 
                                        : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-neutral-700 border-transparent'
                                    }`}>
                                      {cls.type === 'Lecture' ? 'Theory Protocol' : 'Practical Array'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
                {activeTab === 'history' && (
                  <div className="flex flex-col h-full bg-white dark:bg-neutral-900/40 border border-slate-200 dark:border-neutral-800 rounded-[2.5rem] p-8 shadow-2xl">
                    <div className="flex items-center justify-between shrink-0 mb-8">
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-neutral-500 flex items-center gap-3">
                        <History size={14} className="text-slate-400" /> Archives
                      </h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar pb-10">
                      {notifications.length > 5 ? notifications.slice(5).map((notif: any, i: number) => (
                        <motion.div 
                          key={`history-${notif.id}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.6 }}
                          whileHover={{ opacity: 1, scale: 0.995 }}
                          className="bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-neutral-900 rounded-2xl p-5 flex gap-6"
                        >
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-neutral-800 shadow-sm">
                            <Bell size={16} className="text-slate-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="text-sm font-black uppercase tracking-tight text-slate-800 dark:text-neutral-400">{notif.title}</h4>
                              <span className="text-[9px] font-black text-slate-300 dark:text-neutral-700 uppercase tracking-widest pt-1">
                                {notif.createdAt ? new Date(notif.createdAt.toDate()).toLocaleDateString() : 'SYNCED'}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-slate-500 dark:text-neutral-600 line-clamp-1">
                              {notif.content}
                            </p>
                          </div>
                        </motion.div>
                      )) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-200 opacity-20">
                          <History size={48} className="mb-4" />
                          <p className="text-xs font-black uppercase tracking-widest">No Archival Data</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Glass Accent Overlays */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-600/40 to-transparent pointer-events-none z-50"></div>
    </div>
  );
}

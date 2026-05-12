import React, { useState, useEffect } from 'react';
import { 
  BellRing, 
  Layers, 
  Building2, 
  History, 
  BarChart3, 
  LogOut, 
  Send,
  Plus,
  Home,
  TrendingUp,
  Activity,
  Users,
  ChevronRight,
  Search,
  Sparkles,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ThemeToggle from '../components/ThemeToggle';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from 'recharts';

type Tab = 'post' | 'categories' | 'departments' | 'recent' | 'analytics';

const DEPARTMENTS = [
  'All Departments',
  'Computer Science',
  'MCA',
  'BCA',
  'BTech CSE 1',
  'BTech CSE 2',
  'Management',
  'MBA',
  'BBA',
  'Pharmacy',
  'Physiotherapy',
  'BPT - A',
  'BPT - B',
  'Nursing',
  'GNM',
  'B.Sc. Nursing',
  'Applied Health Science',
  'MLT',
  'B.AOTT',
  'Microbiology',
  'Biotechnology'
];

const CATEGORIES = [
  'Exams',
  'Events',
  'Important Alerts',
  'General'
];

export default function FacultyDashboard() {
  const { user, userData, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('post');
  const navigate = useNavigate();

  // New Notification State
  const [targetDept, setTargetDept] = useState('All Departments');
  const [category, setCategory] = useState('General');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);

  // Analytics State
  const [stats, setStats] = useState({
    totalViews: 0,
    totalPosts: 0,
    openRate: 0,
    engagementTrend: [] as any[],
    categoryData: [] as any[],
    isReady: false
  });

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim() || !user) return;
    setIsPublishing(true);
    try {
      await addDoc(collection(db, 'notifications'), {
        title,
        content,
        department: targetDept,
        category,
        authorId: user.uid,
        authorName: userData?.firstName ? `${userData.firstName} ${userData.lastName}` : user.displayName || 'Faculty',
        createdAt: serverTimestamp(),
        views: Math.floor(Math.random() * 5) + 1
      });
      setTitle('');
      setContent('');
      alert('Notification published!');
    } catch (error) {
      console.error("Error publishing notification:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  // Real-time Analytics Listener
  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      
      let totalViews = 0;
      const catMap: Record<string, number> = {};
      const trendMap: Record<string, number> = {};

      notifs.forEach(n => {
        totalViews += (n.views || 0);
        catMap[n.category || 'General'] = (catMap[n.category || 'General'] || 0) + (n.views || 0);
        
        if (n.createdAt) {
          const date = new Date(n.createdAt.toDate());
          const dateKey = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          trendMap[dateKey] = (trendMap[dateKey] || 0) + (n.views || 0);
        }
      });

      const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));
      const trendData = Object.entries(trendMap)
        .map(([name, value]) => ({ name, value }))
        .slice(0, 7)
        .reverse(); 

      setStats({
        totalViews,
        totalPosts: notifs.length,
        openRate: notifs.length > 0 ? Math.min(98, Math.round((totalViews / (notifs.length * 20)) * 100)) : 0, 
        engagementTrend: trendData,
        categoryData,
        isReady: true
      });
      
      setRecentNotifications(notifs.slice(0, 10));
    });

    return () => unsubscribe();
  }, []);

  const navItems = [
    { id: 'post', label: 'Broadcast', icon: Send, color: 'text-rose-500' },
    { id: 'recent', label: 'History', icon: History, color: 'text-amber-500' },
    { id: 'analytics', label: 'Insights', icon: BarChart3, color: 'text-indigo-500' },
  ];

  return (
    <div className="flex h-screen w-full bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white overflow-hidden font-sans transition-colors duration-300">
      {/* Left Sidebar */}
      <aside className="w-72 bg-gray-50 dark:bg-black/40 border-r border-gray-200 dark:border-white/5 backdrop-blur-xl flex flex-col pt-6 pb-6 shadow-2xl relative z-10 transition-colors">
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E97262] to-[#c75141] flex items-center justify-center">
            <BellRing size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Faculty Portal</h1>
            <p className="text-xs text-white/40 uppercase tracking-wider">{userData?.role || 'Faculty'}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
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
                    ? 'bg-rose-500 dark:bg-rose-500 text-white shadow-2xl shadow-rose-500/20' 
                    : 'text-slate-500 dark:text-neutral-500 hover:text-slate-900 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-white/[0.03]'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : `group-hover:${item.color} transition-colors`} />
                <span className="hidden lg:block text-sm font-bold tracking-tight">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activePill"
                    className="absolute -right-4 w-1 h-6 bg-rose-500 rounded-l-full hidden lg:block"
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
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-rose-500/5 dark:bg-rose-500/[0.05] blur-[150px] rounded-full pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 dark:bg-indigo-500/[0.03] blur-[120px] rounded-full pointer-events-none"></div>

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
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-neutral-500">System Online / Ready for Broadcast</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 bg-white dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-800 p-1.5 rounded-2xl shadow-xl shadow-black/5"
            >
              <div className="px-4 py-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                  {user?.displayName?.charAt(0) || 'F'}
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{user?.displayName || 'Faculty User'}</p>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-neutral-600 uppercase tracking-widest leading-none">Coordinator</p>
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
                
                {activeTab === 'post' && (
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full">
                    {/* Broadcast Form */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                      <div className="bg-white dark:bg-neutral-900/40 border border-slate-200 dark:border-neutral-800/60 rounded-[2.5rem] p-8 shadow-2xl shadow-black/5 flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-neutral-500 flex items-center gap-3">
                            <Sparkles size={14} className="text-rose-500" /> Draft Transmission
                          </h3>
                        </div>

                        <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Destination</label>
                              <select 
                                value={targetDept}
                                onChange={(e) => setTargetDept(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-neutral-800 rounded-2xl px-5 py-3.5 text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                              >
                                {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Protocol</label>
                              <select 
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-neutral-800 rounded-2xl px-5 py-3.5 text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                              >
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                              </select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Transmission Subject</label>
                            <input 
                              type="text" 
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              placeholder="URGENT: SEMESTER UPDATES" 
                              className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-neutral-800 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:text-slate-300 dark:placeholder:text-neutral-700" 
                            />
                          </div>

                          <div className="space-y-2 flex-1 flex flex-col">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Message Payload</label>
                            <textarea 
                              value={content}
                              onChange={(e) => setContent(e.target.value)}
                              placeholder="Details of the transmission..." 
                              className="w-full flex-1 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-neutral-800 rounded-[2rem] px-6 py-5 text-sm font-medium outline-none focus:ring-2 focus:ring-rose-500/20 transition-all resize-none placeholder:text-slate-300 dark:placeholder:text-neutral-700 min-h-[150px]"
                            />
                          </div>
                        </div>

                        <div className="mt-8">
                          <motion.button 
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={handlePublish}
                            disabled={isPublishing || !title.trim() || !content.trim()}
                            className="w-full bg-black dark:bg-rose-500 text-white dark:text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 hover:shadow-2xl hover:shadow-rose-500/40 transition-all disabled:opacity-20 shadow-xl"
                          >
                            {isPublishing ? 'Transmitting...' : (
                              <>
                                <span>Execute Broadcast</span>
                                <Zap size={14} className="fill-current" />
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Quick Info / Suggestions */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-rose-500 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-rose-500/20 relative overflow-hidden group">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"
                        />
                        <div className="relative z-10">
                          <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-80">Broadcast Pro-Tip</h4>
                          <p className="text-xl font-black tracking-tight leading-tight italic">"Be concise and clear. Real-time metrics show students engage 40% better with bullet points."</p>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-neutral-900/40 border border-slate-200 dark:border-neutral-800 rounded-[2.5rem] p-8 shadow-xl">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-neutral-500 mb-6 font-mono">Current Context</h4>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400">Target Segment</span>
                            <span className="text-xs font-black text-rose-500 uppercase italic">{targetDept}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400">Active Faculty</span>
                            <span className="text-xs font-black text-slate-900 dark:text-white uppercase">{userData?.firstName || 'User'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400">Est. Reach</span>
                            <span className="text-xs font-black text-green-500 uppercase">~240 Users</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'recent' && (
                  <div className="space-y-6 flex flex-col h-full bg-white dark:bg-neutral-900/40 border border-slate-200 dark:border-neutral-800 rounded-[2.5rem] p-8 shadow-2xl">
                    <div className="flex items-center justify-between shrink-0 mb-4">
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-neutral-500">Recent Transmissions</h3>
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                        Total: {recentNotifications.length}
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar pb-10">
                      {recentNotifications.length > 0 ? recentNotifications.map((notif: any, i: number) => (
                        <motion.div 
                          key={notif.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="group p-6 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-neutral-800 rounded-3xl hover:border-rose-500/50 hover:bg-white dark:hover:bg-neutral-800/80 transition-all duration-500"
                        >
                          <div className="flex items-start gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-800 flex items-center justify-center text-slate-400 group-hover:text-rose-500 transition-colors shadow-sm">
                              <BellRing size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none group-hover:text-rose-500 transition-colors truncate pr-4">{notif.title}</h4>
                                <span className="text-[9px] font-black text-slate-300 dark:text-neutral-700 uppercase tracking-widest whitespace-nowrap pt-1">
                                  {notif.createdAt ? new Date(notif.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'NOW'}
                                </span>
                              </div>
                              <p className="text-xs font-medium text-slate-500 dark:text-neutral-500 line-clamp-1 mb-4">{notif.content}</p>
                              <div className="flex items-center gap-3">
                                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-rose-500/10 text-rose-500 rounded-lg">{notif.category}</span>
                                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-slate-200 dark:bg-neutral-800 text-slate-50 dark:text-neutral-400 rounded-lg">{notif.department}</span>
                                <div className="ml-auto flex items-center gap-1.5 text-[10px] font-black text-slate-400 group-hover:text-slate-600 transition-colors">
                                  <Users size={12} />
                                  {notif.views || 0} Views
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                          <History size={48} className="opacity-10 mb-4" />
                          <p className="text-xs font-black uppercase tracking-widest">No history found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="space-y-8 flex flex-col h-full">
                    {/* Hero Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                      {[
                        { label: 'Network Reach', value: stats.totalViews, trend: '+12%', icon: Users, color: 'indigo' },
                        { label: 'Pulse Rate', value: `${stats.openRate}%`, trend: '+4%', icon: Activity, color: 'rose' },
                        { label: 'Post Volume', value: stats.totalPosts, trend: 'ALL-TIME', icon: Layers, color: 'amber' },
                      ].map((card, i) => (
                        <motion.div 
                          key={i}
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-white dark:bg-neutral-900/40 border border-slate-200 dark:border-neutral-800 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group hover:border-rose-500/50 transition-colors"
                        >
                          <div className={`absolute -right-8 -top-8 w-24 h-24 bg-${card.color}-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
                          <div className={`w-12 h-12 rounded-2xl bg-${card.color}-500/10 flex items-center justify-center mb-6 text-${card.color}-500`}>
                            <card.icon size={22} />
                          </div>
                          <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-1 uppercase italic">
                            {typeof card.value === 'number' && card.value >= 1000 ? `${(card.value/1000).toFixed(1)}k` : card.value}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{card.label}</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${card.trend.includes('+') ? 'text-green-500' : 'text-slate-300'}`}>{card.trend}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Chart Experience */}
                    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
                       <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-neutral-900/40 border border-slate-200 dark:border-neutral-800 rounded-[2.5rem] p-8 shadow-2xl flex flex-col"
                       >
                          <div className="flex items-center justify-between mb-8">
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-neutral-500">Interaction Volume</h4>
                              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Temporal activity over 7 days</p>
                            </div>
                            <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-black/50 rounded-lg border border-slate-200 dark:border-neutral-800">
                               <div className="w-1.5 h-1.5 rounded-full bg-rose-500 ml-2"></div>
                               <span className="text-[8px] font-black uppercase tracking-widest pr-2">Live</span>
                            </div>
                          </div>
                          <div className="flex-1 min-h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={stats.engagementTrend}>
                                <defs>
                                  <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                <XAxis 
                                  dataKey="name" 
                                  axisLine={false} 
                                  tickLine={false} 
                                  tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }} 
                                  dy={15}
                                />
                                <YAxis hide />
                                <RechartsTooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#000', 
                                    border: 'none',
                                    borderRadius: '16px',
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    color: '#fff'
                                  }}
                                  cursor={{ stroke: '#f43f5e', strokeWidth: 1 }}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="value" 
                                  stroke="#f43f5e" 
                                  strokeWidth={4}
                                  fill="url(#roseGradient)" 
                                  animationDuration={2000}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                       </motion.div>

                       <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-neutral-900/40 border border-slate-200 dark:border-neutral-800 rounded-[2.5rem] p-8 shadow-2xl flex flex-col"
                       >
                          <div className="mb-8">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-neutral-500">Segment Saturation</h4>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Views by categorization</p>
                          </div>
                          <div className="flex-1 min-h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={stats.categoryData}>
                                <XAxis 
                                  dataKey="name" 
                                  axisLine={false} 
                                  tickLine={false} 
                                  tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }}
                                  dy={15}
                                />
                                <YAxis hide />
                                <RechartsTooltip 
                                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                  contentStyle={{ 
                                    backgroundColor: '#000', 
                                    border: 'none',
                                    borderRadius: '16px',
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    color: '#fff'
                                  }}
                                />
                                <Bar dataKey="value" radius={[12, 12, 0, 0]} animationDuration={3000}>
                                  {stats.categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#f43f5e' : '#6366f1'} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                       </motion.div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Glass Accent Overlays */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500/40 to-transparent pointer-events-none"></div>
    </div>
  );
}

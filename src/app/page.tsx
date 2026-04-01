'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Trophy, Loader2, Brain, Users, Star, CheckCircle2, Target, ShoppingBag, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';
import { motion } from 'framer-motion';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function LandingPage() {
  const router = useRouter();
  const { setUser } = useUserStore();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const hasSetUser = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const currentUser = useUserStore.getState().user;
        if (!currentUser || currentUser.id !== session.user.id) {
          setUser(session.user as never);
        }
        hasSetUser.current = true;
        router.push('/dashboard');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const currentUser = useUserStore.getState().user;
        if (!currentUser || currentUser.id !== session.user.id) {
          setUser(session.user as never);
        }
        hasSetUser.current = true;
        router.push('/dashboard');
      } else {
        setUser(null);
        hasSetUser.current = false;
      }
    });

    return () => subscription.unsubscribe();
  }, [router, setUser]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              gamer_tag: name,
            }
          }
        });
        if (error) throw error;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500 overflow-x-hidden relative font-sans">
      
      <LandingHeader />

      {/* Sunset Ember Ambient Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#FF4500]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[800px] h-[800px] bg-[#FFA500]/5 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[1000px] h-[500px] bg-[#FF6B00]/5 rounded-full blur-[200px] pointer-events-none" />

      {/* HERO SECTION */}
      <div id="hero" className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-12 md:pb-20 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10 min-h-[90vh]">
        
        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 text-xs font-bold text-orange-400"
          >
            <Activity className="h-4 w-4" />
            <span className="tracking-wide">LEVEL UP YOUR LIFE.</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl lg:text-[5rem] font-light tracking-tighter leading-[1.05] drop-shadow-2xl">
            PLAN, <br className="hidden lg:block"/> MANAGE & <br />
            <span className="font-black bg-gradient-to-r from-[#FF4500] to-[#FFA500] bg-clip-text text-transparent flex items-center font-bold">
              TRACK <Target className="w-12 h-12 mx-3 text-orange-500" /> TASK
            </span>
          </h1>
          
          <p className="text-xl text-zinc-400 font-medium leading-relaxed max-w-lg">
            Stop using boring corporate apps. Earn massive XP, complete AI-generated side quests, flex your heatmaps, and battle procrastination with friends. 🎮
          </p>

          <div className="flex items-center gap-6 pt-4 opacity-80">
            <div className="flex -space-x-4">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" className="h-12 w-12 rounded-full border-2 border-black object-cover" alt="User" />
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" className="h-12 w-12 rounded-full border-2 border-black object-cover" alt="User" />
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" className="h-12 w-12 rounded-full border-2 border-black object-cover" alt="User" />
              <div className="h-12 w-12 rounded-full border-2 border-black bg-[#FF00FF] flex items-center justify-center text-xs font-black text-black">+10k</div>
            </div>
            <div className="text-sm font-medium text-zinc-400">Join the arena before it&apos;s mainstream.</div>
          </div>
        </motion.div>

        {/* Right Glass Auth Panel */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto relative"
        >
          {/* Floating Testimonial Pill */}
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="absolute -top-6 -right-4 md:-right-8 z-20 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl max-w-[220px]"
          >
            <div className="flex gap-1 mb-1.5">
              {[1,2,3,4,5].map(i => <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />)}
            </div>
            <p className="text-xs text-zinc-200 indent-1 italic font-medium tracking-wide">&quot;Literally addicted to getting my life together rn tbh.&quot;</p>
          </motion.div>

          {/* Form */}
          <div className="relative glass-card p-8">
            <div className="text-left space-y-2 mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2 uppercase">
                {isLogin ? 'ENTER THE ARENA' : 'Join the Party.'}
              </h2>
              {!isLogin && (
                <p className="text-sm text-orange-400 font-bold">
                  Start your gamified productivity journey.
                </p>
              )}
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Gamer Tag</label>
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-4 glass-input text-white placeholder:text-zinc-600 text-sm font-medium"
                    placeholder="Enter display name"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Email Layer</label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 glass-input text-white placeholder:text-zinc-600 text-sm font-medium"
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Secret Key</label>
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 glass-input text-white placeholder:text-zinc-600 text-sm font-medium"
                    placeholder="••••••••"
                  />
              </div>

              {errorMsg && (
                <p className="text-xs text-red-400 font-semibold bg-red-400/10 py-2 px-3 rounded-lg border border-red-400/20">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative flex items-center justify-center gap-2 rounded-xl px-4 py-4 text-sm font-black text-white uppercase tracking-widest transition-all bg-gradient-to-r from-[#FF4500] to-[#FF8C00] hover:from-[#E63E00] hover:to-[#E67E00] shadow-[0_0_20px_rgba(255,69,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed mt-4 group"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin flex-shrink-0 text-zinc-400" />}
                {!isLoading && (isLogin ? 'INITIALIZE LOGIN' : 'CREATE CHARACTER')}
                {!isLoading && <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform flex-shrink-0 text-zinc-400" />}
              </button>
            </form>

            <div className="text-center mt-6">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrorMsg('');
                }}
                className="text-xs text-zinc-500 hover:text-white transition-colors font-semibold tracking-wide"
              >
                {isLogin ? "NO CHARACTER YET? SIGN UP" : "ALREADY EXIST? SIGN IN"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* STRIP */}
      <div className="relative z-10 w-full border-y border-white/5 bg-black/20 backdrop-blur-md py-6 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
          <div className="font-bold flex items-center gap-2 text-zinc-400 text-sm"><Trophy className="h-4 w-4" /> 10M+ Quests Completed</div>
          <div className="font-bold flex items-center gap-2 text-zinc-400 text-sm"><Sparkles className="h-4 w-4" /> Powered by Gemini AI</div>
          <div className="font-bold flex items-center gap-2 text-zinc-400 text-sm"><CheckCircle2 className="h-4 w-4" /> Supabase Edge Scaled</div>
          <div className="font-bold flex items-center gap-2 text-zinc-400 text-sm"><Activity className="h-4 w-4" /> 99.9% Uptime SLA</div>
        </div>
      </div>

      {/* BENTO GRID FEATURES SECTION */}
      <section id="features" className="relative z-10 w-full max-w-7xl mx-auto px-6 py-32 space-y-16">
        
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter"
          >
            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500">dominate life.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 text-lg md:text-xl font-medium"
          >
            QuestLog combines cutting-edge AI, intense social rivalries, and RPG mechanics to make productivity actually addictive.
          </motion.p>
        </div>

        {/* The Grid Map */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-auto md:auto-rows-[280px]">
          
          {/* AI Quests (2x2) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#121216] to-[#0A0A0C] border border-white/5 p-10 flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 h-full flex flex-col">
              <div className="h-14 w-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6">
                <Brain className="h-7 w-7 text-orange-400" />
              </div>
              <h3 className="text-3xl font-black mb-3">Google Gemini AI Quests</h3>
              <p className="text-zinc-400 text-lg leading-relaxed flex-grow">
                Drop an impossible goal into the engine. Our Gemini intelligence breaks it down into bite-sized, actionable boss fights instantly. Less thinking, more executing.
              </p>
              
              {/* Visual Mockup inside the card */}
              <div className="mt-8 p-4 rounded-xl bg-black/50 border border-white/5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                  <div className="h-2.5 w-3/4 bg-white/10 rounded-full" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-zinc-700" />
                  <div className="h-2.5 w-1/2 bg-white/5 rounded-full" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-zinc-700" />
                  <div className="h-2.5 w-2/3 bg-white/5 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Productivity Heatmaps (2x1) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 relative group overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#121216] to-[#0A0A0C] border border-white/5 p-8 flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div className="px-3 py-1 rounded-full bg-amber-500/10 text-emerald-400 text-xs font-bold border border-amber-500/20">365-Days</div>
                </div>
                <h3 className="text-2xl font-black mb-2">GitHub-Style Heatmaps</h3>
                <p className="text-zinc-400 text-sm">Real-time productivity graphs tracking your execution over the last 52 weeks.</p>
              </div>
              
              {/* Fake heatmap grid */}
              <div className="flex gap-1.5 mt-6 border border-white/5 p-3 rounded-xl bg-black/40 overflow-hidden">
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(col => (
                  <div key={col} className="flex flex-col gap-1.5">
                    {[1,2,3,4,5].map(row => (
                      <div key={row} className={`h-2.5 w-2.5 rounded-[2px] ${Math.random() > 0.6 ? 'bg-amber-500' : Math.random() > 0.3 ? 'bg-emerald-800' : 'bg-zinc-800'}`} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Social Rivals (1x1) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="relative group overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#121216] to-[#0A0A0C] border border-white/5 p-8 flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <div className="h-12 w-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-black mb-2">Rivalries</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Add friends, create intense rivalries, and dominate the global leaderboards.</p>
            </div>
            {/* Visual element */}
            <div className="flex -space-x-4 mt-6">
              <div className="h-10 w-10 rounded-full border-2 border-zinc-900 bg-gradient-to-tr from-pink-500 to-orange-500 z-30 shadow-lg" />
              <div className="h-10 w-10 rounded-full border-2 border-zinc-900 bg-gradient-to-tr from-orange-500 to-orange-500 z-20 shadow-lg" />
              <div className="h-10 w-10 rounded-full border-2 border-zinc-900 bg-gradient-to-tr from-amber-500 to-teal-500 z-10 shadow-lg" />
            </div>
          </motion.div>

          {/* Shop & Loot (1x1) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="relative group overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#121216] to-[#0A0A0C] border border-white/5 p-8 flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <div className="h-12 w-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-4">
                <ShoppingBag className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-black mb-2">The Shop</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Exchange hard-earned XP for aesthetic rings and prestige profile titles.</p>
            </div>
            
            <div className="mt-6 flex items-center justify-between border border-white/10 bg-black/40 rounded-full py-2 px-4">
               <span className="text-xs font-bold text-yellow-400">Mythic Ring</span>
               <span className="text-xs text-zinc-500">10,000 XP</span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* MEET THE TEAM SECTION */}
      <section id="team" className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-4 mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black tracking-tighter"
          >
            Built by <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-400 to-amber-500">Elite Talent.</span>
          </motion.h2>
          <p className="text-zinc-400 text-lg font-medium max-w-2xl mx-auto">
            The C-Suite driving the Gamified Productivity revolution forward.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-sm md:max-w-5xl mx-auto">
          {/* CEO */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group relative"
          >
            <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-zinc-900 border-2 border-white/5 relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 z-10 pointer-events-none" />
              <img src="/img/ceo.jpg" alt="CEO" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
              <div className="absolute bottom-4 left-4 z-20 flex gap-2">
                 <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full text-[10px] font-black tracking-widest uppercase backdrop-blur-md">LVL 100</span>
                 <span className="px-3 py-1 bg-black/50 text-white border border-white/10 rounded-full text-[10px] font-black tracking-widest uppercase backdrop-blur-md">🥇 First</span>
              </div>
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-1">Alexander Sterling</h3>
            <p className="text-zinc-500 font-bold text-sm tracking-wider uppercase">Chief Executive Officer</p>
          </motion.div>

          {/* CPO */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group relative md:translate-y-12"
          >
            <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-zinc-900 border-2 border-white/5 relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 z-10 pointer-events-none" />
              <img src="/img/coo.jpg" alt="CPO" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
              <div className="absolute bottom-4 left-4 z-20 flex gap-2">
                 <span className="px-3 py-1 bg-zinc-400/10 text-zinc-300 border border-zinc-400/20 rounded-full text-[10px] font-black tracking-widest uppercase backdrop-blur-md">LVL 95</span>
                 <span className="px-3 py-1 bg-black/50 text-white border border-white/10 rounded-full text-[10px] font-black tracking-widest uppercase backdrop-blur-md">🥈 Second</span>
              </div>
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-1">Marcus Vance</h3>
            <p className="text-zinc-500 font-bold text-sm tracking-wider uppercase">Chief Product Officer</p>
          </motion.div>

          {/* CTO */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="group relative"
          >
            <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-zinc-900 border-2 border-white/5 relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 z-10 pointer-events-none" />
              <img src="/img/cfo.jpg" alt="CTO" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
              <div className="absolute bottom-4 left-4 z-20 flex gap-2">
                 <span className="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full text-[10px] font-black tracking-widest uppercase backdrop-blur-md">LVL 90</span>
                 <span className="px-3 py-1 bg-black/50 text-white border border-white/10 rounded-full text-[10px] font-black tracking-widest uppercase backdrop-blur-md">🥉 Third</span>
              </div>
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-1">Julian Hayes</h3>
            <p className="text-zinc-500 font-bold text-sm tracking-wider uppercase">Chief Technology Officer</p>
          </motion.div>
        </div>
      </section>

      {/* CALL TO ACTION BOTTOM */}
      <section className="relative w-full py-32 mt-16 border-t border-white/5 bg-gradient-to-b from-[#050505] to-orange-950/20 text-center px-6 overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
         <div className="relative z-10 max-w-3xl mx-auto space-y-8 flex flex-col items-center">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 mb-2">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Ready to enter the arena?</h2>
            <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed">
              Join thousands of others unlocking their true potential. Create your character today and start leveling up your real world stats.
            </p>
            <button 
              onClick={scrollToTop}
              className="mt-6 px-10 py-5 bg-white text-black text-sm font-bold uppercase tracking-widest rounded-full hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300"
            >
              Get Started Now
            </button>
         </div>
      </section>

      <div id="footer">
        <LandingFooter />
      </div>

    </div>
  );
}

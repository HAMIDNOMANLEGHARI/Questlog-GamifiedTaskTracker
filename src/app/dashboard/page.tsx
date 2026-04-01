'use client';

import { useUserStore } from '@/store/userStore';
import { useGamificationStore } from '@/store/gamificationStore';
import { useTaskStore } from '@/store/taskStore';
import { GithubHeatmap } from '@/components/GithubHeatmap';
import { TotalTasksChart } from '@/components/TotalTasksChart';
import { RivalWidget } from '@/components/RivalWidget';
import { Quote } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const { user } = useUserStore();
  const gamification = useGamificationStore((state) => state.data);
  const tasks = useTaskStore((state) => state.tasks);

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  
  const [quote, setQuote] = useState({ text: "The secret of getting ahead is getting started.", author: "Mark Twain" });

  useEffect(() => {
    const quotes = [
      { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
      { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
      { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
      { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
      { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" }
    ];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || user?.email?.split('@')[0]}! 👋</h1>
        <p className="text-zinc-500 mt-1 text-lg">Here&apos;s your progress for today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Core Stats */}
        <div className="p-6 rounded-2xl glass-card">
          <h3 className="text-sm font-medium text-zinc-500">Current Level</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">{gamification?.level || 1}</p>
          <div className="mt-4 h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-500 rounded-full" 
              style={{ width: `${(gamification?.xp || 0) % 100}%` }} 
            />
          </div>
          <p className="text-xs text-zinc-500 mt-2">{(gamification?.xp || 0) % 100} / 100 XP to next level</p>
        </div>

        <div className="p-6 rounded-2xl glass-card">
          <h3 className="text-sm font-medium text-zinc-500">Day Streak</h3>
          <p className="text-3xl font-bold text-orange-500 mt-2">{gamification?.streak_count || 0} 🔥</p>
          <p className="text-xs text-zinc-500 mt-2">Keep it up! Login tomorrow for bonus XP.</p>
        </div>

        <div className="p-6 rounded-2xl glass-card">
          <h3 className="text-sm font-medium text-zinc-500">Pending Tasks</h3>
          <p className="text-3xl font-bold text-amber-500 mt-2">{pendingTasks.length}</p>
          <p className="text-xs text-zinc-500 mt-2">Finish them to earn {(pendingTasks.length) * 10} XP</p>
        </div>
      </div>

      {/* Charts & Recent Tasks & Quotes */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quote Plate */}
        <div className="col-span-1 glass-card rounded-2xl p-6 flex flex-col justify-center items-center text-center">
          <Quote className="h-8 w-8 text-orange-500 mb-4 opacity-50" />
          <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300 italic mb-4">&quot;{quote.text}&quot;</p>
          <p className="text-sm font-bold text-zinc-400">— {quote.author}</p>
        </div>

        <div className="p-6 rounded-2xl glass-card col-span-1 lg:col-span-2">
          <TotalTasksChart />
        </div>
      </div>

      {/* Rivalry System */}
      <RivalWidget />

      {/* Productivity Heatmap */}
      <GithubHeatmap />
    </div>
  );
}

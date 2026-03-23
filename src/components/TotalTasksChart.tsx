'use client';

import { useTaskStore } from '@/store/taskStore';
import { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];

export function TotalTasksChart() {
  const { tasks } = useTaskStore();

  const data = useMemo(() => {
    const categoryMap = new Map<string, number>();
    let totalCompleted = 0;

    tasks.forEach(task => {
      if (task.status === 'completed') {
        const cat = task.category || 'Other';
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
        totalCompleted++;
      }
    });

    const chartData = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      Tasks: value
    })).sort((a, b) => b.Tasks - a.Tasks);

    return { chartData, totalCompleted };
  }, [tasks]);

  return (
    <div className="h-full w-full min-h-[250px] flex flex-col pt-4">
      <h3 className="text-sm font-semibold text-zinc-500 mb-1 px-2">Total Tasks Completed So Far</h3>
      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 px-2">{data.totalCompleted} <span className="text-sm font-medium text-zinc-500">tasks</span></p>
      
      <div className="flex-1">
        {data.chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="Tasks" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {data.chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
             <p className="text-zinc-500 text-sm">No tasks completed yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

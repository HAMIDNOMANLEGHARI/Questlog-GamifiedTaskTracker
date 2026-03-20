import { TaskBoard } from '@/components/TaskBoard';
import { SmartQuestGenerator } from '@/components/SmartQuestGenerator';

export default function TasksPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <p className="text-zinc-500">Manage your daily goals and track your progress.</p>
      </div>

      <SmartQuestGenerator />
      <TaskBoard />
    </div>
  );
}

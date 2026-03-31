'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const EMOJI_OPTIONS = ['⚔️', '🏰', '🐉', '🔥', '⭐', '🎯', '🚀', '💎', '🎮', '👑', '🦁', '🌊', '⚡', '🏆', '🎪', '🗡️'];

export function CreateCommunityModal({ isOpen, onClose, onCreated }: CreateCommunityModalProps) {
  const { user } = useUserStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('⚔️');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;
    setIsCreating(true);

    try {
      // 1. Create the community
      const { data: community, error: createError } = await supabase
        .from('sub_communities')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          creator_id: user.id,
          avatar_emoji: emoji,
        })
        .select()
        .single();

      if (createError) throw createError;

      // 2. Auto-add creator as admin member
      const { error: memberError } = await supabase
        .from('community_members')
        .insert({
          community_id: community.id,
          user_id: user.id,
          role: 'admin',
          community_xp: 0,
        });

      if (memberError) throw memberError;

      toast.success(`"${name.trim()}" guild created!`, { icon: '🏰' });
      setName('');
      setDescription('');
      setEmoji('⚔️');
      onCreated();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to create community';
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h2 className="text-xl font-black tracking-tight">Create a Guild</h2>
                <p className="text-sm text-zinc-500">Start your own community with a custom leaderboard.</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreate} className="p-6 space-y-6">
              {/* Emoji Picker */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Guild Emblem</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className={`w-12 h-12 text-2xl rounded-xl border-2 flex items-center justify-center transition-all hover:scale-110 ${
                        emoji === e
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Guild Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={40}
                  className="w-full px-5 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all shadow-sm"
                  placeholder="e.g., Study Squad, Code Warriors..."
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Description <span className="text-zinc-400 normal-case font-normal">(optional)</span></label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="w-full px-5 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all shadow-sm resize-none"
                  placeholder="What's this guild about?"
                />
              </div>

              {/* Submit */}
              <motion.button
                whileHover={!isCreating ? { scale: 1.02 } : {}}
                whileTap={!isCreating ? { scale: 0.98 } : {}}
                type="submit"
                disabled={isCreating || !name.trim()}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                {isCreating ? 'Creating...' : 'Create Guild'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

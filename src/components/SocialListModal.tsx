'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SHOP_ITEMS } from '@/constants/shop';

interface SocialUser {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  ring: string | null;
  title: string | null;
}

interface SocialListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  userIds: string[];
}

export function SocialListModal({ isOpen, onClose, title, userIds }: SocialListModalProps) {
  const [users, setUsers] = useState<SocialUser[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen || userIds.length === 0) {
      setUsers([]);
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, username, avatar_url, ring, title')
          .in('id', userIds);
          
        if (!error && data) setUsers(data as SocialUser[]);
      } catch (err) {
        console.error('Error fetching social users', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [isOpen, userIds]);

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
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-xl font-bold tracking-tight">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 flex-1">
              {userIds.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <p>No users to display.</p>
                </div>
              ) : loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => {
                    const ringClass = SHOP_ITEMS.rings.find(r => r.id === (user.ring || 'basic-white'))?.borderClass || 'border-zinc-200 dark:border-zinc-700';
                    return (
                      <div
                        key={user.id}
                        onClick={() => {
                          onClose();
                          router.push(`/dashboard/u/${user.username}`);
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                      >
                        <div className={`w-12 h-12 rounded-full border-[2px] flex items-center justify-center shrink-0 overflow-hidden bg-zinc-100 dark:bg-black ${ringClass}`}>
                          {user.avatar_url ? (
                            user.avatar_url.startsWith('http') ? (
                              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xl">{user.avatar_url}</span>
                            )
                          ) : (
                            <span className="text-lg font-bold">{user.name?.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{user.name}</p>
                          <p className="text-[10px] text-zinc-500 truncate uppercase font-bold tracking-wider">{user.title || 'Novice'} &bull; @{user.username}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';
import { Loader2, Users, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function JoinByInvitePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const { user } = useUserStore();

  const [status, setStatus] = useState<'loading' | 'found' | 'joined' | 'already' | 'error'>('loading');
  const [community, setCommunity] = useState<{ id: string; name: string; avatar_emoji: string; description: string | null } | null>(null);

  useEffect(() => {
    if (code && user?.id) handleJoin();
  }, [code, user?.id]);

  const handleJoin = async () => {
    try {
      // 1. Find community by invite code
      const { data: commData, error: commError } = await supabase
        .from('sub_communities')
        .select('id, name, avatar_emoji, description')
        .eq('invite_code', code)
        .single();

      if (commError || !commData) {
        setStatus('error');
        return;
      }
      setCommunity(commData);

      // 2. Check if already a member
      const { data: existing } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', commData.id)
        .eq('user_id', user!.id)
        .maybeSingle();

      if (existing) {
        setStatus('already');
        return;
      }

      // 3. Auto-join as member
      const { error: joinError } = await supabase
        .from('community_members')
        .insert({
          community_id: commData.id,
          user_id: user!.id,
          role: 'member',
          community_xp: 0,
        });

      if (joinError) throw joinError;
      setStatus('joined');
      toast.success('You joined the group!', { icon: '🎉' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-zinc-400" />
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 max-w-md mx-auto px-4">
      {status === 'loading' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto" />
          <p className="text-lg font-bold text-zinc-500">Joining group...</p>
        </motion.div>
      )}

      {status === 'found' && community && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="text-6xl">
            {community.avatar_emoji.startsWith('http') ? (
              <img src={community.avatar_emoji} alt="" className="w-20 h-20 rounded-2xl object-cover shadow-lg mx-auto" />
            ) : (
              community.avatar_emoji
            )}
          </div>
          <h1 className="text-2xl font-black">{community.name}</h1>
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
        </motion.div>
      )}

      {status === 'joined' && community && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto" />
          <div className="text-5xl">
            {community.avatar_emoji.startsWith('http') ? (
              <img src={community.avatar_emoji} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-lg mx-auto" />
            ) : (
              community.avatar_emoji
            )}
          </div>
          <h1 className="text-2xl font-black">{community.name}</h1>
          <p className="text-zinc-500">You&apos;re now a member!</p>
          <button onClick={() => router.push(`/dashboard/community/${community.id}`)}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all">
            Open Group
          </button>
        </motion.div>
      )}

      {status === 'already' && community && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Users className="w-16 h-16 text-indigo-500 mx-auto" />
          <h1 className="text-2xl font-black">{community.name}</h1>
          <p className="text-zinc-500">You&apos;re already a member of this group!</p>
          <button onClick={() => router.push(`/dashboard/community/${community.id}`)}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all">
            Go to Group
          </button>
        </motion.div>
      )}

      {status === 'error' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-black">Invalid Invite</h1>
          <p className="text-zinc-500">This invite link is expired or doesn&apos;t exist.</p>
          <button onClick={() => router.push('/dashboard/community')}
            className="px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold transition-all">
            Back to Community
          </button>
        </motion.div>
      )}
    </div>
  );
}

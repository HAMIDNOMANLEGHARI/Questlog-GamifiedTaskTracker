'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, Loader2, Plus, Users, Crown, Globe, UserPlus, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import { SHOP_ITEMS } from '@/constants/shop';
import { GlobalTavern } from '@/components/GlobalTavern';
import { CreateCommunityModal } from '@/components/CreateCommunityModal';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface LeaderboardEntry {
  user_id: string;
  xp: number;
  level: number;
  users: {
    name: string;
    email: string;
    avatar_url: string | null;
    title: string | null;
    ring: string | null;
    username: string;
  };
}

interface MyCommunity {
  community_id: string;
  role: string;
  community_xp: number;
  sub_communities: {
    id: string;
    name: string;
    avatar_emoji: string;
    description: string | null;
    creator_id: string;
  };
}

interface DiscoverGroup {
  id: string;
  name: string;
  avatar_emoji: string;
  description: string | null;
  member_count: number;
  creator_name: string;
}

export default function CommunityPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [myCommunities, setMyCommunities] = useState<MyCommunity[]>([]);
  const [communityMemberCounts, setCommunityMemberCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Discover state
  const [allDiscoverGroups, setAllDiscoverGroups] = useState<DiscoverGroup[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());
  const [requestingJoin, setRequestingJoin] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<'groups' | 'discover'>('groups');

  useEffect(() => {
    fetchLeaderboard();
    if (user?.id) {
      fetchMyCommunities();
      fetchDiscoverGroups();
    }
  }, [user?.id]);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('gamification')
        .select(`
          user_id, xp, level,
          users!inner ( name, email, avatar_url, title, ring, username )
        `)
        .order('xp', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLeaders(data as unknown as LeaderboardEntry[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCommunities = async () => {
    setCommunitiesLoading(true);
    try {
      const { data: membershipData, error } = await supabase
        .from('community_members')
        .select('community_id, role, community_xp')
        .eq('user_id', user!.id);

      if (error && error.code !== '42P01') throw error;
      const memberships = membershipData || [];

      if (memberships.length === 0) {
        setMyCommunities([]);
        setCommunitiesLoading(false);
        return;
      }

      const communityIds = memberships.map(m => m.community_id);
      const { data: commData } = await supabase
        .from('sub_communities')
        .select('id, name, avatar_emoji, description, creator_id')
        .in('id', communityIds);

      const commMap = Object.fromEntries((commData || []).map(c => [c.id, c]));

      const communities: MyCommunity[] = memberships
        .filter(m => commMap[m.community_id])
        .map(m => ({
          community_id: m.community_id,
          role: m.role,
          community_xp: m.community_xp,
          sub_communities: commMap[m.community_id],
        }));
      setMyCommunities(communities);

      const counts: Record<string, number> = {};
      for (const cid of communityIds) {
        const { count } = await supabase
          .from('community_members')
          .select('*', { count: 'exact', head: true })
          .eq('community_id', cid);
        counts[cid] = count || 0;
      }
      setCommunityMemberCounts(counts);
    } catch (err) {
      console.error(err);
    } finally {
      setCommunitiesLoading(false);
    }
  };

  const fetchDiscoverGroups = async () => {
    setDiscoverLoading(true);
    try {
      // Fetch ALL communities
      const { data: allCommunities } = await supabase
        .from('sub_communities')
        .select('id, name, avatar_emoji, description, creator_id')
        .order('created_at', { ascending: false });
      if (!allCommunities || allCommunities.length === 0) {
        setAllDiscoverGroups([]);
        setDiscoverLoading(false);
        return;
      }

      // Fetch user's memberships
      const { data: myMemberships } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', user!.id);
      const myCommIds = new Set((myMemberships || []).map(m => m.community_id));

      // Filter out ones user is already in
      const notJoined = allCommunities.filter(c => !myCommIds.has(c.id));

      // Fetch member counts
      const withCounts = await Promise.all(notJoined.map(async (c) => {
        const { count } = await supabase
          .from('community_members')
          .select('*', { count: 'exact', head: true })
          .eq('community_id', c.id);
        return { ...c, member_count: count || 0 };
      }));

      // Fetch creator names
      const creatorIds = Array.from(new Set(withCounts.map(c => c.creator_id)));
      const { data: creatorsData } = await supabase
        .from('users')
        .select('id, name')
        .in('id', creatorIds);
      const creatorMap = Object.fromEntries((creatorsData || []).map(u => [u.id, u.name]));

      setAllDiscoverGroups(withCounts.map(c => ({
        ...c,
        creator_name: creatorMap[c.creator_id] || 'Unknown',
      })));

      // Fetch pending requests
      const { data: pendingReqs } = await supabase
        .from('community_join_requests')
        .select('community_id')
        .eq('user_id', user!.id)
        .eq('status', 'pending');
      setPendingRequests(new Set((pendingReqs || []).map(r => r.community_id)));
    } catch (err) {
      console.error(err);
    } finally {
      setDiscoverLoading(false);
    }
  };

  const handleRequestJoin = async (communityId: string) => {
    if (!user) return;
    setRequestingJoin(communityId);
    try {
      const { error } = await supabase
        .from('community_join_requests')
        .insert({
          community_id: communityId,
          user_id: user.id,
          status: 'pending',
        });
      if (error) throw error;
      setPendingRequests(prev => new Set([...Array.from(prev), communityId]));
      toast.success('Join request sent!', { icon: '📩' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to send request');
    } finally {
      setRequestingJoin(null);
    }
  };

  // Filter discover groups by search
  const filteredDiscoverGroups = allDiscoverGroups.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.creator_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community</h1>
          <p className="text-zinc-500">Compete on the leaderboard, join groups, and tackle Co-op Quests with friends.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Create Group
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1.5 glass-input rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'groups'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          <Users className="w-4 h-4" /> Your Groups
          {myCommunities.length > 0 && (
            <span className="text-[10px] bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full font-black">{myCommunities.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'discover'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          <Globe className="w-4 h-4" /> Discover
          {allDiscoverGroups.length > 0 && (
            <span className="text-[10px] bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full font-black">{allDiscoverGroups.length}</span>
          )}
        </button>
      </div>

      {/* ─── Your Groups Tab ─── */}
      {activeTab === 'groups' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {communitiesLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
          ) : myCommunities.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <Users className="w-16 h-16 text-zinc-400 mx-auto mb-4 opacity-30" />
              <p className="text-zinc-500 font-bold text-lg">No groups yet</p>
              <p className="text-zinc-400 text-sm mt-1 mb-6">Create your own group or discover existing ones!</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 transition-colors">
                  <Plus className="w-4 h-4" /> Create Group
                </button>
                <button onClick={() => setActiveTab('discover')} className="flex items-center gap-2 px-5 py-2.5 bg-zinc-200 dark:bg-zinc-700 rounded-xl font-bold text-sm hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors">
                  <Globe className="w-4 h-4" /> Discover
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myCommunities.map((mc) => (
                <motion.div
                  whileHover={{ scale: 1.03, y: -3 }}
                  key={mc.community_id}
                  onClick={() => router.push(`/dashboard/community/${mc.community_id}`)}
                  className="cursor-pointer p-5 rounded-2xl glass-card hover:shadow-lg hover:border-orange-400/50 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl shrink-0">
                      {mc.sub_communities.avatar_emoji.startsWith('http') ? (
                        <img src={mc.sub_communities.avatar_emoji} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        mc.sub_communities.avatar_emoji
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">{mc.sub_communities.name}</h3>
                      <p className="text-xs text-zinc-500 flex items-center gap-1">
                        {communityMemberCounts[mc.community_id] || '?'} members
                        {mc.role === 'admin' && <Crown className="w-3 h-3 text-yellow-500 ml-1" />}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400 font-medium">Your XP</span>
                    <span className="font-mono font-bold text-orange-600 dark:text-orange-400">{mc.community_xp}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ─── Discover Tab ─── */}
      {activeTab === 'discover' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups by name, description, or creator..."
              className="w-full pl-12 pr-5 py-3.5 rounded-2xl glass-input text-sm font-medium shadow-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors text-xs font-bold">
                Clear
              </button>
            )}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              {searchQuery ? (
                <>{filteredDiscoverGroups.length} group{filteredDiscoverGroups.length !== 1 ? 's' : ''} found</>
              ) : (
                <>{allDiscoverGroups.length} group{allDiscoverGroups.length !== 1 ? 's' : ''} to discover</>
              )}
            </p>
          </div>

          {/* Groups Grid */}
          {discoverLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
          ) : filteredDiscoverGroups.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
              {searchQuery ? (
                <>
                  <Search className="w-12 h-12 text-zinc-400 mx-auto mb-3 opacity-30" />
                  <p className="text-zinc-500 font-bold">No groups match &quot;{searchQuery}&quot;</p>
                  <p className="text-zinc-400 text-sm mt-1">Try a different search term</p>
                </>
              ) : (
                <>
                  <Globe className="w-12 h-12 text-zinc-400 mx-auto mb-3 opacity-30" />
                  <p className="text-zinc-500 font-bold">No groups to discover</p>
                  <p className="text-zinc-400 text-sm mt-1">You&apos;re already in every group, or none exist yet!</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDiscoverGroups.map((group) => (
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={group.id}
                  className="p-5 rounded-2xl glass-card hover:shadow-lg transition-all flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-3xl shrink-0">
                      {group.avatar_emoji.startsWith('http') ? (
                        <img src={group.avatar_emoji} alt="" className="w-11 h-11 rounded-xl object-cover shadow-sm" />
                      ) : (
                        group.avatar_emoji
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">{group.name}</h3>
                      <p className="text-[11px] text-zinc-500">{group.member_count} members · by {group.creator_name}</p>
                    </div>
                  </div>
                  {group.description && (
                    <p className="text-xs text-zinc-400 mb-3 line-clamp-2 flex-1">{group.description}</p>
                  )}
                  {!group.description && <div className="flex-1" />}
                  <button
                    onClick={() => handleRequestJoin(group.id)}
                    disabled={pendingRequests.has(group.id) || requestingJoin === group.id}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all mt-2 ${
                      pendingRequests.has(group.id)
                        ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 cursor-default'
                        : 'bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {pendingRequests.has(group.id) ? (
                      '✓ Request Sent'
                    ) : requestingJoin === group.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <><UserPlus className="w-4 h-4" /> Request to Join</>
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Global Leaderboard + Tavern */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500 rounded-xl">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Global Leaderboard</h2>
                <p className="text-sm text-zinc-500">Top 10 most productive members</p>
              </div>
            </div>

            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {leaders.map((leader, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={leader.user_id}
                    onClick={() => router.push(`/dashboard/u/${leader.users.username || 'unknown'}`)}
                    className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                      user?.id === leader.user_id ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''
                    }`}
                  >
                    <div className="w-8 shrink-0 flex justify-center">
                      {index === 0 ? <span className="text-2xl">🥇</span> : 
                       index === 1 ? <span className="text-2xl">🥈</span> : 
                       index === 2 ? <span className="text-2xl">🥉</span> : 
                       <span className="font-bold text-zinc-400">#{index + 1}</span>}
                    </div>
                    <div className={`h-12 w-12 rounded-full overflow-hidden flex items-center justify-center text-2xl font-bold shrink-0 shadow-md border-[3px] bg-zinc-100 dark:bg-zinc-800 ${
                      SHOP_ITEMS.rings.find(r => r.id === (leader.users.ring || 'basic-white'))?.borderClass || 'border-zinc-200 dark:border-zinc-700'
                    }`}>
                      {leader.users.avatar_url ? (
                        leader.users.avatar_url.startsWith('http') ? (
                          <img src={leader.users.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span>{leader.users.avatar_url}</span>
                        )
                      ) : (
                        <span className="text-zinc-500 dark:text-zinc-400">{(leader.users.name || leader.users.email).substring(0, 1).toUpperCase()}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-2">
                        {leader.users.name || leader.users.email.split('@')[0]}
                        {user?.id === leader.user_id && <span className="text-[10px] bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full tracking-wider uppercase">You</span>}
                      </p>
                      <p className="text-xs font-bold text-zinc-500 tracking-wider">
                        LVL {leader.level} <span className="mx-1">•</span> <span className="text-orange-500 dark:text-orange-400 uppercase">{leader.users.title || 'NOVICE'}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-mono font-bold text-lg text-orange-600 dark:text-orange-400">{leader.xp} XP</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <GlobalTavern />
        </div>
      </div>

      <CreateCommunityModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => { fetchMyCommunities(); fetchDiscoverGroups(); }}
      />
    </div>
  );
}

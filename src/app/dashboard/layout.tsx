'use client';

import { Sidebar } from '@/components/Sidebar';
import { useAppData } from '@/hooks/useAppData';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { SHOP_ITEMS } from '@/constants/shop';
import { useEffect, useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAppData();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedTheme = SHOP_ITEMS.themes.find(t => t.id === theme);
  const isPremiumTheme = selectedTheme && !['light', 'dark'].includes(selectedTheme.id);
  
  // Extract only the background color (e.g., 'bg-blue-950')
  const themeBgClass = isPremiumTheme ? selectedTheme.cssClass.split(' ')[0] : 'bg-zinc-50 dark:bg-black';

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-500 ${mounted ? themeBgClass : 'bg-zinc-50 dark:bg-black'}`}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 overflow-x-hidden">
        <ErrorBoundary fallbackMessage="Something went wrong loading this page. Check your connection and try again.">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full"
          >
            {children}
          </motion.div>
        </ErrorBoundary>
      </main>
    </div>
  );
}

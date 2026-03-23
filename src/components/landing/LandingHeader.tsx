'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function LandingHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 bg-[#050505]/60 backdrop-blur-xl h-16 flex items-center"
    >
      <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer font-bold text-lg text-white" onClick={scrollToTop}>
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <span>QuestLog</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <button onClick={() => scrollToSection('hero')} className="hover:text-white transition-colors">Product</button>
          <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button>
          <button onClick={() => scrollToSection('team')} className="hover:text-white transition-colors">Team</button>
          <button onClick={() => scrollToSection('footer')} className="hover:text-white transition-colors">Company</button>
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={scrollToTop} className="hidden md:block text-sm font-medium text-zinc-300 hover:text-white transition-colors">
            Log in
          </button>
          <button 
            onClick={scrollToTop}
            className="hidden md:flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/10 transition-colors text-white text-xs font-bold px-4 py-2 rounded-full"
          >
            Enter Arena <ArrowRight className="h-3.5 w-3.5" />
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-zinc-400 hover:text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 right-0 bg-[#050505]/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-6 md:hidden shadow-2xl"
          >
            <nav className="flex flex-col gap-4 text-sm font-bold text-zinc-300">
              <button onClick={() => { scrollToSection('hero'); setIsMobileMenuOpen(false); }} className="text-left py-2 hover:text-white border-b border-white/5">Product</button>
              <button onClick={() => { scrollToSection('features'); setIsMobileMenuOpen(false); }} className="text-left py-2 hover:text-white border-b border-white/5">Features</button>
              <button onClick={() => { scrollToSection('team'); setIsMobileMenuOpen(false); }} className="text-left py-2 hover:text-white border-b border-white/5">Team</button>
              <button onClick={() => { scrollToSection('footer'); setIsMobileMenuOpen(false); }} className="text-left py-2 hover:text-white">Company</button>
            </nav>
            <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
              <button onClick={() => { scrollToTop(); setIsMobileMenuOpen(false); }} className="py-3 text-sm font-bold text-white bg-white/5 rounded-xl border border-white/10">
                Log in
              </button>
              <button onClick={() => { scrollToTop(); setIsMobileMenuOpen(false); }} className="py-3 text-sm font-bold text-black bg-white rounded-xl flex items-center justify-center gap-2">
                Enter Arena <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

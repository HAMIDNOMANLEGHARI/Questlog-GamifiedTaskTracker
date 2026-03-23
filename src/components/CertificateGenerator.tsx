'use client';

import { useRef, useState, useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import { useGamificationStore } from '@/store/gamificationStore';
import { format } from 'date-fns';
import { Download, Loader2, Award, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CERTIFICATES = [
  {
    id: 'excellence',
    minLevel: 5,
    title: 'Certificate of Excellence',
    subtitle: 'LevelUp Global Vanguard',
    colors: {
      bg: '#fdfbf7', 
      borderOuter: '#1e3a8a', 
      borderInner: '#b45309', 
      textPrimary: '#1e3a8a',
      textSecondary: '#4b5563',
      textAccent: '#b45309',
      sealFrom: '#fbbf24',
      sealVia: '#f59e0b',
      sealTo: '#b45309',
      sealText: 'white',
      signature: '#1e3a8a',
      nameColor: 'black'
    }
  },
  {
    id: 'masterclass',
    minLevel: 25,
    title: 'Masterclass Diploma',
    subtitle: 'Advanced Productivity Scholar',
    colors: {
      bg: '#f8fafc', 
      borderOuter: '#7f1d1d', 
      borderInner: '#94a3b8', 
      textPrimary: '#7f1d1d',
      textSecondary: '#475569',
      textAccent: '#64748b',
      sealFrom: '#e2e8f0',
      sealVia: '#cbd5e1',
      sealTo: '#94a3b8',
      sealText: '#1e293b',
      signature: '#7f1d1d',
      nameColor: '#0f172a'
    }
  },
  {
    id: 'grandmaster',
    minLevel: 50,
    title: 'Grandmaster Laurels',
    subtitle: 'Elite Performance Guild',
    colors: {
      bg: '#0f172a', 
      borderOuter: '#020617', 
      borderInner: '#fbbf24', 
      textPrimary: '#fbbf24',
      textSecondary: '#94a3b8',
      textAccent: '#f59e0b',
      sealFrom: '#fef08a',
      sealVia: '#f59e0b',
      sealTo: '#b45309',
      sealText: 'white',
      signature: '#fbbf24',
      nameColor: 'white'
    }
  },
  {
    id: 'apex',
    minLevel: 100,
    title: 'The Apex Decree',
    subtitle: 'Supreme Productivity Commander',
    colors: {
      bg: '#050505', 
      borderOuter: '#171717', 
      borderInner: '#06b6d4', 
      textPrimary: '#06b6d4',
      textSecondary: '#a1a1aa',
      textAccent: '#22d3ee',
      sealFrom: '#67e8f9',
      sealVia: '#06b6d4',
      sealTo: '#0891b2',
      sealText: 'white',
      signature: '#22d3ee',
      nameColor: '#ffffff',
      shadowCss: 'drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]' 
    }
  }
];

export function CertificateGenerator() {
  const { user } = useUserStore();
  const gamification = useGamificationStore((state) => state.data);
  const printRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [scale, setScale] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeCert = CERTIFICATES[activeIndex];
  const isUnlocked = gamification ? gamification.level >= activeCert.minLevel : false;

  // Dynamically calculate scale based on available container width
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const availableWidth = containerRef.current.clientWidth - 48; // 24px padding on each side
        if (availableWidth < 1000) {
          setScale(availableWidth / 1000);
        } else {
          setScale(1);
        }
      }
    };
    
    handleResize(); // Initial measurement
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element || !isUnlocked) return;
    
    setIsDownloading(true);
    try {
      // Temporarily ensure the element is visible and styled correctly for the canvas capture
      const canvas = await html2canvas(element, {
        scale: 2, // 2x gives perfect HD without crashing browser memory limits
        useCORS: true,
        backgroundColor: activeCert.colors.bg,
        onclone: (document) => {
          // Remove the responsive CSS scale exclusively for the PDF capture
          const el = document.getElementById('printable-certificate');
          if (el) {
            el.style.transform = 'none';
          }
        }
      });
      const data = canvas.toDataURL('image/jpeg', 0.95); // JPEG is much smaller than PNG for high-res canvases
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(data, 'JPEG', 0, 0, canvas.width, canvas.height);
      const fileName = activeCert.title.replace(/\s+/g, '_');
      pdf.save(`LevelUp_${fileName}_${user?.name || 'Achiever'}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF', error);
      alert('Failed to generate PDF. Please try again. Ensure ad-blockers are disabled.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col items-center w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-4xl gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-bold tracking-tight">Official Credentials</h2>
          <p className="text-zinc-500 text-sm">Valid proof of your elite productivity.</p>
        </div>
        
        {/* Carousel Headers */}
        <div className="flex items-center gap-4 bg-zinc-100 dark:bg-zinc-800/50 p-2 rounded-2xl">
           <button 
             onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))} 
             disabled={activeIndex === 0}
             className="p-2 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 disabled:opacity-30 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-700"
           >
             <ChevronLeft className="w-5 h-5" />
           </button>
           
           <div className="text-center min-w-[200px]">
             <h3 className="font-bold text-sm tracking-tight">{activeCert.title}</h3>
             <p className="text-xs text-zinc-500 font-medium">
               {isUnlocked ? (
                 <span className="text-emerald-500">Unlocked</span>
               ) : (
                 <span className="text-rose-500">Unlocks at Level {activeCert.minLevel}</span>
               )}
             </p>
           </div>
           
           <button 
             onClick={() => setActiveIndex(prev => Math.min(CERTIFICATES.length - 1, prev + 1))} 
             disabled={activeIndex === CERTIFICATES.length - 1}
             className="p-2 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 disabled:opacity-30 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-700"
           >
             <ChevronRight className="w-5 h-5" />
           </button>
        </div>

        <button 
          onClick={handleDownloadPdf}
          disabled={isDownloading || !isUnlocked}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
        >
          {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {isDownloading ? 'Generating HQ PDF...' : 'Download HD PDF'}
        </button>
      </div>

      {/* The Printable Certificate Container */}
      <div 
        ref={containerRef}
        className="w-full overflow-hidden flex justify-center bg-zinc-100 dark:bg-zinc-800/20 rounded-2xl py-8 transition-all duration-300"
        style={{ height: `${700 * scale + 64}px` }}
      >
        {/* Fixed Wrapper for Canvas target guaranteeing HD quality */}
        <div 
          id="printable-certificate"
          ref={printRef}
          className="relative w-[1000px] h-[700px] flex flex-col items-center justify-center text-center p-8 shadow-2xl shrink-0 origin-top transition-all duration-500"
          style={{ 
            transform: `scale(${scale})`,
            backgroundColor: activeCert.colors.bg
          }}
        >
          {/* Lock Overlay */}
          {!isUnlocked && (
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center text-white cursor-not-allowed transition-all">
                <Lock className="h-16 w-16 mb-4 text-white/50" />
                <h3 className="text-4xl font-black tracking-tight mb-2 drop-shadow-lg">Credential Locked</h3>
                <p className="text-xl font-medium text-white/80">Achieve Level {activeCert.minLevel} to unveil this diploma.</p>
             </div>
          )}

          {/* Outer Border */}
          <div className="absolute inset-0 m-6 border-[12px] rounded-sm pointer-events-none transition-colors duration-500" style={{ borderColor: activeCert.colors.borderOuter }} />
          {/* Inner Border */}
          <div className="absolute inset-0 m-[32px] border-[3px] rounded-sm pointer-events-none opacity-80 transition-colors duration-500" style={{ borderColor: activeCert.colors.borderInner }} />
          {/* Corner accents */}
          <div className="absolute top-[30px] left-[30px] w-4 h-4 border-t-4 border-l-4 pointer-events-none" style={{ borderColor: activeCert.colors.borderOuter }} />
          <div className="absolute top-[30px] right-[30px] w-4 h-4 border-t-4 border-r-4 pointer-events-none" style={{ borderColor: activeCert.colors.borderOuter }} />
          <div className="absolute bottom-[30px] left-[30px] w-4 h-4 border-b-4 border-l-4 pointer-events-none" style={{ borderColor: activeCert.colors.borderOuter }} />
          <div className="absolute bottom-[30px] right-[30px] w-4 h-4 border-b-4 border-r-4 pointer-events-none" style={{ borderColor: activeCert.colors.borderOuter }} />
          
          <div className="relative z-10 flex flex-col items-center justify-between h-full w-full py-12 px-16">
            
            {/* Header */}
            <div className="space-y-4">
              <div 
                className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-md border-2 border-white/20 transition-colors duration-500"
                style={{ backgroundColor: activeCert.colors.borderOuter }}
              >
                <Award className="h-8 w-8" style={{ color: activeCert.colors.borderInner }} />
              </div>
              <h3 className="font-bold uppercase tracking-[0.3em] text-sm transition-colors duration-500" style={{ color: activeCert.colors.textAccent }}>
                {activeCert.subtitle}
              </h3>
              <h1 
                className={`text-5xl font-serif uppercase tracking-wide transition-colors duration-500 ${activeCert.colors.shadowCss || ''}`}
                style={{ color: activeCert.colors.textPrimary }}
              >
                {activeCert.title}
              </h1>
            </div>

            {/* Body */}
            <div className="space-y-6 w-full max-w-3xl mt-12">
              <p className="font-serif italic text-xl transition-colors duration-500" style={{ color: activeCert.colors.textSecondary }}>
                This prestigious honor is hereby awarded to
              </p>
              
              <div className="py-2">
                <h2 
                  className="text-5xl font-serif font-bold border-b pb-4 px-12 inline-block transition-colors duration-500"
                  style={{ color: activeCert.colors.nameColor, borderColor: `${activeCert.colors.borderInner}40` }} // 40 is hex opacity
                >
                  {user?.name || user?.email || 'Dedicated Achiever'}
                </h2>
              </div>
              
              <p className="font-serif leading-relaxed text-lg mt-6 px-12 transition-colors duration-500" style={{ color: activeCert.colors.textSecondary }}>
                for demonstrating unparalleled dedication, consistency, and mastery in personal productivity. <br/>
                Having successfully breached <strong style={{ color: activeCert.colors.textPrimary }}>Level {gamification?.level || 1}</strong>, the recipient has proven their capacity to conquer daily quests and forge an elite path forward.
              </p>
            </div>

            {/* Footer Signatures */}
            <div className="flex justify-between w-full mt-auto pt-12 px-12">
              <div className="text-center w-56">
                <div className="border-b-2 pb-2 mb-2 relative transition-colors duration-500" style={{ borderColor: `${activeCert.colors.textSecondary}40` }}>
                  <span className="font-serif italic text-3xl transition-colors duration-500" style={{ fontFamily: "'Brush Script MT', cursive, serif", color: activeCert.colors.signature }}>
                    Alexander Sterling
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-widest font-bold transition-colors duration-500" style={{ color: activeCert.colors.textSecondary }}>
                  Chief Executive Officer
                </p>
              </div>
              
              {/* Gold/Silver/Cyber Seal */}
              <div className="relative flex items-center justify-center translate-y-2">
                <div 
                  className="w-36 h-36 rounded-full flex items-center justify-center shadow-2xl relative transition-all duration-500"
                  style={{ background: `linear-gradient(135deg, ${activeCert.colors.sealFrom}, ${activeCert.colors.sealVia}, ${activeCert.colors.sealTo})` }}
                >
                  {/* Outer Ridge */}
                  <div className="absolute inset-2 rounded-full border border-white/30" />
                  <div className="absolute inset-1 rounded-full border border-black/10" />
                  <div className="w-28 h-28 rounded-full border-[2px] border-white/60 flex items-center justify-center">
                    <div className="text-center" style={{ color: activeCert.colors.sealText }}>
                      <div className="text-[10px] uppercase tracking-widest font-bold opacity-90 mb-1">Official</div>
                      <div className="text-4xl font-serif font-bold my-1 drop-shadow-md">SEAL</div>
                      <div className="text-[10px] font-medium opacity-80 mt-1">Authentic</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center w-56">
                <div className="border-b-2 pb-2 mb-2 mt-4 transition-colors duration-500" style={{ borderColor: `${activeCert.colors.textSecondary}40` }}>
                  <span className="font-serif text-2xl transition-colors duration-500" style={{ color: activeCert.colors.nameColor }}>
                    {format(new Date(), 'MMMM dd, yyyy')}
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-widest font-bold transition-colors duration-500" style={{ color: activeCert.colors.textSecondary }}>
                  Date of Issuance
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

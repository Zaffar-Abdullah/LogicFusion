import React, { useState } from 'react';
import NumberSystemConverter from './components/NumberSystemConverter';
import CircuitBuilder from './components/CircuitBuilder';
import LineCodingSimulator from './components/LineCodingSimulator';
import SequentialLogicLab from './components/SequentialLogicLab';
import { Cpu, Share2, Sun, Moon, Zap, Layers, Activity, Settings, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LogoSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 20 20 L 34 28 L 34 68 L 60 68 L 60 80 L 20 80 Z" fill="currentColor" />
    <path d="M 40 24 L 74 24 L 74 36 L 54 36 L 54 54 L 40 64 Z" fill="currentColor" />
    <path d="M 38 33 L 58 45 L 38 57 Z" stroke="currentColor" strokeWidth="2.5" className="fill-white dark:fill-slate-900" strokeLinejoin="round" />
    <path d="M 48 39 L 54 39 L 58 35 L 75 35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="78" cy="35" r="2.5" stroke="currentColor" strokeWidth="2" className="fill-white dark:fill-slate-900" />
    <path d="M 58 45 L 75 45" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="78" cy="45" r="2.5" stroke="#3b82f6" strokeWidth="2" className="fill-white dark:fill-slate-900" />
    <path d="M 48 51 L 54 51 L 58 55 L 75 55" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="78" cy="55" r="2.5" stroke="currentColor" strokeWidth="2" className="fill-white dark:fill-slate-900" />
  </svg>
);

const LogoImage = ({ className, alt }: { className?: string; alt?: string }) => {
  const [error, setError] = useState(false);
  if (error) {
    return <LogoSVG className={className} />;
  }
  return <img src="/logo.png" alt={alt || "Logo"} className={className} onError={() => setError(true)} referrerPolicy="no-referrer" />;
};

export default function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [activeTab, setActiveTab] = useState<'converter' | 'circuit' | 'linecoding' | 'sequential'>('sequential');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-300 flex flex-col transition-colors duration-300 relative overflow-hidden">
        
        <AnimatePresence mode="wait">
          {!isStarted ? (
            <motion.div 
              key="splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950"
            >
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="flex flex-col items-center z-10"
              >
                <div className="w-40 h-40 md:w-48 md:h-48 mb-8 text-slate-900 dark:text-white drop-shadow-xl relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                  <LogoImage className="w-full h-full object-contain relative z-10" />
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold text-slate-800 dark:text-white leading-none tracking-tight mb-3">
                  Logic<span className="text-blue-600 dark:text-blue-500">Fusion</span>
                </h1>
                <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold mb-12 text-center max-w-md">
                  Digital Architecture Simulator
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsStarted(true)}
                  className="group relative flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg shadow-lg shadow-blue-500/30 transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Play className="w-5 h-5 fill-white relative z-10" />
                  <span className="relative z-10">Start Engine</span>
                </motion.button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              key="app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1 flex flex-col h-full w-full relative z-10"
            >
              <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-11 md:h-11 text-slate-900 dark:text-white drop-shadow-sm flex-shrink-0">
                    <LogoImage className="w-full h-full object-contain" />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-none tracking-tight">
                      Logic<span className="text-blue-600 dark:text-blue-500">Fusion</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold mt-1">Digital Architecture Simulator</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 md:gap-4">
                  <nav className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto hide-scrollbar max-w-[200px] sm:max-w-none">
                    <button
                      onClick={() => setActiveTab('converter')}
                      className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                        activeTab === 'converter' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      <Zap className="h-3.5 w-3.5" />
                      <span className="hidden md:inline">Converter & Logic</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('sequential')}
                      className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                        activeTab === 'sequential' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      <Settings className="h-3.5 w-3.5" />
                      <span className="hidden md:inline">Sequential Logic</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('circuit')}
                      className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                        activeTab === 'circuit' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      <Cpu className="h-3.5 w-3.5" />
                      <span className="hidden md:inline">Circuit Builder</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('linecoding')}
                      className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                        activeTab === 'linecoding' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      <Activity className="h-3.5 w-3.5" />
                      <span className="hidden md:inline">Line Coding</span>
                    </button>
                  </nav>
                  
                  <button 
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors flex-shrink-0"
                    title="Toggle Theme"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                </div>
              </header>

              <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 overflow-y-auto flex flex-col">
                <div className="flex-1 min-h-0 w-full transition-all duration-300 relative">
                  {activeTab === 'converter' && <NumberSystemConverter />}
                  {activeTab === 'sequential' && <SequentialLogicLab />}
                  {activeTab === 'circuit' && <CircuitBuilder />}
                  {activeTab === 'linecoding' && <LineCodingSimulator />}
                </div>
              </main>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

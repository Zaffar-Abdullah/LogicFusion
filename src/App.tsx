import React, { useState } from 'react';
import NumberSystemConverter from './components/NumberSystemConverter';
import CircuitBuilder from './components/CircuitBuilder';
import LineCodingSimulator from './components/LineCodingSimulator';
import { Cpu, Share2, Sun, Moon, Zap, Layers, Activity } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'converter' | 'circuit' | 'linecoding'>('linecoding');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-300 flex flex-col transition-colors duration-300">
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 relative z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-white text-xl shadow-sm">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white leading-none tracking-tight">LogicFusion</h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold mt-1">Digital Circuitry & Logic Engine</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-md border border-slate-200 dark:border-slate-800">

              <button
                onClick={() => setActiveTab('converter')}
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded transition-colors ${
                  activeTab === 'converter' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                Converter & Logic
              </button>
              <button
                onClick={() => setActiveTab('circuit')}
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded transition-colors ${
                  activeTab === 'circuit' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Cpu className="h-3.5 w-3.5" />
                Circuit Builder
              </button>
              <button
                onClick={() => setActiveTab('linecoding')}
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded transition-colors ${
                  activeTab === 'linecoding' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                Line Coding
              </button>
            </nav>
            
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto p-6 overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0 w-full transition-all duration-300 relative overflow-hidden">
                        {activeTab === 'converter' && <NumberSystemConverter />}
            {activeTab === 'circuit' && <CircuitBuilder />}
            {activeTab === 'linecoding' && <LineCodingSimulator />}
          </div>
        </main>
      </div>
    </div>
  );
}

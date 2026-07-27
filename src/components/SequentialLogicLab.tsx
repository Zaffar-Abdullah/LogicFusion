import React, { useState } from 'react';
import { BookOpen, Layers, Zap, ShieldAlert, Cpu } from 'lucide-react';
import SeqFundamentals from './sequential/SeqFundamentals';
import SeqLatches from './sequential/SeqLatches';
import SeqFlipFlops from './sequential/SeqFlipFlops';
import SeqMasterSlave from './sequential/SeqMasterSlave';

type Tab = 'fundamentals' | 'latches' | 'flipflops' | 'masterslave';

export default function SequentialLogicLab() {
  const [activeTab, setActiveTab] = useState<Tab>('fundamentals');

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header and Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 shrink-0">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
          <Layers className="w-6 h-6 text-indigo-500" />
          Sequential Logic & Flip-Flop Fundamentals Lab
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('fundamentals')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'fundamentals'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Fundamentals
          </button>
          <button
            onClick={() => setActiveTab('latches')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'latches'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Cpu className="w-4 h-4" /> Latches
          </button>
          <button
            onClick={() => setActiveTab('flipflops')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'flipflops'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Zap className="w-4 h-4" /> Flip-Flops
          </button>
          <button
            onClick={() => setActiveTab('masterslave')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'masterslave'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Master-Slave
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 bg-slate-100 dark:bg-slate-950">
        {activeTab === 'fundamentals' && <SeqFundamentals />}
        {activeTab === 'latches' && <SeqLatches />}
        {activeTab === 'flipflops' && <SeqFlipFlops />}
        {activeTab === 'masterslave' && <SeqMasterSlave />}
      </div>
    </div>
  );
}

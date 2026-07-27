import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Play, Square, Info } from 'lucide-react';
import { motion } from 'motion/react';

export default function SeqMasterSlave() {
  const [j, setJ] = useState(true);
  const [k, setK] = useState(true);
  const [clock, setClock] = useState(false);
  const [autoClock, setAutoClock] = useState(false);

  // States
  const [masterQ, setMasterQ] = useState(false);
  const [masterQbar, setMasterQbar] = useState(true);
  const [slaveQ, setSlaveQ] = useState(false);
  const [slaveQbar, setSlaveQbar] = useState(true);

  // Timing diagram history
  const [history, setHistory] = useState<{t: number, clk: boolean, masterQ: boolean, slaveQ: boolean}[]>([]);
  const timeRef = useRef(0);
  const maxHistory = 100;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [history]);

  // Master Slave Logic
  // Master is active HIGH level triggered. Slave is active LOW level triggered.
  useEffect(() => {
    let nextMasterQ = masterQ;
    let nextSlaveQ = slaveQ;

    if (clock) {
      // Clock is HIGH -> Master is active, Slave is isolated
      // Actually a level triggered JK will toggle continuously if J=1 K=1. 
      // But in a real Master-Slave, it only toggles once per pulse because feedback comes from Slave Q, which is isolated and stable!
      // This is the genius of Master-Slave. Feedback is from Slave.
      // So Master next state depends on J, K and SLAVE Q.
      if (j && !k) nextMasterQ = true;
      else if (!j && k) nextMasterQ = false;
      else if (j && k) nextMasterQ = !slaveQ; // feedback from slave
    } else {
      // Clock is LOW -> Master is isolated, Slave is active
      // Slave simply takes Master's value
      nextSlaveQ = masterQ;
    }

    setMasterQ(nextMasterQ);
    setMasterQbar(!nextMasterQ);
    setSlaveQ(nextSlaveQ);
    setSlaveQbar(!nextSlaveQ);
    
    // Record history
    setHistory(prev => {
      const newHist = [...prev, { t: timeRef.current++, clk: clock, masterQ: nextMasterQ, slaveQ: nextSlaveQ }];
      if (newHist.length > maxHistory) return newHist.slice(newHist.length - maxHistory);
      return newHist;
    });
  }, [clock, j, k]); // we intentionally only depend on clock and inputs, feedback is captured in effect.

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoClock) {
      interval = setInterval(() => {
        setClock(c => !c);
      }, 500); // 1Hz
    }
    return () => clearInterval(interval);
  }, [autoClock]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Educational Banner */}
      <div className="bg-rose-50 dark:bg-rose-900/10 border-l-4 border-rose-500 p-6 rounded-r-xl shadow-sm">
        <h3 className="text-xl font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2 mb-3">
          <ShieldAlert className="w-6 h-6" />
          The "Race Around" Condition
        </h3>
        <p className="text-rose-900 dark:text-rose-200/80 mb-4 leading-relaxed">
          In a simple level-triggered JK flip-flop, when <strong className="font-mono bg-rose-100 dark:bg-rose-900/40 px-1 rounded">J=1, K=1</strong> and the clock is HIGH, the output toggles. 
          Because modern logic gates are extremely fast, the output can toggle multiple times back and forth 
          during a single HIGH clock pulse. When the clock goes LOW, the final state is unpredictable. 
          This unstable toggling is known as the <strong>Race Around Condition</strong>.
        </p>
        <div className="flex gap-4 items-start bg-white dark:bg-slate-900 p-4 rounded-lg border border-rose-100 dark:border-rose-900/30">
          <Info className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Solutions:</span>
            <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 mt-2 space-y-1">
              <li>Use a <strong>Master-Slave</strong> Flip-Flop (shown below).</li>
              <li>Use <strong>Edge-Triggering</strong> instead of Level-Triggering.</li>
              <li>Ensure clock pulse width is shorter than the propagation delay (impractical).</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Simulation Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Master-Slave JK Simulation</h3>
          
          <div className="flex gap-4 mb-8 justify-center">
             <div className="flex flex-col items-center gap-2">
                <span className="font-mono font-bold text-slate-600 dark:text-slate-400">J</span>
                <button onClick={() => setJ(!j)} className={`w-12 h-12 rounded-lg border-2 font-bold font-mono text-xl transition-colors ${j ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-slate-100 border-slate-300 text-slate-500'}`}>
                  {j ? '1' : '0'}
                </button>
             </div>
             <div className="flex flex-col items-center gap-2">
                <span className="font-mono font-bold text-amber-600">CLK</span>
                <button onClick={() => setClock(!clock)} disabled={autoClock} className={`w-12 h-12 rounded-lg border-2 font-bold font-mono text-xl transition-colors ${clock ? 'bg-amber-100 border-amber-500 text-amber-700' : 'bg-slate-100 border-slate-300 text-slate-500'}`}>
                  {clock ? '1' : '0'}
                </button>
             </div>
             <div className="flex flex-col items-center gap-2">
                <span className="font-mono font-bold text-slate-600 dark:text-slate-400">K</span>
                <button onClick={() => setK(!k)} className={`w-12 h-12 rounded-lg border-2 font-bold font-mono text-xl transition-colors ${k ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-slate-100 border-slate-300 text-slate-500'}`}>
                  {k ? '1' : '0'}
                </button>
             </div>
          </div>
          
          <div className="flex justify-center mb-6">
             <button onClick={() => setAutoClock(!autoClock)} className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 ${autoClock ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                {autoClock ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />} 
                {autoClock ? 'Stop Clock' : 'Auto Clock (1Hz)'}
             </button>
          </div>

          {/* Block Diagram & Circuit */}
          <div className="relative w-full bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-center overflow-hidden py-8">
             <div className="w-full max-w-[800px]">
               <svg viewBox="0 0 800 370" className="w-full h-auto drop-shadow-sm font-sans">
                 
                 {/* Background Highlights for Master and Slave */}
                 <rect x="180" y="50" width="160" height="200" rx="8" fill={clock ? "rgba(99, 102, 241, 0.08)" : "transparent"} stroke={clock ? "rgba(99, 102, 241, 0.4)" : "rgba(148, 163, 184, 0.1)"} strokeWidth="2" strokeDasharray="6 6" className="transition-all duration-300" />
                 
                 <rect x="500" y="50" width="160" height="200" rx="8" fill={!clock ? "rgba(16, 185, 129, 0.08)" : "transparent"} stroke={!clock ? "rgba(16, 185, 129, 0.4)" : "rgba(148, 163, 184, 0.1)"} strokeWidth="2" strokeDasharray="6 6" className="transition-all duration-300" />

                 {/* Master Block */}
                 <rect x="200" y="80" width="120" height="140" fill="white" stroke={clock ? "#6366f1" : "#64748b"} strokeWidth={clock ? "3" : "2"} className="transition-all duration-300 dark:fill-slate-900" />
                 <text x="260" y="70" textAnchor="middle" className="text-sm font-bold fill-indigo-600 dark:fill-indigo-400">Master</text>
                 <text x="215" y="115" className="text-sm font-bold fill-slate-700 dark:fill-slate-300 font-mono">J</text>
                 <text x="215" y="195" className="text-sm font-bold fill-slate-700 dark:fill-slate-300 font-mono">K</text>
                 <text x="305" y="115" className="text-sm font-bold fill-slate-700 dark:fill-slate-300 font-mono">Q</text>
                 <text x="295" y="195" className="text-sm font-bold fill-slate-700 dark:fill-slate-300 font-mono">Q'</text>

                 {/* Slave Block */}
                 <rect x="520" y="80" width="120" height="140" fill="white" stroke={!clock ? "#10b981" : "#64748b"} strokeWidth={!clock ? "3" : "2"} className="transition-all duration-300 dark:fill-slate-900" />
                 <text x="580" y="70" textAnchor="middle" className="text-sm font-bold fill-emerald-600 dark:fill-emerald-400">Slave</text>
                 <text x="535" y="115" className="text-sm font-bold fill-slate-700 dark:fill-slate-300 font-mono">J</text>
                 <text x="535" y="195" className="text-sm font-bold fill-slate-700 dark:fill-slate-300 font-mono">K</text>
                 <text x="625" y="115" className="text-sm font-bold fill-slate-700 dark:fill-slate-300 font-mono">Q</text>
                 <text x="615" y="195" className="text-sm font-bold fill-slate-700 dark:fill-slate-300 font-mono">Q'</text>

                 {/* Inputs */}
                 {/* Set to junction */}
                 <path d="M 60 110 L 120 110" fill="none" stroke={j ? "#3b82f6" : "#94a3b8"} strokeWidth="2.5" className="transition-colors duration-300" />
                 <text x="25" y="114" className="text-sm font-bold fill-blue-600 dark:fill-blue-400">Set</text>
                 
                 {/* Reset to junction */}
                 <path d="M 60 190 L 140 190" fill="none" stroke={k ? "#3b82f6" : "#94a3b8"} strokeWidth="2.5" className="transition-colors duration-300" />
                 <text x="15" y="194" className="text-sm font-bold fill-blue-600 dark:fill-blue-400">Reset</text>

                 {/* Feedback Slave Q' to Master J junction */}
                 <path d="M 640 190 L 660 190 L 660 260 L 120 260 L 120 110" fill="none" stroke={slaveQbar ? "#10b981" : "#94a3b8"} strokeWidth="2.5" className="transition-colors duration-300" />
                 <circle cx="120" cy="110" r="3" fill={slaveQbar ? "#10b981" : "#94a3b8"} className="transition-colors duration-300" />
                 <polygon points="128,256 128,264 120,260" fill={slaveQbar ? "#10b981" : "#94a3b8"} className="transition-colors duration-300" />

                 {/* Feedback Slave Q to Master K junction */}
                 <path d="M 640 110 L 680 110 L 680 30 L 140 30 L 140 190" fill="none" stroke={slaveQ ? "#10b981" : "#94a3b8"} strokeWidth="2.5" className="transition-colors duration-300" />
                 <circle cx="140" cy="190" r="3" fill={slaveQ ? "#10b981" : "#94a3b8"} className="transition-colors duration-300" />
                 <polygon points="148,26 148,34 140,30" fill={slaveQ ? "#10b981" : "#94a3b8"} className="transition-colors duration-300" />

                 {/* Junction to Master J */}
                 <path d="M 120 110 L 200 110" fill="none" stroke={(j && slaveQbar) ? "#6366f1" : "#94a3b8"} strokeWidth="2.5" className="transition-colors duration-300" />
                 <polygon points="190,105 190,115 200,110" fill={(j && slaveQbar) ? "#6366f1" : "#94a3b8"} className="transition-colors duration-300" />

                 {/* Junction to Master K */}
                 <path d="M 140 190 L 200 190" fill="none" stroke={(k && slaveQ) ? "#6366f1" : "#94a3b8"} strokeWidth="2.5" className="transition-colors duration-300" />
                 <polygon points="190,185 190,195 200,190" fill={(k && slaveQ) ? "#6366f1" : "#94a3b8"} className="transition-colors duration-300" />

                 {/* Master Q to Slave J */}
                 <path d="M 320 110 L 520 110" fill="none" stroke={masterQ ? "#6366f1" : "#94a3b8"} strokeWidth="2.5" className="transition-colors duration-300" />
                 <polygon points="510,105 510,115 520,110" fill={masterQ ? "#6366f1" : "#94a3b8"} className="transition-colors duration-300" />

                 {/* Master Q' to Slave K */}
                 <path d="M 320 190 L 520 190" fill="none" stroke={masterQbar ? "#6366f1" : "#94a3b8"} strokeWidth="2.5" className="transition-colors duration-300" />
                 <polygon points="510,185 510,195 520,190" fill={masterQbar ? "#6366f1" : "#94a3b8"} className="transition-colors duration-300" />

                 {/* Output Q */}
                 <path d="M 640 110 L 740 110" fill="none" stroke={slaveQ ? "#10b981" : "#94a3b8"} strokeWidth="2.5" className="transition-colors duration-300" />
                 
                 {/* Output Q' */}
                 <path d="M 640 190 L 740 190" fill="none" stroke={slaveQbar ? "#10b981" : "#94a3b8"} strokeWidth="2.5" className="transition-colors duration-300" />
                 
                 {/* Branch dots for feedback */}
                 <circle cx="660" cy="190" r="3" fill={slaveQbar ? "#10b981" : "#94a3b8"} className="transition-colors duration-300" />
                 <circle cx="680" cy="110" r="3" fill={slaveQ ? "#10b981" : "#94a3b8"} className="transition-colors duration-300" />

                 {/* Clock path */}
                 <text x="35" y="325" className="text-sm font-bold fill-amber-600 dark:fill-amber-500">Clk</text>
                 <path d="M 60 320 L 380 320" fill="none" stroke={clock ? "#f59e0b" : "#94a3b8"} strokeWidth="2.5" className="transition-colors duration-300" />
                 
                 {/* Master Clk branch */}
                 <path d="M 180 320 L 180 150 L 200 150" fill="none" stroke={clock ? "#f59e0b" : "#94a3b8"} strokeWidth="2.5" className="transition-colors duration-300" />
                 <circle cx="180" cy="320" r="3" fill={clock ? "#f59e0b" : "#94a3b8"} className="transition-colors duration-300" />
                 <polygon points="190,145 190,155 200,150" fill={clock ? "#f59e0b" : "#94a3b8"} className="transition-colors duration-300" />

                 {/* NOT Gate */}
                 <path d="M 380 305 L 380 335 L 415 320 Z" fill="white" stroke={clock ? "#f59e0b" : "#94a3b8"} strokeWidth="2" className="transition-colors duration-300 dark:fill-slate-900" />
                 <circle cx="419" cy="320" r="4" fill="white" stroke={!clock ? "#f59e0b" : "#94a3b8"} strokeWidth="2" className="transition-colors duration-300 dark:fill-slate-900" />
                 
                 {/* Slave Clk branch */}
                 <path d="M 423 320 L 480 320 L 480 150 L 520 150" fill="none" stroke={!clock ? "#f59e0b" : "#94a3b8"} strokeWidth="2.5" className="transition-colors duration-300" />
                 <polygon points="510,145 510,155 520,150" fill={!clock ? "#f59e0b" : "#94a3b8"} className="transition-colors duration-300" />

                 {/* Title */}
                 <text x="400" y="360" textAnchor="middle" className="text-sm font-bold fill-emerald-600 dark:fill-emerald-500">Master-slave JK Flip-Flop</text>
               </svg>
             </div>
          </div>
        </div>

        {/* Timing Diagram */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Timing Analysis</h3>
            <div className="flex gap-4 text-xs font-mono">
              <span className="flex items-center gap-1 text-indigo-500"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Master Active (CLK=1)</span>
              <span className="flex items-center gap-1 text-emerald-500"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Slave Active (CLK=0)</span>
            </div>
          </div>
          
          <div className="relative border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 overflow-hidden flex flex-col">
            <div ref={scrollRef} className="flex-1 min-h-[280px] p-4 pl-[140px] overflow-x-auto relative custom-scrollbar scroll-smooth">
               <div style={{ minWidth: '600px', width: `${Math.max(600, history.length * 30)}px` }} className="h-full relative">
                 <svg width="100%" height="100%" className="overflow-visible">
                    {/* Grid Lines */}
                    {Array.from({ length: Math.max(20, history.length) }).map((_, i) => (
                      <line key={i} x1={i * 30} y1="0" x2={i * 30} y2="100%" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" strokeDasharray="4 4" />
                    ))}

                    {/* Clock Regions Highlighting */}
                    {history.map((h, i) => (
                      <rect 
                        key={`bg-${i}`} 
                        x={i * 30} 
                        y="0" 
                        width={30} 
                        height="100%" 
                        fill={h.clk ? "rgba(99, 102, 241, 0.05)" : "rgba(16, 185, 129, 0.05)"} 
                        className="transition-colors duration-200"
                      />
                    ))}
                    
                    {/* CLK */}
                    <g transform="translate(0, 30)">
                      <path 
                        d={history.map((h, i) => {
                          const prevClk = i > 0 ? history[i-1].clk : h.clk;
                          const x1 = i * 30;
                          const x2 = (i + 1) * 30;
                          const y1 = prevClk ? 0 : 25;
                          const y2 = h.clk ? 0 : 25;
                          if (y1 !== y2) {
                            return `M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2}`;
                          }
                          return `M ${x1} ${y2} L ${x2} ${y2}`;
                        }).join(' ')}
                        fill="none" stroke="#f59e0b" strokeWidth="2.5" 
                      />
                      {/* Clock Edge Arrows */}
                      {history.map((h, i) => {
                        if (i === 0) return null;
                        const prevClk = history[i-1].clk;
                        if (!prevClk && h.clk) {
                          return <polygon key={`up-${i}`} points={`${i*30},0 ${i*30 - 4},5 ${i*30 + 4},5`} fill="#6366f1" />;
                        } else if (prevClk && !h.clk) {
                          return <polygon key={`down-${i}`} points={`${i*30},25 ${i*30 - 4},20 ${i*30 + 4},20`} fill="#10b981" />;
                        }
                        return null;
                      })}
                    </g>

                    {/* Master Qm */}
                    <g transform="translate(0, 100)">
                      <path 
                        d={history.map((h, i) => {
                          const prevQ = i > 0 ? history[i-1].masterQ : h.masterQ;
                          const x1 = i * 30;
                          const x2 = (i + 1) * 30;
                          const y1 = prevQ ? 0 : 25;
                          const y2 = h.masterQ ? 0 : 25;
                          if (y1 !== y2) {
                            return `M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2}`;
                          }
                          return `M ${x1} ${y2} L ${x2} ${y2}`;
                        }).join(' ')}
                        fill="none" stroke="#6366f1" strokeWidth="2.5" 
                      />
                    </g>

                    {/* Slave Qs */}
                    <g transform="translate(0, 170)">
                      <path 
                        d={history.map((h, i) => {
                          const prevQ = i > 0 ? history[i-1].slaveQ : h.slaveQ;
                          const x1 = i * 30;
                          const x2 = (i + 1) * 30;
                          const y1 = prevQ ? 0 : 25;
                          const y2 = h.slaveQ ? 0 : 25;
                          if (y1 !== y2) {
                            return `M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2}`;
                          }
                          return `M ${x1} ${y2} L ${x2} ${y2}`;
                        }).join(' ')}
                        fill="none" stroke="#10b981" strokeWidth="2.5" 
                      />
                    </g>
                  </svg>
               </div>
            </div>
            
            {/* Fixed Labels Overlay */}
            <div className="absolute left-0 top-0 bottom-0 w-[130px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-r border-slate-200 dark:border-slate-800 z-10 pointer-events-none flex flex-col justify-start">
               <div className="absolute top-[36px] left-4 flex items-center gap-2">
                 <span className="text-[12px] text-amber-600 dark:text-amber-500 font-mono font-bold">Clock</span>
               </div>
               <div className="absolute top-[106px] left-4 flex items-center gap-2">
                 <span className="text-[12px] text-indigo-600 dark:text-indigo-400 font-mono font-bold">Qm (Master)</span>
               </div>
               <div className="absolute top-[176px] left-4 flex items-center gap-2">
                 <span className="text-[12px] text-emerald-600 dark:text-emerald-500 font-mono font-bold">Qs (Slave)</span>
               </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="mb-2"><strong>Timing Analysis Observation:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-1 text-xs">
              <li><strong className="text-indigo-600 dark:text-indigo-400">Master Latch</strong> updates state on the <strong>Rising Edge</strong> and holds it while clock is HIGH.</li>
              <li><strong className="text-emerald-600 dark:text-emerald-400">Slave Latch</strong> transfers the master's state to the output on the <strong>Falling Edge</strong>.</li>
              <li>This decoupled triggering isolates the output from the inputs, completely eliminating the continuous toggling of the race-around condition.</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}

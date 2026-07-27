import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Info, Activity, Clock, Zap } from 'lucide-react';
import { motion } from 'motion/react';

type FlipFlopType = 'SR' | 'JK' | 'D' | 'T';
interface FFState { Q: boolean; Qbar: boolean; }

export default function SeqFlipFlops() {
  const [ffType, setFfType] = useState<FlipFlopType>('SR');
  const [input1, setInput1] = useState(false); // S, J, D, T
  const [input2, setInput2] = useState(false); // R, K
  const [state, setState] = useState<FFState>({ Q: false, Qbar: true });
  const [clock, setClock] = useState(false);
  const [autoClock, setAutoClock] = useState(false);
  
  const [history, setHistory] = useState<{t: number, clk: boolean, i1: boolean, i2: boolean, q: boolean}[]>([]);
  const timeRef = useRef(0);
  const maxHistory = 100;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [history]);

  const prevClockRef = useRef(clock);

  useEffect(() => {
    let nextQ = state.Q;
    const isRisingEdge = !prevClockRef.current && clock;

    if (isRisingEdge) {
      if (ffType === 'SR') {
        if (input1 && !input2) nextQ = true;
        else if (!input1 && input2) nextQ = false;
        else if (input1 && input2) nextQ = false; // Invalid
      } else if (ffType === 'JK') {
        if (input1 && !input2) nextQ = true;
        else if (!input1 && input2) nextQ = false;
        else if (input1 && input2) nextQ = !state.Q;
      } else if (ffType === 'D') {
        nextQ = input1;
      } else if (ffType === 'T') {
        if (input1) nextQ = !state.Q;
      }
      setState({ Q: nextQ, Qbar: !nextQ });
    }

    prevClockRef.current = clock;

    // Record history
    setHistory(prev => {
      const newHist = [...prev, { t: timeRef.current++, clk: clock, i1: input1, i2: input2, q: nextQ }];
      if (newHist.length > maxHistory) return newHist.slice(newHist.length - maxHistory);
      return newHist;
    });
  }, [clock, input1, input2]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoClock) {
      interval = setInterval(() => {
        setClock(c => !c);
      }, 500); // 1Hz (500ms toggle)
    }
    return () => clearInterval(interval);
  }, [autoClock]);

  // Reset state on type change
  useEffect(() => {
    setInput1(false);
    setInput2(false);
    setState({ Q: false, Qbar: true });
    setHistory([]);
    timeRef.current = 0;
  }, [ffType]);

  const getInput1Label = () => {
    if (ffType === 'SR') return 'S';
    if (ffType === 'JK') return 'J';
    if (ffType === 'D') return 'D';
    if (ffType === 'T') return 'T';
    return '';
  };
  const getInput2Label = () => {
    if (ffType === 'SR') return 'R';
    if (ffType === 'JK') return 'K';
    return null;
  };

  const getInternalImage = () => {
    // Detailed SVG block diagram for Flip-Flop internal structures
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg w-full overflow-hidden">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Internal Gate-Level Structure</h4>
        <div className="relative w-full max-w-[400px] h-[200px]">
          <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
            <defs>
              <g id="and-gate">
                <path d="M 0 0 L 15 0 A 15 15 0 0 1 15 30 L 0 30 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" className="text-white dark:text-slate-800" style={{stroke: '#6366f1'}} />
                <text x="12" y="19" fontSize="10" fontWeight="bold" fill="#4f46e5" className="dark:fill-indigo-400" textAnchor="middle">AND</text>
              </g>
              <g id="nand-gate">
                <path d="M 0 0 L 15 0 A 15 15 0 0 1 15 30 L 0 30 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" className="text-white dark:text-slate-800" style={{stroke: '#f59e0b'}} />
                <circle cx="33" cy="15" r="3" fill="white" stroke="#f59e0b" strokeWidth="2" className="dark:fill-slate-900" />
                <text x="12" y="19" fontSize="10" fontWeight="bold" fill="#d97706" className="dark:fill-amber-500" textAnchor="middle">NAND</text>
              </g>
              <g id="not-gate">
                <path d="M 0 0 L 20 10 L 0 20 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" className="text-white dark:text-slate-800" style={{stroke: '#64748b'}} />
                <circle cx="23" cy="10" r="3" fill="white" stroke="#64748b" strokeWidth="2" className="dark:fill-slate-900" />
              </g>
              <g id="edge-det">
                <rect x="0" y="0" width="30" height="20" rx="4" fill="currentColor" stroke="currentColor" strokeWidth="2" className="text-slate-100 dark:text-slate-800" style={{stroke: '#64748b'}} />
                <path d="M 10 15 L 15 5 L 20 15" fill="none" stroke="#64748b" strokeWidth="1.5" />
              </g>
            </defs>

            {/* Labels */}
            <text x="10" y="45" fontSize="12" fontFamily="monospace" fontWeight="bold" fill="currentColor" className="text-slate-600 dark:text-slate-400">{getInput1Label()}</text>
            <text x="10" y="105" fontSize="12" fontFamily="monospace" fontWeight="bold" fill="currentColor" className="text-slate-600 dark:text-slate-400">CLK</text>
            {getInput2Label() && <text x="10" y="165" fontSize="12" fontFamily="monospace" fontWeight="bold" fill="currentColor" className="text-slate-600 dark:text-slate-400">{getInput2Label()}</text>}

            <text x="380" y="65" fontSize="12" fontFamily="monospace" fontWeight="bold" fill="currentColor" className="text-slate-600 dark:text-slate-400">Q</text>
            <text x="380" y="145" fontSize="12" fontFamily="monospace" fontWeight="bold" fill="currentColor" className="text-slate-600 dark:text-slate-400">Q'</text>

            {/* Input Wires */}
            <path d={`M 30 40 L ${ffType === 'D' || ffType === 'T' ? '120' : '120'} 40`} stroke="#94a3b8" strokeWidth="2" fill="none" />
            <path d="M 40 100 L 70 100" stroke="#94a3b8" strokeWidth="2" fill="none" />
            {getInput2Label() && <path d="M 30 160 L 120 160" stroke="#94a3b8" strokeWidth="2" fill="none" />}

            {/* D-Flip Flop Inverter */}
            {ffType === 'D' && (
              <>
                <circle cx="70" cy="40" r="3" fill="#94a3b8" />
                <path d="M 70 40 L 70 150 L 80 150" stroke="#94a3b8" strokeWidth="2" fill="none" />
                <g transform="translate(80, 140)"><use href="#not-gate" /></g>
                <path d="M 106 150 L 120 150" stroke="#94a3b8" strokeWidth="2" fill="none" />
              </>
            )}

            {/* T-Flip Flop Feedback (Toggles when T=1) */}
            {ffType === 'T' && (
              <>
                {/* Q' to top AND */}
                <path d="M 320 140 L 340 140 L 340 190 L 100 190 L 100 25 L 120 25" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.6" strokeDasharray="4 2" />
                {/* Q to bottom AND */}
                <path d="M 320 60 L 360 60 L 360 195 L 90 195 L 90 175 L 120 175" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.6" strokeDasharray="4 2" />
              </>
            )}

            {/* JK-Flip Flop Feedback */}
            {ffType === 'JK' && (
              <>
                {/* Q' to top AND (J) */}
                <path d="M 320 140 L 340 140 L 340 190 L 100 190 L 100 25 L 120 25" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.6" strokeDasharray="4 2" />
                <circle cx="320" cy="140" r="3" fill="#94a3b8" />
                {/* Q to bottom AND (K) */}
                <path d="M 320 60 L 360 60 L 360 195 L 90 195 L 90 175 L 120 175" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.6" strokeDasharray="4 2" />
                <circle cx="320" cy="60" r="3" fill="#94a3b8" />
              </>
            )}

            {/* Clock Edge Detector */}
            <g transform="translate(70, 90)"><use href="#edge-det" /></g>
            <path d="M 100 100 L 110 100 L 110 50 L 120 50" stroke="#94a3b8" strokeWidth="2" fill="none" />
            <path d="M 110 100 L 110 150 L 120 150" stroke="#94a3b8" strokeWidth="2" fill="none" />
            <circle cx="110" cy="100" r="3" fill="#94a3b8" />

            {/* Pulse Steering AND Gates */}
            <g transform="translate(120, 30)"><use href="#and-gate" /></g>
            <g transform="translate(120, 140)"><use href="#and-gate" /></g>

            {/* Steering to Latch Wires */}
            <path d="M 150 45 L 180 45 L 180 60 L 220 60" stroke="#94a3b8" strokeWidth="2" fill="none" />
            <path d="M 150 155 L 180 155 L 180 140 L 220 140" stroke="#94a3b8" strokeWidth="2" fill="none" />

            {/* SR Latch (NAND based) */}
            <g transform="translate(220, 45)"><use href="#nand-gate" /></g>
            <g transform="translate(220, 125)"><use href="#nand-gate" /></g>

            {/* Latch Cross Coupling */}
            <path d="M 256 60 L 280 60 L 280 100 L 200 100 L 200 130 L 220 130" stroke="#94a3b8" strokeWidth="2" fill="none" />
            <path d="M 256 140 L 290 140 L 290 90 L 210 90 L 210 70 L 220 70" stroke="#94a3b8" strokeWidth="2" fill="none" />
            <circle cx="280" cy="60" r="3" fill="#94a3b8" />
            <circle cx="290" cy="140" r="3" fill="#94a3b8" />

            {/* Output Wires */}
            <path d="M 256 60 L 370 60" stroke="#94a3b8" strokeWidth="2" fill="none" />
            <path d="M 256 140 L 370 140" stroke="#94a3b8" strokeWidth="2" fill="none" />

          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {/* Left Column: Controls & Waveform */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Main interactive panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-6 shadow-sm">
          <div className="flex flex-wrap gap-2 mb-6">
            {['SR', 'JK', 'D', 'T'].map((type) => (
              <button
                key={type}
                onClick={() => setFfType(type as FlipFlopType)}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors border ${
                  ffType === type
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/40 dark:border-indigo-700 dark:text-indigo-300 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                {type} Flip-Flop
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* IO Controls */}
            <div className="flex flex-col gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
               <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-600 dark:text-slate-400">{getInput1Label()}</span>
                  <button onClick={() => setInput1(!input1)} className={`w-12 h-8 rounded border-2 font-bold font-mono transition-colors ${input1 ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-white border-slate-300 text-slate-500 dark:bg-slate-800 dark:border-slate-600'}`}>
                    {input1 ? '1' : '0'}
                  </button>
               </div>
               {getInput2Label() && (
                 <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-600 dark:text-slate-400">{getInput2Label()}</span>
                    <button onClick={() => setInput2(!input2)} className={`w-12 h-8 rounded border-2 font-bold font-mono transition-colors ${input2 ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-white border-slate-300 text-slate-500 dark:bg-slate-800 dark:border-slate-600'}`}>
                      {input2 ? '1' : '0'}
                    </button>
                 </div>
               )}
               <div className="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
               <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-500 flex items-center gap-1"><Clock className="w-3 h-3"/> CLK</span>
                  <div className="flex gap-2">
                    <button onClick={() => setAutoClock(!autoClock)} className={`px-2 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1 ${autoClock ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                      {autoClock ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />} Auto
                    </button>
                    <button onClick={() => setClock(!clock)} disabled={autoClock} className={`w-12 h-8 rounded border-2 font-bold font-mono transition-colors ${clock ? 'bg-amber-100 border-amber-500 text-amber-700' : 'bg-white border-slate-300 text-slate-500 dark:bg-slate-800 dark:border-slate-600'} disabled:opacity-50`}>
                      {clock ? '1' : '0'}
                    </button>
                  </div>
               </div>
            </div>

            {/* Block Diagram & Output */}
            <div className="flex items-center justify-center p-4">
              <div className="relative w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-400 rounded-lg flex flex-col items-center justify-center">
                <span className="font-bold text-indigo-800 dark:text-indigo-300 text-xl">{ffType} FF</span>
                <span className="text-[10px] text-indigo-500">(Edge-Triggered)</span>
                
                {/* Pins */}
                <div className="absolute -left-4 top-4 text-xs font-mono font-bold">{getInput1Label()}</div>
                <div className="absolute -left-3 top-6 w-3 h-0.5 bg-slate-400"></div>
                
                {getInput2Label() && (
                  <>
                    <div className="absolute -left-4 bottom-4 text-xs font-mono font-bold">{getInput2Label()}</div>
                    <div className="absolute -left-3 bottom-6 w-3 h-0.5 bg-slate-400"></div>
                  </>
                )}
                
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex items-center">
                  <span className="text-[10px] font-mono font-bold mr-1">CLK</span>
                  <div className="w-3 h-0.5 bg-slate-400 relative">
                     {/* Edge trigger triangle */}
                     <div className="absolute right-0 -top-1.5 w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-slate-400 border-b-[4px] border-b-transparent"></div>
                  </div>
                </div>

                <div className="absolute -right-8 top-4 flex items-center">
                  <div className="w-3 h-0.5 bg-slate-400"></div>
                  <div className={`ml-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${state.Q ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-slate-100 border-slate-300 text-slate-500 dark:bg-slate-800 dark:border-slate-600'}`}>{state.Q ? '1' : '0'}</div>
                  <span className="ml-1 text-xs font-mono font-bold">Q</span>
                </div>

                <div className="absolute -right-8 bottom-4 flex items-center">
                  <div className="w-3 h-0.5 bg-slate-400"></div>
                  <div className={`ml-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${state.Qbar ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-slate-100 border-slate-300 text-slate-500 dark:bg-slate-800 dark:border-slate-600'}`}>{state.Qbar ? '1' : '0'}</div>
                  <span className="ml-1 text-xs font-mono font-bold">Q'</span>
                </div>
              </div>
            </div>
          </div>

          {/* Internal Structure view */}
          {getInternalImage()}

        </div>

        {/* Waveform Visualization */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 overflow-hidden">
          <h3 className="text-sm font-semibold mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" /> Timing Diagram (Waveforms)
          </h3>
          <div className="relative border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 overflow-hidden flex flex-col">
            <div ref={scrollRef} className="overflow-x-auto custom-scrollbar pb-2 scroll-smooth pl-[80px]">
              <div className="h-48 p-2 relative" style={{ minWidth: '600px', width: `${Math.max(600, history.length * 30)}px` }}>
                <svg width="100%" height="100%" className="overflow-visible">
                  {/* Grid */}
                  {Array.from({ length: Math.max(20, history.length) }).map((_, i) => (
                    <line key={i} x1={i * 30} y1="0" x2={i * 30} y2="100%" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" strokeDasharray="4 4" />
                  ))}
                  
                  {/* CLK */}
                  <g transform="translate(0, 20)">
                    <path 
                      d={history.map((h, i) => {
                        const prevClk = i > 0 ? history[i-1].clk : h.clk;
                        const x1 = i * 30;
                        const x2 = (i + 1) * 30;
                        const y1 = prevClk ? 0 : 15;
                        const y2 = h.clk ? 0 : 15;
                        return y1 !== y2 ? `M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2}` : `M ${x1} ${y2} L ${x2} ${y2}`;
                      }).join(' ')}
                      fill="none" stroke="#f59e0b" strokeWidth="1.5" 
                    />
                    {/* Highlight positive edges since it's positive edge triggered */}
                    {history.map((h, i) => {
                      if (i === 0) return null;
                      const prevClk = history[i-1].clk;
                      if (!prevClk && h.clk) {
                        return <polygon key={`edge-${i}`} points={`${i*30},0 ${i*30 - 4},4 ${i*30 + 4},4`} fill="#ef4444" />;
                      }
                      return null;
                    })}
                  </g>

                  {/* Input 1 */}
                  <g transform="translate(0, 60)">
                    <path 
                      d={history.map((h, i) => {
                        const prevVal = i > 0 ? history[i-1].i1 : h.i1;
                        const x1 = i * 30;
                        const x2 = (i + 1) * 30;
                        const y1 = prevVal ? 0 : 15;
                        const y2 = h.i1 ? 0 : 15;
                        return y1 !== y2 ? `M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2}` : `M ${x1} ${y2} L ${x2} ${y2}`;
                      }).join(' ')}
                      fill="none" stroke="#3b82f6" strokeWidth="1.5" 
                    />
                  </g>

                  {/* Input 2 */}
                  {getInput2Label() && (
                    <g transform="translate(0, 100)">
                      <path 
                        d={history.map((h, i) => {
                          const prevVal = i > 0 ? history[i-1].i2 : h.i2;
                          const x1 = i * 30;
                          const x2 = (i + 1) * 30;
                          const y1 = prevVal ? 0 : 15;
                          const y2 = h.i2 ? 0 : 15;
                          return y1 !== y2 ? `M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2}` : `M ${x1} ${y2} L ${x2} ${y2}`;
                        }).join(' ')}
                        fill="none" stroke="#6366f1" strokeWidth="1.5" 
                      />
                    </g>
                  )}

                  {/* Output Q */}
                  <g transform={`translate(0, ${getInput2Label() ? 140 : 100})`}>
                    <path 
                      d={history.map((h, i) => {
                        const prevQ = i > 0 ? history[i-1].q : h.q;
                        const x1 = i * 30;
                        const x2 = (i + 1) * 30;
                        const y1 = prevQ ? 0 : 15;
                        const y2 = h.q ? 0 : 15;
                        return y1 !== y2 ? `M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2}` : `M ${x1} ${y2} L ${x2} ${y2}`;
                      }).join(' ')}
                      fill="none" stroke="#10b981" strokeWidth="2" 
                    />
                  </g>
                </svg>
              </div>
            </div>
            
            {/* Fixed Labels Overlay */}
            <div className="absolute left-0 top-0 bottom-0 w-[70px] bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm border-r border-slate-200 dark:border-slate-800 z-10 pointer-events-none flex flex-col justify-start">
               <div className="absolute top-[24px] left-4 flex items-center gap-2">
                 <span className="text-[12px] text-amber-500 font-mono font-bold">CLK</span>
               </div>
               <div className="absolute top-[64px] left-4 flex items-center gap-2">
                 <span className="text-[12px] text-blue-500 font-mono font-bold">{getInput1Label()}</span>
               </div>
               {getInput2Label() && (
                 <div className="absolute top-[104px] left-4 flex items-center gap-2">
                   <span className="text-[12px] text-indigo-500 font-mono font-bold">{getInput2Label()}</span>
                 </div>
               )}
               <div className={`absolute left-4 flex items-center gap-2 ${getInput2Label() ? 'top-[144px]' : 'top-[104px]'}`}>
                 <span className="text-[12px] text-emerald-500 font-mono font-bold">Q</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Tables */}
      <div className="space-y-6">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-2 text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
            <Info className="w-4 h-4" /> Description
          </h3>
          <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed mb-2">
            {ffType === 'SR' && "The Set-Reset (SR) flip-flop is a basic memory element. It suffers from an invalid state when S=1 and R=1 simultaneously."}
            {ffType === 'JK' && "The JK flip-flop resolves the SR flip-flop's invalid state by adding feedback, causing it to toggle when J=1 and K=1. This can cause a 'race around condition' in level-triggered versions, solved by edge-triggering or master-slave configurations."}
            {ffType === 'D' && "The Data (D) flip-flop ensures S and R are never both 1 by using an inverter. It transfers the input Data (D) to the output (Q) on the clock edge. Widely used as a basic memory register."}
            {ffType === 'T' && "The Toggle (T) flip-flop changes state (toggles) on every clock edge when T=1. It holds state when T=0. Widely used in counters and frequency dividers."}
          </p>
        </div>

        {/* Truth Table */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3 text-slate-800 dark:text-slate-200">Truth Table</h3>
          <div className="overflow-hidden rounded border border-slate-200 dark:border-slate-700 mb-4">
            <table className="w-full text-xs text-left text-slate-700 dark:text-slate-300 font-mono">
              <thead className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-2">CLK</th>
                  <th className="p-2">{getInput1Label()}</th>
                  {getInput2Label() && <th className="p-2">{getInput2Label()}</th>}
                  <th className="p-2">Q(t+1)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {ffType === 'SR' && (
                  <>
                    <tr><td className="p-2">↑</td><td className="p-2">0</td><td className="p-2">0</td><td className="p-2">Memory</td></tr>
                    <tr><td className="p-2">↑</td><td className="p-2">0</td><td className="p-2">1</td><td className="p-2">0</td></tr>
                    <tr><td className="p-2">↑</td><td className="p-2">1</td><td className="p-2">0</td><td className="p-2">1</td></tr>
                    <tr><td className="p-2">↑</td><td className="p-2">1</td><td className="p-2">1</td><td className="p-2 text-red-500">Invalid</td></tr>
                  </>
                )}
                {ffType === 'JK' && (
                  <>
                    <tr><td className="p-2">↑</td><td className="p-2">0</td><td className="p-2">0</td><td className="p-2">Memory</td></tr>
                    <tr><td className="p-2">↑</td><td className="p-2">0</td><td className="p-2">1</td><td className="p-2">0</td></tr>
                    <tr><td className="p-2">↑</td><td className="p-2">1</td><td className="p-2">0</td><td className="p-2">1</td></tr>
                    <tr><td className="p-2">↑</td><td className="p-2">1</td><td className="p-2">1</td><td className="p-2 text-amber-500">Toggle</td></tr>
                  </>
                )}
                {ffType === 'D' && (
                  <>
                    <tr><td className="p-2">0</td><td className="p-2">X</td><td className="p-2">Memory</td></tr>
                    <tr><td className="p-2">↑</td><td className="p-2">0</td><td className="p-2">0</td></tr>
                    <tr><td className="p-2">↑</td><td className="p-2">1</td><td className="p-2">1</td></tr>
                  </>
                )}
                {ffType === 'T' && (
                  <>
                    <tr><td className="p-2">0</td><td className="p-2">X</td><td className="p-2">Memory</td></tr>
                    <tr><td className="p-2">↑</td><td className="p-2">0</td><td className="p-2">Memory</td></tr>
                    <tr><td className="p-2">↑</td><td className="p-2">1</td><td className="p-2 text-amber-500">Toggle</td></tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
          
          <h3 className="text-sm font-semibold mb-3 text-slate-800 dark:text-slate-200">Excitation Table</h3>
          <div className="overflow-hidden rounded border border-slate-200 dark:border-slate-700">
            <table className="w-full text-xs text-left text-slate-700 dark:text-slate-300 font-mono">
              <thead className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-2">Q(t)</th>
                  <th className="p-2">Q(t+1)</th>
                  <th className="p-2">{getInput1Label()}</th>
                  {getInput2Label() && <th className="p-2">{getInput2Label()}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {ffType === 'SR' && (
                  <>
                    <tr><td className="p-2">0</td><td className="p-2">0</td><td className="p-2">0</td><td className="p-2">X</td></tr>
                    <tr><td className="p-2">0</td><td className="p-2">1</td><td className="p-2">1</td><td className="p-2">0</td></tr>
                    <tr><td className="p-2">1</td><td className="p-2">0</td><td className="p-2">0</td><td className="p-2">1</td></tr>
                    <tr><td className="p-2">1</td><td className="p-2">1</td><td className="p-2">X</td><td className="p-2">0</td></tr>
                  </>
                )}
                {ffType === 'JK' && (
                  <>
                    <tr><td className="p-2">0</td><td className="p-2">0</td><td className="p-2">0</td><td className="p-2">X</td></tr>
                    <tr><td className="p-2">0</td><td className="p-2">1</td><td className="p-2">1</td><td className="p-2">X</td></tr>
                    <tr><td className="p-2">1</td><td className="p-2">0</td><td className="p-2">X</td><td className="p-2">1</td></tr>
                    <tr><td className="p-2">1</td><td className="p-2">1</td><td className="p-2">X</td><td className="p-2">0</td></tr>
                  </>
                )}
                {ffType === 'D' && (
                  <>
                    <tr><td className="p-2">0</td><td className="p-2">0</td><td className="p-2">0</td></tr>
                    <tr><td className="p-2">0</td><td className="p-2">1</td><td className="p-2">1</td></tr>
                    <tr><td className="p-2">1</td><td className="p-2">0</td><td className="p-2">0</td></tr>
                    <tr><td className="p-2">1</td><td className="p-2">1</td><td className="p-2">1</td></tr>
                  </>
                )}
                {ffType === 'T' && (
                  <>
                    <tr><td className="p-2">0</td><td className="p-2">0</td><td className="p-2">0</td></tr>
                    <tr><td className="p-2">0</td><td className="p-2">1</td><td className="p-2">1</td></tr>
                    <tr><td className="p-2">1</td><td className="p-2">0</td><td className="p-2">1</td></tr>
                    <tr><td className="p-2">1</td><td className="p-2">1</td><td className="p-2">0</td></tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

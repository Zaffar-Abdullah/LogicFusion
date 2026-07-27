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
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const timeRef = useRef(0);
  const maxHistory = 100;
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const index = Math.floor(x / 30);
    if (index >= 0 && index < history.length) {
      setHoverIndex(index);
    } else {
      setHoverIndex(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

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
    const wireProps = (active: boolean) => ({
      fill: "none",
      stroke: active ? "#ef4444" : "#64748b",
      strokeWidth: active ? 3 : 2,
      style: { filter: active ? 'drop-shadow(0 0 3px rgba(239, 68, 68, 0.6))' : 'none' },
      className: "transition-all duration-300 ease-in-out"
    });
    
    const dotProps = (active: boolean) => ({
      fill: active ? "#ef4444" : "#64748b",
      style: { filter: active ? 'drop-shadow(0 0 3px rgba(239, 68, 68, 0.6))' : 'none' },
      className: "transition-all duration-300 ease-in-out"
    });

    const signalLabelClass = "text-sm font-bold fill-slate-800 dark:fill-slate-200 font-mono";

    // Detailed SVG block diagram for Flip-Flop internal structures
    if (ffType === 'D' || ffType === 'SR') {
      const isD = ffType === 'D';
      const topIn = input1;
      const botIn = isD ? !input1 : input2;
      const clkVal = clock;
      const qVal = state.Q;
      const qbarVal = state.Qbar;
      
      const n1Val = !(topIn && clkVal);
      const n2Val = !(botIn && clkVal);

      return (
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg w-full overflow-hidden shadow-inner relative">
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 z-10 relative bg-slate-50 dark:bg-slate-950 px-2 rounded">Logic Gate View</h4>
          <div className="relative w-full max-w-[500px] h-[300px] z-10">
            <svg width="100%" height="100%" viewBox="0 0 500 300" preserveAspectRatio="xMidYMid meet">
              <defs>
                <g id="t-nand-gate">
                  <path d="M 0 0 L 20 0 A 20 20 0 0 1 20 40 L 0 40 Z" fill="#bbf7d0" stroke="#15803d" strokeWidth="2" className="dark:fill-green-900/40 dark:stroke-green-600" />
                  <circle cx="44" cy="20" r="4" fill="white" stroke="#15803d" strokeWidth="2" className="dark:fill-slate-950 dark:stroke-green-600" />
                </g>
                <g id="t-not-gate">
                  <path d="M 0 0 L 20 15 L 0 30 Z" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="2" className="dark:fill-blue-900/40 dark:stroke-blue-600" />
                  <circle cx="26" cy="15" r="4" fill="white" stroke="#1d4ed8" strokeWidth="2" className="dark:fill-slate-950 dark:stroke-blue-600" />
                </g>
              </defs>

              {/* Background regions */}
              <rect x="240" y="35" width="160" height="220" fill="none" stroke="#eab308" strokeWidth="1.5" strokeDasharray="4 4" rx="8" className="dark:stroke-yellow-600/50" />
              <rect x="240" y="35" width="160" height="220" fill="#fef08a" fillOpacity="0.05" stroke="none" rx="8" className="dark:fill-yellow-900/10" />
              <rect x="280" y="27" width="80" height="16" fill="#fef08a" rx="4" className="dark:fill-yellow-900" />
              <text x="320" y="38" textAnchor="middle" className="text-[10px] font-bold fill-yellow-800 dark:fill-yellow-400 font-mono tracking-wider">NAND Latch</text>

              {/* Input labels */}
              <text x="15" y="85" className={signalLabelClass}>{isD ? 'D' : 'S'}</text>
              <text x="10" y="155" className={signalLabelClass}>EN</text>
              <text x="10" y="170" className="text-[10px] font-bold fill-slate-500 font-mono">(CLK)</text>
              {!isD && <text x="15" y="210" className={signalLabelClass}>R</text>}

              {/* Wires */}
              <path d="M 40 80 L 150 80" {...wireProps(topIn)} />
              
              {isD ? (
                <>
                  <path d="M 70 80 L 70 205 L 85 205" {...wireProps(topIn)} />
                  <circle cx="70" cy="80" r="3" {...dotProps(topIn)} />
                  <use href="#t-not-gate" x="85" y="190" />
                  <path d="M 115 205 L 150 205" {...wireProps(botIn)} />
                </>
              ) : (
                <path d="M 40 205 L 150 205" {...wireProps(botIn)} />
              )}

              <path d="M 40 150 L 100 150" {...wireProps(clkVal)} />
              <path d="M 100 150 L 100 100 L 150 100" {...wireProps(clkVal)} />
              <circle cx="100" cy="150" r="3" {...dotProps(clkVal)} />
              <path d="M 100 150 L 100 185 L 150 185" {...wireProps(clkVal)} />

              <use href="#t-nand-gate" x="150" y="70" />
              <use href="#t-nand-gate" x="150" y="175" />

              <path d="M 194 90 L 230 90 L 230 80 L 280 80" {...wireProps(n1Val)} />
              <text x="210" y="70" className="text-[10px] font-bold fill-slate-500 dark:fill-slate-400 font-mono">SET'</text>
              <path d="M 194 195 L 230 195 L 230 205 L 280 205" {...wireProps(n2Val)} />
              <text x="210" y="220" className="text-[10px] font-bold fill-slate-500 dark:fill-slate-400 font-mono">RESET'</text>

              <use href="#t-nand-gate" x="280" y="70" />
              <use href="#t-nand-gate" x="280" y="175" />

              <path d="M 324 90 L 350 90 L 350 140 L 250 160 L 250 185 L 280 185" {...wireProps(qVal)} />
              <circle cx="350" cy="90" r="3" {...dotProps(qVal)} />
              
              <path d="M 324 195 L 360 195 L 360 150 L 260 130 L 260 100 L 280 100" {...wireProps(qbarVal)} />
              <circle cx="360" cy="195" r="3" {...dotProps(qbarVal)} />

              <path d="M 324 90 L 460 90" {...wireProps(qVal)} />
              <text x="470" y="95" className={signalLabelClass}>Q</text>
              <path d="M 324 195 L 460 195" {...wireProps(qbarVal)} />
              <text x="470" y="200" className={signalLabelClass}>Q̅</text>

            </svg>
          </div>
        </div>
      );
    }
    
    if (ffType === 'T' || ffType === 'JK') {
      const isT = ffType === 'T';
      const jVal = input1;
      const kVal = isT ? input1 : input2;
      const clkVal = clock;
      const qVal = state.Q;
      const qbarVal = state.Qbar;
      
      const n1Val = !(jVal && clkVal && qbarVal);
      const n2Val = !(kVal && clkVal && qVal);

      return (
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg w-full overflow-hidden shadow-inner relative">
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 z-10 relative bg-slate-50 dark:bg-slate-950 px-2 rounded">Logic Gate View</h4>
          <div className="relative w-full max-w-[500px] h-[300px] z-10">
            <svg width="100%" height="100%" viewBox="0 0 500 300" preserveAspectRatio="xMidYMid meet">
              <defs>
                <g id="t-nand-gate">
                  <path d="M 0 0 L 20 0 A 20 20 0 0 1 20 40 L 0 40 Z" fill="#bbf7d0" stroke="#15803d" strokeWidth="2" className="dark:fill-green-900/40 dark:stroke-green-600" />
                  <circle cx="44" cy="20" r="4" fill="white" stroke="#15803d" strokeWidth="2" className="dark:fill-slate-950 dark:stroke-green-600" />
                </g>
              </defs>

              {/* Background regions */}
              <rect x="240" y="35" width="160" height="220" fill="none" stroke="#eab308" strokeWidth="1.5" strokeDasharray="4 4" rx="8" className="dark:stroke-yellow-600/50" />
              <rect x="240" y="35" width="160" height="220" fill="#fef08a" fillOpacity="0.05" stroke="none" rx="8" className="dark:fill-yellow-900/10" />
              <rect x="280" y="27" width="80" height="16" fill="#fef08a" rx="4" className="dark:fill-yellow-900" />
              <text x="320" y="38" textAnchor="middle" className="text-[10px] font-bold fill-yellow-800 dark:fill-yellow-400 font-mono tracking-wider">NAND Latch</text>
              
              <rect x="140" y="35" width="80" height="220" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="4 4" rx="8" className="dark:stroke-indigo-600/50" />
              <rect x="140" y="35" width="80" height="220" fill="#e0e7ff" fillOpacity="0.05" stroke="none" rx="8" className="dark:fill-indigo-900/10" />
              <rect x="155" y="27" width="50" height="16" fill="#e0e7ff" rx="4" className="dark:fill-indigo-900" />
              <text x="180" y="38" textAnchor="middle" className="text-[10px] font-bold fill-indigo-800 dark:fill-indigo-400 font-mono tracking-wider">Steering</text>

              <text x="15" y="85" className={signalLabelClass}>{isT ? 'T' : 'J'}</text>
              {!isT && <text x="15" y="225" className={signalLabelClass}>K</text>}

              <path d="M 40 80 L 150 80" {...wireProps(jVal)} />
              {isT ? (
                <>
                  <path d="M 70 80 L 70 220 L 150 220" {...wireProps(jVal)} />
                  <circle cx="70" cy="80" r="3" {...dotProps(jVal)} />
                </>
              ) : (
                <path d="M 40 220 L 150 220" {...wireProps(kVal)} />
              )}
              
              <text x="10" y="155" className={signalLabelClass}>Clk</text>
              <path d="M 40 150 L 100 150" {...wireProps(clkVal)} />
              <path d="M 100 150 L 100 90 L 150 90" {...wireProps(clkVal)} />
              <circle cx="100" cy="150" r="3" {...dotProps(clkVal)} />
              <path d="M 100 150 L 100 210 L 150 210" {...wireProps(clkVal)} />

              <path d="M 410 210 L 430 210 L 430 45 L 120 45 L 120 100 L 150 100" {...wireProps(qbarVal)} />
              <circle cx="410" cy="210" r="3" {...dotProps(qbarVal)} />
              <polygon points="128,96 128,104 120,100" {...dotProps(qbarVal)} />

              <path d="M 410 90 L 420 90 L 420 245 L 130 245 L 130 200 L 150 200" {...wireProps(qVal)} />
              <circle cx="410" cy="90" r="3" {...dotProps(qVal)} />
              <polygon points="138,196 138,204 130,200" {...dotProps(qVal)} />

              <use href="#t-nand-gate" x="150" y="70" />
              <use href="#t-nand-gate" x="150" y="190" />

              <path d="M 194 90 L 230 90 L 230 80 L 280 80" {...wireProps(n1Val)} />
              <path d="M 194 210 L 230 210 L 230 220 L 280 220" {...wireProps(n2Val)} />

              <use href="#t-nand-gate" x="280" y="70" />
              <use href="#t-nand-gate" x="280" y="190" />

              <path d="M 324 90 L 350 90 L 350 140 L 250 160 L 250 200 L 280 200" {...wireProps(qVal)} />
              <circle cx="350" cy="90" r="3" {...dotProps(qVal)} />
              
              <path d="M 324 210 L 360 210 L 360 160 L 260 140 L 260 100 L 280 100" {...wireProps(qbarVal)} />
              <circle cx="360" cy="210" r="3" {...dotProps(qbarVal)} />

              <path d="M 324 90 L 460 90" {...wireProps(qVal)} />
              <text x="470" y="95" className={signalLabelClass}>Q</text>

              <path d="M 324 210 L 460 210" {...wireProps(qbarVal)} />
              <text x="470" y="215" className={signalLabelClass}>Q̅</text>

            </svg>
          </div>
        </div>
      );
    }

    return null;
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
                <svg width="100%" height="100%" className="overflow-visible" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
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

                  {/* Hover Overlay Tooltip */}
                  {hoverIndex !== null && history[hoverIndex] && (
                    <g transform={`translate(${hoverIndex * 30}, 0)`}>
                      <line x1={15} y1={0} x2={15} y2="100%" stroke="#94a3b8" strokeDasharray="4 2" strokeWidth={1} />
                      <g transform={`translate(${hoverIndex * 30 + 100 > Math.max(800, history.length * 30) ? -85 : 20}, 10)`}>
                        <rect x={0} y={0} width={80} height={getInput2Label() ? 100 : 85} fill="white" className="dark:fill-slate-800 dark:stroke-slate-700" rx={4} stroke="#cbd5e1" strokeWidth={1} filter="drop-shadow(0 4px 3px rgb(0 0 0 / 0.07))" />
                        <text x={8} y={16} className="text-[10px] font-bold fill-slate-600 dark:fill-slate-300">t = {history[hoverIndex].t}</text>
                        <text x={8} y={32} className="text-[10px] font-bold fill-amber-600 dark:fill-amber-400">CLK: {history[hoverIndex].clk ? '1' : '0'}</text>
                        <text x={8} y={48} className="text-[10px] font-bold fill-blue-600 dark:fill-blue-400">{getInput1Label()}: {history[hoverIndex].i1 ? '1' : '0'}</text>
                        {getInput2Label() && <text x={8} y={64} className="text-[10px] font-bold fill-indigo-600 dark:fill-indigo-400">{getInput2Label()}: {history[hoverIndex].i2 ? '1' : '0'}</text>}
                        <text x={8} y={getInput2Label() ? 80 : 64} className="text-[10px] font-bold fill-emerald-600 dark:fill-emerald-400">Q:  {history[hoverIndex].q ? '1' : '0'}</text>
                        <text x={8} y={getInput2Label() ? 96 : 80} className="text-[10px] font-bold fill-emerald-600 dark:fill-emerald-400">Q̅:  {!history[hoverIndex].q ? '1' : '0'}</text>
                      </g>
                    </g>
                  )}
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

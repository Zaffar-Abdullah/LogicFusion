import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, RefreshCcw, Info, Settings, Clock, Zap, Activity } from 'lucide-react';
import { motion } from 'motion/react';

type FlipFlopType = 'SR' | 'JK' | 'D' | 'T';

interface FFState {
  Q: boolean;
  Qbar: boolean;
}

export default function SequentialLogicLab() {
  const [ffType, setFfType] = useState<FlipFlopType>('SR');
  
  // Inputs
  const [input1, setInput1] = useState(false); // S, J, D, T
  const [input2, setInput2] = useState(false); // R, K
  
  // State
  const [state, setState] = useState<FFState>({ Q: false, Qbar: true });
  const [prevState, setPrevState] = useState<FFState>({ Q: false, Qbar: true });
  
  // Clock
  const [clock, setClock] = useState(false);
  const [autoClock, setAutoClock] = useState(false);
  const [clockFreq, setClockFreq] = useState(1); // Hz
  
  // History for timing diagram
  const [history, setHistory] = useState<{t: number, clk: boolean, i1: boolean, i2: boolean, q: boolean}[]>([]);
  const timeRef = useRef(0);
  const maxHistory = 100;
  
  const handleClockEdge = (isRising: boolean) => {
    if (!isRising) return; // Positive edge triggered
    
    setPrevState(state);
    
    let nextQ = state.Q;
    
    if (ffType === 'SR') {
      if (input1 && !input2) nextQ = true;
      else if (!input1 && input2) nextQ = false;
      else if (input1 && input2) nextQ = false; // Invalid, reset to 0 conventionally or toggle randomly. Let's force to 0.
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
  };
  
  useEffect(() => {
    let interval: any;
    if (autoClock) {
      interval = setInterval(() => {
        setClock(c => {
          const nextC = !c;
          if (nextC) handleClockEdge(true);
          return nextC;
        });
      }, 1000 / (clockFreq * 2));
    }
    return () => clearInterval(interval);
  }, [autoClock, clockFreq, input1, input2, state, ffType]);
  
  useEffect(() => {
    const record = {
      t: timeRef.current++,
      clk: clock,
      i1: input1,
      i2: input2,
      q: state.Q
    };
    setHistory(prev => {
      const next = [...prev, record];
      if (next.length > maxHistory) return next.slice(next.length - maxHistory);
      return next;
    });
  }, [clock, input1, input2, state.Q]);

  const reset = () => {
    setState({ Q: false, Qbar: true });
    setPrevState({ Q: false, Qbar: true });
    setHistory([]);
    timeRef.current = 0;
    setClock(false);
  };

  const getInput1Label = () => {
    if (ffType === 'SR') return 'S';
    if (ffType === 'JK') return 'J';
    if (ffType === 'D') return 'D';
    return 'T';
  };
  const getInput2Label = () => {
    if (ffType === 'SR') return 'R';
    if (ffType === 'JK') return 'K';
    return null;
  };
  
  const getEquation = () => {
    if (ffType === 'SR') return "Q(t+1) = S + R'Q";
    if (ffType === 'JK') return "Q(t+1) = JQ' + K'Q";
    if (ffType === 'D') return "Q(t+1) = D";
    return "Q(t+1) = T ⊕ Q";
  };

  const getExplanation = () => {
    if (ffType === 'SR') return "Set-Reset Flip-Flop is the fundamental memory element. S=1 sets Q to 1, R=1 resets Q to 0. S=1,R=1 is invalid.";
    if (ffType === 'JK') return "JK Flip-Flop improves upon SR by defining the J=1,K=1 state to toggle the output, avoiding the invalid state.";
    if (ffType === 'D') return "Data Flip-Flop passes the D input to Q on the clock edge. It's widely used for registers and delay elements.";
    return "Toggle Flip-Flop toggles the output state when T=1 on the clock edge. Used extensively in counters.";
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Settings className="w-5 h-5" />
          <h2 className="font-bold text-lg">Sequential Logic Lab</h2>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-md border border-slate-200 dark:border-slate-800">
          {['SR', 'JK', 'D', 'T'].map(type => (
            <button
              key={type}
              onClick={() => { setFfType(type as FlipFlopType); reset(); }}
              className={`px-4 py-1.5 text-xs font-medium rounded transition-colors ${
                ffType === type ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {type} Flip-Flop
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-xl">
            <h3 className="text-sm font-semibold mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Inputs
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700 dark:text-slate-300 font-mono text-sm">{getInput1Label()} Input</span>
                <button 
                  onClick={() => setInput1(!input1)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${input1 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${input1 ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              
              {getInput2Label() && (
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 font-mono text-sm">{getInput2Label()} Input</span>
                  <button 
                    onClick={() => setInput2(!input2)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${input2 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${input2 ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-xl">
            <h3 className="text-sm font-semibold mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" /> Clock System
            </h3>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</span>
              <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${clock ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                {clock ? 'HIGH' : 'LOW'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button 
                onClick={() => setAutoClock(!autoClock)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                  autoClock ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50'
                }`}
              >
                {autoClock ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                {autoClock ? 'Pause' : 'Auto Clock'}
              </button>
              <button 
                onClick={() => {
                  setClock(true);
                  handleClockEdge(true);
                  setTimeout(() => setClock(false), 200);
                }}
                disabled={autoClock}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Manual Pulse
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Speed: {clockFreq} Hz</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="10" 
                step="0.5"
                value={clockFreq}
                onChange={e => setClockFreq(parseFloat(e.target.value))}
                disabled={autoClock}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600 disabled:opacity-50"
              />
            </div>
            
            <button 
              onClick={reset}
              className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Reset State
            </button>
          </div>
        </div>

        {/* Center Column: Simulation & Internals */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center relative min-h-[300px]">
            
            <div className="absolute top-4 left-4 flex gap-4 text-xs font-mono">
              <div className="flex flex-col">
                <span className="text-slate-400">Present State</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">Q = {prevState.Q ? '1' : '0'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400">Next State</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">Q = {state.Q ? '1' : '0'}</span>
              </div>
            </div>

            {/* Flip-Flop SVG Component */}
            <div className="relative w-48 h-48 bg-white dark:bg-slate-800 border-4 border-slate-300 dark:border-slate-600 rounded-lg shadow-lg flex flex-col items-center justify-center z-10">
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                {/* Internal wiring animation could go here */}
              </div>
              <span className="text-3xl font-black text-slate-800 dark:text-slate-200 tracking-wider">
                {ffType}-FF
              </span>
              
              {/* Inputs */}
              <div className="absolute -left-6 top-1/4 flex items-center">
                <div className="w-6 h-1 bg-slate-400 dark:bg-slate-500" />
                <span className="absolute -left-4 font-mono font-bold text-slate-600 dark:text-slate-400 text-sm -translate-y-1/2 top-1/2">{getInput1Label()}</span>
                <span className="absolute left-2 -top-5 font-mono text-xs font-bold text-indigo-600">{input1 ? '1' : '0'}</span>
              </div>
              
              <div className="absolute -left-6 top-1/2 flex items-center">
                <div className="w-6 h-1 bg-blue-400 dark:bg-blue-600 relative">
                  <motion.div 
                    initial={false}
                    animate={{ backgroundColor: clock ? '#3b82f6' : '#94a3b8' }}
                    className="absolute inset-0"
                  />
                </div>
                <div className="absolute left-6 w-3 h-3 border-t-2 border-r-2 border-blue-400 dark:border-blue-600 transform rotate-45 -translate-y-1/2 top-1/2" />
                <span className="absolute -left-6 font-mono font-bold text-blue-500 dark:text-blue-400 text-sm -translate-y-1/2 top-1/2">CLK</span>
              </div>

              {getInput2Label() && (
                <div className="absolute -left-6 top-3/4 flex items-center">
                  <div className="w-6 h-1 bg-slate-400 dark:bg-slate-500" />
                  <span className="absolute -left-4 font-mono font-bold text-slate-600 dark:text-slate-400 text-sm -translate-y-1/2 top-1/2">{getInput2Label()}</span>
                  <span className="absolute left-2 -top-5 font-mono text-xs font-bold text-indigo-600">{input2 ? '1' : '0'}</span>
                </div>
              )}

              {/* Outputs */}
              <div className="absolute -right-6 top-1/4 flex items-center">
                <div className="w-6 h-1 bg-emerald-400 dark:bg-emerald-600" />
                <span className="absolute -right-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm -translate-y-1/2 top-1/2">Q</span>
                <span className="absolute right-2 -top-5 font-mono text-xs font-bold text-emerald-600">{state.Q ? '1' : '0'}</span>
              </div>
              
              <div className="absolute -right-6 top-3/4 flex items-center">
                <div className="w-6 h-1 bg-emerald-400 dark:bg-emerald-600" />
                <div className="absolute left-6 w-2 h-2 rounded-full border-2 border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800 -translate-y-1/2 top-1/2 -ml-1" />
                <span className="absolute -right-6 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm -translate-y-1/2 top-1/2">Q'</span>
                <span className="absolute right-2 -top-5 font-mono text-xs font-bold text-emerald-600">{state.Qbar ? '1' : '0'}</span>
              </div>
            </div>

          </div>

          {/* Timing Diagram */}
          <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex-1">
            <h3 className="text-sm font-semibold mb-2 text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" /> Live Timing Diagram
            </h3>
            
            <div className="relative w-full h-32 overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded custom-scrollbar">
              <svg className="w-full h-full" preserveAspectRatio="none">
                {/* SVG definitions for waveforms */}
                <g transform="translate(0, 20)">
                  <text x="5" y="10" fontSize="10" fill="#94a3b8" fontFamily="monospace">CLK</text>
                  <polyline 
                    points={history.map((h, i) => `${i * 5},${h.clk ? 0 : 15} ${i * 5 + 4.9},${h.clk ? 0 : 15}`).join(' ')} 
                    fill="none" stroke="#3b82f6" strokeWidth="1.5" 
                  />
                </g>
                <g transform="translate(0, 50)">
                  <text x="5" y="10" fontSize="10" fill="#94a3b8" fontFamily="monospace">{getInput1Label()}</text>
                  <polyline 
                    points={history.map((h, i) => `${i * 5},${h.i1 ? 0 : 15} ${i * 5 + 4.9},${h.i1 ? 0 : 15}`).join(' ')} 
                    fill="none" stroke="#f59e0b" strokeWidth="1.5" 
                  />
                </g>
                {getInput2Label() && (
                  <g transform="translate(0, 80)">
                    <text x="5" y="10" fontSize="10" fill="#94a3b8" fontFamily="monospace">{getInput2Label()}</text>
                    <polyline 
                      points={history.map((h, i) => `${i * 5},${h.i2 ? 0 : 15} ${i * 5 + 4.9},${h.i2 ? 0 : 15}`).join(' ')} 
                      fill="none" stroke="#f59e0b" strokeWidth="1.5" 
                    />
                  </g>
                )}
                <g transform="translate(0, 110)">
                  <text x="5" y="10" fontSize="10" fill="#94a3b8" fontFamily="monospace">Q</text>
                  <polyline 
                    points={history.map((h, i) => `${i * 5},${h.q ? 0 : 15} ${i * 5 + 4.9},${h.q ? 0 : 15}`).join(' ')} 
                    fill="none" stroke="#10b981" strokeWidth="2" 
                  />
                </g>
              </svg>
            </div>
          </div>
          
        </div>

        {/* Right Column: Tables & Info */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-2 text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
              <Info className="w-4 h-4" /> Characteristics
            </h3>
            <div className="text-xs font-mono bg-white dark:bg-slate-900 p-2 rounded border border-indigo-100 dark:border-indigo-800/50 mb-3 text-center font-bold text-slate-700 dark:text-slate-300">
              {getEquation()}
            </div>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
              {getExplanation()}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 overflow-hidden">
             <h3 className="text-sm font-semibold mb-3 text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> Truth Table
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                  <tr>
                    {getInput1Label() && <th className="p-1.5 border-b border-slate-300 dark:border-slate-600">{getInput1Label()}</th>}
                    {getInput2Label() && <th className="p-1.5 border-b border-slate-300 dark:border-slate-600">{getInput2Label()}</th>}
                    <th className="p-1.5 border-b border-slate-300 dark:border-slate-600">Q(t+1)</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-slate-700 dark:text-slate-300">
                  {ffType === 'SR' && (
                    <>
                      <tr><td className="p-1.5">0</td><td className="p-1.5">0</td><td className="p-1.5">Q(t) (Hold)</td></tr>
                      <tr><td className="p-1.5">0</td><td className="p-1.5">1</td><td className="p-1.5">0 (Reset)</td></tr>
                      <tr><td className="p-1.5">1</td><td className="p-1.5">0</td><td className="p-1.5">1 (Set)</td></tr>
                      <tr><td className="p-1.5">1</td><td className="p-1.5">1</td><td className="p-1.5 text-red-500">Invalid</td></tr>
                    </>
                  )}
                  {ffType === 'JK' && (
                    <>
                      <tr><td className="p-1.5">0</td><td className="p-1.5">0</td><td className="p-1.5">Q(t) (Hold)</td></tr>
                      <tr><td className="p-1.5">0</td><td className="p-1.5">1</td><td className="p-1.5">0 (Reset)</td></tr>
                      <tr><td className="p-1.5">1</td><td className="p-1.5">0</td><td className="p-1.5">1 (Set)</td></tr>
                      <tr><td className="p-1.5">1</td><td className="p-1.5">1</td><td className="p-1.5">Q'(t) (Toggle)</td></tr>
                    </>
                  )}
                  {ffType === 'D' && (
                    <>
                      <tr><td className="p-1.5">0</td><td className="p-1.5">0</td></tr>
                      <tr><td className="p-1.5">1</td><td className="p-1.5">1</td></tr>
                    </>
                  )}
                  {ffType === 'T' && (
                    <>
                      <tr><td className="p-1.5">0</td><td className="p-1.5">Q(t) (Hold)</td></tr>
                      <tr><td className="p-1.5">1</td><td className="p-1.5">Q'(t) (Toggle)</td></tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 overflow-hidden mt-4">
             <h3 className="text-sm font-semibold mb-3 text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> Excitation Table
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                  <tr>
                    <th className="p-1.5 border-b border-slate-300 dark:border-slate-600">Q(t)</th>
                    <th className="p-1.5 border-b border-slate-300 dark:border-slate-600">Q(t+1)</th>
                    {getInput1Label() && <th className="p-1.5 border-b border-slate-300 dark:border-slate-600">{getInput1Label()}</th>}
                    {getInput2Label() && <th className="p-1.5 border-b border-slate-300 dark:border-slate-600">{getInput2Label()}</th>}
                  </tr>
                </thead>
                <tbody className="font-mono text-slate-700 dark:text-slate-300">
                  {ffType === 'SR' && (
                    <>
                      <tr><td className="p-1.5">0</td><td className="p-1.5">0</td><td className="p-1.5">0</td><td className="p-1.5">X</td></tr>
                      <tr><td className="p-1.5">0</td><td className="p-1.5">1</td><td className="p-1.5">1</td><td className="p-1.5">0</td></tr>
                      <tr><td className="p-1.5">1</td><td className="p-1.5">0</td><td className="p-1.5">0</td><td className="p-1.5">1</td></tr>
                      <tr><td className="p-1.5">1</td><td className="p-1.5">1</td><td className="p-1.5">X</td><td className="p-1.5">0</td></tr>
                    </>
                  )}
                  {ffType === 'JK' && (
                    <>
                      <tr><td className="p-1.5">0</td><td className="p-1.5">0</td><td className="p-1.5">0</td><td className="p-1.5">X</td></tr>
                      <tr><td className="p-1.5">0</td><td className="p-1.5">1</td><td className="p-1.5">1</td><td className="p-1.5">X</td></tr>
                      <tr><td className="p-1.5">1</td><td className="p-1.5">0</td><td className="p-1.5">X</td><td className="p-1.5">1</td></tr>
                      <tr><td className="p-1.5">1</td><td className="p-1.5">1</td><td className="p-1.5">X</td><td className="p-1.5">0</td></tr>
                    </>
                  )}
                  {ffType === 'D' && (
                    <>
                      <tr><td className="p-1.5">0</td><td className="p-1.5">0</td><td className="p-1.5">0</td></tr>
                      <tr><td className="p-1.5">0</td><td className="p-1.5">1</td><td className="p-1.5">1</td></tr>
                      <tr><td className="p-1.5">1</td><td className="p-1.5">0</td><td className="p-1.5">0</td></tr>
                      <tr><td className="p-1.5">1</td><td className="p-1.5">1</td><td className="p-1.5">1</td></tr>
                    </>
                  )}
                  {ffType === 'T' && (
                    <>
                      <tr><td className="p-1.5">0</td><td className="p-1.5">0</td><td className="p-1.5">0</td></tr>
                      <tr><td className="p-1.5">0</td><td className="p-1.5">1</td><td className="p-1.5">1</td></tr>
                      <tr><td className="p-1.5">1</td><td className="p-1.5">0</td><td className="p-1.5">1</td></tr>
                      <tr><td className="p-1.5">1</td><td className="p-1.5">1</td><td className="p-1.5">0</td></tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

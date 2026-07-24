import React, { useState, useEffect, useRef } from 'react';
import { ALUStep } from '../logic/binaryOperations';
import { Play, Pause, SkipBack, SkipForward, StepBack, StepForward } from 'lucide-react';

export default function ALUVisualizer({ steps, operation }: { steps: ALUStep[], operation: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: any;
    if (isPlaying && currentStep < steps.length - 1) {
      timer = setTimeout(() => setCurrentStep(c => c + 1), 1500);
    } else if (isPlaying && currentStep === steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length]);

  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [steps]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [currentStep]);

  if (!steps || steps.length === 0) return null;

  const step = steps[currentStep];
  const isBitwise = operation === "+" || operation === "-";

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden mt-6 shadow-sm">
      <div className="bg-slate-50 dark:bg-slate-950 p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          ALU Simulation Engine
        </h3>
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded p-1 border border-slate-200 dark:border-slate-800">
          <button onClick={() => setCurrentStep(0)} disabled={currentStep === 0} className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 transition-colors"><SkipBack className="w-4 h-4" /></button>
          <button onClick={() => setCurrentStep(c => Math.max(0, c - 1))} disabled={currentStep === 0} className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 transition-colors"><StepBack className="w-4 h-4" /></button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="p-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button onClick={() => setCurrentStep(c => Math.min(steps.length - 1, c + 1))} disabled={currentStep === steps.length - 1} className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 transition-colors"><StepForward className="w-4 h-4" /></button>
          <button onClick={() => setCurrentStep(steps.length - 1)} disabled={currentStep === steps.length - 1} className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 transition-colors"><SkipForward className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col items-center justify-center min-h-[320px]">
        {/* Visual Logic Board */}
        <div className="w-full h-[320px] relative border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950/50 shadow-inner flex items-center justify-center overflow-hidden">
          {isBitwise ? (
            <div className="relative w-[600px] h-[300px]">
              {/* SVG Wires */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 300">
                <defs>
                  <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#94a3b8" />
                  </marker>
                  <marker id="arrow-active" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#10b981" />
                  </marker>
                </defs>
                {/* A to XOR1 */}
                <path d="M 100 80 L 220 120" stroke={step.bitA ? '#10b981' : '#94a3b8'} strokeWidth="2" fill="none" markerEnd={step.bitA ? "url(#arrow-active)" : "url(#arrow)"} className={`transition-all duration-500 ${step.bitA ? "wire-flow" : ""}`} />
                {/* B to XOR1 */}
                <path d="M 100 160 L 220 130" stroke={step.bitB ? '#10b981' : '#94a3b8'} strokeWidth="2" fill="none" markerEnd={step.bitB ? "url(#arrow-active)" : "url(#arrow)"} className={`transition-all duration-500 ${step.bitB ? "wire-flow" : ""}`} />
                
                {/* Cin to XOR2 */}
                <path d="M 100 240 L 370 160" stroke={step.carryIn ? '#10b981' : '#94a3b8'} strokeWidth="2" fill="none" markerEnd={step.carryIn ? "url(#arrow-active)" : "url(#arrow)"} className={`transition-all duration-500 ${step.carryIn ? "wire-flow" : ""}`} />
                
                {/* XOR1 to XOR2 */}
                <path d="M 280 125 L 370 140" stroke={(step.bitA !== step.bitB) ? '#10b981' : '#94a3b8'} strokeWidth="2" fill="none" markerEnd={(step.bitA !== step.bitB) ? "url(#arrow-active)" : "url(#arrow)"} className={`transition-all duration-500 ${(step.bitA !== step.bitB) ? "wire-flow" : ""}`} />
                
                {/* XOR2 to SUM */}
                <path d="M 430 150 L 520 110" stroke={step.outBit ? '#10b981' : '#94a3b8'} strokeWidth="2" fill="none" markerEnd={step.outBit ? "url(#arrow-active)" : "url(#arrow)"} className={`transition-all duration-500 ${step.outBit ? "wire-flow" : ""}`} />

                {/* XOR1 to AND2 */}
                <path d="M 280 125 L 370 200" stroke={(step.bitA !== step.bitB) ? '#10b981' : '#94a3b8'} strokeWidth="2" fill="none" markerEnd={(step.bitA !== step.bitB) ? "url(#arrow-active)" : "url(#arrow)"} className={`transition-all duration-500 ${(step.bitA !== step.bitB) ? "wire-flow" : ""}`} />
                
                {/* Cin to AND2 */}
                <path d="M 100 240 L 370 215" stroke={step.carryIn ? '#10b981' : '#94a3b8'} strokeWidth="2" fill="none" markerEnd={step.carryIn ? "url(#arrow-active)" : "url(#arrow)"} className={`transition-all duration-500 ${step.carryIn ? "wire-flow" : ""}`} />
                
                {/* A to AND1 */}
                <path d="M 100 80 C 150 80, 250 260, 370 250" stroke={step.bitA ? '#10b981' : '#94a3b8'} strokeWidth="2" fill="none" markerEnd={step.bitA ? "url(#arrow-active)" : "url(#arrow)"} className={`transition-all duration-500 ${step.bitA ? "wire-flow" : ""}`} />
                {/* B to AND1 */}
                <path d="M 100 160 C 150 160, 250 265, 370 265" stroke={step.bitB ? '#10b981' : '#94a3b8'} strokeWidth="2" fill="none" markerEnd={step.bitB ? "url(#arrow-active)" : "url(#arrow)"} className={`transition-all duration-500 ${step.bitB ? "wire-flow" : ""}`} />

                {/* AND2 to OR */}
                <path d="M 430 207 L 460 207 L 460 225 L 490 225" stroke={((step.bitA !== step.bitB) && step.carryIn) ? '#10b981' : '#94a3b8'} strokeWidth="2" fill="none" markerEnd={((step.bitA !== step.bitB) && step.carryIn) ? "url(#arrow-active)" : "url(#arrow)"} className={`transition-all duration-500 ${((step.bitA !== step.bitB) && step.carryIn) ? "wire-flow" : ""}`} />
                
                {/* AND1 to OR */}
                <path d="M 430 257 L 460 257 L 460 240 L 490 240" stroke={(step.bitA && step.bitB) ? '#10b981' : '#94a3b8'} strokeWidth="2" fill="none" markerEnd={(step.bitA && step.bitB) ? "url(#arrow-active)" : "url(#arrow)"} className={`transition-all duration-500 ${(step.bitA && step.bitB) ? "wire-flow" : ""}`} />

                {/* OR to COUT */}
                <path d="M 550 232 L 570 232 L 570 270 L 520 270" stroke={step.carryOut ? '#10b981' : '#94a3b8'} strokeWidth="2" fill="none" markerEnd={step.carryOut ? "url(#arrow-active)" : "url(#arrow)"} className={`transition-all duration-500 ${step.carryOut ? "wire-flow" : ""}`} />
              </svg>

              {/* Inputs */}
              <div className="absolute left-6 top-[60px] flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">A</span>
                <div className={`w-8 h-8 rounded border-2 flex items-center justify-center font-mono font-bold transition-all duration-500 ${step.bitA ? 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-600'}`}>{step.bitA ?? 0}</div>
              </div>
              <div className="absolute left-6 top-[140px] flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">B</span>
                <div className={`w-8 h-8 rounded border-2 flex items-center justify-center font-mono font-bold transition-all duration-500 ${step.bitB ? 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-600'}`}>{step.bitB ?? 0}</div>
              </div>
              <div className="absolute left-4 top-[220px] flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Cin</span>
                <div className={`w-8 h-8 rounded border-2 flex items-center justify-center font-mono font-bold transition-all duration-500 ${step.carryIn ? 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-600'}`}>{step.carryIn ?? 0}</div>
              </div>

              {/* Logic Gates (Full Adder internals) */}
              <div className={`absolute left-[220px] top-[105px] w-16 h-10 border-2 rounded flex flex-col items-center justify-center transition-all duration-500 ${(step.bitA !== step.bitB) ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm dark:shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-500'}`}>
                <span className="text-[10px] font-bold">XOR</span>
              </div>
              <div className={`absolute left-[370px] top-[130px] w-16 h-10 border-2 rounded flex flex-col items-center justify-center transition-all duration-500 ${(step.bitA !== step.bitB) !== !!step.carryIn ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm dark:shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-500'}`}>
                <span className="text-[10px] font-bold">XOR</span>
              </div>
              <div className={`absolute left-[370px] top-[187px] w-16 h-10 border-2 rounded flex flex-col items-center justify-center transition-all duration-500 ${((step.bitA !== step.bitB) && step.carryIn) ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm dark:shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-500'}`}>
                <span className="text-[10px] font-bold">AND</span>
              </div>
              <div className={`absolute left-[370px] top-[237px] w-16 h-10 border-2 rounded flex flex-col items-center justify-center transition-all duration-500 ${(step.bitA && step.bitB) ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm dark:shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-500'}`}>
                <span className="text-[10px] font-bold">AND</span>
              </div>
              <div className={`absolute left-[490px] top-[212px] w-16 h-10 border-2 rounded flex flex-col items-center justify-center transition-all duration-500 ${step.carryOut ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm dark:shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-500'}`}>
                <span className="text-[10px] font-bold">OR</span>
              </div>

              {/* Outputs */}
              <div className="absolute right-6 top-[90px] flex items-center gap-2">
                <div className={`w-10 h-10 rounded border-2 flex items-center justify-center font-mono font-bold text-lg transition-all duration-500 ${step.outBit ? 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm dark:shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-600'}`}>{step.outBit ?? 0}</div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Sum</span>
              </div>
              
              <div className="absolute right-6 top-[250px] flex items-center gap-2">
                <div className={`w-8 h-8 rounded border-2 flex items-center justify-center font-mono font-bold transition-all duration-500 ${step.carryOut ? 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm dark:shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-600'}`}>{step.carryOut ?? 0}</div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Cout</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg min-w-[250px] shadow-sm">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Register A (Multiplicand)</div>
                <div className="font-mono text-lg text-emerald-600 dark:text-emerald-400 font-bold tracking-widest text-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded">{step.regA || "-"}</div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg min-w-[250px] shadow-sm">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Accumulator / Result</div>
                <div className="font-mono text-lg text-indigo-600 dark:text-indigo-400 font-bold tracking-widest text-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded">{step.acc || step.resultSoFar || "-"}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simulation Log */}
      <div 
        ref={logContainerRef}
        className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-4 max-h-[250px] overflow-y-auto flex flex-col gap-3 custom-scrollbar"
      >
        {steps.slice(0, currentStep + 1).map((s, idx) => (
          <div 
            key={s.id} 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-start gap-4 shadow-sm animate-slide-up-fade"
          >
            <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider shrink-0 mt-0.5 w-16">
              Step {idx + 1}
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-slate-800 dark:text-white mb-1">{s.phase}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">{s.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

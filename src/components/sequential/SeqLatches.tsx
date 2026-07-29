import React, { useState, useEffect } from 'react';
import { Info, Activity } from 'lucide-react';
import { motion } from 'motion/react';

export default function SeqLatches() {
  const [latchType, setLatchType] = useState<'NAND' | 'NOR'>('NAND');
  const [input1, setInput1] = useState(false); // S for NAND(active low set?), S for NOR. Actually PDF says S, R for both. 
  // Let's use the PDF definitions:
  // NAND Latch: S and R inputs. 1,1 is hold (0,0 is forbidden). Wait, PDF says S(set), R(reset). 
  // S=1, R=0 -> Q=0, Q'=1. Wait, PDF image shows S=1, R=0 gives Q=0? No.
  // Let's look at the PDF table for NAND Latch:
  // S=1, R=0 => Q=0, Q'=1 (because it's active low inputs actually. The PDF labels them S, R but they are active low.)
  // Let's stick to the PDF's truth table exactly.
  // NAND:
  // S=1, R=0 -> Q=0, Q'=1
  // S=1, R=1 -> Hold (after S=1,R=0 is Q=0)
  // S=0, R=1 -> Q=1, Q'=0
  // S=0, R=0 -> Q=1, Q'=1 (forbidden)
  
  // NOR:
  // S=1, R=0 -> Q=1, Q'=0
  // S=0, R=0 -> Hold
  // S=0, R=1 -> Q=0, Q'=1
  // S=1, R=1 -> Q=0, Q'=0 (forbidden)

  const [s, setS] = useState(latchType === 'NAND' ? true : false);
  const [r, setR] = useState(latchType === 'NAND' ? true : false);
  const [q, setQ] = useState(false);
  const [qBar, setQBar] = useState(true);

  // Switch type reset
  useEffect(() => {
    if (latchType === 'NAND') {
      setS(true); setR(true); setQ(false); setQBar(true);
    } else {
      setS(false); setR(false); setQ(false); setQBar(true);
    }
  }, [latchType]);

  // Logic evaluation
  useEffect(() => {
    if (latchType === 'NAND') {
      // Cross coupled NAND: Q = ~(S & Q'), Q' = ~(R & Q)
      // Because it's asynchronous and can have race conditions in code if not careful, 
      // we can just use a simple state machine based on the truth table.
      if (s && !r) {
        setQ(false); setQBar(true);
      } else if (!s && r) {
        setQ(true); setQBar(false);
      } else if (!s && !r) {
        setQ(true); setQBar(true); // forbidden
      } else {
        // 1 1 is hold, do nothing
      }
    } else {
      // NOR Latch
      if (s && !r) {
        setQ(true); setQBar(false);
      } else if (!s && r) {
        setQ(false); setQBar(true);
      } else if (s && r) {
        setQ(false); setQBar(false); // forbidden
      } else {
        // 0 0 is hold, do nothing
      }
    }
  }, [s, r, latchType]);

  return (
    <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {/* Left: Interactive Sim */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              Latch Simulation
            </h3>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setLatchType('NAND')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  latchType === 'NAND' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                NAND Latch
              </button>
              <button
                onClick={() => setLatchType('NOR')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  latchType === 'NOR' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                NOR Latch
              </button>
            </div>
          </div>

          <div className="relative h-72 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center p-4 shadow-inner">
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            {/* Proper SVG Circuit Diagram */}
            <div className="relative flex items-center justify-between w-full max-w-lg h-56 z-10">
              
              {/* Inputs */}
              <div className="flex flex-col justify-between h-full w-24 py-4 z-10 relative">
                <div className="flex items-center justify-end">
                  <span className="mr-2 font-mono font-bold text-slate-600 dark:text-slate-400">
                    {latchType === 'NAND' ? "S (set)" : "R (reset)"}
                  </span>
                  <button 
                    onClick={() => setS(!s)}
                    className={`w-10 h-10 rounded border-2 font-bold font-mono text-lg transition-colors shadow-sm ${
                      s ? 'bg-emerald-100 border-emerald-500 text-emerald-700 dark:bg-emerald-900/40 dark:border-emerald-500 dark:text-emerald-400' 
                        : 'bg-white border-slate-300 text-slate-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {s ? '1' : '0'}
                  </button>
                </div>
                <div className="flex items-center justify-end">
                  <span className="mr-2 font-mono font-bold text-slate-600 dark:text-slate-400">
                    {latchType === 'NAND' ? "R (reset)" : "S (set)"}
                  </span>
                  <button 
                    onClick={() => setR(!r)}
                    className={`w-10 h-10 rounded border-2 font-bold font-mono text-lg transition-colors shadow-sm ${
                      r ? 'bg-emerald-100 border-emerald-500 text-emerald-700 dark:bg-emerald-900/40 dark:border-emerald-500 dark:text-emerald-400' 
                        : 'bg-white border-slate-300 text-slate-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {r ? '1' : '0'}
                  </button>
                </div>
              </div>

              {/* Central SVG Area for Gates and Wires */}
              <div className="absolute inset-0 w-full h-full pointer-events-none">
                <svg width="100%" height="100%" viewBox="0 0 500 224" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    {/* NAND Gate Symbol */}
                    <g id="nand-gate">
                      <path d="M 0 0 L 30 0 A 30 30 0 0 1 30 60 L 0 60 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" className="text-indigo-100 dark:text-indigo-900/40" style={{stroke: '#6366f1'}} />
                      <circle cx="66" cy="30" r="6" fill="white" stroke="#6366f1" strokeWidth="2" className="dark:fill-slate-950" />
                      <text x="25" y="34" fontSize="14" fontWeight="bold" fill="#4f46e5" className="dark:fill-indigo-400" textAnchor="middle">NAND</text>
                    </g>
                    
                    {/* NOR Gate Symbol */}
                    <g id="nor-gate">
                      <path d="M 0 0 C 15 0 25 15 25 30 C 25 45 15 60 0 60 C 10 45 10 15 0 0" fill="currentColor" stroke="currentColor" strokeWidth="2" className="text-indigo-100 dark:text-indigo-900/40" style={{stroke: '#6366f1'}} />
                      <path d="M 0 0 C 40 0 60 30 60 30 C 60 30 40 60 0 60 C 10 45 10 15 0 0" fill="currentColor" stroke="currentColor" strokeWidth="2" className="text-indigo-100 dark:text-indigo-900/40" style={{stroke: '#6366f1'}} />
                      <circle cx="66" cy="30" r="6" fill="white" stroke="#6366f1" strokeWidth="2" className="dark:fill-slate-950" />
                      <text x="28" y="34" fontSize="12" fontWeight="bold" fill="#4f46e5" className="dark:fill-indigo-400" textAnchor="middle">NOR</text>
                    </g>
                  </defs>

                  {/* Top Input Wire (S/R) */}
                  <path d="M 80 46 L 190 46" fill="none" stroke={s ? "#10b981" : "#64748b"} strokeWidth={s ? 3 : 2} style={{ filter: s ? 'drop-shadow(0 0 3px rgba(16, 185, 129, 0.6))' : 'none' }} className="transition-all duration-300 ease-in-out" />
                  
                  {/* Bottom Input Wire (R/S) */}
                  <path d="M 80 178 L 190 178" fill="none" stroke={r ? "#10b981" : "#64748b"} strokeWidth={r ? 3 : 2} style={{ filter: r ? 'drop-shadow(0 0 3px rgba(16, 185, 129, 0.6))' : 'none' }} className="transition-all duration-300 ease-in-out" />

                  {/* Feedback Wires */}
                  {/* Q' to Top Gate Input 2 */}
                  <path d="M 330 162 L 350 162 L 350 112 L 150 112 L 150 78 L 190 78" fill="none" stroke={qBar ? "#f59e0b" : "#64748b"} strokeWidth={qBar ? 3 : 2} style={{ filter: qBar ? 'drop-shadow(0 0 3px rgba(245, 158, 11, 0.6))' : 'none' }} className="transition-all duration-300 ease-in-out" />
                  <circle cx="330" cy="162" r="4" fill={qBar ? "#f59e0b" : "#64748b"} style={{ filter: qBar ? 'drop-shadow(0 0 3px rgba(245, 158, 11, 0.6))' : 'none' }} className="transition-all duration-300 ease-in-out" />

                  {/* Q to Bottom Gate Input 1 */}
                  <path d="M 330 62 L 370 62 L 370 112 L 170 112 L 170 146 L 190 146" fill="none" stroke={q ? "#f59e0b" : "#64748b"} strokeWidth={q ? 3 : 2} style={{ filter: q ? 'drop-shadow(0 0 3px rgba(245, 158, 11, 0.6))' : 'none' }} className="transition-all duration-300 ease-in-out" />
                  <circle cx="330" cy="62" r="4" fill={q ? "#f59e0b" : "#64748b"} style={{ filter: q ? 'drop-shadow(0 0 3px rgba(245, 158, 11, 0.6))' : 'none' }} className="transition-all duration-300 ease-in-out" />

                  {/* Gates */}
                  <g transform="translate(190, 32)">
                    <use href={latchType === 'NAND' ? "#nand-gate" : "#nor-gate"} />
                  </g>
                  
                  <g transform="translate(190, 132)">
                    <use href={latchType === 'NAND' ? "#nand-gate" : "#nor-gate"} />
                  </g>

                  {/* Output Wires */}
                  {/* Top Gate Output (Q) */}
                  <path d="M 262 62 L 420 62" fill="none" stroke={q ? "#f59e0b" : "#64748b"} strokeWidth={q ? 3 : 2} style={{ filter: q ? 'drop-shadow(0 0 3px rgba(245, 158, 11, 0.6))' : 'none' }} className="transition-all duration-300 ease-in-out" />
                  
                  {/* Bottom Gate Output (Q') */}
                  <path d="M 262 162 L 420 162" fill="none" stroke={qBar ? "#f59e0b" : "#64748b"} strokeWidth={qBar ? 3 : 2} style={{ filter: qBar ? 'drop-shadow(0 0 3px rgba(245, 158, 11, 0.6))' : 'none' }} className="transition-all duration-300 ease-in-out" />

                </svg>
              </div>

              {/* Outputs */}
              <div className="flex flex-col justify-between h-full w-24 py-1 z-10 relative">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded border-2 flex items-center justify-center font-bold font-mono text-lg transition-all duration-300 shadow-sm ${
                    q ? 'bg-amber-100 border-amber-500 text-amber-700 dark:bg-amber-900/40 dark:border-amber-500 dark:text-amber-400' 
                      : 'bg-white border-slate-300 text-slate-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400'
                  }`}>
                    {q ? '1' : '0'}
                  </div>
                  <span className="ml-3 font-mono font-bold text-slate-600 dark:text-slate-400">Q</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded border-2 flex items-center justify-center font-bold font-mono text-lg transition-all duration-300 shadow-sm ${
                    qBar ? 'bg-amber-100 border-amber-500 text-amber-700 dark:bg-amber-900/40 dark:border-amber-500 dark:text-amber-400' 
                      : 'bg-white border-slate-300 text-slate-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400'
                  }`}>
                    {qBar ? '1' : '0'}
                  </div>
                  <span className="ml-3 font-mono font-bold text-slate-600 dark:text-slate-400">Q'</span>
                </div>
              </div>
            </div>

            {/* Forbidden state warning */}
            {((latchType === 'NAND' && !s && !r) || (latchType === 'NOR' && s && r)) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-bold border border-red-200 dark:border-red-800 shadow-md"
              >
                ⚠️ Forbidden State! Both outputs are {q ? '1' : '0'}
              </motion.div>
            )}

          </div>
        </div>
      </div>

      {/* Right: Info & Truth Table */}
      <div className="space-y-6">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-2 text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
            <Info className="w-4 h-4" /> About {latchType} Latch
          </h3>
          <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
            {latchType === 'NAND' ? 
              "A NAND latch is formed by cross-coupling two NAND gates. It uses active-low inputs (often labeled S' and R'). When both are 1, it holds its state. When S is 0, it sets Q=1. When R is 0, it resets Q=0. Both inputs being 0 is an invalid/forbidden state." 
              : 
              "A NOR latch is formed by cross-coupling two NOR gates. It uses active-high inputs. When both are 0, it holds its state. When S is 1, it sets Q=1. When R is 1, it resets Q=0. Both inputs being 1 is an invalid/forbidden state."
            }
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 overflow-hidden">
          <h3 className="text-sm font-semibold mb-3 text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" /> Function Table
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                <tr>
                  <th className="p-2 border-b border-slate-300 dark:border-slate-600">S</th>
                  <th className="p-2 border-b border-slate-300 dark:border-slate-600">R</th>
                  <th className="p-2 border-b border-slate-300 dark:border-slate-600">Q</th>
                  <th className="p-2 border-b border-slate-300 dark:border-slate-600">Q'</th>
                </tr>
              </thead>
              <tbody className="font-mono text-slate-700 dark:text-slate-300 divide-y divide-slate-200 dark:divide-slate-700">
                {latchType === 'NAND' ? (
                  <>
                    <tr className={s&&!r ? "bg-emerald-50 dark:bg-emerald-900/20" : ""}><td className="p-2">1</td><td className="p-2">0</td><td className="p-2">0</td><td className="p-2">1</td></tr>
                    <tr className={s&&r&&q===0 ? "bg-emerald-50 dark:bg-emerald-900/20" : ""}><td className="p-2">1</td><td className="p-2">1</td><td className="p-2">0</td><td className="p-2">1 <span className="text-[10px] text-slate-400 ml-1">(after S=1,R=0)</span></td></tr>
                    <tr className={!s&&r ? "bg-emerald-50 dark:bg-emerald-900/20" : ""}><td className="p-2">0</td><td className="p-2">1</td><td className="p-2">1</td><td className="p-2">0</td></tr>
                    <tr className={s&&r&&q===1 ? "bg-emerald-50 dark:bg-emerald-900/20" : ""}><td className="p-2">1</td><td className="p-2">1</td><td className="p-2">1</td><td className="p-2">0 <span className="text-[10px] text-slate-400 ml-1">(after S=0,R=1)</span></td></tr>
                    <tr className={!s&&!r ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold" : ""}><td className="p-2">0</td><td className="p-2">0</td><td className="p-2">1</td><td className="p-2">1 <span className="text-[10px] ml-1">(forbidden)</span></td></tr>
                  </>
                ) : (
                  <>
                    <tr className={s&&!r ? "bg-emerald-50 dark:bg-emerald-900/20" : ""}><td className="p-2">1</td><td className="p-2">0</td><td className="p-2">1</td><td className="p-2">0</td></tr>
                    <tr className={!s&&!r&&q===1 ? "bg-emerald-50 dark:bg-emerald-900/20" : ""}><td className="p-2">0</td><td className="p-2">0</td><td className="p-2">1</td><td className="p-2">0 <span className="text-[10px] text-slate-400 ml-1">(after S=1,R=0)</span></td></tr>
                    <tr className={!s&&r ? "bg-emerald-50 dark:bg-emerald-900/20" : ""}><td className="p-2">0</td><td className="p-2">1</td><td className="p-2">0</td><td className="p-2">1</td></tr>
                    <tr className={!s&&!r&&q===0 ? "bg-emerald-50 dark:bg-emerald-900/20" : ""}><td className="p-2">0</td><td className="p-2">0</td><td className="p-2">0</td><td className="p-2">1 <span className="text-[10px] text-slate-400 ml-1">(after S=0,R=1)</span></td></tr>
                    <tr className={s&&r ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold" : ""}><td className="p-2">1</td><td className="p-2">1</td><td className="p-2">0</td><td className="p-2">0 <span className="text-[10px] ml-1">(forbidden)</span></td></tr>
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

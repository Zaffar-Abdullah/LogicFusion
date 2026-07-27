import React from 'react';
import { ArrowRight, Clock, Zap, Cpu, MemoryStick } from 'lucide-react';

export default function SeqFundamentals() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-500" />
          Combinational vs. Sequential Circuits
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          <strong>Sequential circuits</strong> are digital circuits that store and use previous state information to determine their next state. 
          Unlike combinational circuits, their output depends on both the <strong>present input</strong> and their <strong>past state</strong>.
        </p>

        {/* Visual Diagrams */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          
          {/* Combinational Diagram */}
          <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-wider">Combinational Logic</h4>
            <div className="relative w-full max-w-[280px] h-32 flex items-center justify-center">
              {/* Inputs */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                <div className="flex items-center">
                  <span className="text-xs font-mono mr-2">In₁</span>
                  <div className="w-8 h-0.5 bg-slate-400 relative"><div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t-2 border-r-2 border-slate-400 rotate-45"></div></div>
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-mono mr-2">Inₙ</span>
                  <div className="w-8 h-0.5 bg-slate-400 relative"><div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t-2 border-r-2 border-slate-400 rotate-45"></div></div>
                </div>
              </div>
              
              {/* Logic Block */}
              <div className="w-32 h-24 bg-white dark:bg-slate-900 border-2 border-slate-400 rounded-lg flex items-center justify-center shadow-sm z-10">
                <span className="font-semibold text-center text-sm">Combinational<br/>Logic</span>
              </div>

              {/* Outputs */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                <div className="flex items-center">
                  <div className="w-8 h-0.5 bg-slate-400 relative"><div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t-2 border-r-2 border-slate-400 rotate-45"></div></div>
                  <span className="text-xs font-mono ml-2">Out₁</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-0.5 bg-slate-400 relative"><div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t-2 border-r-2 border-slate-400 rotate-45"></div></div>
                  <span className="text-xs font-mono ml-2">Outₙ</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-center text-slate-500 mt-4">Outputs depend ONLY on current inputs.</p>
          </div>

          {/* Sequential Diagram */}
          <div className="flex flex-col items-center bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
            <h4 className="text-sm font-semibold text-indigo-500 dark:text-indigo-400 mb-6 uppercase tracking-wider">Sequential Logic</h4>
            <div className="relative w-full max-w-[280px] h-40 flex items-center justify-center">
              
              {/* Inputs */}
              <div className="absolute left-0 top-6 flex flex-col gap-2">
                <div className="flex items-center">
                  <span className="text-xs font-mono mr-2">In</span>
                  <div className="w-8 h-0.5 bg-indigo-400 relative"><div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t-2 border-r-2 border-indigo-400 rotate-45"></div></div>
                </div>
              </div>

              {/* Logic Block */}
              <div className="absolute top-2 w-32 h-16 bg-white dark:bg-slate-900 border-2 border-indigo-400 rounded-lg flex items-center justify-center shadow-sm z-10">
                <span className="font-semibold text-center text-xs">Combinational<br/>Logic</span>
              </div>

              {/* Outputs */}
              <div className="absolute right-0 top-6 flex flex-col gap-2">
                <div className="flex items-center">
                  <div className="w-8 h-0.5 bg-indigo-400 relative"><div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t-2 border-r-2 border-indigo-400 rotate-45"></div></div>
                  <span className="text-xs font-mono ml-2">Out</span>
                </div>
              </div>

              {/* Memory Block */}
              <div className="absolute bottom-2 w-28 h-12 bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-500 rounded flex items-center justify-center shadow-sm z-10">
                <span className="font-semibold text-indigo-800 dark:text-indigo-200 text-xs">Memory<br/>Elements</span>
              </div>

              {/* Feedback Loop */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                {/* Out to Memory */}
                <path d="M 195 24 L 210 24 L 210 115 L 175 115" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400" />
                <polygon points="175,112 175,118 165,115" fill="currentColor" className="text-indigo-400" />
                
                {/* Memory to In */}
                <path d="M 115 115 L 70 115 L 70 34 L 110 34" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400" />
                <polygon points="107,31 107,37 115,34" fill="currentColor" className="text-indigo-400" />
              </svg>
            </div>
            <p className="text-xs text-center text-indigo-600 dark:text-indigo-300 mt-4">Outputs depend on inputs AND past state.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <th className="p-3 rounded-tl-lg">Feature</th>
                <th className="p-3 border-l border-white dark:border-slate-700">Combinational</th>
                <th className="p-3 rounded-tr-lg border-l border-white dark:border-slate-700 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">Sequential</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="p-3 font-medium text-slate-700 dark:text-slate-300">Output dependency</td>
                <td className="p-3 text-slate-600 dark:text-slate-400 border-l border-slate-100 dark:border-slate-800">Present input</td>
                <td className="p-3 text-indigo-700 dark:text-indigo-400 font-semibold border-l border-slate-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-900/10">Present + past state</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-700 dark:text-slate-300">Clock Signal</td>
                <td className="p-3 text-slate-600 dark:text-slate-400 border-l border-slate-100 dark:border-slate-800">No</td>
                <td className="p-3 text-indigo-700 dark:text-indigo-400 font-semibold border-l border-slate-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-900/10">Yes</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-700 dark:text-slate-300">Feedback</td>
                <td className="p-3 text-slate-600 dark:text-slate-400 border-l border-slate-100 dark:border-slate-800">Not required</td>
                <td className="p-3 text-indigo-700 dark:text-indigo-400 font-semibold border-l border-slate-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-900/10">Available</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-700 dark:text-slate-300">Building block</td>
                <td className="p-3 text-slate-600 dark:text-slate-400 border-l border-slate-100 dark:border-slate-800">Logic gates</td>
                <td className="p-3 text-indigo-700 dark:text-indigo-400 font-semibold border-l border-slate-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-900/10">Flip-Flop</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-700 dark:text-slate-300">Operation</td>
                <td className="p-3 text-slate-600 dark:text-slate-400 border-l border-slate-100 dark:border-slate-800">Arithmetic / Logic</td>
                <td className="p-3 text-indigo-700 dark:text-indigo-400 font-semibold border-l border-slate-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-900/10">Memory</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-700 dark:text-slate-300">Speed</td>
                <td className="p-3 text-slate-600 dark:text-slate-400 border-l border-slate-100 dark:border-slate-800">Faster</td>
                <td className="p-3 text-indigo-700 dark:text-indigo-400 font-semibold border-l border-slate-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-900/10">Slower</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-700 dark:text-slate-300">Designing</td>
                <td className="p-3 text-slate-600 dark:text-slate-400 border-l border-slate-100 dark:border-slate-800">Comparatively easy</td>
                <td className="p-3 text-indigo-700 dark:text-indigo-400 font-semibold border-l border-slate-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-900/10">More complex</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-500" />
          Synchronous vs Asynchronous
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          There are two main types of sequential circuits based on how they are timed and triggered.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-600 dark:text-emerald-400">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">Synchronous</h4>
            </div>
            <ul className="space-y-3 text-sm text-emerald-900 dark:text-emerald-100/70">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>Feedback input</strong> governed by clock signal.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>Clocked flip-flops</strong> used as memory devices.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>State is <strong>predictable</strong> hence more reliable.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>Slower operation due to waiting for clock edges.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>Easy to control but involves complex circuit design.</span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg text-amber-600 dark:text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-amber-800 dark:text-amber-300">Asynchronous</h4>
            </div>
            <ul className="space-y-3 text-sm text-amber-900 dark:text-amber-100/70">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span><strong>Feedback</strong> is NOT governed by a clock.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span><strong>Time delay</strong> is used as the memory element (unclocked latches).</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>Faces <strong>race conditions</strong> where state can continuously toggle.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>Faster than synchronous circuits.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>Control is difficult despite simple circuit design.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

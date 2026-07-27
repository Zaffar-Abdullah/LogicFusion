import React, { useState, useEffect, useRef } from 'react';
import { Activity, Type, Hash, Play, Square, FastForward, Info, BookOpen, Lightbulb, AlertTriangle, Cpu, Layers, SplitSquareHorizontal } from 'lucide-react';
import { LineCodingScheme, encodeSignal, AnalysisData } from '../logic/lineCoding';
import { educationalData } from './LineCodingEducationalData';

export default function LineCodingSimulator() {
  const [inputType, setInputType] = useState<'binary' | 'text'>('binary');
  const [inputValue, setInputValue] = useState<string>('10110010');
  const [scheme, setScheme] = useState<LineCodingScheme>('Manchester');
  
  // Comparison Mode
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonScheme, setComparisonScheme] = useState<LineCodingScheme>('Unipolar NRZ');
  
  const [binaryStr, setBinaryStr] = useState<string>('10110010');
  const [levels, setLevels] = useState<number[][]>([]);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);

  const [compLevels, setCompLevels] = useState<number[][]>([]);
  const [compAnalysis, setCompAnalysis] = useState<AnalysisData | null>(null);

  // Animation states
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to binaryStr.length
  const [speed, setSpeed] = useState(1);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const schemes: LineCodingScheme[] = [
    'Unipolar NRZ', 'Polar NRZ-L', 'Polar NRZ-I', 'RZ', 
    'Manchester', 'Differential Manchester', 'AMI', 
    'Pseudoternary', 'MLT-3', '2B1Q'
  ];

  // Text to Binary conversion
  useEffect(() => {
    let bin = '';
    if (inputType === 'text') {
      for (let i = 0; i < inputValue.length; i++) {
        bin += inputValue.charCodeAt(i).toString(2).padStart(8, '0');
      }
    } else {
      bin = inputValue.replace(/[^01]/g, '');
    }
    if (bin === '') bin = '0';
    setBinaryStr(bin);
  }, [inputValue, inputType]);

  // Encode Main Signal
  useEffect(() => {
    const { levels: newLevels, analysis: newAnalysis } = encodeSignal(binaryStr, scheme);
    setLevels(newLevels);
    setAnalysis(newAnalysis);
    setProgress(binaryStr.length); // initially fully drawn
    setIsPlaying(false);
  }, [binaryStr, scheme]);

  // Encode Comparison Signal
  useEffect(() => {
    if (comparisonMode) {
      const { levels: newLevels, analysis: newAnalysis } = encodeSignal(binaryStr, comparisonScheme);
      setCompLevels(newLevels);
      setCompAnalysis(newAnalysis);
    }
  }, [binaryStr, comparisonScheme, comparisonMode]);

  // Animation Loop
  useEffect(() => {
    const animate = (time: number) => {
      if (lastTimeRef.current !== null && isPlaying) {
        const delta = time - lastTimeRef.current;
        setProgress((prev) => {
          const next = prev + (delta / 1000) * speed * 2; // speed bits per second
          if (next >= binaryStr.length) {
            setIsPlaying(false);
            return binaryStr.length;
          }
          return next;
        });
      }
      lastTimeRef.current = time;
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (isPlaying) {
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, binaryStr.length, speed]);

  const handlePlayPause = () => {
    if (progress >= binaryStr.length) {
      setProgress(0); // restart
    }
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setProgress(binaryStr.length);
  };

  const renderWaveform = (levelsToDraw: number[][], schemeToDraw: LineCodingScheme, color: string = '#38bdf8') => {
    if (levelsToDraw.length === 0) return null;

    const width = 800;
    const height = 200;
    const padding = 40;
    
    const symbolCount = levelsToDraw.length;
    const symbolWidth = (width - 2 * padding) / Math.max(1, symbolCount);
    
    const maxV = schemeToDraw === '2B1Q' ? 3 : 1;
    const midY = height / 2;
    const scaleY = (height / 2 - 20) / maxV;

    let pathD = '';

    const currentSymbolProgress = schemeToDraw === '2B1Q' ? progress / 2 : progress;

    for (let i = 0; i < symbolCount; i++) {
      if (i > currentSymbolProgress) break;

      const [v1, v2] = levelsToDraw[i];
      const y1 = midY - v1 * scaleY;
      const y2 = midY - v2 * scaleY;
      
      const startX = padding + i * symbolWidth;
      const midX = startX + symbolWidth / 2;
      const endX = startX + symbolWidth;

      const symbolFrac = Math.min(1, Math.max(0, currentSymbolProgress - i));

      if (i === 0) {
        pathD += `M ${startX} ${y1} `;
      } else {
        pathD += `L ${startX} ${y1} `; 
      }

      if (symbolFrac < 0.5) {
        const currX = startX + (symbolWidth) * symbolFrac;
        pathD += `L ${currX} ${y1} `;
      } else {
        pathD += `L ${midX} ${y1} `;
        pathD += `L ${midX} ${y2} `; 
        const currX = startX + (symbolWidth) * symbolFrac;
        pathD += `L ${currX} ${y2} `;
      }
    }

    return (
      <div className="relative w-full overflow-x-auto bg-slate-900 rounded-xl border border-slate-700 p-4 shadow-inner mb-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[600px] h-64">
          <line x1={padding} y1={midY} x2={width - padding} y2={midY} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
          <line x1={padding} y1={midY - scaleY} x2={width - padding} y2={midY - scaleY} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
          <line x1={padding} y1={midY + scaleY} x2={width - padding} y2={midY + scaleY} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
          {schemeToDraw === '2B1Q' && (
            <>
              <line x1={padding} y1={midY - 3 * scaleY} x2={width - padding} y2={midY - 3 * scaleY} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
              <line x1={padding} y1={midY + 3 * scaleY} x2={width - padding} y2={midY + 3 * scaleY} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
            </>
          )}
          
          {schemeToDraw === '2B1Q' ? (
            <>
              <text x={padding - 10} y={midY - 3 * scaleY} fill="#94a3b8" fontSize="12" textAnchor="end" dominantBaseline="middle">+3V</text>
              <text x={padding - 10} y={midY - scaleY} fill="#94a3b8" fontSize="12" textAnchor="end" dominantBaseline="middle">+1V</text>
              <text x={padding - 10} y={midY + scaleY} fill="#94a3b8" fontSize="12" textAnchor="end" dominantBaseline="middle">-1V</text>
              <text x={padding - 10} y={midY + 3 * scaleY} fill="#94a3b8" fontSize="12" textAnchor="end" dominantBaseline="middle">-3V</text>
            </>
          ) : (
            <>
              <text x={padding - 10} y={midY - scaleY} fill="#94a3b8" fontSize="12" textAnchor="end" dominantBaseline="middle">+V</text>
              <text x={padding - 10} y={midY} fill="#94a3b8" fontSize="12" textAnchor="end" dominantBaseline="middle">0V</text>
              <text x={padding - 10} y={midY + scaleY} fill="#94a3b8" fontSize="12" textAnchor="end" dominantBaseline="middle">-V</text>
            </>
          )}

          {Array.from({ length: symbolCount + 1 }).map((_, i) => {
            const x = padding + i * symbolWidth;
            return (
              <g key={`divider-${i}`}>
                <line x1={x} y1={20} x2={x} y2={height - 20} stroke="#1e293b" strokeWidth="1" />
                {i < symbolCount && (
                  <text 
                    x={x + symbolWidth / 2} 
                    y={height - 5} 
                    fill={color} 
                    fontSize="14" 
                    fontWeight="bold" 
                    textAnchor="middle"
                    className={i < currentSymbolProgress ? 'opacity-100' : 'opacity-20'}
                  >
                    {schemeToDraw === '2B1Q' ? 
                      binaryStr.padEnd(symbolCount * 2, '0').substring(i * 2, i * 2 + 2) : 
                      binaryStr[i]}
                  </text>
                )}
              </g>
            );
          })}

          <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" />
          
          {isPlaying && currentSymbolProgress < symbolCount && (() => {
            const parts = pathD.trim().split(/ [L|M] /);
            if (parts.length > 0) {
              const lastPart = parts[parts.length - 1];
              const coords = lastPart.split(' ');
              if (coords.length >= 2) {
                const cx = parseFloat(coords[coords.length-2].replace(/[LM]/,''));
                const cy = parseFloat(coords[coords.length-1]);
                if (!isNaN(cx) && !isNaN(cy)) {
                  return <circle cx={cx} cy={cy} r="5" fill={color} className="animate-pulse" />;
                }
              }
            }
            return null;
          })()}
        </svg>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Activity className="w-5 h-5" />
          <h2 className="font-bold text-lg">Line Coding Simulator</h2>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSpeed(prev => prev === 1 ? 0.5 : prev === 0.5 ? 2 : 1)}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
          >
            {speed}x Speed
          </button>
          <button 
            onClick={handlePlayPause}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
          >
            {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isPlaying ? 'Pause' : 'Animate'}
          </button>
          <button 
            onClick={handleStop}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
          >
            <FastForward className="w-4 h-4" />
            Finish
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Input Type
              </label>
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-md border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => { setInputType('binary'); setInputValue('10110010'); }}
                  className={`flex-1 flex justify-center items-center gap-2 py-1.5 text-sm font-medium rounded ${
                    inputType === 'binary' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Hash className="w-4 h-4" /> Binary
                </button>
                <button
                  onClick={() => { setInputType('text'); setInputValue('HELLO'); }}
                  className={`flex-1 flex justify-center items-center gap-2 py-1.5 text-sm font-medium rounded ${
                    inputType === 'text' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Type className="w-4 h-4" /> Text
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Data Input
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={inputType === 'binary' ? "e.g., 10110010" : "e.g., HELLO"}
              />
              {inputType === 'text' && (
                <div className="mt-2 p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded border border-indigo-100 dark:border-indigo-800/50 text-xs text-indigo-800 dark:text-indigo-300 break-all font-mono">
                  {binaryStr}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Encoding Scheme
              </label>
              <select
                value={scheme}
                onChange={(e) => setScheme(e.target.value as LineCodingScheme)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {schemes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 mb-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={comparisonMode} 
                  onChange={(e) => setComparisonMode(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <SplitSquareHorizontal className="w-4 h-4 text-slate-500" />
                Enable Comparison Mode
              </label>
              
              {comparisonMode && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Compare With
                  </label>
                  <select
                    value={comparisonScheme}
                    onChange={(e) => setComparisonScheme(e.target.value as LineCodingScheme)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {schemes.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Analysis & Educational Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Waveform Visualization */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                {scheme} Waveform
              </h3>
              {renderWaveform(levels, scheme, '#38bdf8')}

              {comparisonMode && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    {comparisonScheme} Waveform (Comparison)
                  </h3>
                  {renderWaveform(compLevels, comparisonScheme, '#34d399')}
                </div>
              )}
            </div>

            {/* Educational Content */}
            {educationalData[scheme] ? (
              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80">
                  <h3 className="text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    Understanding {scheme}
                  </h3>
                </div>
                
                <div className="p-4 md:p-5 space-y-6">
                  {/* Step-by-Step Generation */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" /> How it Works
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong className="font-semibold text-slate-900 dark:text-slate-100">Mechanism:</strong> {educationalData[scheme].explanation}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mt-2">
                      <strong className="font-semibold text-slate-900 dark:text-slate-100">Generation:</strong> {educationalData[scheme].generation}
                    </p>
                  </div>

                  {/* Signal Characteristics / Parameter Analysis */}
                  {analysis && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" /> Parameter Analysis
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-sm">
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold mb-1">Bandwidth Efficiency</div>
                          <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{analysis.bandwidth}</div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-sm">
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold mb-1">DC Component</div>
                          <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{analysis.dcComponent}</div>
                          <div className="text-[10px] text-slate-500 mt-1 leading-tight">Can block low frequencies? {analysis.dcComponent.includes('No') ? 'Yes' : 'No'}</div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-sm">
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold mb-1">Self-Clocking</div>
                          <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{analysis.selfClocking}</div>
                          <div className="text-[10px] text-slate-500 mt-1 leading-tight">Clock sync capability</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Insights & Applications */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Engineering Insights
                        </h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
                          {educationalData[scheme].insights}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Real-Life Applications
                        </h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {educationalData[scheme].applications}
                        </p>
                      </div>
                    </div>

                    {/* Troubleshooting & Takeaways */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Common Mistakes
                        </h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-rose-50 dark:bg-rose-900/10 p-3 rounded-lg border border-rose-100 dark:border-rose-900/30">
                          {educationalData[scheme].mistakes}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Key Takeaways
                        </h4>
                        <div className="text-sm text-indigo-700 dark:text-indigo-300 font-medium bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                          {educationalData[scheme].takeaways}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500 italic p-4">Educational content for this scheme is not available.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Activity, Type, Hash, Play, Square, FastForward, Rewind, Info } from 'lucide-react';
import { LineCodingScheme, encodeSignal, AnalysisData } from '../logic/lineCoding';

export default function LineCodingSimulator() {
  const [inputType, setInputType] = useState<'binary' | 'text'>('binary');
  const [inputValue, setInputValue] = useState<string>('10110010');
  const [scheme, setScheme] = useState<LineCodingScheme>('Manchester');
  
  const [binaryStr, setBinaryStr] = useState<string>('10110010');
  const [levels, setLevels] = useState<number[][]>([]);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);

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

  // Encode
  useEffect(() => {
    const { levels: newLevels, analysis: newAnalysis } = encodeSignal(binaryStr, scheme);
    setLevels(newLevels);
    setAnalysis(newAnalysis);
    setProgress(binaryStr.length); // initially fully drawn
    setIsPlaying(false);
  }, [binaryStr, scheme]);

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

  const renderWaveform = () => {
    if (levels.length === 0) return null;

    const width = 800;
    const height = 200;
    const padding = 40;
    
    // Total bits to render (for 2B1Q, length is half of binary if we map dibits to bit slots, wait, in lineCoding 2B1Q skips next bit so levels.length === paddedStr.length / 2)
    // Actually levels.length is exactly the number of symbols drawn.
    const symbolCount = levels.length;
    const symbolWidth = (width - 2 * padding) / Math.max(1, symbolCount);
    
    const maxV = scheme === '2B1Q' ? 3 : 1;
    const midY = height / 2;
    const scaleY = (height / 2 - 20) / maxV;

    let pathD = '';
    let prevY = -1;

    // We draw up to `progress` symbols.
    // If progress is fractional, we draw the last symbol partially.
    // Wait, progress is in bits, for 2B1Q progress is in bits (2 bits per symbol).
    // Let's normalize progress to symbol index.
    const currentSymbolProgress = scheme === '2B1Q' ? progress / 2 : progress;

    for (let i = 0; i < symbolCount; i++) {
      if (i > currentSymbolProgress) break;

      const [v1, v2] = levels[i];
      const y1 = midY - v1 * scaleY;
      const y2 = midY - v2 * scaleY;
      
      const startX = padding + i * symbolWidth;
      const midX = startX + symbolWidth / 2;
      const endX = startX + symbolWidth;

      // Fractional rendering for smooth animation
      const symbolFrac = Math.min(1, Math.max(0, currentSymbolProgress - i));

      if (i === 0) {
        pathD += `M ${startX} ${y1} `;
      } else {
        pathD += `L ${startX} ${y1} `; // Vertical line from previous
      }

      if (symbolFrac < 0.5) {
        const currX = startX + (symbolWidth) * symbolFrac;
        pathD += `L ${currX} ${y1} `;
      } else {
        pathD += `L ${midX} ${y1} `;
        pathD += `L ${midX} ${y2} `; // Middle transition
        const currX = startX + (symbolWidth) * symbolFrac;
        pathD += `L ${currX} ${y2} `;
      }
    }

    return (
      <div className="relative w-full overflow-x-auto bg-slate-900 rounded-xl border border-slate-700 p-4 shadow-inner">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[600px] h-64">
          {/* Grid lines */}
          <line x1={padding} y1={midY} x2={width - padding} y2={midY} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
          <line x1={padding} y1={midY - scaleY} x2={width - padding} y2={midY - scaleY} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
          <line x1={padding} y1={midY + scaleY} x2={width - padding} y2={midY + scaleY} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
          {scheme === '2B1Q' && (
            <>
              <line x1={padding} y1={midY - 3 * scaleY} x2={width - padding} y2={midY - 3 * scaleY} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
              <line x1={padding} y1={midY + 3 * scaleY} x2={width - padding} y2={midY + 3 * scaleY} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
            </>
          )}
          
          {/* Labels */}
          {scheme === '2B1Q' ? (
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

          {/* Clock dividers & Bit text */}
          {Array.from({ length: symbolCount + 1 }).map((_, i) => {
            const x = padding + i * symbolWidth;
            return (
              <g key={`divider-${i}`}>
                <line x1={x} y1={20} x2={x} y2={height - 20} stroke="#1e293b" strokeWidth="1" />
                {i < symbolCount && (
                  <text 
                    x={x + symbolWidth / 2} 
                    y={height - 5} 
                    fill="#38bdf8" 
                    fontSize="14" 
                    fontWeight="bold" 
                    textAnchor="middle"
                    className={i < currentSymbolProgress ? 'opacity-100' : 'opacity-20'}
                  >
                    {scheme === '2B1Q' ? 
                      binaryStr.padEnd(symbolCount * 2, '0').substring(i * 2, i * 2 + 2) : 
                      binaryStr[i]}
                  </text>
                )}
              </g>
            );
          })}

          {/* Signal path */}
          <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinejoin="round" />
          
          {/* Current point indicator */}
          {isPlaying && currentSymbolProgress < symbolCount && (() => {
            // Find last point
            const parts = pathD.trim().split(/ [L|M] /);
            if (parts.length > 0) {
              const lastPart = parts[parts.length - 1];
              const coords = lastPart.split(' ');
              if (coords.length >= 2) {
                const cx = parseFloat(coords[coords.length-2].replace(/[LM]/,''));
                const cy = parseFloat(coords[coords.length-1]);
                if (!isNaN(cx) && !isNaN(cy)) {
                  return <circle cx={cx} cy={cy} r="5" fill="#38bdf8" className="animate-pulse" />;
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
          </div>

          {/* Analysis Panel */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-500" />
              Signal Analysis & Characteristics
            </h3>
            
            {analysis ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-3 rounded-lg">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold mb-1">Bandwidth</div>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{analysis.bandwidth}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-3 rounded-lg">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold mb-1">DC Component</div>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{analysis.dcComponent}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-3 rounded-lg">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold mb-1">Self-Clocking</div>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{analysis.selfClocking}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-3 rounded-lg">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold mb-1">Error Detection</div>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{analysis.errorDetection}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-3 rounded-lg">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold mb-1">Total Transitions</div>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{analysis.transitions}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-3 rounded-lg sm:col-span-2 lg:col-span-1">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold mb-1">Power Spectral</div>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate" title={analysis.powerSpectral}>
                    {analysis.powerSpectral}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 text-slate-500">
                Enter data to see analysis
              </div>
            )}
          </div>
        </div>

        {/* Waveform Visualization */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Time vs Voltage Waveform
          </h3>
          {renderWaveform()}
        </div>
      </div>
    </div>
  );
}

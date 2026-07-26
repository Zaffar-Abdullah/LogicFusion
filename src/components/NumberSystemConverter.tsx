import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowRightLeft, Cpu, AlertTriangle, Layers, Zap } from 'lucide-react';

type BaseType = 2 | 8 | 10 | 16;
const BASES = [
  { value: 2, label: 'Binary (Base-2)' },
  { value: 8, label: 'Octal (Base-8)' },
  { value: 10, label: 'Decimal (Base-10)' },
  { value: 16, label: 'Hexadecimal (Base-16)' }
];

export default function NumberSystemConverter() {
  const [inputValue, setInputValue] = useState('1010');
  const [inputBase, setInputBase] = useState<BaseType>(2);
  const [outputBase, setOutputBase] = useState<BaseType>(10);
  
  // Logic gate simulation states
  const [logicGate, setLogicGate] = useState<'AND' | 'OR' | 'XOR' | 'NAND' | 'NOR'>('AND');
  const [logicInputB, setLogicInputB] = useState('1100');

  const { decimalValue, isValid, errorMsg, convertedOutput, binaryStr } = useMemo(() => {
    let isValid = true;
    let errorMsg = '';
    let decimalValue = 0;
    
    if (!inputValue.trim()) {
      return { decimalValue: 0, isValid: false, errorMsg: 'Input is empty', convertedOutput: '', binaryStr: '' };
    }

    try {
      // Validate based on input base
      if (inputBase === 2 && !/^[01]+$/.test(inputValue)) {
        isValid = false;
        errorMsg = 'Invalid binary digits (only 0 and 1 allowed)';
      } else if (inputBase === 8 && !/^[0-7]+$/.test(inputValue)) {
        isValid = false;
        errorMsg = 'Invalid octal digits (only 0-7 allowed)';
      } else if (inputBase === 10 && !/^\d+$/.test(inputValue)) {
        isValid = false;
        errorMsg = 'Invalid decimal digits (only 0-9 allowed)';
      } else if (inputBase === 16 && !/^[0-9A-Fa-f]+$/.test(inputValue)) {
        isValid = false;
        errorMsg = 'Invalid hexadecimal digits (only 0-9 and A-F allowed)';
      }

      if (isValid) {
        decimalValue = parseInt(inputValue, inputBase);
        if (isNaN(decimalValue)) {
          isValid = false;
          errorMsg = 'Number too large or invalid';
        }
      }
    } catch (e) {
      isValid = false;
      errorMsg = 'Parsing error';
    }

    const convertedOutput = isValid ? decimalValue.toString(outputBase).toUpperCase() : '';
    const binaryStr = isValid ? decimalValue.toString(2) : '';

    return { decimalValue, isValid, errorMsg, convertedOutput, binaryStr };
  }, [inputValue, inputBase, outputBase]);

  // Pad strings for logic gates
  const padLength = Math.max(binaryStr.length, logicInputB.length, 4);
  const aBin = binaryStr.padStart(padLength, '0');
  const bBin = logicInputB.padStart(padLength, '0').replace(/[^01]/g, '0');

  const logicResult = useMemo(() => {
    if (!isValid) return '';
    let res = '';
    for (let i = 0; i < padLength; i++) {
      const a = aBin[i] === '1';
      const b = bBin[i] === '1';
      let r = false;
      switch(logicGate) {
        case 'AND': r = a && b; break;
        case 'OR': r = a || b; break;
        case 'XOR': r = a !== b; break;
        case 'NAND': r = !(a && b); break;
        case 'NOR': r = !(a || b); break;
      }
      res += r ? '1' : '0';
    }
    return res;
  }, [aBin, bBin, logicGate, isValid, padLength]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-lg shadow-sm h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      <div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Number System Converter & Logic Simulator</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Convert numbers with step-by-step breakdowns and apply bitwise logic.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side: Conversion Panel */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
              Conversion Controls
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">From</label>
                <select 
                  value={inputBase}
                  onChange={(e) => setInputBase(Number(e.target.value) as BaseType)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded p-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                >
                  {BASES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
                <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                  className={`mt-2 w-full bg-white dark:bg-slate-950 border ${!isValid ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'} rounded p-2 text-lg font-mono text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors uppercase`}
                  placeholder="Enter value"
                />
                {!isValid && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errorMsg}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">To</label>
                <select 
                  value={outputBase}
                  onChange={(e) => setOutputBase(Number(e.target.value) as BaseType)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded p-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                >
                  {BASES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
                <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-2 text-lg font-mono text-indigo-600 dark:text-indigo-400 min-h-[42px] flex items-center shadow-inner">
                  {isValid ? convertedOutput : '---'}
                </div>
              </div>
            </div>
          </div>

          {/* Visual Bits */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-lg border border-slate-200 dark:border-slate-800">
             <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              Binary Bit Visualization
            </h3>
            <div className="flex flex-wrap gap-2">
              {isValid ? (
                binaryStr.padStart(Math.ceil(binaryStr.length / 4) * 4, '0').split('').map((bit, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`w-10 h-12 flex items-center justify-center rounded-md font-mono font-bold text-lg border-2 ${bit === '1' ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600'}`}
                    >
                      {bit}
                    </motion.div>
                    <span className="text-[10px] text-slate-400 mt-1">{binaryStr.length - 1 - idx}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500 italic">Enter a valid number to see bits.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Step-by-Step & Logic Gates */}
        <div className="w-full md:w-96 shrink-0 flex flex-col gap-4">
          
          <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-lg border border-slate-200 dark:border-slate-800">
             <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-pink-500" />
              Bitwise Logic Simulator
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white dark:bg-slate-950 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded font-mono text-sm">
                <span className="text-slate-500">Input A:</span>
                <span className="text-slate-800 dark:text-slate-200">{isValid ? aBin : '---'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <select 
                  value={logicGate}
                  onChange={(e) => setLogicGate(e.target.value as any)}
                  className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded p-1.5 text-xs font-bold text-pink-600 dark:text-pink-400 outline-none focus:border-pink-500 w-24 shrink-0 shadow-sm"
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                  <option value="XOR">XOR</option>
                  <option value="NAND">NAND</option>
                  <option value="NOR">NOR</option>
                </select>
                
                <input 
                  type="text"
                  value={logicInputB}
                  onChange={(e) => setLogicInputB(e.target.value.replace(/[^01]/g, ''))}
                  className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded p-1.5 font-mono text-sm text-right text-slate-800 dark:text-slate-200 outline-none focus:border-pink-500 shadow-sm"
                  placeholder="Input B (Binary)"
                />
              </div>

              <div className="flex justify-between items-center bg-pink-50 dark:bg-pink-900/10 px-3 py-2 border border-pink-200 dark:border-pink-800/30 rounded font-mono text-sm shadow-inner">
                <span className="text-pink-600 dark:text-pink-400 font-semibold">Result:</span>
                <span className="text-pink-700 dark:text-pink-300 font-bold tracking-widest">{isValid ? logicResult : '---'}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-lg border border-slate-200 dark:border-slate-800 flex-1">
             <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-500" />
              Step-by-Step Breakdown
            </h3>
            
            {isValid ? (
              <div className="space-y-3 font-mono text-xs text-slate-600 dark:text-slate-400 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                <div className="p-3 bg-white dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-800 shadow-sm">
                  {inputBase !== 10 ? (
                    <>
                      <div className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Step 1: Convert Base {inputBase} to Decimal (Base 10)</div>
                      <div className="text-[11px] mb-2 leading-relaxed">
                        Multiply each digit by {inputBase} raised to its positional power, from right to left:
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded text-[11px] overflow-x-auto whitespace-nowrap mb-2">
                        {inputValue.split('').reverse().map((digit, i) => {
                          const val = parseInt(digit, inputBase);
                          return (
                            <span key={i}>
                              {val} &times; {inputBase}<sup>{i}</sup>
                              {i < inputValue.length - 1 ? ' + ' : ''}
                            </span>
                          );
                        }).reverse()}
                      </div>
                      <div>
                        = <span className="font-bold text-slate-800 dark:text-slate-200">{decimalValue}</span>
                      </div>
                    </>
                  ) : (
                     <>
                      <div className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Step 1: Convert to Decimal (Base 10)</div>
                      <div>Input is already in Decimal (Base 10): <span className="font-bold text-slate-800 dark:text-slate-200">{decimalValue}</span></div>
                    </>
                  )}
                </div>
                
                {outputBase !== 10 ? (
                  <div className="p-3 bg-white dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Step 2: Convert Decimal to Base {outputBase}</div>
                    <div className="text-[11px] mb-2">Repeatedly divide the decimal number by {outputBase} and keep track of the remainders.</div>
                    <table className="w-full text-left bg-slate-50 dark:bg-slate-900 rounded">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500">
                        <tr>
                          <th className="py-1 px-2">Value</th>
                          <th className="py-1 px-2">÷ {outputBase}</th>
                          <th className="py-1 px-2 text-right">Remainder</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          let steps = [];
                          let curr = decimalValue;
                          if (curr === 0) {
                            steps.push(
                              <tr key={0}>
                                <td className="py-1 px-2">0</td>
                                <td className="py-1 px-2">0</td>
                                <td className="py-1 px-2 text-right text-indigo-500 font-bold">0</td>
                              </tr>
                            );
                          } else {
                            let k = 0;
                            while (curr > 0) {
                              let q = Math.floor(curr / outputBase);
                              let r = curr % outputBase;
                              let displayR = r.toString(outputBase).toUpperCase();
                              steps.push(
                                <tr key={k++} className="border-b border-slate-200 dark:border-slate-800/50 last:border-0">
                                  <td className="py-1 px-2">{curr}</td>
                                  <td className="py-1 px-2">{q}</td>
                                  <td className="py-1 px-2 text-right text-indigo-500 font-bold">{displayR}</td>
                                </tr>
                              );
                              curr = q;
                            }
                          }
                          return steps;
                        })()}
                      </tbody>
                    </table>
                    <div className="mt-2 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                      Read the remainders from <span className="text-indigo-500 font-bold">bottom to top</span> to get the final result.
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Step 2: Convert to Target Base</div>
                    <div className="text-[11px]">Since the target base is 10, no further conversion is needed.</div>
                  </div>
                )}
                
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded border border-indigo-100 dark:border-indigo-800/50 shadow-sm text-center">
                  <div className="font-semibold text-indigo-700 dark:text-indigo-400 mb-1 text-[10px] uppercase tracking-wider">Final Result</div>
                  <div className="text-lg text-indigo-900 dark:text-indigo-300 font-bold tracking-widest">{convertedOutput} <sub className="text-xs font-normal text-indigo-600 dark:text-indigo-400">({outputBase})</sub></div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500 italic p-4 text-center">
                Awaiting valid input to generate conversion steps.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

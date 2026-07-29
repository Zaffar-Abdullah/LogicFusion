import React from 'react';

export function renderStepByStepBreakdown(inputValue: string, inputBase: number, outputBase: number, decimalValue: number, convertedOutput: string) {
  if (inputBase === outputBase) {
    return (
      <div className="p-3 bg-white dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="text-[11px]">Input and output base are the same. No conversion needed.</div>
      </div>
    );
  }

  const renderGroup2To10 = () => (
    <div className="p-3 bg-white dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-800 shadow-sm mb-3">
      <div className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Group 2: Base {inputBase} to Decimal</div>
      <div className="text-[11px] mb-2 leading-relaxed">
        Multiply each digit by {inputBase} raised to its positional power, from right to left:
      </div>
      <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded text-[11px] overflow-x-auto whitespace-nowrap mb-2">
        {inputValue.split('').map((digit, index) => {
          const power = inputValue.length - 1 - index;
          const val = parseInt(digit, inputBase);
          return (
            <span key={index}>
              {val} &times; {inputBase}<sup>{power}</sup>
              {index < inputValue.length - 1 ? ' + ' : ''}
            </span>
          );
        })}
      </div>
      <div>
        = <span className="font-bold text-slate-800 dark:text-slate-200">{decimalValue}</span>
      </div>
    </div>
  );

  const renderGroup1From10 = (targetBase: number, valToConvert: number = decimalValue) => (
    <div className="p-3 bg-white dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-800 shadow-sm mb-3">
      <div className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Group 1: Decimal to Base {targetBase}</div>
      <div className="text-[11px] mb-2">Repeatedly divide the decimal number by {targetBase} and keep track of the remainders.</div>
      <table className="w-full text-left bg-slate-50 dark:bg-slate-900 rounded">
        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500">
          <tr>
            <th className="py-1 px-2">Value</th>
            <th className="py-1 px-2">÷ {targetBase}</th>
            <th className="py-1 px-2 text-right">Remainder</th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            let steps = [];
            let curr = valToConvert;
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
                let q = Math.floor(curr / targetBase);
                let r = curr % targetBase;
                let displayR = r.toString(targetBase).toUpperCase();
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
  );

  const renderGroup3BinToOctHex = (bits: number) => {
    let currentBin = inputValue;
    while (currentBin.length % bits !== 0) {
      currentBin = '0' + currentBin;
    }
    const chunks = currentBin.match(new RegExp(`.{1,${bits}}`, 'g')) || [];
    return (
      <div className="p-3 bg-white dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-800 shadow-sm mb-3">
        <div className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Group 3: Binary to {outputBase === 8 ? 'Octal' : 'Hex'}</div>
        <div className="text-[11px] mb-3">Group bits into chunks of {bits} from right to left, then convert each chunk.</div>
        
        <div className="flex justify-center gap-4 mb-2 flex-wrap">
          {chunks.map((chunk, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded tracking-widest">{chunk}</div>
              <div className="text-slate-400">↓</div>
              <div className="font-bold text-indigo-600 dark:text-indigo-400">{parseInt(chunk, 2).toString(outputBase).toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderGroup4OctHexToBin = (bits: number) => {
    return (
      <div className="p-3 bg-white dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-800 shadow-sm mb-3">
        <div className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Group 4: {inputBase === 8 ? 'Octal' : 'Hex'} to Binary</div>
        <div className="text-[11px] mb-3">Convert each digit independently into its {bits}-bit binary equivalent.</div>
        
        <div className="flex justify-center gap-4 mb-2 flex-wrap">
          {inputValue.split('').map((char, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="font-bold text-indigo-600 dark:text-indigo-400">{char}</div>
              <div className="text-slate-400">↓</div>
              <div className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded tracking-widest">
                {parseInt(char, inputBase).toString(2).padStart(bits, '0')}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderGroup5OctalToHex = () => {
    return (
      <>
        <div className="font-semibold text-xs text-slate-500 uppercase tracking-widest mb-2 mt-1">Group 5: Octal to Hex</div>
        {renderGroup4OctHexToBin(3)}
        {(() => {
          let bin = inputValue.split('').map(c => parseInt(c, 8).toString(2).padStart(3, '0')).join('');
          while (bin.length % 4 !== 0) bin = '0' + bin;
          const chunks = bin.match(new RegExp(`.{1,4}`, 'g')) || [];
          return (
            <div className="p-3 bg-white dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-800 shadow-sm mb-3">
              <div className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Then: Binary to Hex (Group 3)</div>
              <div className="flex justify-center gap-4 mb-2 flex-wrap">
                {chunks.map((chunk, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded tracking-widest">{chunk}</div>
                    <div className="text-slate-400">↓</div>
                    <div className="font-bold text-indigo-600 dark:text-indigo-400">{parseInt(chunk, 2).toString(16).toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </>
    );
  };

  const renderGroup6HexToOctal = () => {
    return (
      <>
        <div className="font-semibold text-xs text-slate-500 uppercase tracking-widest mb-2 mt-1">Group 6: Hex to Octal</div>
        {renderGroup4OctHexToBin(4)}
        {(() => {
          let bin = inputValue.split('').map(c => parseInt(c, 16).toString(2).padStart(4, '0')).join('');
          while (bin.length % 3 !== 0) bin = '0' + bin;
          const chunks = bin.match(new RegExp(`.{1,3}`, 'g')) || [];
          return (
            <div className="p-3 bg-white dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-800 shadow-sm mb-3">
              <div className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Then: Binary to Octal (Group 3)</div>
              <div className="flex justify-center gap-4 mb-2 flex-wrap">
                {chunks.map((chunk, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded tracking-widest">{chunk}</div>
                    <div className="text-slate-400">↓</div>
                    <div className="font-bold text-indigo-600 dark:text-indigo-400">{parseInt(chunk, 2).toString(8)}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </>
    );
  };


  let steps = null;

  if (inputBase === 10) steps = renderGroup1From10(outputBase);
  else if (outputBase === 10) steps = renderGroup2To10();
  else if (inputBase === 2 && (outputBase === 8 || outputBase === 16)) steps = renderGroup3BinToOctHex(outputBase === 8 ? 3 : 4);
  else if ((inputBase === 8 || inputBase === 16) && outputBase === 2) steps = renderGroup4OctHexToBin(inputBase === 8 ? 3 : 4);
  else if (inputBase === 8 && outputBase === 16) steps = renderGroup5OctalToHex();
  else if (inputBase === 16 && outputBase === 8) steps = renderGroup6HexToOctal();

  return (
    <>
      {steps}
      <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded border border-indigo-100 dark:border-indigo-800/50 shadow-sm text-center">
        <div className="font-semibold text-indigo-700 dark:text-indigo-400 mb-1 text-[10px] uppercase tracking-wider">Final Result</div>
        <div className="text-lg text-indigo-900 dark:text-indigo-300 font-bold tracking-widest">{convertedOutput} <sub className="text-xs font-normal text-indigo-600 dark:text-indigo-400">({outputBase})</sub></div>
      </div>
    </>
  );
}

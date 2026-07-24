import React from 'react';

// Generates a 4-variable K-Map (w, x, y, z)
export default function KMapVisualizer({ truthTable }: { truthTable: any[] }) {
  if (!truthTable || truthTable.length !== 16) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-slate-500 font-mono p-4 text-center">
        K-Map visualization is currently supported for 4-variable expressions (16 truth table rows).
      </div>
    );
  }

  // K-Map cell indices for 4 variables
  // Rows: wx (00, 01, 11, 10) -> decimal: 0, 1, 3, 2
  // Cols: yz (00, 01, 11, 10) -> decimal: 0, 1, 3, 2
  // Minterm = (w<<3) | (x<<2) | (y<<1) | z
  
  const rows = ['00', '01', '11', '10'];
  const cols = ['00', '01', '11', '10'];

  const getMintermValue = (wx: string, yz: string) => {
    const binStr = wx + yz;
    const decimal = parseInt(binStr, 2);
    // find in truth table
    const row = truthTable[decimal];
    return row ? row.f : 0;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 overflow-auto custom-scrollbar">
      <div className="relative">
        <div className="absolute -top-6 left-0 text-xs font-bold text-slate-500 dark:text-slate-400">wx \ yz</div>
        
        <table className="border-collapse border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
          <thead>
            <tr>
              <th className="border-b-2 border-r-2 border-slate-300 dark:border-slate-700 p-2 bg-slate-100 dark:bg-slate-800"></th>
              {cols.map(c => (
                <th key={c} className="border border-slate-300 dark:border-slate-700 p-2 min-w-[40px] bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r}>
                <th className="border border-slate-300 dark:border-slate-700 p-2 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold">
                  {r}
                </th>
                {cols.map(c => {
                  const val = getMintermValue(r, c);
                  const isOne = val === 1;
                  return (
                    <td 
                      key={c} 
                      className={`border border-slate-300 dark:border-slate-700 p-3 text-center font-mono text-lg font-bold transition-colors ${
                        isOne 
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                          : 'text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 text-[10px] text-slate-500 dark:text-slate-400 text-center max-w-[300px]">
        Values are mapped using Gray code ordering (00, 01, 11, 10) to ensure adjacent cells differ by only one bit.
      </div>
    </div>
  );
}

import sys

with open('src/components/embedded/ArduinoWorkspace.tsx', 'r') as f:
    content = f.read()

new_content = content.replace("""    </div>
  );
}""", """      
      {/* Learning Mode Panel */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg p-4">
        <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" /> Learning Mode Insight
        </h4>
        <div className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-3">
          {pinStates['13']?.value === 'HIGH' ? (
             <div className="flex items-center gap-2 animate-pulse text-green-600 dark:text-green-400 font-medium">
               <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Pin 13 (HIGH)</span>
               <span>→</span>
               <span>Current flows</span>
               <span>→</span>
               <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Resistor</span>
               <span>→</span>
               <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">LED ON</span>
               <span>→</span>
               <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Ground (GND)</span>
             </div>
          ) : (
             <div className="flex items-center gap-2 text-slate-500">
               <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Pin 13 (LOW)</span>
               <span>→</span>
               <span>No voltage</span>
               <span>→</span>
               <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">LED OFF</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}""")

with open('src/components/embedded/ArduinoWorkspace.tsx', 'w') as f:
    f.write(new_content)

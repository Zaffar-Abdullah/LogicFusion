import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Remove import
content = content.replace("import CompleteDigitalComputerSimulator from './components/CompleteDigitalComputerSimulator';\n", "")

# Remove tab state references
content = content.replace("<'learning' | 'converter' | 'circuit' | 'embedded'>('embedded')", "<'converter' | 'circuit' | 'embedded'>('embedded')")

# Remove learning tab button
learning_btn = """              <button
                onClick={() => setActiveTab('learning')}
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded transition-colors ${
                  activeTab === 'learning' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                Computer Simulator
              </button>"""
content = content.replace(learning_btn, "")

# Remove conditional rendering
content = content.replace("{activeTab === 'learning' && <CompleteDigitalComputerSimulator />}\n", "")

with open('src/App.tsx', 'w') as f:
    f.write(content)

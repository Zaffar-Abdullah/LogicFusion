import os

# Ensure dir
os.makedirs('src/components/embedded', exist_ok=True)

# 1. Main Component
main_content = """import React, { useState, useEffect } from 'react';
import ArduinoWorkspace from './ArduinoWorkspace';
import ArduinoEditor from './ArduinoEditor';
import ArduinoMonitors from './ArduinoMonitors';
import { Play, Square, Code, Activity, Terminal } from 'lucide-react';
import { ArduinoEngine } from './ArduinoEngine';

export default function VirtualEmbeddedLab() {
  const [isRunning, setIsRunning] = useState(false);
  const [code, setCode] = useState(`void setup() {\\n  pinMode(13, OUTPUT);\\n  Serial.begin(9600);\\n}\\n\\nvoid loop() {\\n  digitalWrite(13, HIGH);\\n  Serial.println("LED ON");\\n  delay(1000);\\n  digitalWrite(13, LOW);\\n  Serial.println("LED OFF");\\n  delay(1000);\\n}`);
  const [pinStates, setPinStates] = useState<Record<string, { mode: string, value: string }>>({});
  const [serialOutput, setSerialOutput] = useState<string[]>([]);
  const [activeRightTab, setActiveRightTab] = useState<'code' | 'gpio' | 'serial'>('code');
  const [engine, setEngine] = useState<ArduinoEngine | null>(null);

  // Initialize engine
  useEffect(() => {
    const newEngine = new ArduinoEngine();
    newEngine.onPinUpdate = (pin, mode, value) => {
      setPinStates(prev => ({
        ...prev,
        [pin]: { mode, value }
      }));
    };
    newEngine.onSerialOutput = (text) => {
      setSerialOutput(prev => [...prev, text].slice(-50)); // Keep last 50 lines
    };
    setEngine(newEngine);
    return () => newEngine.stop();
  }, []);

  const handleRun = async () => {
    if (!engine) return;
    setIsRunning(true);
    setSerialOutput([]);
    try {
      await engine.run(code);
    } catch (e: any) {
      setSerialOutput(prev => [...prev, `ERROR: ${e.message}`]);
      setIsRunning(false);
    }
  };

  const handleStop = () => {
    if (engine) engine.stop();
    setIsRunning(false);
    setPinStates({});
  };

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
      {/* Left Pane: Workspace */}
      <div className="flex-1 flex flex-col relative border-r border-slate-200 dark:border-slate-800">
        <div className="h-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4">
          <div className="font-semibold text-sm flex items-center gap-2">
            <span className="text-slate-800 dark:text-slate-200">Virtual Embedded Lab (MVP)</span>
            <span className="px-2 py-0.5 text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full font-bold">Arduino Uno</span>
          </div>
          <div className="flex gap-2">
            {!isRunning ? (
              <button 
                onClick={handleRun}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors shadow-sm"
              >
                <Play className="w-3.5 h-3.5" /> Start Simulation
              </button>
            ) : (
              <button 
                onClick={handleStop}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded transition-colors shadow-sm"
              >
                <Square className="w-3.5 h-3.5" /> Stop
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 relative">
           <ArduinoWorkspace pinStates={pinStates} isRunning={isRunning} />
        </div>
      </div>

      {/* Right Pane: Code & Monitors */}
      <div className="w-[450px] flex flex-col bg-white dark:bg-slate-900">
        <div className="h-12 bg-slate-100 dark:bg-slate-950 flex p-1 border-b border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setActiveRightTab('code')}
            className={`flex-1 flex items-center justify-center gap-2 text-xs font-medium rounded transition-colors ${activeRightTab === 'code' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Code className="w-3.5 h-3.5" /> Code
          </button>
          <button 
            onClick={() => setActiveRightTab('gpio')}
            className={`flex-1 flex items-center justify-center gap-2 text-xs font-medium rounded transition-colors ${activeRightTab === 'gpio' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Activity className="w-3.5 h-3.5" /> GPIO Monitor
          </button>
          <button 
            onClick={() => setActiveRightTab('serial')}
            className={`flex-1 flex items-center justify-center gap-2 text-xs font-medium rounded transition-colors ${activeRightTab === 'serial' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Terminal className="w-3.5 h-3.5" /> Serial
          </button>
        </div>
        
        <div className="flex-1 min-h-0 overflow-hidden relative">
          {activeRightTab === 'code' && (
            <ArduinoEditor code={code} onChange={setCode} />
          )}
          {activeRightTab === 'gpio' && (
            <ArduinoMonitors type="gpio" pinStates={pinStates} serialOutput={serialOutput} />
          )}
          {activeRightTab === 'serial' && (
            <ArduinoMonitors type="serial" pinStates={pinStates} serialOutput={serialOutput} />
          )}
        </div>
      </div>
    </div>
  );
}
"""

with open('src/components/VirtualEmbeddedLab.tsx', 'w') as f:
    f.write(main_content)

# 2. ArduinoEngine (Simple JS eval based simulator for MVP)
engine_content = """export class ArduinoEngine {
  onPinUpdate: (pin: string | number, mode: string, value: string) => void = () => {};
  onSerialOutput: (text: string) => void = () => {};
  
  private isRunning = false;
  private pins: Record<string, { mode: string, value: number }> = {};
  
  // Constants exposed to script
  private constants = {
    HIGH: 1,
    LOW: 0,
    INPUT: 0,
    OUTPUT: 1,
    INPUT_PULLUP: 2
  };

  stop() {
    this.isRunning = false;
  }

  async run(cppCode: string) {
    this.stop();
    this.isRunning = true;
    this.pins = {};

    // Very naive C++ to JS transpilation for simple Arduino sketches
    let jsCode = cppCode
      .replace(/void\\s+setup\\s*\\(\\)/g, 'async function setup()')
      .replace(/void\\s+loop\\s*\\(\\)/g, 'async function loop()')
      .replace(/int\\s+/g, 'let ')
      .replace(/float\\s+/g, 'let ')
      .replace(/String\\s+/g, 'let ')
      .replace(/const\\s+let/g, 'const')
      .replace(/delay\\s*\\(/g, 'await _delay(')
      // Strip out comments to prevent issues
      .replace(/\\/\\/[^\\n]*/g, '');

    // Setup Serial polyfill
    const Serial = {
      begin: (baud: number) => this.onSerialOutput(`Serial port opened at ${baud} baud`),
      print: (val: any) => this.onSerialOutput(`${val}`),
      println: (val: any) => this.onSerialOutput(`${val}\\n`)
    };

    const pinMode = (pin: number, mode: number) => {
      const modeStr = mode === 1 ? 'OUTPUT' : (mode === 2 ? 'INPUT_PULLUP' : 'INPUT');
      if (!this.pins[pin]) this.pins[pin] = { mode: modeStr, value: 0 };
      else this.pins[pin].mode = modeStr;
      this.onPinUpdate(pin, modeStr, this.pins[pin].value ? 'HIGH' : 'LOW');
    };

    const digitalWrite = (pin: number, value: number) => {
      if (!this.pins[pin]) this.pins[pin] = { mode: 'OUTPUT', value: 0 };
      this.pins[pin].value = value;
      this.onPinUpdate(pin, this.pins[pin].mode, value ? 'HIGH' : 'LOW');
    };

    const digitalRead = (pin: number) => {
      return this.pins[pin] ? this.pins[pin].value : 0;
    };

    const analogWrite = (pin: number, value: number) => {
      digitalWrite(pin, value > 127 ? 1 : 0); // Simplified for MVP
    };

    const _delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Construct evaluation context
    const evalScope = `
      ${Object.entries(this.constants).map(([k, v]) => `const ${k} = ${v};`).join('\\n')}
      ${jsCode}
      
      return {
        setup: typeof setup === 'function' ? setup : async () => {},
        loop: typeof loop === 'function' ? loop : async () => {}
      };
    `;

    try {
      const createModule = new Function('pinMode', 'digitalWrite', 'digitalRead', 'analogWrite', '_delay', 'Serial', evalScope);
      const { setup, loop } = createModule(pinMode, digitalWrite, digitalRead, analogWrite, _delay, Serial);

      if (this.isRunning) await setup();
      
      // Infinite loop runner
      while (this.isRunning) {
        await loop();
        // Prevent complete freezing if loop doesn't have delay
        await _delay(10);
      }
    } catch (err: any) {
      console.error(err);
      this.onSerialOutput(`Compilation/Execution Error: ${err.message}`);
      this.isRunning = false;
    }
  }
}
"""

with open('src/components/embedded/ArduinoEngine.ts', 'w') as f:
    f.write(engine_content)

# 3. Arduino Editor
editor_content = """import React from 'react';
import Editor from '@monaco-editor/react';

export default function ArduinoEditor({ code, onChange }: { code: string, onChange: (val: string) => void }) {
  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage="cpp"
        theme="vs-dark"
        value={code}
        onChange={(val) => onChange(val || '')}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          padding: { top: 16 }
        }}
      />
    </div>
  );
}
"""

with open('src/components/embedded/ArduinoEditor.tsx', 'w') as f:
    f.write(editor_content)

# 4. Arduino Monitors
monitors_content = """import React from 'react';

export default function ArduinoMonitors({ type, pinStates, serialOutput }: { type: 'gpio' | 'serial', pinStates: any, serialOutput: string[] }) {
  if (type === 'serial') {
    return (
      <div className="h-full bg-slate-950 text-green-400 font-mono text-sm p-4 overflow-y-auto custom-scrollbar flex flex-col">
        {serialOutput.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
        {serialOutput.length === 0 && (
          <div className="text-slate-600 italic">No serial output yet. Ensure Serial.begin(9600); is in setup().</div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-slate-900 p-4 overflow-y-auto custom-scrollbar">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Live GPIO Monitor</h3>
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-100 dark:bg-slate-800">
          <tr>
            <th className="px-3 py-2 font-medium">Pin</th>
            <th className="px-3 py-2 font-medium">Mode</th>
            <th className="px-3 py-2 font-medium">Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {Object.entries(pinStates).map(([pin, state]: [string, any]) => (
            <tr key={pin} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-3 py-2 font-mono text-indigo-500">D{pin}</td>
              <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{state.mode}</td>
              <td className="px-3 py-2 font-bold text-slate-800 dark:text-slate-200">
                <span className={`px-2 py-0.5 rounded text-xs ${state.value === 'HIGH' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                  {state.value}
                </span>
              </td>
            </tr>
          ))}
          {Object.keys(pinStates).length === 0 && (
            <tr>
              <td colSpan={3} className="px-3 py-4 text-center text-slate-500 italic">No pins configured yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
"""

with open('src/components/embedded/ArduinoMonitors.tsx', 'w') as f:
    f.write(monitors_content)

# 5. Arduino Workspace
workspace_content = """import React, { useCallback, useState } from 'react';
import { ReactFlow, Controls, Background, MiniMap, Node, Edge, addEdge, applyNodeChanges, applyEdgeChanges, Connection, NodeChange, EdgeChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Lightbulb, SquareTerminal } from 'lucide-react';

const ArduinoNode = ({ data }: { data: any }) => (
  <div className="bg-teal-700 text-white rounded-lg p-4 w-64 shadow-xl border-2 border-teal-900 relative">
    <div className="text-center font-bold text-xl tracking-wider mb-2 opacity-80">ARDUINO UNO</div>
    <div className="flex justify-between mt-4">
      <div className="flex flex-col gap-1">
        {/* Analog/Power Pins (Simplified) */}
        <div className="text-[8px] font-mono opacity-70">POWER</div>
        <div className="w-3 h-3 bg-slate-900 rounded-full border border-slate-600 relative">
           <div className="absolute -left-6 text-[8px]">GND</div>
        </div>
      </div>
      <div className="flex flex-col gap-1 items-end">
        {/* Digital Pins */}
        <div className="text-[8px] font-mono opacity-70">DIGITAL (PWM~)</div>
        {[13, 12, 11].map(pin => (
          <div key={pin} className="w-3 h-3 bg-slate-900 rounded-full border border-slate-600 relative flex items-center">
            <div className="absolute -right-6 text-[8px] w-4">{pin}</div>
            {/* Visual indicator for pin state */}
            {data.pinStates?.[pin] && (
               <div className={`absolute -right-10 w-2 h-2 rounded-full ${data.pinStates[pin].value === 'HIGH' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-slate-700'}`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
      <SquareTerminal className="w-16 h-16" />
    </div>
  </div>
);

const LedNode = ({ data }: { data: any }) => {
  // Simple check if it's connected to a HIGH pin
  const isOn = data.isConnectedHigh;
  return (
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full border-2 transition-all duration-75 ${isOn ? 'bg-red-500 border-red-400 shadow-[0_0_20px_#ef4444]' : 'bg-red-900/50 border-red-800/50'}`}></div>
      <div className="flex gap-2 mt-1">
        <div className="w-1 h-6 bg-slate-400 rounded-b"></div>
        <div className="w-1 h-8 bg-slate-400 rounded-b"></div>
      </div>
    </div>
  );
};

const nodeTypes = {
  arduino: ArduinoNode,
  led: LedNode
};

export default function ArduinoWorkspace({ pinStates, isRunning }: { pinStates: any, isRunning: boolean }) {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'board-1', type: 'arduino', position: { x: 250, y: 150 }, data: { pinStates } },
    { id: 'comp-led', type: 'led', position: { x: 600, y: 100 }, data: { isConnectedHigh: false } }
  ]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Update nodes data when pinStates changes
  React.useEffect(() => {
    setNodes(nds => nds.map(node => {
      if (node.id === 'board-1') {
        return { ...node, data: { ...node.data, pinStates } };
      }
      if (node.id === 'comp-led') {
        // Simplified wiring logic for MVP: just assume led is bound to pin 13 internally 
        // to show animation in the UI without complex graph traversal for this demo
        const isHigh = pinStates['13']?.value === 'HIGH';
        return { ...node, data: { ...node.data, isConnectedHigh: isHigh } };
      }
      return node;
    }));
  }, [pinStates]);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((connection: Connection) => setEdges((eds) => addEdge({ ...connection, animated: true, style: { stroke: '#ef4444', strokeWidth: 3 } }, eds)), []);

  return (
    <div className="w-full h-full bg-[#f0f2f5] dark:bg-[#0f111a]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background gap={20} color="#cbd5e1" />
        <Controls />
      </ReactFlow>
      
      {/* Component Library Panel */}
      <div className="absolute top-4 left-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm p-3 w-48">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Components</h4>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 cursor-grab">
            <Lightbulb className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">LED (Red)</span>
          </div>
          <div className="text-[10px] text-slate-400 italic mt-1">
            (Drag & drop to be fully implemented. For now, LED is auto-linked to Pin 13 visually)
          </div>
        </div>
      </div>
    </div>
  );
}
"""

with open('src/components/embedded/ArduinoWorkspace.tsx', 'w') as f:
    f.write(workspace_content)


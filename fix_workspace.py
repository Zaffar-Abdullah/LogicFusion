import sys

content = """import React, { useCallback, useState, useEffect } from 'react';
import { ReactFlow, Controls, Background, Node, Edge, addEdge, applyNodeChanges, applyEdgeChanges, Connection, NodeChange, EdgeChange, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Lightbulb, SquareTerminal } from 'lucide-react';

const ArduinoNode = ({ data }: { data: any }) => (
  <div className="bg-teal-700 text-white rounded-lg p-4 w-64 shadow-xl border-2 border-teal-900 relative">
    <div className="text-center font-bold text-xl tracking-wider mb-2 opacity-80">ARDUINO UNO</div>
    <div className="flex justify-between mt-4">
      <div className="flex flex-col gap-2">
        <div className="text-[8px] font-mono opacity-70">POWER</div>
        <div className="relative flex items-center h-4">
           <div className="text-[10px] w-8">GND</div>
           <div className="w-3 h-3 bg-slate-900 rounded-full border border-slate-600"></div>
           <Handle type="source" position={Position.Left} id="pin-gnd" style={{ left: 24, top: 8, background: '#1e293b' }} />
        </div>
      </div>
      <div className="flex flex-col gap-2 items-end">
        <div className="text-[8px] font-mono opacity-70">DIGITAL (PWM~)</div>
        {[13, 12, 11, 10, 9, 8].map(pin => (
          <div key={pin} className="relative flex items-center justify-end h-4 w-full">
            <div className="text-[10px] mr-2">D{pin}</div>
            <div className="w-3 h-3 bg-slate-900 rounded-full border border-slate-600 relative">
              {data.pinStates?.[pin] && (
                <div className={`absolute -right-4 w-2 h-2 rounded-full ${data.pinStates[pin].value === 'HIGH' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-slate-700'}`}></div>
              )}
            </div>
            <Handle type="source" position={Position.Right} id={`pin-${pin}`} style={{ right: -6, top: 8, background: '#1e293b' }} />
          </div>
        ))}
      </div>
    </div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
      <SquareTerminal className="w-16 h-16" />
    </div>
  </div>
);

const LedNode = ({ data }: { data: any }) => {
  const isOn = data.isConnectedHigh;
  return (
    <div className="flex flex-col items-center relative p-2">
      <Handle type="target" position={Position.Left} id="led-in" style={{ left: 8, top: 18, background: '#1e293b' }} />
      <div className={`w-8 h-8 rounded-full border-2 transition-all duration-75 ${isOn ? 'bg-red-500 border-red-400 shadow-[0_0_20px_#ef4444]' : 'bg-red-900/50 border-red-800/50'}`}></div>
      <div className="flex gap-2 mt-1">
        <div className="w-1 h-6 bg-slate-400 rounded-b"></div>
        <div className="w-1 h-8 bg-slate-400 rounded-b"></div>
      </div>
      <Handle type="source" position={Position.Right} id="led-out" style={{ right: 8, top: 40, background: '#1e293b' }} />
    </div>
  );
};

const nodeTypes = {
  arduino: ArduinoNode,
  led: LedNode
};

export default function ArduinoWorkspace({ pinStates, isRunning }: { pinStates: any, isRunning: boolean }) {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'board-1', type: 'arduino', position: { x: 50, y: 50 }, data: { pinStates } },
    { id: 'comp-led', type: 'led', position: { x: 450, y: 110 }, data: { isConnectedHigh: false } }
  ]);
  const [edges, setEdges] = useState<Edge[]>([
    { id: 'e-13-led', source: 'board-1', sourceHandle: 'pin-13', target: 'comp-led', targetHandle: 'led-in', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } }
  ]);

  useEffect(() => {
    setNodes(nds => nds.map(node => {
      if (node.id === 'board-1') {
        return { ...node, data: { ...node.data, pinStates } };
      }
      if (node.id === 'comp-led') {
        // Find if any edge connects a HIGH pin to this LED
        let isHigh = false;
        const ledEdge = edges.find(e => e.target === 'comp-led');
        if (ledEdge && ledEdge.source === 'board-1') {
          const sourcePin = ledEdge.sourceHandle?.replace('pin-', '');
          if (sourcePin && pinStates[sourcePin]?.value === 'HIGH') {
            isHigh = true;
          }
        }
        return { ...node, data: { ...node.data, isConnectedHigh: isHigh } };
      }
      return node;
    }));
  }, [pinStates, edges]);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((connection: Connection) => setEdges((eds) => addEdge({ ...connection, animated: true, style: { stroke: '#64748b', strokeWidth: 2 } }, eds)), []);

  return (
    <div className="w-full h-full bg-[#f0f2f5] dark:bg-[#0f111a] relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        style={{ width: '100%', height: '100%' }}
      >
        <Background gap={20} color="#cbd5e1" />
        <Controls />
      </ReactFlow>
      
      <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm p-3 w-48 z-10">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Components</h4>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 cursor-grab">
            <Lightbulb className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">LED (Red)</span>
          </div>
          <div className="text-[10px] text-slate-500 italic mt-1 leading-tight">
            Try wiring the LED to different pins and update the code!
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg p-4 z-10 pointer-events-none">
        <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" /> Live Execution Context
        </h4>
        <div className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-3">
          {Object.entries(pinStates).filter(([_, s]: any) => s.value === 'HIGH').length > 0 ? (
             <div className="flex flex-wrap items-center gap-2 animate-pulse text-green-600 dark:text-green-400 font-medium">
               {Object.entries(pinStates).filter(([_, s]: any) => s.value === 'HIGH').map(([pin]) => (
                  <span key={pin} className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Pin {pin} (HIGH)</span>
               ))}
               <span>→</span>
               <span>Voltage Output Active</span>
               <span>→</span>
               <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Circuit closed</span>
             </div>
          ) : (
             <div className="flex items-center gap-2 text-slate-500">
               <span>All Pins LOW</span>
               <span>→</span>
               <span>No voltage</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
"""

with open('src/components/embedded/ArduinoWorkspace.tsx', 'w') as f:
    f.write(content)

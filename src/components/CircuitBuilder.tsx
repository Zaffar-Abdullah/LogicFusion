import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  Handle,
  Position,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Activity, Clock } from 'lucide-react';

// Gate computation logic
const computeGate = (type: string, inputs: boolean[]) => {
  const [a = false, b = false] = inputs;
  switch (type) {
    case 'AND': return a && b;
    case 'OR': return a || b;
    case 'NOT': return !a;
    case 'NAND': return !(a && b);
    case 'NOR': return !(a || b);
    case 'XOR': return a !== b;
    case 'XNOR': return a === b;
    default: return false;
  }
};

// Custom Input Node
const InputNode = ({ data, id }: any) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500/50 rounded p-2 shadow-sm flex items-center justify-between min-w-[90px]">
      <div className="font-bold text-[10px] text-slate-500 dark:text-slate-400 font-mono pr-2">IN</div>
      <button 
        onClick={() => data.toggle(id)}
        className={`w-8 h-8 rounded flex items-center justify-center font-mono font-bold text-white transition-colors text-sm ${data.value ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700'}`}
      >
        {data.value ? '1' : '0'}
      </button>
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-slate-400 border-none" />
    </div>
  );
};

// Custom Clock Node
const ClockNode = ({ data }: any) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-amber-500/50 rounded p-2 shadow-sm flex items-center justify-between min-w-[90px]">
      <div className="font-bold text-[10px] text-amber-600 dark:text-amber-500 font-mono pr-2">CLK</div>
      <div className={`w-8 h-8 rounded flex items-center justify-center font-mono font-bold text-white transition-colors text-sm ${data.value ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700'}`}>
        {data.value ? '1' : '0'}
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-slate-400 border-none" />
    </div>
  );
};

// Custom Output Node
const OutputNode = ({ data }: any) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500/50 rounded p-2 shadow-sm flex items-center justify-between min-w-[90px]">
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-slate-400 border-none" />
      <div className="font-bold text-[10px] text-slate-500 dark:text-slate-400 font-mono pl-1 pr-2">OUT</div>
      <div className={`w-8 h-8 rounded flex items-center justify-center font-mono font-bold text-white text-sm ${data.value ? 'bg-indigo-600 shadow-xl shadow-indigo-600/40' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700'}`}>
        {data.value ? '1' : '0'}
      </div>
    </div>
  );
};

// Custom Gate Node
const GateNode = ({ data, id }: any) => {
  const isUnary = data.type === 'NOT';
  return (
    <div className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded shadow-sm w-[80px] text-center overflow-hidden flex flex-col">
      <div className="bg-slate-100 dark:bg-slate-900/80 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
        {data.type}
      </div>
      <div className="p-2 relative flex flex-col h-14 justify-center items-center bg-white dark:bg-slate-800">
        {!isUnary ? (
          <>
            <Handle type="target" position={Position.Left} id="a" style={{ top: '30%' }} className="w-1.5 h-1.5 bg-slate-400 border-none rounded-none" />
            <Handle type="target" position={Position.Left} id="b" style={{ top: '70%' }} className="w-1.5 h-1.5 bg-slate-400 border-none rounded-none" />
          </>
        ) : (
          <Handle type="target" position={Position.Left} id="a" className="w-1.5 h-1.5 bg-slate-400 border-none rounded-none" />
        )}
        <div className={`font-mono text-sm font-bold ${data.value ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}`}>
          {data.value ? '1' : '0'}
        </div>
        <Handle type="source" position={Position.Right} className="w-1.5 h-1.5 bg-slate-400 border-none rounded-none" />
      </div>
    </div>
  );
};

const nodeTypes = {
  inputNode: InputNode,
  outputNode: OutputNode,
  gateNode: GateNode,
  clockNode: ClockNode,
};

let idCounter = 0;
const getId = () => `node_${idCounter++}`;

const TICK_RATE_MS = 100; // 10 ticks per second
const MAX_HISTORY = 100;
const GATE_DELAY_TICKS = 2; // 200ms propagation delay
const CLOCK_HALF_PERIOD_TICKS = 5; // 500ms high, 500ms low (1Hz)

export default function CircuitBuilder() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [waveformTick, setWaveformTick] = useState(0);
  
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);

  const simEngine = useRef({
    history: {} as Record<string, boolean[]>,
    gateQueue: {} as Record<string, { pendingValue: boolean, ticksLeft: number }>,
    tick: 0,
  });

  const toggleInput = useCallback((id: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, value: !node.data.value },
          };
        }
        return node;
      })
    );
  }, []);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((connection: Connection) => setEdges((eds) => addEdge({ ...connection, animated: true }, eds)), []);

  const addNode = (type: string, nodeType: string = 'gateNode') => {
    const newNode: Node = {
      id: getId(),
      type: nodeType,
      position: { x: 250, y: 150 },
      data: { type, value: false, toggle: toggleInput },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  // Event-Driven Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const engine = simEngine.current;
      engine.tick++;
      
      const currentNodes = [...nodesRef.current];
      const currentEdges = edgesRef.current;
      const nodeMap = new Map(currentNodes.map(n => [n.id, n]));
      let nodesChanged = false;

      const getSourceValue = (targetId: string, handleId: string | null) => {
        const edge = currentEdges.find(e => e.target === targetId && (handleId ? e.targetHandle === handleId : true));
        if (!edge) return false;
        const sourceNode = nodeMap.get(edge.source);
        return sourceNode?.data?.value || false;
      };

      currentNodes.forEach((node, index) => {
        // 1. Clock Signal Simulation
        if (node.type === 'clockNode') {
          if (engine.tick % CLOCK_HALF_PERIOD_TICKS === 0) {
            currentNodes[index] = { ...node, data: { ...node.data, value: !node.data.value } };
            nodeMap.set(node.id, currentNodes[index]);
            nodesChanged = true;
          }
        }
        // 2. Logic Gates with Propagation Delay
        else if (node.type === 'gateNode') {
          const type = node.data.type;
          const a = getSourceValue(node.id, 'a');
          const b = getSourceValue(node.id, 'b');
          const targetVal = computeGate(type, [a, b]);
          
          if (node.data.value !== targetVal) {
             if (!engine.gateQueue[node.id] || engine.gateQueue[node.id].pendingValue !== targetVal) {
                 engine.gateQueue[node.id] = { pendingValue: targetVal, ticksLeft: GATE_DELAY_TICKS };
             } else {
                 engine.gateQueue[node.id].ticksLeft--;
                 if (engine.gateQueue[node.id].ticksLeft <= 0) {
                     currentNodes[index] = { ...node, data: { ...node.data, value: targetVal } };
                     nodeMap.set(node.id, currentNodes[index]);
                     nodesChanged = true;
                     delete engine.gateQueue[node.id];
                 }
             }
          } else {
             delete engine.gateQueue[node.id];
          }
        }
        // 3. Output Nodes
        else if (node.type === 'outputNode') {
          const targetVal = getSourceValue(node.id, null);
          if (node.data.value !== targetVal) {
             currentNodes[index] = { ...node, data: { ...node.data, value: targetVal } };
             nodeMap.set(node.id, currentNodes[index]);
             nodesChanged = true;
          }
        }
      });

      // 4. Update History for Waveforms
      currentNodes.forEach(node => {
         if (['inputNode', 'clockNode', 'outputNode'].includes(node.type!)) {
             if (!engine.history[node.id]) engine.history[node.id] = Array(MAX_HISTORY).fill(false);
             engine.history[node.id].push(node.data.value || false);
             if (engine.history[node.id].length > MAX_HISTORY) {
                engine.history[node.id].shift();
             }
         }
      });

      if (nodesChanged) {
        setNodes(currentNodes);
      }
      // Always update waveform tick to advance the chart
      setWaveformTick(engine.tick);
      
    }, TICK_RATE_MS);
    
    return () => clearInterval(interval);
  }, []);

  const getWaveformPath = (history: boolean[]) => {
    if (!history || history.length === 0) return '';
    let pathData = '';
    history.forEach((val, i) => {
      const x = (i / MAX_HISTORY) * 100;
      const nextX = ((i + 1) / MAX_HISTORY) * 100;
      const y = val ? 20 : 80;
      if (i === 0) {
        pathData += `M ${x} ${y} L ${nextX} ${y} `;
      } else {
        const prevY = history[i-1] ? 20 : 80;
        if (prevY !== y) {
           pathData += `L ${x} ${y} `;
        }
        pathData += `L ${nextX} ${y} `;
      }
    });
    return pathData;
  };

  const trackedNodes = nodes.filter(n => ['inputNode', 'clockNode', 'outputNode'].includes(n.type!));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-lg shadow-sm h-[750px] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Logic Gate Circuit Builder</h2>
        <div className="flex gap-4">
          <span className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wider"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div> High (1)</span>
          <span className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider"><div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></div> Low (0)</span>
        </div>
      </div>
      
      {/* Circuit Canvas */}
      <div className="flex-1 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-950 relative min-h-[400px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-slate-50 dark:bg-slate-950"
          defaultEdgeOptions={{ style: { stroke: '#64748b', strokeWidth: 2 } }}
        >
          <Background color="#94a3b8" gap={20} size={1} />
          <Controls className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 fill-slate-700 dark:fill-slate-300" />
          <Panel position="top-left" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-sm flex flex-col gap-2 max-h-full overflow-y-auto m-2">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Signals</div>
            <button onClick={() => addNode('INPUT', 'inputNode')} className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1.5 rounded text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">Input Switch</button>
            <button onClick={() => addNode('CLOCK', 'clockNode')} className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 px-3 py-1.5 rounded text-xs font-medium hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors flex items-center justify-center gap-1"><Clock className="w-3 h-3"/> Clock (1Hz)</button>
            <button onClick={() => addNode('OUTPUT', 'outputNode')} className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 px-3 py-1.5 rounded text-xs font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">Output Lamp</button>
            <div className="h-px bg-slate-200 dark:bg-slate-800 my-1"></div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Gates</div>
            {['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'].map(gate => (
              <button 
                key={gate}
                onClick={() => addNode(gate)} 
                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {gate}
              </button>
            ))}
          </Panel>
        </ReactFlow>
      </div>

      {/* Waveform Visualization Panel */}
      <div className="h-48 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 p-4 flex flex-col shadow-inner">
        <div className="flex items-center gap-2 mb-3 shrink-0">
          <Activity className="w-4 h-4 text-indigo-500" />
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Timing Analysis (Waveforms)</h3>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 custom-scrollbar">
          {trackedNodes.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-500 dark:text-slate-500 font-mono">
              Add Inputs, Clocks, or Outputs to view timing waveforms.
            </div>
          ) : (
            trackedNodes.map(node => {
              const history = simEngine.current.history[node.id] || [];
              const isHigh = node.data.value;
              return (
                <div key={node.id} className="flex items-center gap-4">
                  <div className="w-20 shrink-0 flex flex-col">
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">
                      {node.type === 'inputNode' ? 'IN' : node.type === 'clockNode' ? 'CLK' : 'OUT'} ({node.id.split('_')[1]})
                    </span>
                    <span className={`text-[10px] font-mono font-bold ${isHigh ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {isHigh ? 'HIGH' : 'LOW'}
                    </span>
                  </div>
                  <div className="flex-1 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded relative overflow-hidden">
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                       <path 
                         d={getWaveformPath(history)} 
                         fill="none" 
                         stroke={isHigh ? '#10b981' : '#6366f1'} 
                         strokeWidth="2" 
                         vectorEffect="non-scaling-stroke"
                       />
                    </svg>
                    {/* Grid lines */}
                    <div className="absolute inset-0 pointer-events-none opacity-10 dark:opacity-20 flex justify-between">
                       {[...Array(10)].map((_, i) => (
                         <div key={i} className="h-full border-l border-slate-500"></div>
                       ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

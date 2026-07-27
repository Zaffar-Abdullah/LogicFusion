import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlowProvider,
  useReactFlow,
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  reconnectEdge,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  Handle,
  Position,
  Panel,
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Activity, Clock } from 'lucide-react';

// Gate computation logic
const computeGate = (type: string, inputs: boolean[]) => {
  switch (type) {
    case 'AND': return inputs.every(v => v);
    case 'OR': return inputs.some(v => v);
    case 'NOT': return !inputs[0];
    case 'NAND': return !inputs.every(v => v);
    case 'NOR': return !inputs.some(v => v);
    case 'XOR': return inputs.filter(v => v).length % 2 === 1;
    case 'XNOR': return inputs.filter(v => v).length % 2 === 0;
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

const getHandleId = (i: number) => {
  if (i === 0) return 'a';
  if (i === 1) return 'b';
  return `in-${i}`;
};

// Custom Gate Node
const GateNode = ({ data, id }: any) => {
  const isUnary = data.type === 'NOT';
  const inputCount = isUnary ? 1 : (data.inputCount || 2);
  const minHeight = Math.max(56, inputCount * 24 + 16);

  return (
    <div className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded shadow-sm w-[90px] text-center flex flex-col transition-all">
      <div className="bg-slate-100 dark:bg-slate-900/80 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center px-1">
        {!isUnary ? (
          <button onClick={(e) => { e.stopPropagation(); data.updateInputs(id, -1); }} className="w-4 h-4 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 disabled:opacity-30" disabled={inputCount <= 2}>-</button>
        ) : <div className="w-4 h-4"></div>}
        <span>{data.type}</span>
        {!isUnary ? (
          <button onClick={(e) => { e.stopPropagation(); data.updateInputs(id, 1); }} className="w-4 h-4 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 disabled:opacity-30" disabled={inputCount >= 10}>+</button>
        ) : <div className="w-4 h-4"></div>}
      </div>
      <div className="p-2 relative flex flex-col justify-center items-center bg-white dark:bg-slate-800 transition-all" style={{ height: minHeight }}>
        {Array.from({ length: inputCount }).map((_, i) => (
          <Handle 
            key={getHandleId(i)}
            type="target" 
            position={Position.Left} 
            id={getHandleId(i)} 
            style={{ top: `${((i + 1) * 100) / (inputCount + 1)}%` }} 
            className="w-1.5 h-1.5 bg-slate-400 border-none rounded-none" 
          />
        ))}
        <div className={`font-mono text-sm font-bold ${data.value ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}`}>
          {data.value ? '1' : '0'}
        </div>
        <Handle type="source" position={Position.Right} className="w-1.5 h-1.5 bg-slate-400 border-none rounded-none" />
      </div>
    </div>
  );
};

// Custom Flip-Flop Node
const FlipFlopNode = ({ data, id }: any) => {
  const type = data.type as 'SR' | 'JK' | 'D' | 'T';
  const hasTwoInputs = type === 'SR' || type === 'JK';
  
  return (
    <div className="bg-slate-50 dark:bg-slate-800 border-2 border-indigo-500/50 rounded shadow-sm w-[90px] text-center flex flex-col transition-all">
      <div className="bg-indigo-100 dark:bg-indigo-900/80 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 border-b border-indigo-200 dark:border-indigo-700 flex justify-center items-center px-1">
        <span>{type}-FF</span>
      </div>
      <div className="p-2 relative flex flex-col justify-center items-center bg-white dark:bg-slate-800 transition-all min-h-[70px]">
        
        {/* Input 1 */}
        <Handle type="target" position={Position.Left} id="in1" style={{ top: '25%' }} className="w-1.5 h-1.5 bg-slate-400 border-none rounded-none" />
        <span className="absolute left-2 text-[8px] font-bold text-slate-500" style={{ top: '25%', transform: 'translateY(-50%)' }}>
          {type === 'SR' ? 'S' : type === 'JK' ? 'J' : type === 'D' ? 'D' : 'T'}
        </span>

        {/* Clock */}
        <Handle type="target" position={Position.Left} id="clk" style={{ top: '50%' }} className="w-1.5 h-1.5 bg-slate-400 border-none rounded-none" />
        <span className="absolute left-2 text-[8px] font-bold text-slate-500" style={{ top: '50%', transform: 'translateY(-50%)' }}>
          ▶
        </span>
        
        {/* Input 2 */}
        {hasTwoInputs && (
          <>
            <Handle type="target" position={Position.Left} id="in2" style={{ top: '75%' }} className="w-1.5 h-1.5 bg-slate-400 border-none rounded-none" />
            <span className="absolute left-2 text-[8px] font-bold text-slate-500" style={{ top: '75%', transform: 'translateY(-50%)' }}>
              {type === 'SR' ? 'R' : type === 'JK' ? 'K' : ''}
            </span>
          </>
        )}

        {/* Q */}
        <Handle type="source" position={Position.Right} id="q" style={{ top: '30%' }} className="w-1.5 h-1.5 bg-slate-400 border-none rounded-none" />
        <span className="absolute right-2 text-[8px] font-bold text-emerald-500" style={{ top: '30%', transform: 'translateY(-50%)' }}>Q</span>
        
        {/* Q' */}
        <Handle type="source" position={Position.Right} id="qbar" style={{ top: '70%' }} className="w-1.5 h-1.5 bg-slate-400 border-none rounded-none" />
        <span className="absolute right-2 text-[8px] font-bold text-emerald-500" style={{ top: '70%', transform: 'translateY(-50%)' }}>Q'</span>
        
      </div>
    </div>
  );
};

// Custom Junction Node (●) for wire branching
const JunctionNode = ({ data, selected }: any) => {
  return (
    <div className={`w-3 h-3 rounded-full relative z-10 transition-all ${selected ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''} ${data.value ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' : 'bg-slate-400'}`}>
      <Handle type="target" position={Position.Left} className="w-4 h-4 opacity-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 !border-none !bg-transparent" />
      <Handle type="source" position={Position.Right} className="w-4 h-4 opacity-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 !border-none !bg-transparent" />
    </div>
  );
};

let idCounter = 0;
const getId = () => `node_${idCounter++}`;

const ICNode = ({ data, id }: any) => {
  const { icType } = data;
  
  let inputs: { id: string, label: string }[] = [];
  let outputs: { id: string, label: string }[] = [];
  let title = '';
  
  if (icType === 'HALF_ADDER') {
    title = 'Half Adder';
    inputs = [{ id: 'A', label: 'A' }, { id: 'B', label: 'B' }];
    outputs = [{ id: 'S', label: 'S' }, { id: 'C', label: 'C' }];
  } else if (icType === 'FULL_ADDER') {
    title = 'Full Adder';
    inputs = [{ id: 'A', label: 'A' }, { id: 'B', label: 'B' }, { id: 'Cin', label: 'Cin' }];
    outputs = [{ id: 'S', label: 'S' }, { id: 'Cout', label: 'Cout' }];
  } else if (icType === 'MUX_2_1') {
    title = '2:1 MUX';
    inputs = [{ id: 'D0', label: 'D0' }, { id: 'D1', label: 'D1' }, { id: 'Sel', label: 'Sel' }];
    outputs = [{ id: 'Y', label: 'Y' }];
  }
  
  return (
    <div className="bg-slate-50 dark:bg-slate-800 border-2 border-fuchsia-500/50 rounded shadow-sm min-w-[100px] text-center flex flex-col transition-all">
      <div className="bg-fuchsia-100 dark:bg-fuchsia-900/80 py-1 text-xs font-bold text-fuchsia-700 dark:text-fuchsia-300 border-b border-fuchsia-200 dark:border-fuchsia-700 flex justify-center items-center px-1">
        <span>{title}</span>
      </div>
      <div className="p-2 relative flex bg-white dark:bg-slate-800 transition-all min-h-[60px] justify-between">
        <div className="flex flex-col gap-2">
          {inputs.map((inp) => (
             <div key={inp.id} className="relative flex items-center h-4">
                <Handle type="target" position={Position.Left} id={inp.id} className="w-1.5 h-1.5 bg-slate-400 border-none rounded-none -left-2" />
                <span className="text-[8px] font-bold text-slate-500 ml-1">{inp.label}</span>
             </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 items-end justify-between">
          {outputs.map((out) => (
             <div key={out.id} className="relative flex items-center h-4 justify-end">
                <span className={`text-[8px] font-bold mr-1 ${data[out.id] ? 'text-emerald-500' : 'text-slate-500'}`}>{out.label}</span>
                <Handle type="source" position={Position.Right} id={out.id} className={`w-1.5 h-1.5 border-none rounded-none -right-2 ${data[out.id] ? 'bg-emerald-500' : 'bg-slate-400'}`} />
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};


// Custom Wire Edge with branch & delete
const CustomWireEdge = ({
  id,
  source,
  sourceHandleId,
  target,
  targetHandleId,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}: any) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  
  const reactFlow = useReactFlow();

  const onDelete = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    reactFlow.setEdges((edges) => edges.filter((e) => e.id !== id));
  };

  const onBranch = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    const junctionId = getId();
    const junctionNode = {
      id: junctionId,
      type: 'junctionNode',
      position: { x: labelX - 6, y: labelY - 6 },
      data: { value: false },
    };

    reactFlow.setNodes((nds) => nds.concat(junctionNode));
    reactFlow.setEdges((eds) => {
      const remainingEdges = eds.filter((e) => e.id !== id);
      return remainingEdges.concat([
        {
          id: `e_${source}_${junctionId}`,
          source: source,
          sourceHandle: sourceHandleId,
          target: junctionId,
          targetHandle: null,
          type: 'custom',
          animated: true,
        },
        {
          id: `e_${junctionId}_${target}`,
          source: junctionId,
          sourceHandle: null,
          target: target,
          targetHandle: targetHandleId,
          type: 'custom',
          animated: true,
        },
      ]);
    });
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} interactionWidth={20} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className={`flex gap-1 transition-opacity ${selected ? 'opacity-100' : 'opacity-0'} hover:opacity-100 nodrag nopan`}
        >
          <button
            className="w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-indigo-600 transition-colors shadow-md"
            onClick={onBranch}
            title="Branch Wire"
          >
            +
          </button>
          <button
            className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-red-600 transition-colors shadow-md"
            onClick={onDelete}
            title="Delete Wire"
          >
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

const nodeTypes = {
  inputNode: InputNode,
  outputNode: OutputNode,
  gateNode: GateNode,
  clockNode: ClockNode,
  junctionNode: JunctionNode,
  flipFlopNode: FlipFlopNode,
  icNode: ICNode,
};

const edgeTypes = {
  custom: CustomWireEdge,
};

const TICK_RATE_MS = 100; // 10 ticks per second
const MAX_HISTORY = 100;
const GATE_DELAY_TICKS = 2; // 200ms propagation delay
const CLOCK_HALF_PERIOD_TICKS = 5; // 500ms high, 500ms low (1Hz)

const onDragStart = (event: React.DragEvent, nodeType: string, nodeData: any) => {
  event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, data: nodeData }));
  event.dataTransfer.effectAllowed = 'move';
};

const LibrarySidebar = () => {
  return (
    <div className="w-48 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-col shadow-sm overflow-y-auto">
      <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">Library</h3>
      
      <div className="flex flex-col gap-3">
        <div>
          <div className="text-[10px] text-slate-500 font-bold tracking-wider mb-2">Flip-Flops</div>
          <div className="grid grid-cols-2 gap-2">
            {['SR', 'JK', 'D', 'T'].map(ff => (
              <div 
                key={ff}
                draggable
                onDragStart={(e) => onDragStart(e, 'flipFlopNode', { type: ff })}
                className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 px-2 py-1.5 rounded text-xs font-medium cursor-grab hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-center transition-colors shadow-sm"
              >
                {ff}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <div className="text-[10px] text-slate-500 font-bold tracking-wider mb-2">Sub-Circuits</div>
          <div className="flex flex-col gap-2">
            <div 
              draggable
              onDragStart={(e) => onDragStart(e, 'icNode', { icType: 'HALF_ADDER' })}
              className="bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-700 dark:text-fuchsia-400 border border-fuchsia-200 dark:border-fuchsia-500/30 px-3 py-2 rounded text-xs font-medium cursor-grab hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/40 transition-colors shadow-sm text-center"
            >
              Half Adder
            </div>
            <div 
              draggable
              onDragStart={(e) => onDragStart(e, 'icNode', { icType: 'FULL_ADDER' })}
              className="bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-700 dark:text-fuchsia-400 border border-fuchsia-200 dark:border-fuchsia-500/30 px-3 py-2 rounded text-xs font-medium cursor-grab hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/40 transition-colors shadow-sm text-center"
            >
              Full Adder
            </div>
            <div 
              draggable
              onDragStart={(e) => onDragStart(e, 'icNode', { icType: 'MUX_2_1' })}
              className="bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-700 dark:text-fuchsia-400 border border-fuchsia-200 dark:border-fuchsia-500/30 px-3 py-2 rounded text-xs font-medium cursor-grab hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/40 transition-colors shadow-sm text-center"
            >
              Multiplexer 2:1
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-2 bg-slate-100 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 leading-tight">
          Drag and drop items from this library into the canvas.
        </div>
      </div>
    </div>
  );
};

function CircuitBuilderInner() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [waveformTick, setWaveformTick] = useState(0);
  
  const reactFlow = useReactFlow();
  
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);

  const simEngine = useRef({
    history: {} as Record<string, boolean[]>,
    gateQueue: {} as Record<string, { pendingValue: boolean, ticksLeft: number }>,
    ffState: {} as Record<string, { q: boolean, prevClk: boolean }>,
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

  const updateGateInputs = useCallback((id: string, delta: number) => {
    setNodes((nds) => {
      const node = nds.find(n => n.id === id);
      if (!node) return nds;

      const currentCount = node.data.inputCount || 2;
      const newCount = Math.max(2, Math.min(10, currentCount + delta));
      if (currentCount === newCount) return nds;

      if (newCount < currentCount) {
        setEdges((eds) => eds.filter((e) => {
          if (e.target !== id) return true;
          let index = -1;
          if (e.targetHandle === 'a') index = 0;
          else if (e.targetHandle === 'b') index = 1;
          else if (e.targetHandle?.startsWith('in-')) index = parseInt(e.targetHandle.split('-')[1]);
          return index !== -1 && index < newCount;
        }));
      }

      return nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, inputCount: newCount } } : n
      );
    });
  }, []);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  
  const onConnect = useCallback((connection: Connection) => setEdges((eds) => addEdge({ ...connection, type: 'custom', animated: true }, eds)), []);
  const onReconnect = useCallback((oldEdge: Edge, newConnection: Connection) => setEdges((els) => reconnectEdge(oldEdge, newConnection, els)), []);

  const onEdgeDoubleClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
    if (!reactFlowBounds) return;

    const position = reactFlow.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const junctionId = getId();
    const junctionNode: Node = {
      id: junctionId,
      type: 'junctionNode',
      position: { x: position.x - 6, y: position.y - 6 },
      data: { value: false },
    };

    setNodes((nds) => nds.concat(junctionNode));
    setEdges((eds) => {
      const remainingEdges = eds.filter((e) => e.id !== edge.id);
      return remainingEdges.concat([
        {
          id: `e_${edge.source}_${junctionId}`,
          source: edge.source,
          sourceHandle: edge.sourceHandle,
          target: junctionId,
          targetHandle: null,
          animated: true,
        },
        {
          id: `e_${junctionId}_${edge.target}`,
          source: junctionId,
          sourceHandle: null,
          target: edge.target,
          targetHandle: edge.targetHandle,
          animated: true,
        },
      ]);
    });
  }, [reactFlow]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const typeDataStr = event.dataTransfer.getData('application/reactflow');
    if (!typeDataStr) return;
    const { type, data } = JSON.parse(typeDataStr);

    const position = reactFlow.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const newNode: Node = {
      id: getId(),
      type,
      position,
      data: {
         ...data,
         value: false,
      }
    };
    
    if (type === 'gateNode') {
        newNode.data.inputCount = data.type === 'NOT' ? 1 : 2;
        newNode.data.updateInputs = updateGateInputs;
    }
    if (type === 'inputNode') {
        newNode.data.toggle = toggleInput;
    }

    setNodes((nds) => nds.concat(newNode));
  }, [reactFlow, toggleInput, updateGateInputs, setNodes]);

  const addNode = (type: string, nodeType: string = 'gateNode') => {
    const newNode: Node = {
      id: getId(),
      type: nodeType,
      position: { x: 250, y: 150 },
      data: { type, value: false, toggle: toggleInput, updateInputs: updateGateInputs, inputCount: type === 'NOT' ? 1 : 2 },
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
        if (sourceNode?.type === 'flipFlopNode') {
           return edge.sourceHandle === 'qbar' ? sourceNode.data.qbar : sourceNode.data.q;
        }
        if (sourceNode?.type === 'icNode') {
           return sourceNode.data[edge.sourceHandle || ''] || false;
        }
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
          const isUnary = type === 'NOT';
          const inputCount = isUnary ? 1 : (node.data.inputCount || 2);
          const inputs = [];
          for (let i = 0; i < inputCount; i++) {
             inputs.push(getSourceValue(node.id, getHandleId(i)));
          }
          const targetVal = computeGate(type, inputs);
          
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
        // 3. Flip Flops
        else if (node.type === 'flipFlopNode') {
          if (!engine.ffState[node.id]) engine.ffState[node.id] = { q: false, prevClk: false };
          
          const in1 = getSourceValue(node.id, 'in1');
          const clk = getSourceValue(node.id, 'clk');
          const in2 = getSourceValue(node.id, 'in2');
          
          const state = engine.ffState[node.id];
          let nextQ = state.q;
          
          // Detect rising edge
          if (clk && !state.prevClk) {
             const type = node.data.type;
             if (type === 'SR') {
                if (in1 && !in2) nextQ = true;
                else if (!in1 && in2) nextQ = false;
                else if (in1 && in2) nextQ = false; // Invalid
             } else if (type === 'JK') {
                if (in1 && !in2) nextQ = true;
                else if (!in1 && in2) nextQ = false;
                else if (in1 && in2) nextQ = !state.q;
             } else if (type === 'D') {
                nextQ = in1;
             } else if (type === 'T') {
                if (in1) nextQ = !state.q;
             }
          }
          
          engine.ffState[node.id].prevClk = clk;
          
          if (state.q !== nextQ) {
              engine.ffState[node.id].q = nextQ;
              currentNodes[index] = { ...node, data: { ...node.data, q: nextQ, qbar: !nextQ, value: nextQ } };
              nodeMap.set(node.id, currentNodes[index]);
              nodesChanged = true;
          } else if (node.data.q === undefined) {
              // Initialize
              currentNodes[index] = { ...node, data: { ...node.data, q: nextQ, qbar: !nextQ, value: nextQ } };
              nodeMap.set(node.id, currentNodes[index]);
              nodesChanged = true;
          }
        }
        // 4. Output & Junction Nodes
        else if (node.type === 'outputNode' || node.type === 'junctionNode') {
          const targetVal = getSourceValue(node.id, null);
          if (node.data.value !== targetVal) {
             currentNodes[index] = { ...node, data: { ...node.data, value: targetVal } };
             nodeMap.set(node.id, currentNodes[index]);
             nodesChanged = true;
          }
        }
        // 5. IC Nodes (Sub-circuits)
        else if (node.type === 'icNode') {
          const type = node.data.icType;
          let targetVals: any = {};
          
          if (type === 'HALF_ADDER') {
             const a = getSourceValue(node.id, 'A');
             const b = getSourceValue(node.id, 'B');
             targetVals.S = a !== b;
             targetVals.C = a && b;
          } else if (type === 'FULL_ADDER') {
             const a = getSourceValue(node.id, 'A');
             const b = getSourceValue(node.id, 'B');
             const cin = getSourceValue(node.id, 'Cin');
             const s1 = a !== b;
             targetVals.S = s1 !== cin;
             targetVals.Cout = (a && b) || (cin && s1);
          } else if (type === 'MUX_2_1') {
             const d0 = getSourceValue(node.id, 'D0');
             const d1 = getSourceValue(node.id, 'D1');
             const sel = getSourceValue(node.id, 'Sel');
             targetVals.Y = sel ? d1 : d0;
          }
          
          let changed = false;
          for (const key in targetVals) {
             if (node.data[key] !== targetVals[key]) {
                changed = true;
                break;
             }
          }
          
          if (changed) {
             currentNodes[index] = { ...node, data: { ...node.data, ...targetVals } };
             nodeMap.set(node.id, currentNodes[index]);
             nodesChanged = true;
          }
        }
      });

      // 4. Update History for Waveforms
      currentNodes.forEach(node => {
         if (['inputNode', 'clockNode', 'outputNode', 'flipFlopNode'].includes(node.type!)) {
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

  const trackedNodes = nodes.filter(n => ['inputNode', 'clockNode', 'outputNode', 'flipFlopNode'].includes(n.type!));

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
      <div className="flex-1 flex gap-4 min-h-[400px]">
        <LibrarySidebar />
        <div className="flex-1 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-950 relative">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur px-4 py-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400 pointer-events-none">
            Double-click any wire to create a branch junction
          </div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onReconnect={onReconnect}
            onEdgeDoubleClick={onEdgeDoubleClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            className="bg-slate-50 dark:bg-slate-950"
            defaultEdgeOptions={{ 
              style: { stroke: '#64748b', strokeWidth: 2 },
              type: 'custom',
              interactionWidth: 20
            }}
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
                      {node.type === 'inputNode' ? 'IN' : node.type === 'clockNode' ? 'CLK' : node.type === 'flipFlopNode' ? `${node.data.type}-FF` : 'OUT'} ({node.id.split('_')[1]})
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

export default function CircuitBuilder() {
  return (
    <ReactFlowProvider>
      <CircuitBuilderInner />
    </ReactFlowProvider>
  );
}

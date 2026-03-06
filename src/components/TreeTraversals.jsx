import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { campusTree, preOrder, postOrder, inOrder, levelOrder, getNodeName } from '../data/campusData';

const TRAVERSALS = {
    preOrder: { name: 'Pre-Order', fn: preOrder, color: '#6c63ff', desc: 'Visit root → left subtree → right subtree (NLR)' },
    inOrder: { name: 'In-Order', fn: inOrder, color: '#00d4aa', desc: 'Visit left subtree → root → right subtree (LNR)' },
    postOrder: { name: 'Post-Order', fn: postOrder, color: '#ff6b9d', desc: 'Visit left subtree → right subtree → root (LRN)' },
    levelOrder: { name: 'Level-Order (BFS)', fn: levelOrder, color: '#ffa726', desc: 'Visit nodes level by level (Breadth-First)' },
};

const PSEUDOCODE = {
    preOrder: [
        'function preOrder(node):',
        '  if node is null: return',
        '  ▶ VISIT(node)',
        '  for each child of node:',
        '    preOrder(child)',
    ],
    inOrder: [
        'function inOrder(node):',
        '  if node is null: return',
        '  inOrder(left half children)',
        '  ▶ VISIT(node)',
        '  inOrder(right half children)',
    ],
    postOrder: [
        'function postOrder(node):',
        '  if node is null: return',
        '  for each child of node:',
        '    postOrder(child)',
        '  ▶ VISIT(node)',
    ],
    levelOrder: [
        'function levelOrder(root):',
        '  queue ← [root]',
        '  while queue not empty:',
        '    node ← queue.dequeue()',
        '    ▶ VISIT(node)',
        '    enqueue all children of node',
    ],
};

// Flat layout for animation SVG
function flatLayout(node, startX = 40, y = 40, xGap = 110, yGap = 78, collapsed = {}) {
    const positions = [];
    const edges = [];
    let cx = startX;

    function layout(n, py, depth) {
        const children = n.children || [];
        if (children.length === 0) {
            positions.push({ ...n, x: cx, y: py, depth });
            cx += xGap;
            return;
        }
        const childPositions = [];
        for (const child of children) {
            const before = cx;
            layout(child, py + yGap, depth + 1);
            childPositions.push({ id: child.id, x: (before + cx - xGap) / 2 });
        }
        const nodeX = (childPositions[0].x + childPositions[childPositions.length - 1].x) / 2;
        positions.push({ ...n, x: nodeX, y: py, depth });
        for (const cp of childPositions) {
            edges.push({ from: n.id, to: cp.id });
        }
    }

    layout(node, y, 0);
    return { positions, edges, totalWidth: cx + 40 };
}

const levelColors = ['#6c63ff', '#00d4aa', '#ff6b9d', '#ffa726', '#42a5f5'];

export default function TreeTraversals() {
    const [traversalType, setTraversalType] = useState('preOrder');
    const [visitedNodes, setVisitedNodes] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(600);
    const timerRef = useRef(null);

    const trav = TRAVERSALS[traversalType];
    const order = useMemo(() => trav.fn(campusTree), [traversalType]);
    const { positions, edges, totalWidth } = useMemo(() => flatLayout(campusTree), []);
    const posMap = useMemo(() => { const m = {}; for (const p of positions) m[p.id] = p; return m; }, [positions]);
    const svgHeight = Math.max(...positions.map(p => p.y)) + 80;

    const reset = useCallback(() => {
        setVisitedNodes([]);
        setCurrentStep(-1);
        setIsPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    useEffect(() => { reset(); }, [traversalType, reset]);

    useEffect(() => {
        if (!isPlaying) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }
        timerRef.current = setInterval(() => {
            setCurrentStep(prev => {
                const next = prev + 1;
                if (next >= order.length) {
                    setIsPlaying(false);
                    return prev;
                }
                setVisitedNodes(order.slice(0, next + 1));
                return next;
            });
        }, speed);
        return () => clearInterval(timerRef.current);
    }, [isPlaying, speed, order]);

    const stepForward = () => {
        if (currentStep < order.length - 1) {
            const next = currentStep + 1;
            setCurrentStep(next);
            setVisitedNodes(order.slice(0, next + 1));
        }
    };

    const stepBack = () => {
        if (currentStep > 0) {
            const next = currentStep - 1;
            setCurrentStep(next);
            setVisitedNodes(order.slice(0, next + 1));
        }
    };

    return (
        <div className="fade-in">
            <div className="section-header">
                <h2>🔄 Tree Traversal Algorithms</h2>
                <p>Watch how different traversal algorithms visit each campus location step by step.</p>
            </div>

            <div className="btn-group" style={{ marginBottom: 16 }}>
                {Object.entries(TRAVERSALS).map(([key, val]) => (
                    <button
                        key={key}
                        className={`btn ${traversalType === key ? 'active' : ''}`}
                        onClick={() => setTraversalType(key)}
                        style={traversalType === key ? { background: val.color, borderColor: val.color } : {}}
                    >
                        {val.name}
                    </button>
                ))}
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-title" style={{ color: trav.color }}>
                        {trav.name} Traversal
                    </div>
                    <div className="card-desc">{trav.desc}</div>

                    <div className="controls">
                        <button className="btn" onClick={() => { reset(); setCurrentStep(-1); }}>⏮ Reset</button>
                        <button className="btn" onClick={stepBack} disabled={currentStep <= 0}>⏪</button>
                        <button className="btn btn-primary" onClick={() => setIsPlaying(!isPlaying)}>
                            {isPlaying ? '⏸ Pause' : '▶ Play'}
                        </button>
                        <button className="btn" onClick={stepForward} disabled={currentStep >= order.length - 1}>⏩</button>
                        <div className="speed-control">
                            <span>Speed:</span>
                            <input type="range" min={100} max={1500} step={100} value={1600 - speed} onChange={e => setSpeed(1600 - +e.target.value)} />
                            <span>{((1600 - speed) / 100).toFixed(0)}x</span>
                        </div>
                    </div>

                    <div className="step-info">
                        <div className="step-counter">Step {Math.max(0, currentStep + 1)} of {order.length}</div>
                        {currentStep >= 0 && (
                            <div>Currently visiting: <strong style={{ color: trav.color }}>{getNodeName(order[currentStep])}</strong></div>
                        )}
                    </div>

                    <div className="traversal-list">
                        {order.map((id, i) => (
                            <div
                                key={`${id}-${i}`}
                                className={`traversal-item ${i <= currentStep ? 'visited' : ''} ${i === currentStep ? 'current' : ''}`}
                                style={i === currentStep ? { borderColor: trav.color, color: trav.color, background: `${trav.color}30` } : i <= currentStep ? { borderColor: `${trav.color}60`, color: trav.color } : {}}
                            >
                                <span style={{ marginRight: 4, opacity: 0.5 }}>{i + 1}.</span>
                                {getNodeName(id)}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="card-title">📝 Pseudocode</div>
                    <div className="pseudocode">
                        {PSEUDOCODE[traversalType].map((line, i) => (
                            <div key={i} className={line.includes('▶') ? 'highlight' : ''} style={{ paddingLeft: (line.match(/^ */)?.[0].length || 0) * 4 }}>
                                {line.trim()}
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: 20 }}>
                        <div className="card-title" style={{ fontSize: 14 }}>📊 Visualization</div>
                        <div className="viz-container" style={{ maxHeight: 400 }}>
                            <svg width={totalWidth} height={svgHeight}>
                                {edges.map((e, i) => {
                                    const from = posMap[e.from];
                                    const to = posMap[e.to];
                                    if (!from || !to) return null;
                                    const edgeVisited = visitedNodes.includes(e.from) && visitedNodes.includes(e.to);
                                    return (
                                        <line
                                            key={i}
                                            x1={from.x + 45} y1={from.y + 18}
                                            x2={to.x + 45} y2={to.y}
                                            stroke={edgeVisited ? trav.color : 'rgba(255,255,255,0.06)'}
                                            strokeWidth={edgeVisited ? 2 : 1}
                                            style={{ transition: 'all 0.3s ease' }}
                                        />
                                    );
                                })}
                                {positions.map(pos => {
                                    const vi = visitedNodes.indexOf(pos.id);
                                    const isCurrent = pos.id === order[currentStep];
                                    const isVisited = vi >= 0;
                                    const w = 90, h = 32;
                                    return (
                                        <g key={pos.id} transform={`translate(${pos.x}, ${pos.y})`}>
                                            <rect
                                                width={w} height={h} rx={6}
                                                fill={isCurrent ? trav.color : isVisited ? `${trav.color}25` : 'rgba(20,20,50,0.9)'}
                                                stroke={isVisited ? trav.color : 'rgba(255,255,255,0.1)'}
                                                strokeWidth={isCurrent ? 2.5 : 1}
                                                style={{ transition: 'all 0.3s ease' }}
                                            />
                                            <text x={w / 2} y={h / 2 + 1} textAnchor="middle" dominantBaseline="central"
                                                fill={isCurrent ? '#fff' : isVisited ? trav.color : 'rgba(255,255,255,0.5)'}
                                                fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif">
                                                {pos.name.length > 12 ? pos.name.slice(0, 10) + '…' : pos.name}
                                            </text>
                                            {isVisited && (
                                                <circle cx={w - 2} cy={2} r={8}
                                                    fill={trav.color} stroke="rgba(0,0,0,0.5)" strokeWidth={1} />
                                            )}
                                            {isVisited && (
                                                <text x={w - 2} y={3} textAnchor="middle" dominantBaseline="central"
                                                    fill="#fff" fontSize="7" fontWeight="bold">{vi + 1}</text>
                                            )}
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

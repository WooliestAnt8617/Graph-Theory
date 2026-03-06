import { useState, useEffect, useMemo, useRef } from 'react';
import { mainGraphNodes as graphNodes, mainGraphEdges as graphEdges, kruskalMST, primMST, getAllMainNodeIds as getAllNodeIds, getNodeName } from '../data/campusData';

const SCALE = 0.95;
function scalePos(nodes) {
    return nodes.map(n => ({ ...n, x: n.x * SCALE + 30, y: n.y * SCALE + 30 }));
}

export default function MinSpanningTree() {
    const [algorithm, setAlgorithm] = useState('kruskal');
    const [startNode, setStartNode] = useState('central_lawn');
    const [currentStep, setCurrentStep] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(800);
    const timerRef = useRef(null);

    const scaledNodes = useMemo(() => scalePos(graphNodes), []);
    const posMap = useMemo(() => { const m = {}; for (const n of scaledNodes) m[n.id] = n; return m; }, [scaledNodes]);
    const nodeIds = useMemo(() => getAllNodeIds(), []);

    const result = useMemo(() => {
        if (algorithm === 'kruskal') return kruskalMST(graphEdges, nodeIds);
        return primMST(graphEdges, nodeIds, startNode);
    }, [algorithm, nodeIds, startNode]);

    const { steps } = result;
    const activeStep = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;
    const mstEdgesUpToNow = activeStep ? activeStep.mstEdges : [];
    const totalWeightNow = activeStep ? activeStep.totalWeight : 0;

    const mstSet = useMemo(() => {
        const s = new Set();
        for (const [u, v] of mstEdgesUpToNow) { s.add(`${u}-${v}`); s.add(`${v}-${u}`); }
        return s;
    }, [mstEdgesUpToNow]);

    const currentEdge = activeStep?.edge;
    const currentEdgeKey = currentEdge ? `${currentEdge[0]}-${currentEdge[1]}` : null;
    const currentEdgeKeyRev = currentEdge ? `${currentEdge[1]}-${currentEdge[0]}` : null;

    useEffect(() => {
        setCurrentStep(-1);
        setIsPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
    }, [algorithm, startNode]);

    useEffect(() => {
        if (!isPlaying) { if (timerRef.current) clearInterval(timerRef.current); return; }
        timerRef.current = setInterval(() => {
            setCurrentStep(prev => {
                if (prev + 1 >= steps.length) { setIsPlaying(false); return prev; }
                return prev + 1;
            });
        }, speed);
        return () => clearInterval(timerRef.current);
    }, [isPlaying, speed, steps.length]);

    const svgW = Math.max(...scaledNodes.map(n => n.x)) + 120;
    const svgH = Math.max(...scaledNodes.map(n => n.y)) + 80;

    return (
        <div className="fade-in">
            <div className="section-header">
                <h2>⚡ Minimum Spanning Trees</h2>
                <p>Find the MST using Kruskal's or Prim's algorithm. The MST connects all vertices with the minimum total edge weight.</p>
            </div>

            <div className="grid-3" style={{ marginBottom: 20 }}>
                <div className="stat-card">
                    <div className="stat-value">{result.totalWeight}m</div>
                    <div className="stat-label">Final MST Weight</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{result.mstEdges.length}</div>
                    <div className="stat-label">MST Edges</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ fontSize: 22 }}>{totalWeightNow}m</div>
                    <div className="stat-label">Current Weight</div>
                </div>
            </div>

            <div className="controls">
                <div className="btn-group">
                    <button className={`btn ${algorithm === 'kruskal' ? 'active' : ''}`} onClick={() => setAlgorithm('kruskal')}>Kruskal's Algorithm</button>
                    <button className={`btn ${algorithm === 'prim' ? 'active' : ''}`} onClick={() => setAlgorithm('prim')}>Prim's Algorithm</button>
                </div>
                {algorithm === 'prim' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Start:</span>
                        <select className="node-select" value={startNode} onChange={e => setStartNode(e.target.value)}>
                            {graphNodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                        </select>
                    </div>
                )}
            </div>

            <div className="controls">
                <button className="btn" onClick={() => { setCurrentStep(-1); setIsPlaying(false); }}>⏮ Reset</button>
                <button className="btn" onClick={() => setCurrentStep(prev => Math.max(-1, prev - 1))} disabled={currentStep <= -1}>⏪</button>
                <button className="btn btn-primary" onClick={() => {
                    if (currentStep === -1 && !isPlaying) setCurrentStep(0);
                    setIsPlaying(!isPlaying);
                }}>
                    {isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
                <button className="btn" onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))} disabled={currentStep >= steps.length - 1}>⏩</button>
                <button className="btn" onClick={() => { setCurrentStep(steps.length - 1); setIsPlaying(false); }}>⏭ Skip to End</button>
                <div className="speed-control">
                    <span>Speed:</span>
                    <input type="range" min={100} max={2000} step={100} value={2100 - speed} onChange={e => setSpeed(2100 - +e.target.value)} />
                </div>
            </div>

            <div className="grid-2">
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                    <div className="card-title">
                        {algorithm === 'kruskal' ? "🔗 Kruskal's" : "🌱 Prim's"} — Step {Math.max(0, currentStep + 1)} / {steps.length}
                    </div>

                    {activeStep && (
                        <div className="step-info" style={{ borderLeftColor: activeStep.accepted !== false ? '#00d4aa' : '#ff6b9d' }}>
                            {activeStep.action === 'start' ? (
                                <div>Starting from node: <strong style={{ color: '#ffa726' }}>{getNodeName(activeStep.currentNode)}</strong></div>
                            ) : (
                                <div>
                                    Edge: <strong>{getNodeName(activeStep.edge[0])}</strong> → <strong>{getNodeName(activeStep.edge[1])}</strong>
                                    {' '}(weight: <strong>{activeStep.edge[2]}m</strong>)
                                    {' — '}
                                    {activeStep.accepted !== false
                                        ? <span style={{ color: '#00d4aa', fontWeight: 700 }}>✓ ACCEPTED</span>
                                        : <span style={{ color: '#ff6b9d', fontWeight: 700 }}>✗ REJECTED (would create cycle)</span>}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="legend" style={{ marginTop: 12 }}>
                        <div className="legend-item"><div className="legend-dot" style={{ background: '#00d4aa' }}></div>MST Edge</div>
                        <div className="legend-item"><div className="legend-dot" style={{ background: '#ff6b9d' }}></div>Rejected Edge</div>
                        <div className="legend-item"><div className="legend-dot" style={{ background: 'rgba(255,255,255,0.08)' }}></div>Unprocessed Edge</div>
                    </div>

                    <div className="viz-container">
                        <svg width={svgW} height={svgH}>
                            {graphEdges.map(([u, v, w], i) => {
                                const from = posMap[u], to = posMap[v];
                                if (!from || !to) return null;
                                const key = `${u}-${v}`;
                                const keyR = `${v}-${u}`;
                                const isMST = mstSet.has(key);
                                const isCurrent = key === currentEdgeKey || key === currentEdgeKeyRev || keyR === currentEdgeKey || keyR === currentEdgeKeyRev;
                                const isRejected = isCurrent && activeStep && activeStep.accepted === false;

                                let color = 'rgba(255,255,255,0.06)';
                                let sw = 1;
                                if (isMST) { color = '#00d4aa'; sw = 2.5; }
                                if (isCurrent && !isRejected && !isMST) { color = '#6c63ff'; sw = 2.5; }
                                if (isRejected) { color = '#ff6b9d'; sw = 2; }

                                return (
                                    <g key={i}>
                                        <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                                            stroke={color} strokeWidth={sw}
                                            strokeDasharray={isRejected ? '6 4' : ''}
                                            style={{ transition: 'all 0.4s ease' }} />
                                        {(isMST || isCurrent) && (
                                            <text x={(from.x + to.x) / 2 + 6} y={(from.y + to.y) / 2 - 6}
                                                fill={isMST ? '#00d4aa' : isRejected ? '#ff6b9d' : '#6c63ff'}
                                                fontSize="9" fontWeight="700" fontFamily="Inter, sans-serif">{w}m</text>
                                        )}
                                    </g>
                                );
                            })}
                            {scaledNodes.map(n => {
                                const inMST = mstEdgesUpToNow.some(([u, v]) => u === n.id || v === n.id);
                                const isCurrNode = currentEdge && (currentEdge[0] === n.id || currentEdge[1] === n.id);
                                const isStart = algorithm === 'prim' && n.id === startNode;
                                return (
                                    <g key={n.id}>
                                        <circle cx={n.x} cy={n.y} r={isStart ? 18 : 14}
                                            fill={isStart ? '#ffa726' : inMST ? 'rgba(0,212,170,0.2)' : isCurrNode ? 'rgba(108,99,255,0.2)' : 'rgba(40,40,80,0.8)'}
                                            stroke={isStart ? '#ffa726' : inMST ? '#00d4aa' : isCurrNode ? '#6c63ff' : 'rgba(255,255,255,0.1)'}
                                            strokeWidth={isStart || isCurrNode ? 2.5 : 1.5}
                                            style={{ transition: 'all 0.3s ease' }} />
                                        <text x={n.x} y={n.y + (isStart ? 30 : 26)}
                                            textAnchor="middle" fill={isStart ? '#ffa726' : inMST ? '#00d4aa' : '#9090b0'}
                                            fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif">
                                            {n.name.length > 14 ? n.name.slice(0, 12) + '…' : n.name}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginTop: 20 }}>
                <div className="card-title">📊 Algorithm Comparison</div>
                <div style={{ overflowX: 'auto', marginTop: 12 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr>
                                {['Property', "Kruskal's", "Prim's"].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '10px 14px', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)', fontWeight: 600 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ['Approach', 'Edge-based (sort & add)', 'Vertex-based (grow from start)'],
                                ['Data Structure', 'Union-Find (Disjoint Set)', 'Priority Queue / Min-Heap'],
                                ['Best For', 'Sparse graphs', 'Dense graphs'],
                                ['Time Complexity', 'O(E log E)', 'O(E log V)'],
                                ['Greedy Strategy', 'Globally smallest edge', 'Locally smallest edge from tree'],
                            ].map(([prop, k, p], i) => (
                                <tr key={i}>
                                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--text-secondary)', fontWeight: 500 }}>{prop}</td>
                                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.03)', color: algorithm === 'kruskal' ? '#6c63ff' : 'var(--text-primary)' }}>{k}</td>
                                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.03)', color: algorithm === 'prim' ? '#6c63ff' : 'var(--text-primary)' }}>{p}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

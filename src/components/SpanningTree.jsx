import { useState, useMemo } from 'react';
import { mainGraphNodes as graphNodes, mainGraphEdges as graphEdges, dfsSpanningTree, bfsSpanningTree, getAllMainNodeIds as getAllNodeIds } from '../data/campusData';

const SCALE = 0.95;

function scalePos(nodes) {
    return nodes.map(n => ({ ...n, x: n.x * SCALE + 30, y: n.y * SCALE + 30 }));
}

export default function SpanningTree() {
    const [method, setMethod] = useState('dfs');
    const [startNode, setStartNode] = useState('central_lawn');
    const [showSpanning, setShowSpanning] = useState(false);

    const scaledNodes = useMemo(() => scalePos(graphNodes), []);
    const posMap = useMemo(() => { const m = {}; for (const n of scaledNodes) m[n.id] = n; return m; }, [scaledNodes]);
    const nodeIds = useMemo(() => getAllNodeIds(), []);

    const spanningEdges = useMemo(() => {
        return method === 'dfs'
            ? dfsSpanningTree(graphEdges, nodeIds, startNode)
            : bfsSpanningTree(graphEdges, nodeIds, startNode);
    }, [method, startNode, nodeIds]);

    const spanningSet = useMemo(() => {
        const s = new Set();
        for (const [u, v] of spanningEdges) {
            s.add(`${u}-${v}`);
            s.add(`${v}-${u}`);
        }
        return s;
    }, [spanningEdges]);

    const totalWeight = spanningEdges.reduce((s, e) => s + e[2], 0);
    const svgW = Math.max(...scaledNodes.map(n => n.x)) + 120;
    const svgH = Math.max(...scaledNodes.map(n => n.y)) + 80;

    return (
        <div className="fade-in">
            <div className="section-header">
                <h2>🌐 Spanning Trees</h2>
                <p>Generate a spanning tree from the campus graph using DFS or BFS. A spanning tree connects all nodes with exactly n−1 edges and no cycles.</p>
            </div>

            <div className="grid-3" style={{ marginBottom: 20 }}>
                <div className="stat-card">
                    <div className="stat-value">{nodeIds.length}</div>
                    <div className="stat-label">Vertices (n)</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{spanningEdges.length}</div>
                    <div className="stat-label">Spanning Edges (n−1)</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{totalWeight}m</div>
                    <div className="stat-label">Total Weight</div>
                </div>
            </div>

            <div className="controls">
                <div className="btn-group">
                    <button className={`btn ${method === 'dfs' ? 'active' : ''}`} onClick={() => setMethod('dfs')}>DFS Spanning Tree</button>
                    <button className={`btn ${method === 'bfs' ? 'active' : ''}`} onClick={() => setMethod('bfs')}>BFS Spanning Tree</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Start Node:</span>
                    <select className="node-select" value={startNode} onChange={e => setStartNode(e.target.value)}>
                        {graphNodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                    </select>
                </div>
                <button className={`btn ${showSpanning ? 'active' : ''}`} onClick={() => setShowSpanning(!showSpanning)}>
                    {showSpanning ? '🌐 Show Full Graph' : '🌳 Show Spanning Tree Only'}
                </button>
            </div>

            <div className="grid-2">
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                    <div className="card-title">
                        {method === 'dfs' ? '🔍 DFS' : '📊 BFS'} Spanning Tree Visualization
                    </div>
                    <div className="legend">
                        <div className="legend-item"><div className="legend-dot" style={{ background: '#00d4aa' }}></div>Spanning Tree Edge</div>
                        {!showSpanning && <div className="legend-item"><div className="legend-dot" style={{ background: 'rgba(255,255,255,0.1)' }}></div>Non-Tree Edge</div>}
                        <div className="legend-item"><div className="legend-dot" style={{ background: '#ffa726' }}></div>Start Node</div>
                    </div>

                    <div className="viz-container">
                        <svg width={svgW} height={svgH}>
                            {graphEdges.map(([u, v, w], i) => {
                                const from = posMap[u], to = posMap[v];
                                if (!from || !to) return null;
                                const isSpanning = spanningSet.has(`${u}-${v}`);
                                if (showSpanning && !isSpanning) return null;
                                return (
                                    <g key={i}>
                                        <line
                                            x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                                            stroke={isSpanning ? '#00d4aa' : 'rgba(255,255,255,0.06)'}
                                            strokeWidth={isSpanning ? 2.5 : 1}
                                            strokeDasharray={isSpanning ? '' : '4 4'}
                                            style={{ transition: 'all 0.4s ease' }}
                                        />
                                        {isSpanning && (
                                            <text
                                                x={(from.x + to.x) / 2 + 6} y={(from.y + to.y) / 2 - 6}
                                                fill="#ffa726" fontSize="9" fontWeight="600" fontFamily="Inter, sans-serif"
                                            >
                                                {w}m
                                            </text>
                                        )}
                                    </g>
                                );
                            })}
                            {scaledNodes.map(n => {
                                const isStart = n.id === startNode;
                                const inTree = spanningEdges.some(([u, v]) => u === n.id || v === n.id) || n.id === startNode;
                                return (
                                    <g key={n.id}>
                                        <circle
                                            cx={n.x} cy={n.y} r={isStart ? 18 : 14}
                                            fill={isStart ? '#ffa726' : inTree ? 'rgba(0,212,170,0.2)' : 'rgba(40,40,80,0.8)'}
                                            stroke={isStart ? '#ffa726' : inTree ? '#00d4aa' : 'rgba(255,255,255,0.1)'}
                                            strokeWidth={isStart ? 2.5 : 1.5}
                                            style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                                            onClick={() => setStartNode(n.id)}
                                        />
                                        <text
                                            x={n.x} y={n.y + (isStart ? 30 : 26)}
                                            textAnchor="middle" fill={isStart ? '#ffa726' : '#9090b0'}
                                            fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif"
                                        >
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
                <div className="card-title">📋 Spanning Tree Properties</div>
                <div className="info-panel" style={{ marginTop: 12 }}>
                    <div className="info-row"><span className="info-label">Algorithm</span><span className="info-value">{method === 'dfs' ? 'Depth-First Search' : 'Breadth-First Search'}</span></div>
                    <div className="info-row"><span className="info-label">Vertices</span><span className="info-value">{nodeIds.length}</span></div>
                    <div className="info-row"><span className="info-label">Edges in Graph</span><span className="info-value">{graphEdges.length}</span></div>
                    <div className="info-row"><span className="info-label">Edges in Spanning Tree</span><span className="info-value">{spanningEdges.length} (n − 1 = {nodeIds.length - 1})</span></div>
                    <div className="info-row"><span className="info-label">Contains Cycles?</span><span className="info-value badge green">No</span></div>
                    <div className="info-row"><span className="info-label">Connected?</span><span className="info-value badge green">Yes</span></div>
                    <div className="info-row"><span className="info-label">Total Weight</span><span className="info-value">{totalWeight} meters</span></div>
                </div>
            </div>
        </div>
    );
}

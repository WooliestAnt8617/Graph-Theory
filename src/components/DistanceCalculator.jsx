import { useState, useMemo } from 'react';
import { mainGraphNodes as graphNodes, mainGraphEdges as graphEdges, dijkstra, getAllMainNodeIds as getAllNodeIds, getNodeName } from '../data/campusData';

const SCALE = 0.95;
function scalePos(nodes) {
    return nodes.map(n => ({ ...n, x: n.x * SCALE + 30, y: n.y * SCALE + 30 }));
}

export default function DistanceCalculator() {
    const [sourceNode, setSourceNode] = useState('');
    const [targetNode, setTargetNode] = useState('');
    const [selectedNodes, setSelectedNodes] = useState([]);

    const scaledNodes = useMemo(() => scalePos(graphNodes), []);
    const posMap = useMemo(() => { const m = {}; for (const n of scaledNodes) m[n.id] = n; return m; }, [scaledNodes]);
    const nodeIds = useMemo(() => getAllNodeIds(), []);

    const handleNodeClick = (id) => {
        if (selectedNodes.length === 0) {
            setSelectedNodes([id]);
            setSourceNode(id);
            setTargetNode('');
        } else if (selectedNodes.length === 1) {
            if (id === selectedNodes[0]) return;
            setSelectedNodes([selectedNodes[0], id]);
            setTargetNode(id);
        } else {
            setSelectedNodes([id]);
            setSourceNode(id);
            setTargetNode('');
        }
    };

    const pathResult = useMemo(() => {
        if (!sourceNode || !targetNode) return null;
        return dijkstra(graphEdges, nodeIds, sourceNode, targetNode);
    }, [sourceNode, targetNode, nodeIds]);

    const pathEdgeSet = useMemo(() => {
        if (!pathResult) return new Set();
        const s = new Set();
        for (const [u, v] of pathResult.edges) { s.add(`${u}-${v}`); s.add(`${v}-${u}`); }
        return s;
    }, [pathResult]);

    const pathNodeSet = useMemo(() => {
        if (!pathResult) return new Set();
        return new Set(pathResult.path);
    }, [pathResult]);

    const svgW = Math.max(...scaledNodes.map(n => n.x)) + 120;
    const svgH = Math.max(...scaledNodes.map(n => n.y)) + 80;

    return (
        <div className="fade-in">
            <div className="section-header">
                <h2>📏 Interactive Distance Calculator</h2>
                <p>Click two nodes on the graph to find the shortest path between them using Dijkstra's algorithm. Distance updates live!</p>
            </div>

            <div className="grid-3" style={{ marginBottom: 20 }}>
                <div className="stat-card">
                    <div className="stat-value" style={sourceNode ? { fontSize: 16 } : {}}>
                        {sourceNode ? getNodeName(sourceNode) : '—'}
                    </div>
                    <div className="stat-label">Source Node</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={targetNode ? { fontSize: 16 } : {}}>
                        {targetNode ? getNodeName(targetNode) : '—'}
                    </div>
                    <div className="stat-label">Target Node</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {pathResult ? (pathResult.distance === Infinity ? '∞' : `${pathResult.distance}m`) : '—'}
                    </div>
                    <div className="stat-label">Shortest Distance</div>
                </div>
            </div>

            <div className="controls">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>From:</span>
                    <select className="node-select" value={sourceNode} onChange={e => { setSourceNode(e.target.value); setSelectedNodes(e.target.value ? [e.target.value, ...(targetNode ? [targetNode] : [])] : []); }}>
                        <option value="">Select source...</option>
                        {graphNodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                    </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>To:</span>
                    <select className="node-select" value={targetNode} onChange={e => { setTargetNode(e.target.value); setSelectedNodes([...(sourceNode ? [sourceNode] : []), ...(e.target.value ? [e.target.value] : [])]); }}>
                        <option value="">Select target...</option>
                        {graphNodes.filter(n => n.id !== sourceNode).map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                    </select>
                </div>
                <button className="btn" onClick={() => { setSourceNode(''); setTargetNode(''); setSelectedNodes([]); }}>🔄 Reset</button>
                {sourceNode && targetNode && (
                    <button className="btn" onClick={() => { const t = sourceNode; setSourceNode(targetNode); setTargetNode(t); setSelectedNodes([targetNode, t]); }}>⇄ Swap</button>
                )}
            </div>

            <div className="grid-2">
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                    <div className="card-title">🗺️ Campus Graph — Click Any Two Nodes</div>
                    <div className="legend">
                        <div className="legend-item"><div className="legend-dot" style={{ background: '#00d4aa' }}></div>Shortest Path</div>
                        <div className="legend-item"><div className="legend-dot" style={{ background: '#6c63ff' }}></div>Source Node</div>
                        <div className="legend-item"><div className="legend-dot" style={{ background: '#ff6b9d' }}></div>Target Node</div>
                    </div>

                    <div className="viz-container">
                        <svg width={svgW} height={svgH}>
                            {graphEdges.map(([u, v, w], i) => {
                                const from = posMap[u], to = posMap[v];
                                if (!from || !to) return null;
                                const isPath = pathEdgeSet.has(`${u}-${v}`);
                                return (
                                    <g key={i}>
                                        <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                                            stroke={isPath ? '#00d4aa' : 'rgba(255,255,255,0.06)'}
                                            strokeWidth={isPath ? 3 : 1}
                                            style={{ transition: 'all 0.4s ease' }} />
                                        <text x={(from.x + to.x) / 2 + 6} y={(from.y + to.y) / 2 - 6}
                                            fill={isPath ? '#00d4aa' : 'rgba(255,255,255,0.15)'}
                                            fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif">{w}m</text>
                                    </g>
                                );
                            })}
                            {scaledNodes.map(n => {
                                const isSource = n.id === sourceNode;
                                const isTarget = n.id === targetNode;
                                const isOnPath = pathNodeSet.has(n.id);
                                let fillColor = 'rgba(40,40,80,0.8)';
                                let strokeColor = 'rgba(255,255,255,0.1)';
                                let r = 14;
                                if (isSource) { fillColor = '#6c63ff'; strokeColor = '#6c63ff'; r = 19; }
                                else if (isTarget) { fillColor = '#ff6b9d'; strokeColor = '#ff6b9d'; r = 19; }
                                else if (isOnPath) { fillColor = 'rgba(0,212,170,0.3)'; strokeColor = '#00d4aa'; r = 16; }

                                return (
                                    <g key={n.id} style={{ cursor: 'pointer' }} onClick={() => handleNodeClick(n.id)}>
                                        <circle cx={n.x} cy={n.y} r={r}
                                            fill={fillColor} stroke={strokeColor}
                                            strokeWidth={isSource || isTarget ? 3 : 1.5}
                                            style={{ transition: 'all 0.3s ease' }} />
                                        <text x={n.x} y={n.y + r + 12}
                                            textAnchor="middle" fill={isSource ? '#6c63ff' : isTarget ? '#ff6b9d' : isOnPath ? '#00d4aa' : '#9090b0'}
                                            fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif">
                                            {n.name.length > 14 ? n.name.slice(0, 12) + '…' : n.name}
                                        </text>
                                        {isSource && <text x={n.x} y={n.y + 3} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">S</text>}
                                        {isTarget && <text x={n.x} y={n.y + 3} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">T</text>}
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>
            </div>

            {pathResult && pathResult.path.length > 0 && (
                <div className="card fade-in" style={{ marginTop: 20 }}>
                    <div className="card-title">🛤️ Shortest Path Details</div>
                    <div className="path-display">
                        {pathResult.path.map((id, i) => (
                            <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <span className="path-node">{getNodeName(id)}</span>
                                {i < pathResult.path.length - 1 && (
                                    <>
                                        <span className="path-arrow">→</span>
                                        <span className="path-weight">
                                            {pathResult.edges[i] ? `${pathResult.edges[i][2]}m` : ''}
                                        </span>
                                        <span className="path-arrow">→</span>
                                    </>
                                )}
                            </span>
                        ))}
                    </div>

                    <div className="info-panel" style={{ marginTop: 16 }}>
                        <div className="info-row"><span className="info-label">Algorithm</span><span className="info-value">Dijkstra's Shortest Path</span></div>
                        <div className="info-row"><span className="info-label">Source</span><span className="info-value">{getNodeName(sourceNode)}</span></div>
                        <div className="info-row"><span className="info-label">Target</span><span className="info-value">{getNodeName(targetNode)}</span></div>
                        <div className="info-row"><span className="info-label">Hops</span><span className="info-value">{pathResult.path.length - 1}</span></div>
                        <div className="info-row"><span className="info-label">Total Distance</span><span className="info-value badge green">{pathResult.distance} meters</span></div>
                    </div>

                    <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Edge Breakdown:</div>
                        {pathResult.edges.map(([u, v, w], i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: 12 }}>
                                <span className="badge">{i + 1}</span>
                                <span style={{ color: 'var(--text-primary)' }}>{getNodeName(u)}</span>
                                <span style={{ color: 'var(--text-muted)' }}>→</span>
                                <span style={{ color: 'var(--text-primary)' }}>{getNodeName(v)}</span>
                                <span style={{ marginLeft: 'auto', color: 'var(--accent-4)', fontWeight: 700 }}>{w}m</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

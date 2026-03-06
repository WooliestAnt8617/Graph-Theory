import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { campusTree, flattenTree } from '../data/campusData';

// Calculate tree layout positions
function layoutTree(node, x = 0, y = 0, level = 0, xSpacing = 130, ySpacing = 80, collapsed = {}) {
    const positions = [];
    const edges = [];
    let currentX = x;

    if (!node) return { positions, edges, width: 0 };

    const isCollapsed = collapsed[node.id];
    const visibleChildren = isCollapsed ? [] : (node.children || []);

    if (visibleChildren.length === 0) {
        positions.push({ ...node, x: currentX, y, level, isLeaf: true, isCollapsed, hasChildren: (node.children || []).length > 0 });
        return { positions, edges, width: xSpacing };
    }

    let totalWidth = 0;
    const childResults = [];
    for (const child of visibleChildren) {
        const result = layoutTree(child, currentX + totalWidth, y + ySpacing, level + 1, xSpacing, ySpacing, collapsed);
        childResults.push(result);
        totalWidth += result.width;
    }

    const nodeX = currentX + totalWidth / 2 - xSpacing / 2;
    positions.push({ ...node, x: nodeX, y, level, isLeaf: false, isCollapsed, hasChildren: true });

    for (const result of childResults) {
        positions.push(...result.positions);
        edges.push(...result.edges);
    }

    for (const pos of childResults.flatMap(r => r.positions)) {
        if (visibleChildren.some(c => c.id === pos.id)) {
            edges.push({ from: node.id, to: pos.id });
        }
    }

    return { positions, edges, width: Math.max(totalWidth, xSpacing) };
}

// Color palette by level
const levelColors = ['#6c63ff', '#00d4aa', '#ff6b9d', '#ffa726', '#42a5f5', '#ab47bc'];

export default function CampusTree() {
    const [collapsed, setCollapsed] = useState({});
    const [hoveredNode, setHoveredNode] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const svgRef = useRef(null);

    const toggleCollapse = useCallback((id) => {
        setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
    }, []);

    const { positions, edges } = useMemo(() =>
        layoutTree(campusTree, 30, 40, 0, 140, 90, collapsed),
        [collapsed]
    );

    const posMap = useMemo(() => {
        const m = {};
        for (const p of positions) m[p.id] = p;
        return m;
    }, [positions]);

    const svgWidth = Math.max(900, Math.max(...positions.map(p => p.x)) + 160);
    const svgHeight = Math.max(500, Math.max(...positions.map(p => p.y)) + 120);

    const flatNodes = useMemo(() => flattenTree(campusTree), []);
    const selected = selectedNode ? flatNodes.find(n => n.id === selectedNode) : null;
    const treeStats = useMemo(() => {
        const depths = flatNodes.map(n => n.depth);
        return {
            totalNodes: flatNodes.length,
            maxDepth: Math.max(...depths),
            leafCount: flatNodes.filter(n => n.childCount === 0).length,
            internalNodes: flatNodes.filter(n => n.childCount > 0).length,
        };
    }, [flatNodes]);

    return (
        <div className="fade-in">
            <div className="section-header">
                <h2>🌳 Campus Tree Structure</h2>
                <p>Interactive hierarchical view of CHRIST University Delhi NCR campus. Click nodes to expand/collapse subtrees.</p>
            </div>

            <div className="grid-3" style={{ marginBottom: 20 }}>
                <div className="stat-card">
                    <div className="stat-value">{treeStats.totalNodes}</div>
                    <div className="stat-label">Total Nodes</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{treeStats.maxDepth}</div>
                    <div className="stat-label">Max Depth</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{treeStats.leafCount}</div>
                    <div className="stat-label">Leaf Nodes</div>
                </div>
            </div>

            <div className="grid-2">
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                    <div className="card-title">📊 Tree Visualization</div>
                    <div className="card-desc">Click any node to expand/collapse its children. Hover to see connections.</div>

                    <div className="legend">
                        {['Root (Lvl 0)', 'Blocks (Lvl 1)', 'Rooms (Lvl 2)', 'Sub-rooms (Lvl 3)'].map((label, i) => (
                            <div className="legend-item" key={i}>
                                <div className="legend-dot" style={{ background: levelColors[i] }}></div>
                                {label}
                            </div>
                        ))}
                    </div>

                    <div className="viz-container" style={{ maxHeight: 550 }}>
                        <svg ref={svgRef} width={svgWidth} height={svgHeight}>
                            <defs>
                                {levelColors.map((c, i) => (
                                    <filter key={i} id={`glow-${i}`}>
                                        <feGaussianBlur stdDeviation="3" result="blur" />
                                        <feFlood floodColor={c} floodOpacity="0.6" />
                                        <feComposite in2="blur" operator="in" />
                                        <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                                    </filter>
                                ))}
                            </defs>

                            {/* Edges */}
                            {edges.map((e, i) => {
                                const from = posMap[e.from];
                                const to = posMap[e.to];
                                if (!from || !to) return null;
                                const isHighlighted = hoveredNode === e.from || hoveredNode === e.to;
                                return (
                                    <path
                                        key={i}
                                        d={`M ${from.x + 55} ${from.y + 20} C ${from.x + 55} ${(from.y + to.y) / 2 + 20}, ${to.x + 55} ${(from.y + to.y) / 2 + 20}, ${to.x + 55} ${to.y}`}
                                        fill="none"
                                        stroke={isHighlighted ? levelColors[from.level] : 'rgba(255,255,255,0.08)'}
                                        strokeWidth={isHighlighted ? 2.5 : 1.5}
                                        style={{ transition: 'all 0.3s ease' }}
                                    />
                                );
                            })}

                            {/* Nodes */}
                            {positions.map((pos) => {
                                const color = levelColors[pos.level % levelColors.length];
                                const isHovered = hoveredNode === pos.id;
                                const isSelected = selectedNode === pos.id;
                                const nodeWidth = 110;
                                const nodeHeight = 36;

                                return (
                                    <g
                                        key={pos.id}
                                        transform={`translate(${pos.x}, ${pos.y})`}
                                        style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
                                        onClick={() => {
                                            setSelectedNode(pos.id);
                                            if (pos.hasChildren) toggleCollapse(pos.id);
                                        }}
                                        onMouseEnter={() => setHoveredNode(pos.id)}
                                        onMouseLeave={() => setHoveredNode(null)}
                                    >
                                        <rect
                                            x={0}
                                            y={0}
                                            width={nodeWidth}
                                            height={nodeHeight}
                                            rx={8}
                                            fill={isSelected ? color : isHovered ? `${color}33` : 'rgba(20,20,50,0.9)'}
                                            stroke={color}
                                            strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1}
                                            filter={isHovered || isSelected ? `url(#glow-${pos.level % levelColors.length})` : undefined}
                                            style={{ transition: 'all 0.25s ease' }}
                                        />
                                        <text
                                            x={nodeWidth / 2}
                                            y={nodeHeight / 2 + 1}
                                            textAnchor="middle"
                                            dominantBaseline="central"
                                            fill={isSelected ? '#fff' : color}
                                            fontSize="10"
                                            fontWeight="600"
                                            fontFamily="Inter, sans-serif"
                                        >
                                            {pos.name.length > 16 ? pos.name.slice(0, 14) + '…' : pos.name}
                                        </text>
                                        {pos.hasChildren && (
                                            <text
                                                x={nodeWidth - 8}
                                                y={10}
                                                textAnchor="middle"
                                                fill={color}
                                                fontSize="10"
                                                fontWeight="bold"
                                            >
                                                {pos.isCollapsed ? '+' : '−'}
                                            </text>
                                        )}
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>
            </div>

            {selected && (
                <div className="card fade-in" style={{ marginTop: 20 }}>
                    <div className="card-title">🔍 Node Details — {selected.name || flatNodes.find(n => n.id === selectedNode)?.name}</div>
                    <div className="info-panel" style={{ marginTop: 12 }}>
                        <div className="info-row"><span className="info-label">ID</span><span className="info-value">{selected.id}</span></div>
                        <div className="info-row"><span className="info-label">Depth</span><span className="info-value">{selected.depth}</span></div>
                        <div className="info-row"><span className="info-label">Parent</span><span className="info-value">{selected.parent || 'None (Root)'}</span></div>
                        <div className="info-row"><span className="info-label">Children Count</span><span className="info-value">{selected.childCount}</span></div>
                        <div className="info-row"><span className="info-label">Type</span><span className="info-value">{selected.childCount > 0 ? 'Internal Node' : 'Leaf Node'}</span></div>
                    </div>
                </div>
            )}
        </div>
    );
}

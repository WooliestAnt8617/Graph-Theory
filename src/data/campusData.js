// ========================================
// CHRIST University Delhi NCR - Campus Data
// Tree Structure + Weighted Graph
// ========================================

// --- TREE REPRESENTATION ---
// Each node has: id, name, children[]
export const campusTree = {
    id: 'campus',
    name: 'CHRIST University Delhi NCR',
    children: [
        {
            id: 'blockA',
            name: 'Block A',
            children: [
                { id: 'coDirector', name: "Co-Director's Office", children: [] },
                { id: 'dean', name: "Dean's Office", children: [] },
                { id: 'assocDean', name: "Associate Dean's Office", children: [] },
                { id: 'library', name: 'Library', children: [] },
                { id: 'mainAudi', name: 'Main Auditorium', children: [] },
                { id: 'cafeteria', name: 'Cafeteria', children: [] },
                { id: 'ideaLounge', name: 'Idea Lounge', children: [] },
                { id: 'seminarHallA', name: 'Seminar Hall (A)', children: [] },
            ],
        },
        {
            id: 'blockB',
            name: 'Block B',
            children: [
                { id: 'seminarHallB', name: 'Seminar Hall (B)', children: [] },
                { id: 'rooftop', name: 'Rooftop', children: [] },
                { id: 'psychLab', name: 'Psychology Lab', children: [] },
                { id: 'confRoom', name: 'Conference Room', children: [] },
                { id: 'capsOffice', name: 'CAPS Office', children: [] },
                { id: 'cchs', name: 'CCHS', children: [] },
                { id: 'ciic', name: 'CIIC', children: [] },
                { id: 'ipm', name: 'IPM', children: [] },
                { id: 'miniAudi', name: 'Mini Audi', children: [] },
                {
                    id: 'bBasement',
                    name: 'B - Basement',
                    children: [
                        { id: 'ccd', name: 'CCD', children: [] },
                        { id: 'csaOffice', name: 'CSA Office', children: [] },
                        { id: 'nccOffice', name: 'NCC Office', children: [] },
                        { id: 'peOffice', name: 'Physical Education Dept', children: [] },
                        { id: 'activityCenter', name: 'Activity Center', children: [] },
                    ],
                },
            ],
        },
        { id: 'miniTurf', name: 'Mini Turf', children: [] },
        { id: 'mainTurf', name: 'Main Turf', children: [] },
        { id: 'basketballCourt', name: 'New Basketball Court', children: [] },
        { id: 'basementParking', name: 'Basement Parking', children: [] },
    ],
};

// --- GRAPH REPRESENTATION ---
// Nodes with positions for visualization
// Edges with weights (distances in meters, estimated)
export const graphNodes = [
    { id: 'campus', name: 'CHRIST Campus', x: 500, y: 50 },
    { id: 'blockA', name: 'Block A', x: 200, y: 150 },
    { id: 'blockB', name: 'Block B', x: 500, y: 150 },
    { id: 'miniTurf', name: 'Mini Turf', x: 750, y: 150 },
    { id: 'mainTurf', name: 'Main Turf', x: 850, y: 250 },
    { id: 'basketballCourt', name: 'Basketball Court', x: 750, y: 350 },
    { id: 'basementParking', name: 'Basement Parking', x: 100, y: 350 },
    { id: 'coDirector', name: "Co-Director's Office", x: 50, y: 250 },
    { id: 'dean', name: "Dean's Office", x: 150, y: 250 },
    { id: 'library', name: 'Library', x: 250, y: 250 },
    { id: 'mainAudi', name: 'Main Auditorium', x: 200, y: 350 },
    { id: 'cafeteria', name: 'Cafeteria', x: 300, y: 350 },
    { id: 'seminarHallA', name: 'Seminar Hall (A)', x: 350, y: 250 },
    { id: 'seminarHallB', name: 'Seminar Hall (B)', x: 400, y: 250 },
    { id: 'confRoom', name: 'Conference Room', x: 500, y: 250 },
    { id: 'capsOffice', name: 'CAPS Office', x: 600, y: 250 },
    { id: 'miniAudi', name: 'Mini Audi', x: 650, y: 350 },
    { id: 'bBasement', name: 'B-Basement', x: 450, y: 350 },
    { id: 'activityCenter', name: 'Activity Center', x: 500, y: 450 },
    { id: 'ccd', name: 'CCD', x: 350, y: 450 },
    { id: 'csaOffice', name: 'CSA Office', x: 550, y: 450 },
];

// Weighted edges: [source, target, weight(meters)]
export const graphEdges = [
    // Campus connections to main blocks
    ['campus', 'blockA', 120],
    ['campus', 'blockB', 100],
    ['campus', 'miniTurf', 200],
    ['campus', 'basementParking', 150],

    // Block A internal & nearby
    ['blockA', 'coDirector', 15],
    ['blockA', 'dean', 20],
    ['blockA', 'library', 30],
    ['blockA', 'mainAudi', 50],
    ['blockA', 'cafeteria', 40],
    ['blockA', 'seminarHallA', 35],
    ['blockA', 'basementParking', 80],

    // Block B internal & nearby
    ['blockB', 'seminarHallB', 20],
    ['blockB', 'confRoom', 25],
    ['blockB', 'capsOffice', 30],
    ['blockB', 'miniAudi', 45],
    ['blockB', 'bBasement', 60],

    // B-Basement connections
    ['bBasement', 'ccd', 10],
    ['bBasement', 'csaOffice', 15],
    ['bBasement', 'activityCenter', 20],

    // Cross-block connections
    ['seminarHallA', 'seminarHallB', 50],
    ['cafeteria', 'bBasement', 90],
    ['library', 'confRoom', 70],
    ['mainAudi', 'miniAudi', 110],

    // Turf & outdoor connections
    ['miniTurf', 'mainTurf', 60],
    ['miniTurf', 'basketballCourt', 80],
    ['mainTurf', 'basketballCourt', 50],
    ['basketballCourt', 'miniAudi', 90],
    ['basementParking', 'mainAudi', 70],
    ['basementParking', 'coDirector', 40],

    // Additional cross-connections for a richer graph
    ['dean', 'library', 15],
    ['cafeteria', 'seminarHallA', 25],
    ['confRoom', 'capsOffice', 20],
    ['ccd', 'csaOffice', 12],
    ['csaOffice', 'activityCenter', 18],
    ['miniAudi', 'capsOffice', 35],
    ['mainTurf', 'blockB', 130],
];

// --- ALGORITHMS ---

// Flatten tree to array of nodes
export function flattenTree(node, depth = 0, parent = null) {
    const result = [{ ...node, depth, parent: parent?.id || null, childCount: node.children.length }];
    for (const child of node.children) {
        result.push(...flattenTree(child, depth + 1, node));
    }
    return result;
}

// Tree Traversals
export function preOrder(node) {
    if (!node) return [];
    const result = [node.id];
    for (const child of node.children) {
        result.push(...preOrder(child));
    }
    return result;
}

export function postOrder(node) {
    if (!node) return [];
    const result = [];
    for (const child of node.children) {
        result.push(...postOrder(child));
    }
    result.push(node.id);
    return result;
}

export function inOrder(node) {
    if (!node) return [];
    const result = [];
    const mid = Math.floor(node.children.length / 2);
    for (let i = 0; i < mid; i++) {
        result.push(...inOrder(node.children[i]));
    }
    result.push(node.id);
    for (let i = mid; i < node.children.length; i++) {
        result.push(...inOrder(node.children[i]));
    }
    return result;
}

export function levelOrder(node) {
    if (!node) return [];
    const result = [];
    const queue = [node];
    while (queue.length > 0) {
        const current = queue.shift();
        result.push(current.id);
        for (const child of current.children) {
            queue.push(child);
        }
    }
    return result;
}

// Build adjacency list from edges
export function buildAdjacencyList(edges, nodes) {
    const adj = {};
    for (const n of nodes) {
        adj[n.id] = [];
    }
    for (const [u, v, w] of edges) {
        if (adj[u]) adj[u].push({ node: v, weight: w });
        if (adj[v]) adj[v].push({ node: u, weight: w });
    }
    return adj;
}

// Union-Find for Kruskal's
class UnionFind {
    constructor(nodes) {
        this.parent = {};
        this.rank = {};
        for (const n of nodes) {
            this.parent[n] = n;
            this.rank[n] = 0;
        }
    }
    find(x) {
        if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
        return this.parent[x];
    }
    union(x, y) {
        const px = this.find(x), py = this.find(y);
        if (px === py) return false;
        if (this.rank[px] < this.rank[py]) this.parent[px] = py;
        else if (this.rank[px] > this.rank[py]) this.parent[py] = px;
        else { this.parent[py] = px; this.rank[px]++; }
        return true;
    }
}

// Kruskal's MST - returns steps for animation
export function kruskalMST(edges, nodeIds) {
    const sorted = [...edges].sort((a, b) => a[2] - b[2]);
    const uf = new UnionFind(nodeIds);
    const steps = [];
    const mstEdges = [];
    let totalWeight = 0;

    for (const [u, v, w] of sorted) {
        const added = uf.union(u, v);
        steps.push({
            edge: [u, v, w],
            accepted: added,
            mstEdges: [...mstEdges, ...(added ? [[u, v, w]] : [])],
            totalWeight: totalWeight + (added ? w : 0),
        });
        if (added) {
            mstEdges.push([u, v, w]);
            totalWeight += w;
        }
    }
    return { steps, mstEdges, totalWeight };
}

// Prim's MST - returns steps for animation
export function primMST(edges, nodeIds, startNode) {
    const adj = buildAdjacencyList(edges, nodeIds.map(id => ({ id })));
    const visited = new Set();
    const steps = [];
    const mstEdges = [];
    let totalWeight = 0;

    visited.add(startNode);
    steps.push({ currentNode: startNode, mstEdges: [], totalWeight: 0, action: 'start' });

    while (visited.size < nodeIds.length) {
        let minEdge = null;
        let minWeight = Infinity;

        for (const v of visited) {
            for (const { node: neighbor, weight } of (adj[v] || [])) {
                if (!visited.has(neighbor) && weight < minWeight) {
                    minWeight = weight;
                    minEdge = [v, neighbor, weight];
                }
            }
        }

        if (!minEdge) break;

        visited.add(minEdge[1]);
        mstEdges.push(minEdge);
        totalWeight += minEdge[2];
        steps.push({
            edge: minEdge,
            currentNode: minEdge[1],
            mstEdges: [...mstEdges],
            totalWeight,
            action: 'add',
        });
    }

    return { steps, mstEdges, totalWeight };
}

// DFS Spanning Tree
export function dfsSpanningTree(edges, nodeIds, startNode) {
    const adj = buildAdjacencyList(edges, nodeIds.map(id => ({ id })));
    const visited = new Set();
    const spanningEdges = [];

    function dfs(node) {
        visited.add(node);
        for (const { node: neighbor, weight } of (adj[node] || [])) {
            if (!visited.has(neighbor)) {
                spanningEdges.push([node, neighbor, weight]);
                dfs(neighbor);
            }
        }
    }

    dfs(startNode);
    return spanningEdges;
}

// BFS Spanning Tree
export function bfsSpanningTree(edges, nodeIds, startNode) {
    const adj = buildAdjacencyList(edges, nodeIds.map(id => ({ id })));
    const visited = new Set([startNode]);
    const queue = [startNode];
    const spanningEdges = [];

    while (queue.length > 0) {
        const node = queue.shift();
        for (const { node: neighbor, weight } of (adj[node] || [])) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                spanningEdges.push([node, neighbor, weight]);
                queue.push(neighbor);
            }
        }
    }

    return spanningEdges;
}

// Dijkstra's Shortest Path
export function dijkstra(edges, nodeIds, source, target) {
    const adj = buildAdjacencyList(edges, nodeIds.map(id => ({ id })));
    const dist = {};
    const prev = {};
    const unvisited = new Set();

    for (const id of nodeIds) {
        dist[id] = Infinity;
        prev[id] = null;
        unvisited.add(id);
    }
    dist[source] = 0;

    while (unvisited.size > 0) {
        let u = null;
        let minDist = Infinity;
        for (const v of unvisited) {
            if (dist[v] < minDist) { minDist = dist[v]; u = v; }
        }
        if (u === null || u === target) break;
        unvisited.delete(u);

        for (const { node: v, weight } of (adj[u] || [])) {
            if (unvisited.has(v)) {
                const alt = dist[u] + weight;
                if (alt < dist[v]) {
                    dist[v] = alt;
                    prev[v] = u;
                }
            }
        }
    }

    // Reconstruct path
    const path = [];
    let current = target;
    while (current !== null) {
        path.unshift(current);
        current = prev[current];
    }

    if (path[0] !== source) return { path: [], distance: Infinity, edges: [] };

    const pathEdges = [];
    for (let i = 0; i < path.length - 1; i++) {
        const u = path[i], v = path[i + 1];
        const edge = edges.find(([a, b]) => (a === u && b === v) || (a === v && b === u));
        if (edge) pathEdges.push(edge);
    }

    return { path, distance: dist[target], edges: pathEdges };
}

// Get node name by id
export function getNodeName(id) {
    const allNodes = [...graphNodes];
    const found = allNodes.find(n => n.id === id);
    return found ? found.name : id;
}

// Get all node IDs from the graph
export function getAllNodeIds() {
    return graphNodes.map(n => n.id);
}

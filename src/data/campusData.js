// ========================================
// CHRIST University Delhi NCR - Campus Data
// Source of Truth: JSON data structure
// ========================================

const campusJson = {
  "campus": "CHRIST (Deemed to be University) Delhi NCR",
  "anchor_scale": "Main Turf = 105m length",
  "graph_data": {
    "nodes": [
      {
        "id": "block_a",
        "label": "Block A",
        "position": {"x": -50, "y": 80},
        "type": "academic_admin",
        "internals": [
          "Main Auditorium", "Library", "Cafeteria", 
          "Co-Director's Office", "Dean's Office", 
          "Seminar Hall A", "Block A Classrooms"
        ]
      },
      {
        "id": "central_lawn",
        "label": "Central Lawn",
        "position": {"x": 0, "y": 0},
        "type": "hub"
      },
      {
        "id": "block_b",
        "label": "Block B",
        "position": {"x": -50, "y": -80},
        "type": "admin_student_life",
        "internals": [
          "B-Block Seminar Hall", "Conference Hall", "Director's Office", 
          "Rooftop", "Mini Audi", "CCHS (Health Center)", 
          "CIIC (Innovation Center)", "CAPS", "CSA", "NCC", 
          "IPM Offices"
        ]
      },
      {
        "id": "main_turf",
        "label": "Main Turf",
        "position": {"x": -90, "y": 0},
        "type": "sports",
        "sub_layers": ["Underground Parking"]
      },
      {
        "id": "mini_turf",
        "label": "Mini Turf",
        "position": {"x": 0, "y": -110},
        "type": "sports",
        "note": "Located directly behind Block B"
      },
      {
        "id": "dominos",
        "label": "Domino's",
        "position": {"x": 60, "y": -60},
        "type": "food",
        "note": "Right side of Block B"
      },
      {
        "id": "synergy_square",
        "label": "Synergy Square",
        "position": {"x": 60, "y": 40},
        "type": "social_hub",
        "adjacent": ["Fathers Residence"]
      },
      {
        "id": "new_basketball",
        "label": "New Basketball Court",
        "position": {"x": -85, "y": 70},
        "type": "sports",
        "adjacent": ["Gazebo"]
      }
    ],
    "edges": [
      {"from": "block_a", "to": "central_lawn", "distance": "30m"},
      {"from": "central_lawn", "to": "block_b", "distance": "30m"},
      {"from": "block_b", "to": "mini_turf", "distance": "20m"},
      {"from": "block_b", "to": "dominos", "distance": "15m"},
      {"from": "central_lawn", "to": "main_turf", "distance": "55m"},
      {"from": "main_turf", "to": "underground_parking", "type": "vertical_transition"}
    ]
  }
};

// --- DATA TRANSFORMATION ---

// Helper to generate a safe ID
const toId = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_$/, '');

// Create a comprehensive list of all nodes, including derived ones.
const allNodes = [...campusJson.graph_data.nodes];
const existingIds = new Set(allNodes.map(n => n.id));

campusJson.graph_data.nodes.forEach(node => {
    const processDerivedNode = (name, parentNode, type, offset = { x: 5, y: -5 }) => {
        const id = toId(name);
        if (!existingIds.has(id)) {
            allNodes.push({
                id: id,
                label: name,
                position: { x: parentNode.position.x + offset.x, y: parentNode.position.y + offset.y },
                type: type,
                parent: parentNode.id
            });
            existingIds.add(id);
        }
    };

    if (node.sub_layers) {
        node.sub_layers.forEach(name => processDerivedNode(name, node, 'logistics', { x: 5, y: -10 }));
    }
    if (node.adjacent) {
        node.adjacent.forEach(name => processDerivedNode(name, node, 'social', { x: 10, y: 5 }));
    }
    // Show internal locations on the main graph
    if (node.internals) {
        const columns = 3;
        const xSpacing = 45;
        const ySpacing = 35;
        const startX = node.position.x + 70;
        const numRows = Math.ceil(node.internals.length / columns);
        const startY = node.position.y - ((numRows - 1) * ySpacing / 2);

        node.internals.forEach((name, i) => {
            const row = Math.floor(i / columns);
            const col = i % columns;
            const offset = {
                x: (startX + col * xSpacing) - node.position.x,
                y: (startY + row * ySpacing) - node.position.y
            };
            processDerivedNode(name, node, 'internal', offset);
        });
    }
});

// Create a comprehensive list of edges.
const allEdges = [...campusJson.graph_data.edges];

// Add edges for adjacent nodes
campusJson.graph_data.nodes.forEach(node => {
    if (node.adjacent) {
        node.adjacent.forEach(name => {
            allEdges.push({ from: node.id, to: toId(name), distance: "15m" });
        });
    }
});

// Add edges for internal nodes to connect them to their parent block
campusJson.graph_data.nodes.forEach(node => {
    if (node.internals) {
        node.internals.forEach(name => {
            allEdges.push({ from: node.id, to: toId(name), distance: "10m" });
        });
    }
});

// Ensure graph is fully connected for algorithms
const extraEdges = [
    { from: "main_turf", to: "new_basketball", distance: "40m" },
    { from: "synergy_square", to: "block_a", distance: "25m" },
    { from: "central_lawn", to: "synergy_square", distance: "40m" },
    { from: "dominos", to: "synergy_square", distance: "30m" },
];
allEdges.push(...extraEdges);

// --- DATA EXPORTS ---

// 1. FULL GRAPH (with internal nodes)
export const graphNodes = allNodes.map(node => {
    return {
        id: node.id,
        name: node.label,
        // Use new position property and adjust scaling for a good layout
        x: (node.position.x + 120) * 4.5,
        y: (node.position.y + 120) * 3,
    };
});

export const graphEdges = allEdges.map(edge => [
    edge.from,
    edge.to,
    // Handle cases with no distance (e.g., vertical_transition)
    edge.distance ? parseInt(edge.distance) : 10
]).filter(edge => edge[0] && edge[1]); // Filter out malformed edges

// 2. MAIN GRAPH (without internal nodes)
const mainRawNodes = allNodes.filter(node => node.type !== 'internal');
const mainRawNodeIds = new Set(mainRawNodes.map(n => n.id));

export const mainGraphNodes = mainRawNodes.map(node => {
    return {
        id: node.id,
        name: node.label,
        x: (node.position.x + 120) * 4.5,
        y: (node.position.y + 120) * 3,
    };
});

const mainRawEdges = allEdges.filter(edge => mainRawNodeIds.has(edge.from) && mainRawNodeIds.has(edge.to));
export const mainGraphEdges = mainRawEdges.map(edge => [
    edge.from,
    edge.to,
    edge.distance ? parseInt(edge.distance) : 10
]).filter(edge => edge[0] && edge[1]);

// 3. TREE REPRESENTATION
const nodeMap = {};
// First, create all node objects for the tree from the enhanced raw node list
allNodes.forEach(node => {
    nodeMap[node.id] = {
        id: node.id,
        name: node.label,
        children: [],
    };
});

// Second, populate children from 'contains' and 'sub_level' (via parent link)
allNodes.forEach(node => {
    // Handle 'internals' (new name for 'contains')
    if (node.internals && Array.isArray(node.internals)) {
        nodeMap[node.id].children = node.internals.map(name => ({
            id: toId(name), // Use the same ID generation
            name: name,
            children: [],
        }));
    }
    // Handle parent links created for sub_layers and adjacent
    if (node.parent) {
        if (nodeMap[node.parent]) {
            // Check if child already exists (e.g. from internals) before pushing
            if (!nodeMap[node.parent].children.find(child => child.id === node.id)) {
                 nodeMap[node.parent].children.push(nodeMap[node.id]);
            }
        }
    }
});

// Third, build the hierarchy. All nodes without a parent are top-level.
const topLevelNodes = allNodes
    .filter(node => !node.parent)
    .map(node => nodeMap[node.id]);

export const campusTree = {
    id: 'campus',
    name: campusJson.campus,
    children: topLevelNodes,
};

// --- ALGORITHMS & HELPERS ---

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

// Get node name by id - using a map for efficiency
const allNodeNames = new Map(allNodes.map(n => [n.id, n.label]));
export function getNodeName(id) {
    return allNodeNames.get(id) || id;
}

// Get all node IDs from the graph
export function getAllNodeIds() {
    return graphNodes.map(n => n.id);
}

// Get all node IDs from the MAIN graph
export function getAllMainNodeIds() {
    return mainGraphNodes.map(n => n.id);
}

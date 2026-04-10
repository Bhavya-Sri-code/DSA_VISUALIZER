// Graph visualizer

const graphCanvas = document.getElementById('graph-canvas');
const btnBFS = document.getElementById('btn-bfs');
const btnDFS = document.getElementById('btn-dfs');
const btnResetGraph = document.getElementById('btn-reset-graph');
const startNodeInput = document.getElementById('graph-start-node');

let nodes = [];
let edges = []; // {u, v, domEdge}
let adjacencyList = {}; // NodeID -> Array of NodeIDs
let selectedNodeForEdge = null;
let edgeIdCounter = 0;

let isGraphRunning = false;

function initGraph() {
    graphCanvas.addEventListener('click', handleCanvasClick);
    btnBFS.addEventListener('click', () => runGraphTraversal('bfs'));
    btnDFS.addEventListener('click', () => runGraphTraversal('dfs'));
    btnResetGraph.addEventListener('click', resetGraph);
}

function handleCanvasClick(e) {
    if (isGraphRunning) return;
    
    // If clicking on exactly canvas, create a node
    if (e.target === graphCanvas) {
        createNode(e.offsetX, e.offsetY);
    }
}

function createNode(x, y) {
    const nodeId = nodes.length;
    nodes.push({ id: nodeId, x, y });
    adjacencyList[nodeId] = [];
    
    const nodeEl = document.createElement('div');
    nodeEl.className = 'graph-node';
    nodeEl.textContent = nodeId;
    nodeEl.style.left = `${x}px`;
    nodeEl.style.top = `${y}px`;
    nodeEl.id = `node-${nodeId}`;
    
    // Click on node to create edge
    nodeEl.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent canvas click
        if (isGraphRunning) return;
        
        if (selectedNodeForEdge === null) {
            // Select first node
            selectedNodeForEdge = nodeId;
            nodeEl.style.borderColor = 'var(--accent)';
            nodeEl.style.borderWidth = '3px';
        } else {
            // Select second node and create edge
            if (selectedNodeForEdge !== nodeId) {
                createEdge(selectedNodeForEdge, nodeId);
            }
            // Reset selection visually
            const prevNodeEl = document.getElementById(`node-${selectedNodeForEdge}`);
            if (prevNodeEl) {
                prevNodeEl.style.borderColor = 'var(--primary)';
                prevNodeEl.style.borderWidth = '2px';
            }
            selectedNodeForEdge = null;
        }
    });

    graphCanvas.appendChild(nodeEl);
    logMessage('graph-log', `Created Node ${nodeId} at [${x}, ${y}]`);
}

function createEdge(u, v) {
    // Check if edge already exists
    if (adjacencyList[u].includes(v)) return;
    
    adjacencyList[u].push(v);
    adjacencyList[v].push(u); // Undirected graph
    
    const uNode = nodes[u];
    const vNode = nodes[v];
    
    const edgeEl = document.createElement('div');
    edgeEl.className = 'graph-edge';
    edgeEl.id = `edge-${Math.min(u,v)}-${Math.max(u,v)}`;
    
    // Calculate length and angle
    const dx = vNode.x - uNode.x;
    const dy = vNode.y - uNode.y;
    const length = Math.sqrt(dx*dx + dy*dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    edgeEl.style.width = `${length}px`;
    edgeEl.style.left = `${uNode.x}px`;
    edgeEl.style.top = `${uNode.y}px`;
    edgeEl.style.transform = `rotate(${angle}deg)`;
    
    // Insert edge before nodes so nodes are drawn on top
    graphCanvas.insertBefore(edgeEl, graphCanvas.firstChild);
    
    edges.push({u, v});
    logMessage('graph-log', `Created Edge between Node ${u} and Node ${v}`);
}

function resetGraphState() {
    // clean colors from traversals
    nodes.forEach(n => {
        const el = document.getElementById(`node-${n.id}`);
        if(el) {
            el.className = 'graph-node';
        }
    });
    const allEdges = document.querySelectorAll('.graph-edge');
    allEdges.forEach(e => {
        e.classList.remove('edge-visited');
    });
}

function resetGraph() {
    graphCanvas.innerHTML = '';
    nodes = [];
    edges = [];
    adjacencyList = {};
    selectedNodeForEdge = null;
    clearLog('graph-log');
    startNodeInput.value = '';
}

async function runGraphTraversal(type) {
    if (isGraphRunning || nodes.length === 0) return;
    
    let startId = parseInt(startNodeInput.value);
    if (isNaN(startId) || startId < 0 || startId >= nodes.length) {
        startId = 0; // Default to 0
        startNodeInput.value = 0;
    }
    
    isGraphRunning = true;
    disableGraphBtns(true);
    resetGraphState();
    clearLog('graph-log');
    
    try {
        if (type === 'bfs') {
            await bfs(startId);
        } else {
            // Set for DFS helper to track visited
            const visited = new Set();
            await dfs(startId, visited);
        }
    } catch (err) {
        console.error(err);
    }
    
    isGraphRunning = false;
    disableGraphBtns(false);
}

function disableGraphBtns(disable) {
    btnBFS.disabled = disable;
    btnDFS.disabled = disable;
    btnResetGraph.disabled = disable;
}

// Visual helpers for Graph
async function visitNode(nodeId) {
    const el = document.getElementById(`node-${nodeId}`);
    el.classList.add('node-visiting');
    logMessage('graph-log', `Visiting Node ${nodeId}`, 'compare');
    await sleep(600);
    el.classList.remove('node-visiting');
    el.classList.add('node-visited');
}

async function visitEdge(u, v) {
    // Edge IDs are created with smaller id first
    const id = `edge-${Math.min(u,v)}-${Math.max(u,v)}`;
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('edge-visited');
        logMessage('graph-log', `Traversing edge (${u} - ${v})`);
        await sleep(300);
    }
}

// BFS Implementation
async function bfs(start) {
    logMessage('graph-log', `--- Starting BFS from Node ${start} ---`, 'info');
    let q = [start];
    let visited = new Set();
    visited.add(start);
    
    while(q.length > 0) {
        let curr = q.shift();
        await visitNode(curr);
        
        // neighbors
        for (let neighbor of adjacencyList[curr]) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                await visitEdge(curr, neighbor);
                logMessage('graph-log', `Node ${neighbor} added to Queue`, 'success');
                q.push(neighbor);
            }
        }
    }
    logMessage('graph-log', `--- BFS Completed ---`, 'info');
}

// DFS Implementation
async function dfs(curr, visited) {
    if (visited.size === 0) { // First call
        logMessage('graph-log', `--- Starting DFS from Node ${curr} ---`, 'info');
    }
    
    visited.add(curr);
    await visitNode(curr);
    
    for (let neighbor of adjacencyList[curr]) {
        if (!visited.has(neighbor)) {
            await visitEdge(curr, neighbor);
            await dfs(neighbor, visited);
        }
    }
    
    if (visited.size === nodes.length || 'check_if_root_or_done') {
       // just logic padding
    }
}

document.addEventListener('DOMContentLoaded', initGraph);

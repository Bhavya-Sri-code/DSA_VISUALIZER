// Queue Data Structure Visualizer

const queueCanvas = document.getElementById('queue-canvas');
const queueInput = document.getElementById('queue-input');
const btnEnqueue = document.getElementById('btn-enqueue');
const btnDequeue = document.getElementById('btn-dequeue');
const btnResetQueue = document.getElementById('btn-reset-queue');

let queueData = [];
let frontIndex = 0;
let rearIndex = -1;

function initQueue() {
    btnEnqueue.addEventListener('click', () => enqueue());
    btnDequeue.addEventListener('click', () => dequeue());
    btnResetQueue.addEventListener('click', resetQueue);
    
    queueInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') enqueue();
    });
}

async function enqueue() {
    const val = queueInput.value.trim();
    if (!val) {
        alert("Please enter a value");
        return;
    }
    
    if (queueCanvas.children.length >= 8) {
        logMessage('queue-log', `Queue is full! Cannot enqueue ${val}.`, 'swap');
        alert("Queue Full!");
        return;
    }

    btnEnqueue.disabled = true;
    queueData.push(val);
    rearIndex++;
    
    logMessage('queue-log', `Enqueueing ${val} to rear of the queue.`, 'success');
    
    const el = document.createElement('div');
    el.className = 'data-box item-enter';
    el.innerHTML = `
        <div style="font-size: 0.7rem; color: var(--text-muted); position:absolute; top: -20px;"></div>
        <div>${val}</div>
    `;
    
    queueCanvas.appendChild(el);
    updatePointers();
    
    queueInput.value = '';
    await sleep(400); 
    btnEnqueue.disabled = false;
    queueInput.focus();
}

async function dequeue() {
    if (queueCanvas.children.length === 0) {
        logMessage('queue-log', `Queue Underflow! Queue is already empty.`, 'swap');
        alert("Queue Underflow! Queue is empty.");
        return;
    }
    
    btnDequeue.disabled = true;
    
    const firstElement = queueCanvas.firstElementChild;
    const val = queueData[frontIndex];
    logMessage('queue-log', `Dequeueing ${val} from front of the queue.`, 'compare');
    
    firstElement.classList.replace('item-enter', 'item-exit');
    firstElement.classList.add('not-found'); 
    
    await sleep(300);
    queueCanvas.removeChild(firstElement);
    frontIndex++;
    
    // Adjust logic if array gets too big in real life, but here visual array dictates state
    if (queueCanvas.children.length === 0) {
        queueData = [];
        frontIndex = 0;
        rearIndex = -1;
    }
    
    updatePointers();
    btnDequeue.disabled = false;
}

function updatePointers() {
    const children = queueCanvas.children;
    for (let i = 0; i < children.length; i++) {
        const labelDiv = children[i].querySelector('div');
        if (i === 0 && i === children.length - 1) {
            labelDiv.textContent = 'Front/Rear';
        } else if (i === 0) {
            labelDiv.textContent = 'Front';
        } else if (i === children.length - 1) {
            labelDiv.textContent = 'Rear';
        } else {
            labelDiv.textContent = '';
        }
    }
}

function resetQueue() {
    queueData = [];
    frontIndex = 0;
    rearIndex = -1;
    queueCanvas.innerHTML = '';
    clearLog('queue-log');
    queueInput.value = '';
    logMessage('queue-log', `Queue cleared.`, 'info');
}

document.addEventListener('DOMContentLoaded', initQueue);

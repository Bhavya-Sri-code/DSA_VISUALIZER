// Stack Data Structure Visualizer

const stackCanvas = document.getElementById('stack-canvas');
const stackInput = document.getElementById('stack-input');
const btnPush = document.getElementById('btn-push');
const btnPop = document.getElementById('btn-pop');
const btnResetStack = document.getElementById('btn-reset-stack');

let stackData = [];

function initStack() {
    btnPush.addEventListener('click', () => push());
    btnPop.addEventListener('click', () => pop());
    btnResetStack.addEventListener('click', resetStack);
    
    // Submit on enter
    stackInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') push();
    });
}

async function push() {
    const val = stackInput.value.trim();
    if (!val) {
        alert("Please enter a value");
        return;
    }
    
    // Hard limit so drawing stays within screen
    if (stackData.length >= 8) {
        logMessage('stack-log', `Stack Overflow! Cannot push ${val}. Stack is full.`, 'swap');
        alert("Stack Overflow!");
        return;
    }

    // Process push
    btnPush.disabled = true;
    
    stackData.push(val);
    logMessage('stack-log', `Pushing ${val} onto top of the stack.`, 'success');
    
    const el = document.createElement('div');
    el.className = 'data-box item-enter';
    el.innerHTML = val;
    // For visual: Top of stack can be highlighted
    
    // Because flex-col-reverse in canvas, appending puts it at "top"
    stackCanvas.appendChild(el);
    stackInput.value = '';
    
    await sleep(400); // let animation play
    btnPush.disabled = false;
    stackInput.focus();
}

async function pop() {
    if (stackData.length === 0) {
        logMessage('stack-log', `Stack Underflow! Stack is already empty.`, 'swap');
        alert("Stack Underflow! Stack is empty.");
        return;
    }
    
    btnPop.disabled = true;
    const val = stackData.pop();
    logMessage('stack-log', `Popping ${val} from top of the stack.`, 'compare');
    
    // The top element is the last child due to flex-col-reverse visually, wait no it's the last added!
    // Since we appendChild, it goes to the end of the NodeList. With flex-col-reverse, last child is top visually.
    const children = stackCanvas.children;
    const topElement = children[children.length - 1];
    
    topElement.classList.replace('item-enter', 'item-exit');
    topElement.classList.add('not-found'); // highlight red for popping
    
    await sleep(300); // animation duration
    stackCanvas.removeChild(topElement);
    
    btnPop.disabled = false;
}

function resetStack() {
    stackData = [];
    stackCanvas.innerHTML = '';
    clearLog('stack-log');
    stackInput.value = '';
    logMessage('stack-log', `Stack cleared.`, 'info');
}

document.addEventListener('DOMContentLoaded', initStack);

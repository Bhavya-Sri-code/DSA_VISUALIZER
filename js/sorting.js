// Sorting Visualizer Logic

let sortArray = [];
let sortElements = [];
let isSorting = false;

// DOM Elements
const sortCanvas = document.getElementById('sorting-canvas');
const customArrayInput = document.getElementById('custom-array');
const btnGenerate = document.getElementById('btn-generate');
const btnSort = document.getElementById('btn-sort');
const btnResetSort = document.getElementById('btn-reset');
const speedSlider = document.getElementById('speed-slider');
const algoSelect = document.getElementById('algo-select');
const timeComplexityEl = document.querySelector('#sorting-info .time-complexity span');
const spaceComplexityEl = document.querySelector('#sorting-info .space-complexity span');

const COMPLEXITIES = {
    'bubble': { time: 'O(n²)', space: 'O(1)' },
    'selection': { time: 'O(n²)', space: 'O(1)' },
    'insertion': { time: 'O(n²)', space: 'O(1)' },
    'merge': { time: 'O(n log n)', space: 'O(n)' },
    'quick': { time: 'O(n log n) avg', space: 'O(log n)' }
};

// Initialize
function initSorting() {
    algoSelect.addEventListener('change', updateComplexity);
    btnGenerate.addEventListener('click', generateArray);
    btnSort.addEventListener('click', startSorting);
    btnResetSort.addEventListener('click', resetSorting);
    
    updateComplexity();
    generateArray(); // default array on load
}

function updateComplexity() {
    const algo = algoSelect.value;
    timeComplexityEl.textContent = COMPLEXITIES[algo].time;
    spaceComplexityEl.textContent = COMPLEXITIES[algo].space;
}

function generateArray() {
    if (isSorting) return;
    const inputVal = customArrayInput.value.trim();
    sortArray = [];
    
    if (inputVal) {
        // Parse custom input
        const nums = inputVal.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        if (nums.length > 0) {
            sortArray = nums.slice(0, 30); // limit to 30 for visualization
        }
    }
    
    if (sortArray.length === 0) {
        // Generate random array
        for (let i = 0; i < 10; i++) {
            sortArray.push(Math.floor(Math.random() * 90) + 10);
        }
    }
    
    renderArray();
    clearLog('sorting-log');
    logMessage('sorting-log', `Generated array: [${sortArray.join(', ')}]`);
}

function renderArray() {
    sortCanvas.innerHTML = '';
    sortElements = [];
    
    // Find max to scale heights
    const maxVal = Math.max(...sortArray);
    
    sortArray.forEach((val, idx) => {
        const el = document.createElement('div');
        el.className = 'array-element val-text';
        // Height proportional to max value, minimum 30px
        const heightPct = Math.max((val / (maxVal || 1)) * 90, 10);
        el.style.height = `${heightPct}%`;
        el.textContent = val;
        
        sortCanvas.appendChild(el);
        sortElements.push(el);
    });
}

function resetSorting() {
    if (isSorting) return; // Prevent reset mid-sort conceptually, or could force reload
    customArrayInput.value = '';
    generateArray();
}

async function startSorting() {
    if (isSorting || sortArray.length === 0) return;
    
    isSorting = true;
    btnSort.disabled = true;
    btnGenerate.disabled = true;
    clearLog('sorting-log');
    const algo = algoSelect.value;
    
    logMessage('sorting-log', `Starting ${algo} sort on [${sortArray.join(', ')}]`);
    
    try {
        switch(algo) {
            case 'bubble': await bubbleSort(); break;
            case 'selection': await selectionSort(); break;
            case 'insertion': await insertionSort(); break;
            case 'merge': await mergeSortWrap(); break;
            case 'quick': await quickSortWrap(); break;
        }
        logMessage('sorting-log', `Array sorted successfully: [${sortArray.join(', ')}]`, 'success');
        
        // Mark all as sorted
        for (let el of sortElements) {
            el.classList.add('sorted');
        }
    } catch (e) {
        console.error("Sorting error:", e);
    }
    
    isSorting = false;
    btnSort.disabled = false;
    btnGenerate.disabled = false;
}

// Helpers
async function visualSwap(i, j) {
    sortElements[i].classList.add('swapping');
    sortElements[j].classList.add('swapping');
    
    await sleep(speedSlider.value);
    
    // Swap data
    let temp = sortArray[i];
    sortArray[i] = sortArray[j];
    sortArray[j] = temp;
    
    // Swap height and text
    let tempHeight = sortElements[i].style.height;
    let tempText = sortElements[i].textContent;
    
    sortElements[i].style.height = sortElements[j].style.height;
    sortElements[i].textContent = sortElements[j].textContent;
    
    sortElements[j].style.height = tempHeight;
    sortElements[j].textContent = tempText;
    
    // log message
    logMessage('sorting-log', `Swapped ${sortArray[j]} and ${sortArray[i]}`, 'swap');
    
    sortElements[i].classList.remove('swapping');
    sortElements[j].classList.remove('swapping');
}

async function visualCompare(i, j) {
    logMessage('sorting-log', `Comparing ${sortArray[i]} and ${sortArray[j]}`, 'compare');
    sortElements[i].classList.add('comparing');
    sortElements[j].classList.add('comparing');
    
    await sleep(speedSlider.value);
    
    sortElements[i].classList.remove('comparing');
    sortElements[j].classList.remove('comparing');
}

async function updateElementValue(i, val) {
    logMessage('sorting-log', `Setting element at index ${i} to ${val}`);
    sortElements[i].classList.add('swapping');
    
    sortArray[i] = val;
    const maxVal = Math.max(...sortArray); 
    const heightPct = Math.max((val / (maxVal || 1)) * 90, 10);
    
    sortElements[i].style.height = `${heightPct}%`;
    sortElements[i].textContent = val;
    
    await sleep(speedSlider.value);
    sortElements[i].classList.remove('swapping');
}

// Algorithms
async function bubbleSort() {
    let n = sortArray.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (!isSorting) return;
            await visualCompare(j, j + 1);
            if (sortArray[j] > sortArray[j + 1]) {
                await visualSwap(j, j + 1);
            }
        }
        sortElements[n - i - 1].classList.add('sorted');
    }
    if (n > 0) sortElements[0].classList.add('sorted');
}

async function selectionSort() {
    let n = sortArray.length;
    for (let i = 0; i < n - 1; i++) {
        let min_idx = i;
        sortElements[min_idx].classList.add('comparing');
        for (let j = i + 1; j < n; j++) {
            if (!isSorting) return;
            await visualCompare(min_idx, j);
            if (sortArray[j] < sortArray[min_idx]) {
                sortElements[min_idx].classList.remove('comparing');
                min_idx = j;
                sortElements[min_idx].classList.add('comparing');
            }
        }
        if (min_idx !== i) {
            await visualSwap(min_idx, i);
        }
        sortElements[min_idx].classList.remove('comparing');
        sortElements[i].classList.add('sorted');
    }
    if (n > 0) sortElements[n - 1].classList.add('sorted');
}

async function insertionSort() {
    let n = sortArray.length;
    sortElements[0].classList.add('sorted');
    for (let i = 1; i < n; i++) {
        let key = sortArray[i];
        let j = i - 1;
        
        sortElements[i].classList.add('swapping');
        logMessage('sorting-log', `Selected ${key} to insert`, 'info');
        await sleep(speedSlider.value);
        sortElements[i].classList.remove('swapping');

        while (j >= 0 && sortArray[j] > key) {
            if (!isSorting) return;
            await visualCompare(j, j + 1);
            await updateElementValue(j + 1, sortArray[j]);
            j = j - 1;
        }
        await updateElementValue(j + 1, key);
        for(let k = 0; k <= i; k++) {
            sortElements[k].classList.add('sorted');
            sortElements[k].classList.remove('swapping');
            sortElements[k].classList.remove('comparing');
        }
    }
}

// Merge Sort
async function mergeSortWrap() {
    await mergeSort(0, sortArray.length - 1);
}

async function merge(l, m, r) {
    let n1 = m - l + 1;
    let n2 = r - m;
    let L = new Array(n1);
    let R = new Array(n2);
    
    for (let i = 0; i < n1; i++) L[i] = sortArray[l + i];
    for (let j = 0; j < n2; j++) R[j] = sortArray[m + 1 + j];
    
    let i = 0, j = 0, k = l;
    
    while (i < n1 && j < n2) {
        if (!isSorting) return;
        sortElements[l+i].classList.add('comparing');
        sortElements[m+1+j].classList.add('comparing');
        logMessage('sorting-log', `Comparing ${L[i]} and ${R[j]}`, 'compare');
        await sleep(speedSlider.value);
        
        sortElements[l+i].classList.remove('comparing');
        sortElements[m+1+j].classList.remove('comparing');

        if (L[i] <= R[j]) {
            await updateElementValue(k, L[i]);
            i++;
        } else {
            await updateElementValue(k, R[j]);
            j++;
        }
        k++;
    }
    
    while (i < n1) {
        if (!isSorting) return;
        await updateElementValue(k, L[i]);
        i++; k++;
    }
    while (j < n2) {
        if (!isSorting) return;
        await updateElementValue(k, R[j]);
        j++; k++;
    }
}

async function mergeSort(l, r) {
    if (l >= r) return;
    let m = l + Math.floor((r - l) / 2);
    await mergeSort(l, m);
    await mergeSort(m + 1, r);
    await merge(l, m, r);
}

// Quick Sort
async function quickSortWrap() {
    await quickSort(0, sortArray.length - 1);
}

async function partition(low, high) {
    let pivot = sortArray[high];
    sortElements[high].style.backgroundColor = 'var(--accent)'; // Highlight pivot
    logMessage('sorting-log', `Pivot selected: ${pivot}`);
    
    let i = (low - 1);
    
    for (let j = low; j <= high - 1; j++) {
        if (!isSorting) return;
        await visualCompare(j, high);
        
        if (sortArray[j] < pivot) {
            i++;
            if (i !== j) await visualSwap(i, j);
        }
    }
    await visualSwap(i + 1, high);
    sortElements[high].style.backgroundColor = ''; // Remove pivot highlight
    sortElements[i+1].style.backgroundColor = '';
    return (i + 1);
}

async function quickSort(low, high) {
    if (low < high) {
        let pi = await partition(low, high);
        sortElements[pi].classList.add('sorted'); // pivot is in correct place
        await quickSort(low, pi - 1);
        await quickSort(pi + 1, high);
    } else if (low === high) {
        sortElements[low].classList.add('sorted');
    }
}

// Init on load
document.addEventListener('DOMContentLoaded', initSorting);

// Searching Visualizer Logic

let searchArray = [];
let searchElements = [];
let isSearching = false;

const searchCanvas = document.getElementById('searching-canvas');
const searchTargetInput = document.getElementById('search-target');
const btnLinearSearch = document.getElementById('btn-linear-search');
const btnBinarySearch = document.getElementById('btn-binary-search');
const btnResetSearch = document.getElementById('btn-reset-search');
const searchAlgoName = document.getElementById('search-algo-name');
const searchTime = document.getElementById('search-time').querySelector('span');

function initSearching() {
    btnLinearSearch.addEventListener('click', () => startSearch('linear'));
    btnBinarySearch.addEventListener('click', () => startSearch('binary'));
    btnResetSearch.addEventListener('click', resetSearching);
    
    generateSearchArray();
}

function generateSearchArray(sorted = false) {
    searchArray = [];
    // Generate 15 random numbers
    for (let i = 0; i < 15; i++) {
        searchArray.push(Math.floor(Math.random() * 90) + 10);
    }
    
    if (sorted) {
        searchArray.sort((a, b) => a - b);
    }
    
    renderSearchArray();
}

function renderSearchArray() {
    searchCanvas.innerHTML = '';
    searchElements = [];
    
    searchArray.forEach((val) => {
        const el = document.createElement('div');
        el.className = 'data-box';
        el.textContent = val;
        searchCanvas.appendChild(el);
        searchElements.push(el);
    });
}

function resetSearching() {
    if (isSearching) return;
    searchTargetInput.value = '';
    clearLog('searching-log');
    searchAlgoName.textContent = 'Searching';
    searchTime.textContent = '-';
    generateSearchArray();
}

async function startSearch(type) {
    if (isSearching) return;
    
    const targetVal = parseInt(searchTargetInput.value);
    if (isNaN(targetVal)) {
        alert("Please enter a valid target number.");
        return;
    }
    
    isSearching = true;
    disableSearchControl(true);
    clearLog('searching-log');
    
    // reset previous states
    searchElements.forEach(el => {
        el.className = 'data-box';
    });

    if (type === 'linear') {
        searchAlgoName.textContent = 'Linear Search';
        searchTime.textContent = 'O(n)';
        
        // Ensure array isn't strictly sorted for linear to show it works anyway
        // or just let it be. If it was sorted from prev binary, re-shuffle
        if (isSorted(searchArray)) generateSearchArray();
        
        await linearSearch(targetVal);
    } else {
        searchAlgoName.textContent = 'Binary Search';
        searchTime.textContent = 'O(log n)';
        
        // Binary search REQUIRES sorted array
        if (!isSorted(searchArray)) {
            logMessage('searching-log', 'Sorting array for Binary Search...', 'info');
            generateSearchArray(true);
            await sleep(500);
        }
        
        await binarySearch(targetVal);
    }
    
    isSearching = false;
    disableSearchControl(false);
}

function isSorted(arr) {
    for (let i = 1; i < arr.length; i++) {
        if (arr[i - 1] > arr[i]) return false;
    }
    return true;
}

function disableSearchControl(disable) {
    btnLinearSearch.disabled = disable;
    btnBinarySearch.disabled = disable;
    btnResetSearch.disabled = disable;
    searchTargetInput.disabled = disable;
}

async function linearSearch(target) {
    logMessage('searching-log', `Starting linear search for ${target}`);
    for (let i = 0; i < searchArray.length; i++) {
        searchElements[i].classList.add('comparing');
        logMessage('searching-log', `Checking if ${searchArray[i]} == ${target}`, 'compare');
        
        await sleep(500); // fixed delay
        
        if (searchArray[i] === target) {
            searchElements[i].classList.remove('comparing');
            searchElements[i].classList.add('found');
            logMessage('searching-log', `Value ${target} found at index ${i}!`, 'success');
            return;
        } else {
            searchElements[i].classList.remove('comparing');
            searchElements[i].classList.add('not-found');
        }
    }
    logMessage('searching-log', `Value ${target} not found in the array.`, 'info');
}

async function binarySearch(target) {
    logMessage('searching-log', `Starting binary search for ${target}`);
    let left = 0;
    let right = searchArray.length - 1;
    
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        
        // Dim elements outside current range
        for (let i=0; i<searchArray.length; i++) {
            if (i < left || i > right) {
                searchElements[i].style.opacity = '0.3';
            } else {
                searchElements[i].style.opacity = '1';
            }
        }
        
        searchElements[mid].classList.add('comparing');
        logMessage('searching-log', `Range [${left}, ${right}]. Mid is at index ${mid} (value: ${searchArray[mid]})`, 'compare');
        
        await sleep(700);
        
        if (searchArray[mid] === target) {
            searchElements[mid].classList.remove('comparing');
            searchElements[mid].classList.add('found');
            logMessage('searching-log', `Value ${target} found at index ${mid}!`, 'success');
            return;
        }
        
        if (searchArray[mid] < target) {
            logMessage('searching-log', `${searchArray[mid]} < ${target}. Focusing on right side.`, 'info');
            searchElements[mid].classList.remove('comparing');
            searchElements[mid].classList.add('not-found');
            left = mid + 1;
        } else {
            logMessage('searching-log', `${searchArray[mid]} > ${target}. Focusing on left side.`, 'info');
            searchElements[mid].classList.remove('comparing');
            searchElements[mid].classList.add('not-found');
            right = mid - 1;
        }
    }
    
    logMessage('searching-log', `Value ${target} not found.`, 'info');
}

document.addEventListener('DOMContentLoaded', initSearching);

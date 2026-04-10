// Global Utilities
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function logMessage(containerId, message, type = 'info') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    
    // Add simple icon or badge based on type
    let prefix = '';
    if (type === 'compare') prefix = '<span style="color: var(--warning)">[Compare]</span> ';
    else if (type === 'swap') prefix = '<span style="color: var(--danger)">[Swap]</span> ';
    else if (type === 'success') prefix = '<span style="color: var(--success)">[Success]</span> ';
    
    entry.innerHTML = `${prefix}${message}`;
    container.appendChild(entry);
    
    // Auto scroll to bottom
    container.scrollTop = container.scrollHeight;
}

function clearLog(containerId) {
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = '';
}

// Landing Page & Tab Switching Logic
document.addEventListener('DOMContentLoaded', () => {
    // Landing Page Logic
    const btnGetStarted = document.getElementById('btn-get-started');
    const landingPage = document.getElementById('landing-page');
    const mainApp = document.getElementById('main-app');

    if (btnGetStarted) {
        btnGetStarted.addEventListener('click', () => {
            landingPage.style.animation = 'slideOut 0.5s forwards';
            setTimeout(() => {
                landingPage.style.display = 'none';
                mainApp.style.display = 'flex';
                mainApp.style.animation = 'fadeIn 0.6s ease forwards';
                
                // On first load, maybe algorithm sizes are 0 if relying on flex.
                // Usually window resize or explicit render fixes any canvas issues.
                // Re-rendering default array just in case
                if (typeof generateArray === 'function') {
                    generateArray();
                }
            }, 500); // Wait for animation
        });
    }

    const tabBtns = document.querySelectorAll('.tab-btn');
    const viewSections = document.querySelectorAll('.view-section');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            tabBtns.forEach(b => b.classList.remove('active'));
            viewSections.forEach(v => v.classList.remove('active'));
            
            // Add active to clicked
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
});

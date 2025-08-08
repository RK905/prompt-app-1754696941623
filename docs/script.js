// Main JavaScript file for your PWA - Simple Calculator App
document.addEventListener('DOMContentLoaded', function() {
    console.log('Simple Calculator App loaded successfully!');
    
    // Initialize the app
    initApp();
});

function initApp() {
    // Add fade-in animation to main content
    const app = document.getElementById('app');
    if (app) {
        app.classList.add('fade-in');
    }

    // Inject basic styles for the calculator (keeps file self-contained)
    injectStyles();

    // Build calculator UI
    buildCalculatorUI();

    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }

    // Install prompt handling for PWA
    setupInstallPrompt();

    // Online/offline status
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
}

// Add your custom app functionality here
function updateAppContent(content) {
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = content;
    }
}

// Example function to show a notification
function showNotification(message) {
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification('Simple Calculator', { body: message });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('Simple Calculator', { body: message });
                }
            });
        }
    }
}

/* --------------------------
   Calculator Implementation
   -------------------------- */

function injectStyles() {
    if (document.getElementById('simple-calc-styles')) return;
    const css = `
#app { max-width: 420px; margin: 24px auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
.calc-container { background: linear-gradient(180deg,#f7f8fc,#eef2ff); border-radius: 12px; box-shadow: 0 6px 18px rgba(12,22,55,0.12); padding: 16px; }
.calc-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.calc-title { font-weight:700; color:#111827; letter-spacing:0.2px; }
.status-dot { width:10px; height:10px; border-radius:50%; display:inline-block; margin-left:8px; vertical-align:middle; }
.screen { background:#0b1220; color:#e6eef8; border-radius:8px; padding:12px 14px; min-height:72px; display:flex; flex-direction:column; justify-content:center; margin-bottom:12px; }
.screen .expr { font-size:14px; color:#9fb0d9; min-height:18px; word-break:break-all; }
.screen .result { font-size:28px; font-weight:700; margin-top:4px; word-break:break-all; }
.keypad { display:grid; grid-template-columns: repeat(4,1fr); gap:8px; }
.btn { background:#fff; border-radius:8px; padding:12px; text-align:center; font-weight:600; box-shadow: 0 1px 0 rgba(12,22,55,0.04); cursor:pointer; user-select:none; }
.btn.operator { background: linear-gradient(180deg,#2b6cb0,#2c5282); color:#fff; }
.btn.action { background:linear-gradient(180deg,#edf2f7,#e2e8f0); color:#111827; }
.btn.wide { grid-column: span 2; }
.btn:active { transform: translateY(1px); }
.history { margin-top:12px; background:#fff; border-radius:8px; padding:10px; max-height:160px; overflow:auto; box-shadow: inset 0 1px 0 rgba(12,22,55,0.02); }
.history h4 { margin:0 0 8px 0; font-size:13px; color:#374151; }
.history ul { list-style:none; padding:0; margin:0; font-size:13px; color:#111827; }
.history li { padding:6px 8px; border-radius:6px; display:flex; justify-content:space-between; align-items:center; gap:8px; }
.history li:nth-child(odd) { background: rgba(12,22,55,0.02); }
.install-banner { margin-left:12px; }
.fade-in { animation: fadeIn 360ms ease; }
@keyframes fadeIn { from { opacity:0; transform: translateY(6px) } to { opacity:1; transform: translateY(0) } }
.install-btn { background:#10b981; color:#fff; padding:6px 10px; border-radius:8px; cursor:pointer; font-weight:700; }
.clear-history { background:#ef4444; color:#fff; padding:6px 8px; border-radius:8px; cursor:pointer; font-weight:700; }
.small-muted { font-size:12px; color:#6b7280; }
`;
    const style = document.createElement('style');
    style.id = 'simple-calc-styles';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
}

function buildCalculatorUI() {
    const content = `
    <div class="calc-container" role="application" aria-label="Simple Calculator">
      <div class="calc-header">
        <div>
          <div class="calc-title">Simple Calculator</div>
          <div class="small-muted">Fast, offline-ready arithmetic</div>
        </div>
        <div>
          <span id="onlineStatus" title="Online status"><span class="status-dot" id="statusDot"></span></span>
          <span class="install-banner" id="installBanner"></span>
        </div>
      </div>

      <div class="screen" id="screen" aria-live="polite">
        <div class="expr" id="expression">&nbsp;</div>
        <div class="result" id="result">0</div>
      </div>

      <div class="keypad" id="keypad">
        <div class="btn action" data-action="clear">C</div>
        <div class="btn action" data-action="back">⌫</div>
        <div class="btn action" data-action="percent">%</div>
        <div class="btn operator" data-value="/">÷</div>

        <div class="btn" data-value="7">7</div>
        <div class="btn" data-value="8">8</div>
        <div class="btn" data-value="9">9</div>
        <div class="btn operator" data-value="*">×</div>

        <div class="btn" data-value="4">4</div>
        <div class="btn" data-value="5">5</div>
        <div class="btn" data-value="6">6</div>
        <div class="btn operator" data-value="-">−</div>

        <div class="btn" data-value="1">1</div>
        <div class="btn" data-value="2">2</div>
        <div class="btn" data-value="3">3</div>
        <div class="btn operator" data-value="+">+</div>

        <div class="btn" data-value="0" class="wide">0</div>
        <div class="btn" data-value=".">.</div>
        <div class="btn operator" data-action="equals">=</div>
      </div>

      <div class="history" id="historyPanel" aria-label="Calculation history">
        <h4>History</h4>
        <ul id="historyList"></ul>
        <div style="display:flex;gap:8px;margin-top:8px;align-items:center;">
          <div class="clear-history" id="clearHistoryBtn">Clear</div>
          <div class="small-muted" style="margin-left:auto;">Autosaved</div>
        </div>
      </div>
    </div>
  `;
    updateAppContent(content);

    // Wire up functionality
    setupCalculatorBehavior();
    renderHistory();
}

let currentExpression = '';
let lastResult = null;
const HISTORY_KEY = 'simple_calc_history_v1';
const MAX_HISTORY = 20;

function setupCalculatorBehavior() {
    const keypad = document.getElementById('keypad');
    const expressionEl = document.getElementById('expression');
    const resultEl = document.getElementById('result');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    // Button clicks
    keypad.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn');
        if (!btn) return;
        const val = btn.getAttribute('data-value');
        const action = btn.getAttribute('data-action');

        if (action) {
            handleAction(action);
        } else if (val) {
            handleInput(val);
        }
    });

    // Keyboard input
    window.addEventListener('keydown', (e) => {
        if (e.metaKey || e.ctrlKey) return; // avoid interfering with shortcuts
        if (e.key === 'Enter') { e.preventDefault(); handleAction('equals'); return; }
        if (e.key === 'Backspace') { e.preventDefault(); handleAction('back'); return; }
        if (e.key === 'Escape') { e.preventDefault(); handleAction('clear'); return; }
        const allowed = '0123456789+-*/.%()';
        if (allowed.includes(e.key)) {
            e.preventDefault();
            // Convert * and / to display-friendly equivalents remain same for evaluation
            handleInput(e.key);
        }
    });

    clearHistoryBtn.addEventListener('click', () => {
        localStorage.removeItem(HISTORY_KEY);
        renderHistory();
        showNotification('History cleared');
    });

    function handleInput(val) {
        // Normalize display of operators for user friendliness
        if (/^[0-9]$/.test(val)) {
            if (currentExpression === '0') currentExpression = val;
            else currentExpression += val;
        } else if (val === '.') {
            // prevent multiple decimals in the current number fragment
            const parts = currentExpression.split(/[\+\-\*\/\%]/);
            const last = parts[parts.length - 1] || '';
            if (!last.includes('.')) currentExpression += '.';
        } else if (/[\+\-\*\/\%()]/.test(val)) {
            // prevent two operators in a row (except minus as sign)
            if (currentExpression === '' && val === '-') {
                currentExpression = '-';
            } else {
                // replace trailing operator if typing another operator
                if (/[\+\-\*\/\%]$/.test(currentExpression) && /[\+\-\*\/\%]/.test(val)) {
                    currentExpression = currentExpression.slice(0, -1) + val;
                } else {
                    currentExpression += val;
                }
            }
        }

        updateDisplay();
    }

    function handleAction(action) {
        if (action === 'clear') {
            currentExpression = '';
            lastResult = null;
            updateDisplay();
        } else if (action === 'back') {
            currentExpression = currentExpression.slice(0, -1);
            updateDisplay();
        } else if (action === 'equals') {
            calculateResult();
        } else if (action === 'percent') {
            // If there's a current number, apply percent to it (divide by 100)
            applyPercent();
        }
    }

    function updateDisplay() {
        expressionEl.textContent = currentExpression || '\u00A0';
        if (currentExpression === '') {
            resultEl.textContent = '0';
        } else {
            const tentative = safeEvaluatePreview(currentExpression);
            resultEl.textContent = tentative !== null ? tentative : '…';
        }
    }

    function calculateResult() {
        if (!currentExpression) return;
        const value = safeEvaluate(currentExpression);
        if (value === null || value === undefined || Number.isNaN(value) || !isFinite(value)) {
            resultEl.textContent = 'Error';
            showNotification('Invalid expression');
            return;
        }
        lastResult = value;
        resultEl.textContent = formatNumber(value);
        addToHistory(currentExpression, value);
        currentExpression = String(value);
        showNotification('Result: ' + formatNumber(value));
        renderHistory();
    }

    function applyPercent() {
        // If expression ends with a number, convert that trailing number to percent
        const match = currentExpression.match(/(-?\d+(\.\d+)?)$/);
        if (match) {
            const num = parseFloat(match[1]);
            const replaced = (num / 100).toString();
            currentExpression = currentExpression.slice(0, match.index) + replaced;
            updateDisplay();
        } else if (currentExpression === '') {
            currentExpression = '0';
            updateDisplay();
        }
    }

    function renderHistory() {
        const items = loadHistory();
        historyList.innerHTML = '';
        if (!items.length) {
            historyList.innerHTML = '<li class="small-muted">No history yet</li>';
            return;
        }
        items.slice().reverse().forEach(item => {
            const li = document.createElement('li');
            const left = document.createElement('div');
            left.style.flex = '1';
            left.innerHTML = `<div style="font-size:13px;color:#111827">${escapeHtml(item.expr)}</div><div class="small-muted">${formatNumber(item.result)}</div>`;
            const right = document.createElement('div');
            right.style.marginLeft = '8px';
            const useBtn = document.createElement('button');
            useBtn.textContent = 'Use';
            useBtn.className = 'install-btn';
            useBtn.style.padding = '6px 8px';
            useBtn.style.fontSize = '13px';
            useBtn.addEventListener('click', () => {
                currentExpression = String(item.result);
                updateDisplay();
            });
            right.appendChild(useBtn);
            li.appendChild(left);
            li.appendChild(right);
            historyList.appendChild(li);
        });
    }

    // initialize display
    updateDisplay();
    renderHistory();
}

function safeEvaluatePreview(expr) {
    try {
        const sanitized = sanitizeExpression(expr);
        if (sanitized === '') return null;
        // quick evaluation but avoid executing complex code: use Function on sanitized expression
        const value = Function('"use strict"; return (' + sanitized + ')')();
        if (!isFinite(value)) return null;
        return formatNumber(value);
    } catch (e) {
        return null;
    }
}

function safeEvaluate(expr) {
    try {
        const sanitized = sanitizeExpression(expr);
        if (sanitized === '') return 0;
        const value = Function('"use strict"; return (' + sanitized + ')')();
        if (!isFinite(value)) return NaN;
        return Math.round((value + Number.EPSILON) * 1e12) / 1e12; // round to avoid floating noise
    } catch (e) {
        return NaN;
    }
}

function sanitizeExpression(expr) {
    // Allow digits, operators, dot, parentheses and spaces only
    // Convert display-friendly characters to JS operators if necessary
    expr = String(expr).replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/,/g, '');
    // Remove any characters not allowed
    if (/[^0-9+\-*/().% ]/.test(expr)) {
        throw new Error('Invalid characters');
    }
    // Handle percent operator: convert occurrences like "number%" to "(number/100)"
    // Replace occurrences of "number%" with "(number/100)"
    expr = expr.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
    return expr;
}

function formatNumber(num) {
    // Format nicely, but keep precision when necessary
    if (Number.isInteger(num)) return String(num);
    // Else show up to 10 decimals but trim trailing zeros
    const s = num.toString();
    if (s.indexOf('e') !== -1) return s;
    return parseFloat(num.toFixed(10)).toString();
}

function addToHistory(expr, result) {
    const items = loadHistory();
    items.push({ expr: String(expr), result: result, time: Date.now() });
    // keep bounded length
    while (items.length > MAX_HISTORY) items.shift();
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
    } catch (e) {
        console.warn('Failed to save history:', e);
    }
}

function loadHistory() {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch (e) {
        return [];
    }
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[m];
    });
}

/* --------------------------
   Install prompt handling
   -------------------------- */
let deferredInstallPrompt = null;

function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;
        showInstallButton();
    });

    // try to automatically check if app is already installed
    window.addEventListener('appinstalled', () => {
        deferredInstallPrompt = null;
        const banner = document.getElementById('installBanner');
        if (banner) banner.innerHTML = '<span class="small-muted">App installed</span>';
    });
}

function showInstallButton() {
    const banner = document.getElementById('installBanner');
    if (!banner) return;
    banner.innerHTML = '';
    const btn = document.createElement('button');
    btn.className = 'install-btn';
    btn.textContent = 'Install';
    btn.addEventListener('click', async () => {
        if (!deferredInstallPrompt) return;
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
            banner.innerHTML = '<span class="small-muted">Thank you for installing!</span>';
            deferredInstallPrompt = null;
        } else {
            console.log('User dismissed the A2HS prompt');
        }
    });
    banner.appendChild(btn);
}

/* --------------------------
   Online/offline indicator
   -------------------------- */
function updateOnlineStatus() {
    const dot = document.getElementById('statusDot');
    const status = document.getElementById('onlineStatus');
    if (!dot || !status) return;
    if (navigator.onLine) {
        dot.style.background = '#10b981';
        status.title = 'Online';
    } else {
        dot.style.background = '#ef4444';
        status.title = 'Offline - limited functionality';
    }
}
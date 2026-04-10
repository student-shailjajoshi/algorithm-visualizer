/* =============================================
   ALGOVIZ – Sorting Visualizer
   script.js
   ============================================= */

// =============================================
// STATE VARIABLES
// =============================================

let currentAlgo = 'bubble';  // currently selected algorithm
let arr        = [];          // current array being visualized
let steps      = [];          // all precomputed animation steps
let stepIdx    = 0;           // current step index
let playing    = false;       // is animation running?
let timer      = null;        // setTimeout handle
let startTime  = null;        // for measuring elapsed ms
let totalTime  = 0;           // total elapsed ms
let comparisons = 0;          // comparison counter
let swaps       = 0;          // swap counter
let n           = 5;          // array size
let speed       = 1;          // speed level 1–5

// Delay in ms per speed level
const speedMap = {
  1: 1200,
  2: 700,
  3: 400,
  4: 180,
  5: 60
};

// =============================================
// PSEUDOCODE DEFINITIONS
// Each entry: { t: HTML string, indent: CSS class }
// =============================================

const pseudocodes = {
  bubble: [
    { t: `<span class="kw">for</span> i = <span class="nm">1</span> <span class="kw">to</span> (n - <span class="nm">1</span>):`,       indent: '' },
    { t: `swapped = <span class="kw2">false</span>`,                                                                                  indent: 'indent1' },
    { t: `<span class="kw">for</span> j = <span class="nm">1</span> <span class="kw">to</span> (n - i):`,                            indent: 'indent1' },
    { t: `<span class="kw">if</span> arr[j] &lt; arr[j<span class="op">-</span><span class="nm">1</span>]:`,                          indent: 'indent2' },
    { t: `<span class="fn">swap</span>(j, j<span class="op">-</span><span class="nm">1</span>)`,                                        indent: 'indent3' },
    { t: `swapped = <span class="kw2">true</span>`,                                                                                   indent: 'indent2' },
    { t: `<span class="kw">if not</span> swapped: <span class="kw">break</span>`,                                                     indent: 'indent1' },
  ],

  insertion: [
    { t: `<span class="kw">for</span> i = <span class="nm">1</span> <span class="kw">to</span> n<span class="op">-</span><span class="nm">1</span>:`, indent: '' },
    { t: `key = arr[i]`,                                                                                                              indent: 'indent1' },
    { t: `j = i <span class="op">-</span> <span class="nm">1</span>`,                                                                  indent: 'indent1' },
    { t: `<span class="kw">while</span> j &gt;= <span class="nm">0</span> <span class="kw">and</span> arr[j] &gt; key:`,            indent: 'indent1' },
    { t: `arr[j<span class="op">+</span><span class="nm">1</span>] = arr[j]`,                                                         indent: 'indent2' },
    { t: `j = j <span class="op">-</span> <span class="nm">1</span>`,                                                                  indent: 'indent2' },
    { t: `arr[j<span class="op">+</span><span class="nm">1</span>] = key`,                                                            indent: 'indent1' },
  ],

  selection: [
    { t: `<span class="kw">for</span> i = <span class="nm">0</span> <span class="kw">to</span> n<span class="op">-</span><span class="nm">2</span>:`, indent: '' },
    { t: `minIdx = i`,                                                                                                                indent: 'indent1' },
    { t: `<span class="kw">for</span> j = i<span class="op">+</span><span class="nm">1</span> <span class="kw">to</span> n<span class="op">-</span><span class="nm">1</span>:`, indent: 'indent1' },
    { t: `<span class="kw">if</span> arr[j] &lt; arr[minIdx]:`,                                                                     indent: 'indent2' },
    { t: `minIdx = j`,                                                                                                                indent: 'indent3' },
    { t: `<span class="fn">swap</span>(arr[i], arr[minIdx])`,                                                                        indent: 'indent1' },
  ],

  merge: [
    { t: `<span class="fn">mergeSort</span>(arr, l, r):`,                                                                            indent: '' },
    { t: `<span class="kw">if</span> l &gt;= r: <span class="kw">return</span>`,                                                      indent: 'indent1' },
    { t: `mid = (l <span class="op">+</span> r) <span class="op">/</span> <span class="nm">2</span>`,                              indent: 'indent1' },
    { t: `<span class="fn">mergeSort</span>(arr, l, mid)`,                                                                           indent: 'indent1' },
    { t: `<span class="fn">mergeSort</span>(arr, mid<span class="op">+</span><span class="nm">1</span>, r)`,                         indent: 'indent1' },
    { t: `<span class="fn">merge</span>(arr, l, mid, r)`,                                                                            indent: 'indent1' },
  ],

  quick: [
    { t: `<span class="fn">quickSort</span>(arr, lo, hi):`,                                                                          indent: '' },
    { t: `<span class="kw">if</span> lo &gt;= hi: <span class="kw">return</span>`,                                                    indent: 'indent1' },
    { t: `pivot = arr[hi]`,                                                                                                           indent: 'indent1' },
    { t: `i = lo <span class="op">-</span> <span class="nm">1</span>`,                                                               indent: 'indent1' },
    { t: `<span class="kw">for</span> j = lo <span class="kw">to</span> hi<span class="op">-</span><span class="nm">1</span>:`,     indent: 'indent1' },
    { t: `<span class="kw">if</span> arr[j] &lt;= pivot: <span class="fn">swap</span>(++i, j)`,                                   indent: 'indent2' },
    { t: `<span class="fn">swap</span>(i<span class="op">+</span><span class="nm">1</span>, hi)`,                                     indent: 'indent1' },
  ],
};

// =============================================
// INITIALIZATION
// =============================================

function init() {
  generateArr();
  renderCode();
  renderBars([]);
}

// Generate a fresh random array of size n
function generateArr() {
  arr = [];
  const used = new Set();
  while (arr.length < n) {
    const v = Math.floor(Math.random() * 90) + 10;
    if (!used.has(v)) {
      used.add(v);
      arr.push(v);
    }
  }
  steps = [];
  stepIdx = 0;
  comparisons = 0;
  swaps = 0;
  totalTime = 0;
  updateStats();
  setStatus('Press Play to start', false);
  document.getElementById('stepCounter').textContent = '';
}

// =============================================
// RENDER FUNCTIONS
// =============================================

// Render pseudocode, optionally highlighting a line
function renderCode(activeLine = -1) {
  const lines = pseudocodes[currentAlgo];
  const body = document.getElementById('codeBody');
  body.innerHTML = lines.map((line, i) =>
    `<div class="code-line ${line.indent} ${activeLine === i ? 'active' : ''}" style="color:#e2e8f0">${line.t}</div>`
  ).join('');
}

// Render bars with optional color highlights
// highlighted: array of { idx: number, cls: 'comparing' | 'swapping' | 'sorted' }
function renderBars(highlighted) {
  const clsMap = {};
  (highlighted || []).forEach(h => { clsMap[h.idx] = h.cls; });

  const area = document.getElementById('barsArea');
  const maxV = Math.max(...arr, 1);

  area.innerHTML = arr.map((v, i) => {
    const h   = Math.round((v / maxV) * 180);
    const cls = clsMap[i] || '';
    const valColor =
      cls === 'swapping'  ? '#f97316' :
      cls === 'comparing' ? '#3b82f6' :
      cls === 'sorted'    ? '#22c55e' : '#1a1d2e';

    return `
      <div class="bar-wrap">
        <div class="bar-val" style="color:${valColor}">${v}</div>
        <div class="bar ${cls}" style="height:${h}px"></div>
      </div>`;
  }).join('');
}

// Update comparisons / swaps / time stats display
function updateStats() {
  document.getElementById('statComp').textContent = comparisons;
  document.getElementById('statSwap').textContent = swaps;
  document.getElementById('statTime').textContent = totalTime;
}

// Set the status message and dot color
function setStatus(msg, active, color) {
  const dot = document.getElementById('statusDot');
  dot.className = 'status-dot' +
    (color === 'blue'  ? ' blue'  :
     color === 'green' ? ' green' : '');
  document.getElementById('statusMsg').textContent = msg;
}

// =============================================
// STEP GENERATION
// Pre-computes all animation steps for the chosen algorithm
// =============================================

function generateSteps() {
  const a = [...arr];
  const s = [];

  // ---------- Bubble Sort ----------
  if (currentAlgo === 'bubble') {
    for (let i = 0; i < a.length - 1; i++) {
      let swapped = false;
      for (let j = 0; j < a.length - i - 1; j++) {
        s.push({ type: 'compare', i: j, j: j + 1, codeLine: 3, arr: [...a], sortedFrom: a.length - i });
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          s.push({ type: 'swap', i: j, j: j + 1, codeLine: 4, arr: [...a], sortedFrom: a.length - i });
          swapped = true;
        }
      }
      if (!swapped) break;
    }
    s.push({ type: 'done', arr: [...a], codeLine: -1 });
  }

  // ---------- Insertion Sort ----------
  else if (currentAlgo === 'insertion') {
    for (let i = 1; i < a.length; i++) {
      let key = a[i];
      let j   = i - 1;
      s.push({ type: 'compare', i: i, j: i, codeLine: 1, arr: [...a] });
      while (j >= 0 && a[j] > key) {
        s.push({ type: 'compare', i: j, j: j + 1, codeLine: 3, arr: [...a] });
        a[j + 1] = a[j];
        s.push({ type: 'swap',    i: j, j: j + 1, codeLine: 4, arr: [...a] });
        j--;
      }
      a[j + 1] = key;
      s.push({ type: 'place', i: j + 1, codeLine: 6, arr: [...a] });
    }
    s.push({ type: 'done', arr: [...a], codeLine: -1 });
  }

  // ---------- Selection Sort ----------
  else if (currentAlgo === 'selection') {
    for (let i = 0; i < a.length - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < a.length; j++) {
        s.push({ type: 'compare', i: minIdx, j: j, codeLine: 3, arr: [...a] });
        if (a[j] < a[minIdx]) {
          minIdx = j;
        }
      }
      if (minIdx !== i) {
        [a[i], a[minIdx]] = [a[minIdx], a[i]];
        s.push({ type: 'swap', i, j: minIdx, codeLine: 5, arr: [...a] });
      }
      s.push({ type: 'sorted', idx: i, codeLine: -1, arr: [...a] });
    }
    s.push({ type: 'done', arr: [...a], codeLine: -1 });
  }

  // ---------- Merge Sort ----------
  else if (currentAlgo === 'merge') {
    function merge(arr, l, m, r) {
      const left  = arr.slice(l, m + 1);
      const right = arr.slice(m + 1, r + 1);
      let i = 0, j = 0, k = l;
      while (i < left.length && j < right.length) {
        s.push({ type: 'compare', i: l + i, j: m + 1 + j, codeLine: 5, arr: [...arr] });
        if (left[i] <= right[j]) { arr[k++] = left[i++]; }
        else                     { arr[k++] = right[j++]; }
        s.push({ type: 'swap', i: k - 1, j: k - 1, codeLine: 5, arr: [...arr] });
      }
      while (i < left.length)  { arr[k++] = left[i++]; }
      while (j < right.length) { arr[k++] = right[j++]; }
    }
    function ms(arr, l, r) {
      if (l >= r) return;
      const mid = Math.floor((l + r) / 2);
      ms(arr, l, mid);
      ms(arr, mid + 1, r);
      merge(arr, l, mid, r);
    }
    ms(a, 0, a.length - 1);
    s.push({ type: 'done', arr: [...a], codeLine: -1 });
  }

  // ---------- Quick Sort ----------
  else if (currentAlgo === 'quick') {
    function partition(arr, lo, hi) {
      const pivot = arr[hi];
      let i = lo - 1;
      for (let j = lo; j < hi; j++) {
        s.push({ type: 'compare', i: j, j: hi, codeLine: 5, arr: [...arr] });
        if (arr[j] <= pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          if (i !== j) s.push({ type: 'swap', i, j, codeLine: 5, arr: [...arr] });
        }
      }
      [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
      s.push({ type: 'swap', i: i + 1, j: hi, codeLine: 6, arr: [...arr] });
      return i + 1;
    }
    function qs(arr, lo, hi) {
      if (lo >= hi) return;
      const p = partition(arr, lo, hi);
      qs(arr, lo, p - 1);
      qs(arr, p + 1, hi);
    }
    qs(a, 0, a.length - 1);
    s.push({ type: 'done', arr: [...a], codeLine: -1 });
  }

  return s;
}

// =============================================
// PLAYBACK CONTROL
// =============================================

function togglePlay() {
  if (!playing) startPlay();
  else          pausePlay();
}

function startPlay() {
  // Generate steps on first play
  if (steps.length === 0) {
    steps     = generateSteps();
    startTime = Date.now() - totalTime;
  }
  if (stepIdx >= steps.length) return;

  playing = true;
  document.getElementById('btnPlay').disabled  = true;
  document.getElementById('btnPause').disabled = false;
  runStep();
}

function pausePlay() {
  playing   = false;
  clearTimeout(timer);
  totalTime = Date.now() - startTime;
  document.getElementById('btnPlay').disabled  = false;
  document.getElementById('btnPause').disabled = true;
  setStatus('Paused', false);
}

function runStep() {
  if (!playing || stepIdx >= steps.length) {
    if (stepIdx >= steps.length) finishPlay();
    return;
  }

  const step = steps[stepIdx];
  arr       = [...step.arr];
  totalTime = Date.now() - startTime;

  applyStep(step);
  stepIdx++;

  document.getElementById('stepCounter').textContent = `${stepIdx} / ${steps.length}`;
  updateStats();

  timer = setTimeout(runStep, speedMap[speed]);
}

// Apply a single step: update highlights, counters, code highlight
function applyStep(step) {
  let highlighted = [];

  if (step.type === 'compare') {
    comparisons++;
    highlighted = [
      { idx: step.i, cls: 'comparing' },
      { idx: step.j, cls: 'comparing' }
    ];
    setStatus(`${arr[step.i]} vs ${arr[step.j]} — comparing`, true, 'blue');
    renderCode(step.codeLine);

  } else if (step.type === 'swap') {
    swaps++;
    highlighted = [
      { idx: step.i, cls: 'swapping' },
      { idx: step.j, cls: 'swapping' }
    ];
    setStatus(`${arr[step.i]} > ${arr[step.j]} — swapping`, true, 'blue');
    renderCode(step.codeLine);

  } else if (step.type === 'place') {
    highlighted = [{ idx: step.i, cls: 'sorted' }];
    setStatus(`Placed at index ${step.i}`, true, 'blue');
    renderCode(step.codeLine);

  } else if (step.type === 'sorted') {
    for (let k = 0; k <= step.idx; k++) highlighted.push({ idx: k, cls: 'sorted' });
    renderCode(-1);

  } else if (step.type === 'done') {
    for (let k = 0; k < arr.length; k++) highlighted.push({ idx: k, cls: 'sorted' });
    renderCode(-1);
  }

  // Mark already-sorted right portion (bubble sort)
  if (step.sortedFrom !== undefined) {
    for (let k = step.sortedFrom; k < arr.length; k++) {
      highlighted.push({ idx: k, cls: 'sorted' });
    }
  }

  renderBars(highlighted);
}

// Called when all steps are done
function finishPlay() {
  playing = false;
  clearTimeout(timer);

  const highlighted = arr.map((_, i) => ({ idx: i, cls: 'sorted' }));
  renderBars(highlighted);

  totalTime = Date.now() - startTime;
  updateStats();
  setStatus('✓ Sorting complete!', true, 'green');
  document.getElementById('stepCounter').textContent = `${steps.length} steps total`;
  document.getElementById('btnPlay').disabled  = false;
  document.getElementById('btnPause').disabled = true;
  renderCode(-1);
}

// =============================================
// RESET
// =============================================

function resetViz() {
  clearTimeout(timer);
  playing    = false;
  steps      = [];
  stepIdx    = 0;
  comparisons = 0;
  swaps       = 0;
  totalTime   = 0;
  startTime   = null;

  document.getElementById('btnPlay').disabled  = false;
  document.getElementById('btnPause').disabled = true;

  generateArr();
  renderBars([]);
  renderCode(-1);
}

// =============================================
// SLIDER HANDLERS
// =============================================

function onNChange(val) {
  n = parseInt(val);
  document.getElementById('nVal').textContent = n;
  resetViz();
}

function onSpeedChange(val) {
  speed = parseInt(val);
  const labels = { 1: 'Very slow', 2: 'Slow', 3: 'Medium', 4: 'Fast', 5: 'Very fast' };
  document.getElementById('speedLabel').textContent = labels[speed];
}

// =============================================
// ALGORITHM SWITCHER
// =============================================

function switchAlgo(algo, el) {
  currentAlgo = algo;

  // Update sidebar active state
  document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
  el.classList.add('active');

  // Show correct info panel
  document.querySelectorAll('.algo-info').forEach(x => x.classList.remove('active'));
  document.getElementById('info-' + algo).classList.add('active');

  resetViz();
}

// =============================================
// START
// =============================================
init();

const initialArray = [9, 18, 23, 34, 42, 51, 65, 76];

const $ = (id) => document.getElementById(id);

const ui = {
  array: $("array"),
  target: $("targetInput"),
  search: $("searchButton"),
  status: $("status"),
  result: $("result"),
  resultTitle: $("resultTitle"),
  resultValue: $("resultValue"),
  resultIcon: $("resultIcon"),
  progress: $("progress"),
  progressLabel: $("progressLabel"),
  play: $("playButton"),
  playIcon: $("playIcon"),
  playLabel: $("playLabel"),
  previous: $("previousButton"),
  next: $("nextButton"),
  reset: $("resetButton"),
  speed: $("speed"),
  stepCounter: $("stepCounter"),
  pseudocode: $("pseudocode"),
  codeExplanation: $("codeExplanation"),
  lessonStep: $("lessonStep"),
  lessonIcon: $("lessonIcon"),
  lessonTitle: $("lessonTitle"),
  lessonExplanation: $("lessonExplanation"),
  lessonNext: $("lessonNext"),
  lessonHint: $("lessonHint"),
  lessonProgress: $("lessonProgress"),
  lessonNextButton: $("lessonNextButton"),
  comparisons: $("comparisons"),
  checked: $("checked"),
  remaining: $("remaining"),
  resultIndex: $("resultIndex"),
  arraySize: $("arraySize"),
  arraySizeValue: $("arraySizeValue"),
  random: $("randomButton"),
  custom: $("customArray"),
  applyArray: $("applyArrayButton"),
  inputMessage: $("inputMessage"),
  modeDescription: $("modeDescription")
};

let array = [...initialArray];
let target = 42;
let timeline = [];
let currentStep = 0;
let mode = "learn";
let playing = false;
let timer = null;

const delays = {
  slow: 1400,
  normal: 750,
  fast: 300
};

function addStep(data) {
  timeline.push({
    array: [...array],
    low: data.low ?? null,
    high: data.high ?? null,
    mid: data.mid ?? null,
    activeIndex: data.activeIndex ?? null,
    foundIndex: data.foundIndex ?? null,
    discarded: [...(data.discarded || [])],
    checked: [...(data.checked || [])],
    comparisons: data.comparisons ?? 0,
    remaining: data.remaining ?? 0,
    line: data.line ?? 1,
    title: data.title || "",
    explanation: data.explanation || "",
    next: data.next || "",
    hint: data.hint || "",
    codeExplanation: data.codeExplanation || "",
    icon: data.icon || "🔍",
    label: data.label || "",
    done: data.done || false,
    notFound: data.notFound || false,
    checkpoint: data.checkpoint ?? true
  });
}

function generateTimeline() {
  timeline = [];

  let low = 0;
  let high = array.length - 1;
  let comparisons = 0;

  const checked = [];
  const discarded = [];

  addStep({
    low,
    high,
    remaining: array.length,
    line: 1,
    title: "Initialize the search",
    explanation: `We are looking for ${target} in a sorted array of ${array.length} elements. LOW starts at index 0 and HIGH starts at index ${high}.`,
    next: "Calculate the middle index of the current search range.",
    hint: "Binary Search only works correctly when the array is sorted.",
    codeExplanation: `low = 0, high = ${high}.`,
    icon: "🎯",
    label: "INITIALIZE"
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const value = array[mid];

    addStep({
      low,
      high,
      mid,
      checked,
      discarded,
      comparisons,
      remaining: high - low + 1,
      line: 3,
      title: "Calculate the middle",
      explanation: `The current search range is from index ${low} to ${high}. Its middle index is ${mid}. The value at that position is ${value}.`,
      next: `Compare ${value} with the target ${target}.`,
      hint: "MID is calculated from the current LOW and HIGH positions.",
      codeExplanation: `mid = floor((${low} + ${high}) / 2) = ${mid}.`,
      icon: "🎯",
      label: "FIND MID"
    });

    comparisons++;
    checked.push(mid);

    addStep({
      low,
      high,
      mid,
      activeIndex: mid,
      checked,
      discarded,
      comparisons,
      remaining: high - low + 1,
      line: 4,
      title: "Compare the middle element",
      explanation: `arr[${mid}] is ${value}. Our target is ${target}.`,
      next: value === target
        ? "The values are equal. We have found the target!"
        : value < target
          ? `${value} is smaller than ${target}. Eliminate the left half.`
          : `${value} is greater than ${target}. Eliminate the right half.`,
      hint: "A single comparison tells us which half cannot contain the target.",
      codeExplanation: `${value} ${value === target ? "===" : value < target ? "<" : ">"} ${target}.`,
      icon: "⚖️",
      label: `COMPARISON ${comparisons}`
    });

    if (value === target) {
      addStep({
        low,
        high,
        mid,
        activeIndex: mid,
        foundIndex: mid,
        checked,
        discarded,
        comparisons,
        remaining: 1,
        line: 4,
        title: "Target found!",
        explanation: `We found ${target} at index ${mid}. Binary Search completed the search in ${comparisons} comparison${comparisons === 1 ? "" : "s"}.`,
        next: "The search is complete.",
        hint: "Notice how many elements were eliminated without being examined.",
        codeExplanation: `arr[${mid}] === ${target}. Return ${mid}.`,
        icon: "🎉",
        label: "FOUND",
        done: true
      });

      return;
    }

    if (value < target) {
      const previousLow = low;
      low = mid + 1;

      for (let i = previousLow; i < low; i++) {
        if (!discarded.includes(i)) discarded.push(i);
      }

      addStep({
        low,
        high,
        checked,
        discarded,
        comparisons,
        remaining: Math.max(0, high - low + 1),
        line: 5,
        title: "Eliminate the left half",
        explanation: `${value} is smaller than ${target}. Because the array is sorted, all elements from index ${previousLow} through ${mid} are too small. LOW moves to ${low}.`,
        next: low <= high
          ? "Find the middle of the smaller search range."
          : "No elements remain in the search range.",
        hint: "The faded elements have been permanently eliminated.",
        codeExplanation: `low = mid + 1 = ${low}.`,
        icon: "➡️",
        label: "MOVE LOW"
      });
    } else {
      const previousHigh = high;
      high = mid - 1;

      for (let i = mid; i <= previousHigh; i++) {
        if (!discarded.includes(i)) discarded.push(i);
      }

      addStep({
        low,
        high,
        checked,
        discarded,
        comparisons,
        remaining: Math.max(0, high - low + 1),
        line: 6,
        title: "Eliminate the right half",
        explanation: `${value} is greater than ${target}. Because the array is sorted, all elements from index ${mid} through ${previousHigh} are too large. HIGH moves to ${high}.`,
        next: low <= high
          ? "Find the middle of the smaller search range."
          : "No elements remain in the search range.",
        hint: "The faded elements have been permanently eliminated.",
        codeExplanation: `high = mid - 1 = ${high}.`,
        icon: "⬅️",
        label: "MOVE HIGH"
      });
    }
  }

  addStep({
    low,
    high,
    checked,
    discarded,
    comparisons,
    remaining: 0,
    line: 7,
    title: "Target not found",
    explanation: `LOW (${low}) has moved beyond HIGH (${high}). The search range is empty, so ${target} does not exist in this array.`,
    next: "Try another target or enter a different array.",
    hint: "When LOW becomes greater than HIGH, Binary Search terminates.",
    codeExplanation: `low = ${low} > high = ${high}. Return -1.`,
    icon: "🔍",
    label: "NOT FOUND",
    done: true,
    notFound: true
  });
}

function renderArray(step) {
  ui.array.innerHTML = "";
  ui.array.style.setProperty("--array-size", step.array.length);

  step.array.forEach((value, index) => {
    const cell = document.createElement("div");
    cell.className = "cell";

    const valueElement = document.createElement("div");
    valueElement.className = "cell-value";
    valueElement.textContent = value;

    const indexElement = document.createElement("span");
    indexElement.className = "cell-index";
    indexElement.textContent = index;

    const pointer = document.createElement("span");
    pointer.className = "cell-pointer";

    const labels = [];

    if (step.low === index) {
      cell.classList.add("low");
      labels.push("LOW");
    }

    if (step.high === index) {
      cell.classList.add("high");
      labels.push("HIGH");
    }

    if (step.mid === index) {
      cell.classList.add("mid");
      labels.push("MID");
    }

    if (step.foundIndex === index) {
      cell.classList.add("found");
      labels.push("FOUND");
    }

    if (step.discarded.includes(index)) {
      cell.classList.add("outside");
    }

    pointer.textContent = labels.join(" · ");

    cell.append(valueElement, indexElement, pointer);
    ui.array.appendChild(cell);
  });
}

function renderResult(step) {
  if (step.foundIndex !== null) {
    ui.result.hidden = false;
    ui.result.classList.remove("failure");
    ui.resultTitle.textContent = "Target found";
    ui.resultValue.textContent = `Index ${step.foundIndex}`;
    ui.resultIcon.textContent = "✓";
  } else if (step.notFound) {
    ui.result.hidden = false;
    ui.result.classList.add("failure");
    ui.resultTitle.textContent = "Target not found";
    ui.resultValue.textContent = "No matching element";
    ui.resultIcon.textContent = "×";
  } else {
    ui.result.hidden = true;
  }
}

function renderCode(step) {
  ui.pseudocode.querySelectorAll(".code-line").forEach((line) => {
    line.classList.toggle(
      "active",
      Number(line.dataset.line) === step.line
    );
  });

  ui.codeExplanation.textContent = step.codeExplanation;
}

function renderLesson(step) {
  ui.lessonStep.textContent = `STEP ${currentStep + 1}`;
  ui.lessonIcon.textContent = step.icon;
  ui.lessonTitle.textContent = step.title;
  ui.lessonExplanation.textContent = step.explanation;
  ui.lessonNext.textContent = step.next;
  ui.lessonHint.textContent = step.hint;

  ui.lessonProgress.textContent =
    `${currentStep + 1} of ${timeline.length} visualization steps`;

  ui.lessonNextButton.disabled =
    currentStep === timeline.length - 1;

  ui.lessonNextButton.textContent =
    currentStep === timeline.length - 1
      ? "Completed"
      : "Continue →";
}

function renderStatus(step) {
  ui.status.className = "status";

  if (step.done && step.notFound) {
    ui.status.textContent = "Not found";
    ui.status.classList.add("not-found");
  } else if (step.done) {
    ui.status.textContent = "Found";
    ui.status.classList.add("found");
  } else {
    ui.status.textContent = step.label || "Searching";
    ui.status.classList.add("running");
  }
}

function renderControls() {
  ui.previous.disabled = currentStep === 0;
  ui.next.disabled = currentStep === timeline.length - 1;
  ui.play.disabled = timeline.length <= 1;

  ui.playIcon.textContent = playing ? "Ⅱ" : "▶";
  ui.playLabel.textContent = playing ? "Pause" : "Play";
}

function render() {
  if (!timeline.length) return;

  const step = timeline[currentStep];

  renderArray(step);
  renderResult(step);
  renderCode(step);
  renderLesson(step);
  renderStatus(step);
  renderControls();

  window.ALGOVIZ_STATE = {
    algorithm: "Binary Search",
    category: "searching",
    mode,
    array: step.array,
    target,
    step: {
      label: step.label,
      title: step.title,
      explanation: step.explanation,
      next: step.next,
      line: step.line,
      comparisons: step.comparisons,
      checked: step.checked,
      remaining: step.remaining,
      low: step.low,
      high: step.high,
      mid: step.mid,
      activeIndex: step.activeIndex,
      foundIndex: step.foundIndex,
      done: step.done,
      notFound: step.notFound
    },
    progress: `${currentStep + 1} / ${timeline.length}`
  };

  ui.comparisons.textContent = step.comparisons;
  ui.checked.textContent = step.checked.length;
  ui.remaining.textContent = step.remaining;

  ui.resultIndex.textContent =
    step.foundIndex !== null ? step.foundIndex : "—";

  ui.stepCounter.textContent =
    `${currentStep + 1} / ${timeline.length}`;

  const percentage = timeline.length <= 1
    ? 100
    : Math.round(currentStep / (timeline.length - 1) * 100);

  ui.progress.value = percentage;
  ui.progressLabel.textContent = `${percentage}%`;
}

function stopPlayback() {
  playing = false;
  clearTimeout(timer);
  timer = null;
  renderControls();
}

function moveToStep(index) {
  stopPlayback();

  currentStep = Math.max(
    0,
    Math.min(index, timeline.length - 1)
  );

  render();
}

function nextStep() {
  if (currentStep >= timeline.length - 1) {
    stopPlayback();
    return;
  }

  currentStep++;
  render();

  if (mode === "learn" && timeline[currentStep].checkpoint !== false) {
    stopPlayback();
  }
}

function previousStep() {
  moveToStep(currentStep - 1);
}

function play() {
  if (playing) {
    stopPlayback();
    return;
  }

  if (currentStep >= timeline.length - 1) {
    currentStep = 0;
    render();
  }

  playing = true;
  renderControls();

  function tick() {
    if (!playing) return;

    if (currentStep >= timeline.length - 1) {
      stopPlayback();
      return;
    }

    currentStep++;
    render();

    if (mode === "learn" && timeline[currentStep].checkpoint !== false) {
      stopPlayback();
      return;
    }

    if (currentStep >= timeline.length - 1) {
      stopPlayback();
      return;
    }

    timer = setTimeout(tick, delays[ui.speed.value] || delays.normal);
  }

  timer = setTimeout(tick, delays[ui.speed.value] || delays.normal);
}

function rebuild() {
  stopPlayback();
  generateTimeline();
  currentStep = 0;
  ui.target.value = target;
  ui.custom.value = array.join(", ");
  render();
}

function setTarget() {
  const raw = ui.target.value.trim();

  if (!raw) {
    showMessage("Enter a target value.", "error");
    return;
  }

  const value = Number(raw);

  if (!Number.isSafeInteger(value)) {
    showMessage("Target must be a valid integer.", "error");
    return;
  }

  target = value;
  showMessage("Target updated.", "success");
  rebuild();
}

function showMessage(message, type = "") {
  ui.inputMessage.textContent = message;
  ui.inputMessage.className = `input-message ${type}`;
}

function parseArray() {
  const raw = ui.custom.value.trim();

  if (!raw) {
    showMessage("Enter an array of integers.", "error");
    return;
  }

  const parts = raw.split(",").map((item) => item.trim());

  if (parts.some((item) => item === "")) {
    showMessage("Remove empty values from the array.", "error");
    return;
  }

  const values = parts.map(Number);

  if (
    values.some((value) => !Number.isSafeInteger(value)) ||
    values.length < 2 ||
    values.length > 16
  ) {
    showMessage("Enter between 2 and 16 valid integers.", "error");
    return;
  }

  for (let i = 1; i < values.length; i++) {
    if (values[i] < values[i - 1]) {
      showMessage("Binary Search requires ascending sorted values.", "error");
      return;
    }
  }

  array = values;
  ui.arraySize.value = array.length;
  ui.arraySizeValue.textContent = array.length;

  showMessage("Sorted array applied successfully.", "success");
  rebuild();
}

function createRandomArray(size) {
  const values = [];
  let value = Math.floor(Math.random() * 10);

  for (let i = 0; i < size; i++) {
    value += Math.floor(Math.random() * 10) + 1;
    values.push(value);
  }

  return values;
}

function generateRandomArray() {
  array = createRandomArray(Number(ui.arraySize.value));
  showMessage("New sorted array generated.", "success");
  rebuild();
}

function changeMode(nextMode) {
  if (!["learn", "explore"].includes(nextMode)) return;

  mode = nextMode;
  stopPlayback();

  document.querySelectorAll(".mode").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.mode === mode
    );
  });

  ui.modeDescription.textContent = mode === "learn"
    ? "Pause at important checkpoints and understand every decision."
    : "Watch the entire algorithm execute continuously.";

  render();
}

ui.play.addEventListener("click", play);
ui.next.addEventListener("click", nextStep);
ui.previous.addEventListener("click", previousStep);
ui.reset.addEventListener("click", () => moveToStep(0));

ui.search.addEventListener("click", setTarget);
ui.target.addEventListener("keydown", (event) => {
  if (event.key === "Enter") setTarget();
});

ui.lessonNextButton.addEventListener("click", nextStep);

ui.progress.addEventListener("input", () => {
  const index = Math.round(
    Number(ui.progress.value) / 100 * (timeline.length - 1)
  );

  moveToStep(index);
});

ui.speed.addEventListener("change", () => {
  if (!playing) return;

  stopPlayback();
  play();
});

ui.applyArray.addEventListener("click", parseArray);
ui.custom.addEventListener("keydown", (event) => {
  if (event.key === "Enter") parseArray();
});

ui.random.addEventListener("click", generateRandomArray);

ui.arraySize.addEventListener("input", () => {
  const size = Number(ui.arraySize.value);
  ui.arraySizeValue.textContent = size;
  array = createRandomArray(size);
  showMessage("Array size updated.", "success");
  rebuild();
});

document.querySelectorAll(".mode").forEach((button) => {
  button.addEventListener("click", () => {
    changeMode(button.dataset.mode);
  });
});

generateTimeline();
render();

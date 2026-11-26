
export function createSearchVisualizer({
  generateSteps,
  initialArray,
  initialTarget,
  validateArray = () => true,
  createRandomArray
}) {
  const get = (id) => document.getElementById(id);
  const algorithmName = document.querySelector("h1")?.textContent
    .replace(/[.]/g, "")
    .trim() || document.title.split(" —")[0];

  const ui = {
    array: get("searchArray"),
    status: get("searchStatus"),
    target: get("targetInput"),
    applyTarget: get("applyTargetButton"),
    targetDisplay: get("targetDisplay"),
    result: get("searchResult"),
    resultText: get("searchResultText"),
    resultValue: get("searchResultValue"),
    comparisons: get("searchComparisons"),
    checked: get("searchChecked"),
    remaining: get("searchRemaining"),
    resultIndex: get("searchResultIndex"),
    stepCounter: get("searchStepCounter"),
    progress: get("searchProgress"),
    progressLabel: get("searchProgressLabel"),
    pseudocode: get("searchPseudocode"),
    codeExplanation: get("searchCodeExplanation"),
    lessonStep: get("searchLessonStep"),
    lessonIcon: get("searchLessonIcon"),
    lessonTitle: get("searchLessonTitle"),
    lessonExplanation: get("searchLessonExplanation"),
    lessonNext: get("searchLessonNext"),
    lessonHint: get("searchLessonHint"),
    lessonNextButton: get("searchLessonNextButton"),
    play: get("searchPlayButton"),
    playIcon: get("searchPlayIcon"),
    playLabel: get("searchPlayLabel"),
    previous: get("searchPreviousButton"),
    next: get("searchNextButton"),
    reset: get("searchResetButton"),
    speed: get("searchSpeed"),
    size: get("searchSize"),
    sizeValue: get("searchSizeValue"),
    shuffle: get("searchShuffleButton"),
    custom: get("searchCustomArray"),
    applyArray: get("searchApplyArrayButton"),
    inputHint: get("searchInputHint"),
    modeDescription: get("searchModeDescription")
  };

  const requiredElements = Object.entries(ui)
    .filter(([, element]) => !element)
    .map(([name]) => name);

  if (requiredElements.length) {
    throw new Error(
      `Search visualizer is missing elements: ${requiredElements.join(", ")}`
    );
  }

  let originalArray = [...initialArray];
  let target = initialTarget;
  let steps = [];
  let currentStep = 0;
  let mode = "learn";
  let isPlaying = false;
  let playbackTimer = null;

  const speeds = {
    slow: 1200,
    normal: 650,
    fast: 250
  };

  function showInputMessage(message, type = "info") {
    ui.inputHint.textContent = message;
    ui.inputHint.dataset.type = type;
  }

  function setStatus(message, type = "default") {
    ui.status.textContent = message;
    ui.status.dataset.state = type;
  }

  function renderArray(step) {
    ui.array.innerHTML = "";
    ui.array.style.setProperty("--array-size", step.array.length);

    const discarded = step.discardedIndices || [];
    const checkedIndices = step.checkedIndices || [];

    step.array.forEach((value, index) => {
      const cell = document.createElement("div");
      cell.className = "search-cell";

      const valueElement = document.createElement("div");
      valueElement.className = "search-cell-value";
      valueElement.textContent = value;

      const indexElement = document.createElement("span");
      indexElement.className = "search-cell-index";
      indexElement.textContent = index;

      const pointer = document.createElement("span");
      pointer.className = "search-cell-pointer";

      const labels = [];

      if (Number.isInteger(step.low) && step.low === index) {
        cell.classList.add("low");
        labels.push("LOW");
      }

      if (Number.isInteger(step.high) && step.high === index) {
        cell.classList.add("high");
        labels.push("HIGH");
      }

      if (Number.isInteger(step.mid) && step.mid === index) {
        cell.classList.add("mid", "active");
        labels.push("MID");
      } else if (step.activeIndex === index) {
        cell.classList.add("active");
      }

      if (step.foundIndex === index) {
        cell.classList.add("found");
        labels.push("FOUND");
      } else if (checkedIndices.includes(index)) {
        cell.classList.add("checked");
      }

      if (discarded.includes(index)) {
        cell.classList.add("outside-range");
      }

      pointer.textContent = labels.join(" · ");

      cell.appendChild(valueElement);
      cell.appendChild(indexElement);
      cell.appendChild(pointer);

      ui.array.appendChild(cell);
    });
  }

  function renderResult(step) {
    if (step.foundIndex !== null && step.foundIndex !== undefined) {
      ui.result.hidden = false;
      ui.result.dataset.state = "success";
      ui.resultText.textContent = "Target found";
      ui.resultValue.textContent = `Index ${step.foundIndex}`;
      return;
    }

    if (step.notFound) {
      ui.result.hidden = false;
      ui.result.dataset.state = "error";
      ui.resultText.textContent = "Target not found";
      ui.resultValue.textContent = "No matching element";
      return;
    }

    ui.result.hidden = true;
  }

  function renderCode(step) {
    const lines = ui.pseudocode.querySelectorAll(".search-code-line");

    lines.forEach((line, index) => {
      line.classList.toggle(
        "active",
        index + 1 === step.line
      );
    });

    ui.codeExplanation.textContent = step.codeExplanation || "";
  }

  function renderLesson(step) {
    ui.lessonStep.textContent =
      `STEP ${currentStep + 1} / ${steps.length}`;

    ui.lessonIcon.textContent = step.icon || "🔍";
    ui.lessonTitle.textContent = step.title || "";
    ui.lessonExplanation.textContent = step.explanation || "";
    ui.lessonNext.textContent = step.next || "";
    ui.lessonHint.textContent = step.hint || "";

    ui.lessonNextButton.disabled =
      currentStep >= steps.length - 1;

    ui.lessonNextButton.textContent =
      currentStep >= steps.length - 1
        ? "Completed"
        : "Continue";
  }

  function renderControls() {
    ui.previous.disabled = currentStep === 0;
    ui.next.disabled = currentStep >= steps.length - 1;

    ui.play.disabled = steps.length <= 1;

    ui.playIcon.textContent = isPlaying ? "Ⅱ" : "▶";
    ui.playLabel.textContent = isPlaying ? "Pause" : "Play";
  }

  function render() {
    if (!steps.length) return;

    const step = steps[currentStep];

    renderArray(step);
    renderResult(step);
    renderCode(step);
    renderLesson(step);
    renderControls();

    ui.comparisons.textContent = step.comparisons ?? 0;
    ui.checked.textContent = step.checkedIndices?.length ?? 0;

    ui.remaining.textContent =
      step.remainingCount ??
      Math.max(
        0,
        step.array.length - (step.checkedIndices?.length ?? 0)
      );

    ui.resultIndex.textContent =
      step.foundIndex !== null && step.foundIndex !== undefined
        ? step.foundIndex
        : "—";

    ui.stepCounter.textContent =
      `${currentStep + 1} / ${steps.length}`;

    const percentage = steps.length <= 1
      ? 100
      : Math.round((currentStep / (steps.length - 1)) * 100);

    ui.progress.value = percentage;
    ui.progressLabel.textContent = `${percentage}%`;

    window.ALGOVIZ_STATE = {
      algorithm: algorithmName,
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
        checked: step.checkedIndices,
        remaining: step.remainingCount,
        low: step.low,
        high: step.high,
        mid: step.mid,
        activeIndex: step.activeIndex,
        foundIndex: step.foundIndex,
        done: step.done,
        notFound: step.notFound
      },
      progress: `${currentStep + 1} / ${steps.length}`
    };

    if (step.done) {
      setStatus(
        step.notFound ? "Target not found" : "Search completed",
        step.notFound ? "error" : "success"
      );
    } else if (step.foundIndex !== null && step.foundIndex !== undefined) {
      setStatus("Target found", "success");
    } else {
      setStatus(step.label || "Searching", "active");
    }
  }

  function stopPlayback() {
    isPlaying = false;

    if (playbackTimer !== null) {
      clearTimeout(playbackTimer);
      playbackTimer = null;
    }

    renderControls();
  }

  function buildTimeline() {
    stopPlayback();

    steps = generateSteps([...originalArray], target);
    currentStep = 0;

    if (!steps.length) {
      setStatus("Unable to generate search steps", "error");
      return;
    }

    ui.target.value = target;
    ui.targetDisplay.textContent = target;
    ui.custom.value = originalArray.join(", ");

    render();
  }

  function moveToStep(index) {
    stopPlayback();

    currentStep = Math.max(
      0,
      Math.min(index, steps.length - 1)
    );

    render();
  }

  function nextStep() {
    if (currentStep >= steps.length - 1) {
      stopPlayback();
      return;
    }

    currentStep++;
    render();

    if (mode === "learn" && steps[currentStep].checkpoint) {
      stopPlayback();
    }
  }

  function previousStep() {
    moveToStep(currentStep - 1);
  }

  function getDelay() {
    return speeds[ui.speed.value] || speeds.normal;
  }

  function play() {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    if (currentStep >= steps.length - 1) {
      currentStep = 0;
      render();
    }

    isPlaying = true;
    renderControls();

    function tick() {
      if (!isPlaying) return;

      if (currentStep >= steps.length - 1) {
        stopPlayback();
        return;
      }

      currentStep++;
      render();

      if (
        mode === "learn" &&
        steps[currentStep].checkpoint
      ) {
        stopPlayback();
        return;
      }

      if (currentStep >= steps.length - 1) {
        stopPlayback();
        return;
      }

      playbackTimer = setTimeout(tick, getDelay());
    }

    playbackTimer = setTimeout(tick, getDelay());
  }

  function reset() {
    stopPlayback();
    currentStep = 0;
    render();
  }

  function setTarget() {
    const rawValue = ui.target.value.trim();

    if (!rawValue) {
      showInputMessage("Enter a target value.", "error");
      return;
    }

    const value = Number(rawValue);

    if (!Number.isSafeInteger(value)) {
      showInputMessage("Target must be a valid integer.", "error");
      return;
    }

    target = value;
    showInputMessage("Target updated successfully.", "success");
    buildTimeline();
  }

  function setArray(array) {
    const validation = validateArray(array);

    if (validation !== true) {
      showInputMessage(
        typeof validation === "string"
          ? validation
          : "This array is not valid for the selected algorithm.",
        "error"
      );

      return false;
    }

    if (array.length < 2 || array.length > 20) {
      showInputMessage(
        "Enter between 2 and 20 numbers.",
        "error"
      );

      return false;
    }

    originalArray = [...array];

    ui.size.value = array.length;
    ui.sizeValue.textContent = array.length;
    ui.custom.value = array.join(", ");

    showInputMessage("Array updated successfully.", "success");

    buildTimeline();
    return true;
  }

  function parseCustomArray() {
    const rawValue = ui.custom.value.trim();

    if (!rawValue) {
      showInputMessage("Enter an array of numbers.", "error");
      return;
    }

    const parts = rawValue.split(",").map((value) => value.trim());

    if (parts.some((value) => value === "")) {
      showInputMessage("Remove empty values from the array.", "error");
      return;
    }

    const array = parts.map(Number);

    if (array.some((value) => !Number.isSafeInteger(value))) {
      showInputMessage("All array values must be valid integers.", "error");
      return;
    }

    setArray(array);
  }

  function randomArray(size) {
    if (createRandomArray) {
      return createRandomArray(size);
    }

    const values = [];

    while (values.length < size) {
      const value = Math.floor(Math.random() * 90) + 10;

      if (!values.includes(value)) {
        values.push(value);
      }
    }

    return values;
  }

  function shuffleArray() {
    const size = Number(ui.size.value);
    const array = randomArray(size);

    setArray(array);
  }

  function changeSize() {
    const size = Number(ui.size.value);

    ui.sizeValue.textContent = size;

    setArray(randomArray(size));
  }

  function changeMode(nextMode) {
    if (nextMode !== "learn" && nextMode !== "explore") {
      return;
    }

    mode = nextMode;
    stopPlayback();

    document.querySelectorAll(".search-mode-button").forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.mode === mode
      );
    });

    ui.modeDescription.textContent =
      mode === "learn"
        ? "Learn mode pauses at important checkpoints so you can understand every decision."
        : "Explore mode runs continuously so you can watch the complete algorithm.";

    render();
  }

  ui.play.addEventListener("click", play);
  ui.previous.addEventListener("click", previousStep);
  ui.next.addEventListener("click", nextStep);
  ui.reset.addEventListener("click", reset);

  ui.applyTarget.addEventListener("click", setTarget);

  ui.target.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      setTarget();
    }
  });

  ui.lessonNextButton.addEventListener("click", nextStep);

  ui.progress.addEventListener("input", () => {
    const percentage = Number(ui.progress.value);

    const index = Math.round(
      (percentage / 100) * (steps.length - 1)
    );

    moveToStep(index);
  });

  ui.speed.addEventListener("change", () => {
    if (!isPlaying) return;

    stopPlayback();
    play();
  });

  ui.shuffle.addEventListener("click", shuffleArray);
  ui.size.addEventListener("input", changeSize);
  ui.applyArray.addEventListener("click", parseCustomArray);

  ui.custom.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      parseCustomArray();
    }
  });

  document.querySelectorAll(".search-mode-button").forEach((button) => {
    button.addEventListener("click", () => {
      changeMode(button.dataset.mode);
    });
  });

  buildTimeline();
}

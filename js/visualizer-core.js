
function createVisualizer({ generateSteps, initialArray }) {
  const get = (id) => document.getElementById(id);
  const algorithmName = document.querySelector("h1")?.textContent
    .replace(/[.]/g, "")
    .trim() || document.title.split(" —")[0];

  const ui = {
    bars: get("bars"),
    values: get("arrayValues"),
    indices: get("arrayIndices"),
    status: get("runStatus"),
    stepCounter: get("stepCounter"),
    progress: get("progressSlider"),
    comparisons: get("comparisonCount"),
    swaps: get("swapCount"),
    sorted: get("sortedCount"),
    pass: get("passCount"),
    pseudocode: get("pseudocode"),
    codeExplanation: get("codeExplanationText"),
    lessonStep: get("lessonStep"),
    lessonIcon: get("lessonIcon"),
    lessonTitle: get("lessonTitle"),
    lessonExplanation: get("lessonExplanation"),
    lessonNext: get("lessonNext"),
    lessonHint: get("lessonHint"),
    lessonNextButton: get("lessonNextButton"),
    playButton: get("playButton"),
    playIcon: get("playIcon"),
    playLabel: get("playLabel"),
    previous: get("previousButton"),
    next: get("nextButton"),
    reset: get("resetButton"),
    speed: get("speedSelect"),
    size: get("sizeSlider"),
    sizeValue: get("sizeValue"),
    shuffle: get("shuffleButton"),
    custom: get("customArray"),
    apply: get("applyArrayButton"),
    inputHint: get("inputHint"),
    modeDescription: get("modeDescription")
  };

  let originalArray = [...initialArray];
  let steps = [];
  let currentStep = 0;
  let timer = null;
  let playing = false;
  let mode = "learn";
  let aiButton = null;
  let aiOutput = null;
  let aiRequestId = 0;

  function stop() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }

    playing = false;
    updatePlaybackControls();
  }

  function updateStatus(label, state = "") {
    ui.status.className = `run-status ${state}`;
    ui.status.innerHTML = `<i></i> ${label}`;
  }

  function updatePlaybackControls() {
    const atStart = currentStep === 0;
    const atEnd = currentStep >= steps.length - 1;

    ui.playIcon.textContent = playing ? "Ⅱ" : "▶";
    ui.playLabel.textContent = playing
      ? "Pause"
      : atEnd
        ? "Replay"
        : currentStep === 0
          ? "Start learning"
          : "Continue";

    ui.previous.disabled = atStart || playing;
    ui.next.disabled = atEnd || playing;
    ui.reset.disabled = atStart && !playing;
    ui.lessonNextButton.disabled = atEnd || playing;
  }

  function renderBars(step) {
    const array = step.array;
    const minimum = Math.min(...array);
    const maximum = Math.max(...array);
    const range = maximum - minimum || 1;

    ui.bars.style.setProperty("--array-size", array.length);
    ui.values.style.setProperty("--array-size", array.length);
    ui.indices.style.setProperty("--array-size", array.length);

    ui.bars.innerHTML = "";
    ui.values.innerHTML = "";
    ui.indices.innerHTML = "";

    array.forEach((value, index) => {
      const valueLabel = document.createElement("span");
      valueLabel.textContent = value;
      ui.values.appendChild(valueLabel);

      const column = document.createElement("div");
      column.className = "bar-column";

      const bar = document.createElement("div");
      const height = 14 + ((value - minimum) / range) * 82;

      bar.className = "bar";
      bar.style.height = `${height}%`;
      bar.title = `Index ${index}, value ${value}`;

      if (step.sorted.includes(index)) {
        bar.classList.add("sorted");
      } else if (step.swapping.includes(index)) {
        bar.classList.add("swapping");
      } else if (step.comparing.includes(index)) {
        bar.classList.add("comparing");
      }

      column.appendChild(bar);
      ui.bars.appendChild(column);

      const indexLabel = document.createElement("span");
      indexLabel.textContent = index;
      ui.indices.appendChild(indexLabel);
    });
  }

  function renderLesson(step) {
    ui.lessonStep.textContent = step.label;
    ui.lessonIcon.textContent = step.icon || "✦";
    ui.lessonTitle.textContent = step.title;
    ui.lessonExplanation.textContent = step.explanation;
    ui.lessonNext.innerHTML = `
      <strong>Coming up</strong>
      <span>${step.next}</span>
    `;

    ui.lessonHint.textContent = step.hint ||
      (mode === "learn"
        ? "Take your time. You can move through every step manually."
        : "Explore the algorithm at your own pace.");

    ui.codeExplanation.textContent = step.codeExplanation;
  }

  function render(stepIndex) {
    const step = steps[stepIndex];

    if (!step) return;

    currentStep = stepIndex;
    aiRequestId++;

    if (aiOutput) {
      aiOutput.textContent = "";
    }

    if (aiButton) {
      aiButton.disabled = false;
    }

    renderBars(step);
    renderLesson(step);

    ui.comparisons.textContent = step.comparisons;
    ui.swaps.textContent = step.swaps;
    ui.sorted.textContent = step.sorted.length;
    ui.pass.textContent = step.pass;

    ui.stepCounter.textContent =
      `Step ${currentStep + 1} / ${steps.length}`;

    ui.progress.max = steps.length - 1;
    ui.progress.value = currentStep;

    ui.pseudocode.querySelectorAll(".code-line").forEach((line) => {
      line.classList.toggle(
        "active",
        Number(line.dataset.line) === step.line
      );
    });

    window.ALGOVIZ_STATE = {
      algorithm: algorithmName,
      category: "sorting",
      mode,
      array: step.array,
      step: {
        label: step.label,
        title: step.title,
        explanation: step.explanation,
        next: step.next,
        line: step.line,
        comparisons: step.comparisons,
        swaps: step.swaps,
        pass: step.pass,
        comparing: step.comparing,
        swapping: step.swapping,
        sorted: step.sorted,
        done: step.done
      },
      progress: `${currentStep + 1} / ${steps.length}`
    };

    if (step.done) {
      updateStatus("Completed", "complete");
    } else if (playing) {
      updateStatus("Running", "running");
    } else if (currentStep === 0) {
      updateStatus("Ready");
    } else {
      updateStatus("Paused");
    }

    updatePlaybackControls();
  }

  function setupAiExplainer() {
    if (!ui.lessonNextButton || !ui.lessonNextButton.parentElement) return;

    aiButton = document.createElement("button");
    aiButton.className = "lesson-next-button ai-explain-button";
    aiButton.type = "button";
    aiButton.textContent = "Explain with Groq";

    aiOutput = document.createElement("span");
    aiOutput.className = "ai-explanation";
    aiOutput.setAttribute("aria-live", "polite");

    const actions = ui.lessonNextButton.parentElement;
    actions.insertBefore(aiOutput, ui.lessonNextButton);
    actions.insertBefore(aiButton, ui.lessonNextButton);

    aiButton.addEventListener("click", async () => {
      const requestId = ++aiRequestId;
      const step = steps[currentStep];

      aiButton.disabled = true;
      aiOutput.textContent = "Asking Groq...";

      try {
        const response = await fetch("/api/explain-step", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            algorithm: document.title.split(" —")[0],
            array: step.array,
            step: {
              title: step.title,
              explanation: step.explanation,
              next: step.next,
              comparisons: step.comparisons,
              swaps: step.swaps
            }
          })
        });
        const result = await response.json();

        if (requestId !== aiRequestId) return;
        if (!response.ok) {
          throw new Error(result.error || "Groq request failed.");
        }

        aiOutput.textContent = result.explanation;
      } catch (error) {
        if (requestId === aiRequestId) {
          aiOutput.textContent = error.message.includes("Failed to fetch")
            ? "Start the Flask app to use Groq explanations."
            : error.message;
        }
      } finally {
        if (requestId === aiRequestId) {
          aiButton.disabled = false;
        }
      }
    });
  }

  function buildTimeline() {
    stop();
    steps = generateSteps([...originalArray]);
    currentStep = 0;
    render(0);
  }

  function nextStep() {
    if (currentStep >= steps.length - 1) {
      stop();
      return;
    }

    render(currentStep + 1);
  }

  function previousStep() {
    stop();

    if (currentStep > 0) {
      render(currentStep - 1);
    }
  }

  function scheduleNextStep() {
    if (!playing) return;

    timer = setTimeout(() => {
      timer = null;

      if (!playing) return;

      nextStep();

      const current = steps[currentStep];

      if (current.done) {
        stop();
        updateStatus("Completed", "complete");
        return;
      }

      if (mode === "learn" && current.checkpoint) {
        stop();
        updateStatus("Your turn", "");
        ui.lessonHint.textContent =
          "Pause here and make sure you understand what just happened. Continue when you're ready.";
        return;
      }

      scheduleNextStep();
    }, Number(ui.speed.value));
  }

  function play() {
    if (playing) {
      stop();
      updateStatus("Paused");
      return;
    }

    if (currentStep >= steps.length - 1) {
      render(0);
    }

    playing = true;
    updateStatus("Running", "running");
    updatePlaybackControls();

    scheduleNextStep();
  }

  function reset() {
    stop();
    render(0);
  }

  function randomArray(size) {
    return Array.from(
      { length: size },
      () => Math.floor(Math.random() * 90) + 10
    );
  }

  function setArray(array) {
    originalArray = [...array];
    ui.size.value = array.length;
    ui.sizeValue.textContent = array.length;
    ui.custom.value = array.join(", ");
    buildTimeline();
  }

  function showInputMessage(message, type = "") {
    ui.inputHint.textContent = message;
    ui.inputHint.className = `input-hint ${type}`;
  }

  function setMode(nextMode) {
    stop();
    mode = nextMode;

    document.querySelectorAll(".mode-button").forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.mode === mode
      );
    });

    ui.modeDescription.textContent = mode === "learn"
      ? "Guided playback with explanations and pauses after important operations."
      : "Continuous playback. Follow the visualization at your own pace.";

    if (currentStep > 0) {
      updateStatus("Paused");
    }

    ui.lessonHint.textContent = mode === "learn"
      ? "Take your time. You can move through every step manually."
      : "Explore the algorithm at your own pace.";

    updatePlaybackControls();
  }

  ui.playButton.addEventListener("click", play);

  ui.next.addEventListener("click", () => {
    stop();
    nextStep();
  });

  ui.lessonNextButton.addEventListener("click", () => {
    stop();
    nextStep();
  });

  ui.previous.addEventListener("click", previousStep);
  ui.reset.addEventListener("click", reset);

  ui.progress.addEventListener("input", (event) => {
    stop();
    render(Number(event.target.value));
  });

  ui.speed.addEventListener("change", () => {
    if (playing) {
      stop();
      play();
    }
  });

  ui.size.addEventListener("input", (event) => {
    ui.sizeValue.textContent = event.target.value;
  });

  ui.size.addEventListener("change", (event) => {
    setArray(randomArray(Number(event.target.value)));
    showInputMessage("New random array generated.", "success");
  });

  ui.shuffle.addEventListener("click", () => {
    setArray(randomArray(originalArray.length));
    showInputMessage("Array shuffled successfully.", "success");
  });

  ui.apply.addEventListener("click", () => {
    const raw = ui.custom.value.trim();

    if (!raw) {
      showInputMessage("Please enter some numbers.", "error");
      return;
    }

    const parts = raw.split(",").map((value) => value.trim());

    if (parts.length < 2 || parts.length > 20) {
      showInputMessage("Enter between 2 and 20 numbers.", "error");
      return;
    }

    const values = parts.map(Number);

    if (
      parts.some((value) => value === "") ||
      values.some((value) => !Number.isFinite(value))
    ) {
      showInputMessage("Please enter valid comma-separated numbers.", "error");
      return;
    }

    setArray(values);
    showInputMessage("Your custom array is ready.", "success");
  });

  document.querySelectorAll(".mode-button").forEach((button) => {
    button.addEventListener("click", () => {
      setMode(button.dataset.mode);
    });
  });

  setupAiExplainer();
  buildTimeline();

  return {
    reset,
    play,
    nextStep,
    previousStep,
    setArray,
    setMode
  };
}

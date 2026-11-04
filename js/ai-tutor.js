(() => {
  const suggestions = [
    "What is happening right now?",
    "Why is this comparison necessary?",
    "What should I notice in the next step?"
  ];

  const root = document.createElement("aside");
  root.className = "ai-tutor";
  root.innerHTML = `
    <button class="ai-tutor-launch" type="button" aria-expanded="false" aria-controls="aiTutorPanel">
      <span class="ai-tutor-launch-mark">✦</span>
      <span>Tutor</span>
    </button>
    <section class="ai-tutor-panel" id="aiTutorPanel" aria-label="ALGOVIZ AI Tutor" hidden>
      <div class="ai-tutor-header">
        <div>
          <span class="ai-tutor-kicker">ALGOVIZ AI</span>
          <h2>Ask your tutor</h2>
          <p class="ai-tutor-context"></p>
        </div>
        <button class="ai-tutor-close" type="button" aria-label="Close tutor">×</button>
      </div>
      <div class="ai-tutor-messages" aria-live="polite"></div>
      <div class="ai-tutor-suggestions"></div>
      <form class="ai-tutor-form">
        <label class="sr-only" for="aiTutorInput">Ask the AI tutor</label>
        <textarea id="aiTutorInput" rows="2" maxlength="600" placeholder="Ask about this step..."></textarea>
        <div class="ai-tutor-form-footer">
          <span>Powered by Groq</span>
          <button type="submit">Send <span>↗</span></button>
        </div>
      </form>
      <button class="ai-tutor-clear" type="button">Clear conversation</button>
    </section>
  `;

  document.body.appendChild(root);

  const launch = root.querySelector(".ai-tutor-launch");
  const panel = root.querySelector(".ai-tutor-panel");
  const close = root.querySelector(".ai-tutor-close");
  const contextLabel = root.querySelector(".ai-tutor-context");
  const messagesElement = root.querySelector(".ai-tutor-messages");
  const suggestionsElement = root.querySelector(".ai-tutor-suggestions");
  const form = root.querySelector(".ai-tutor-form");
  const input = root.querySelector("#aiTutorInput");
  const sendButton = form.querySelector("button");
  const clearButton = root.querySelector(".ai-tutor-clear");
  let messages = [];
  let busy = false;

  function currentState() {
    return window.ALGOVIZ_STATE || {
      algorithm: "ALGOVIZ",
      category: "algorithm learning",
      step: { title: "The algorithm library", explanation: "The learner is exploring ALGOVIZ." },
      progress: "Library"
    };
  }

  function contextText() {
    const state = currentState();
    return state.algorithm && state.progress
      ? `${state.algorithm} · ${state.progress}`
      : "Explore the algorithm library";
  }

  function renderMessages() {
    messagesElement.innerHTML = "";

    if (!messages.length) {
      const welcome = document.createElement("div");
      welcome.className = "ai-tutor-welcome";
      welcome.textContent = "I can explain the current step, connect it to the pseudocode, or help you predict what happens next.";
      messagesElement.appendChild(welcome);
    }

    messages.forEach((message) => {
      const item = document.createElement("div");
      item.className = `ai-tutor-message ${message.role}`;
      item.textContent = message.content;
      messagesElement.appendChild(item);
    });

    messagesElement.scrollTop = messagesElement.scrollHeight;
  }

  function renderSuggestions() {
    suggestionsElement.innerHTML = "";
    suggestions.forEach((suggestion) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = suggestion;
      button.addEventListener("click", () => {
        input.value = suggestion;
        input.focus();
      });
      suggestionsElement.appendChild(button);
    });
  }

  function setOpen(open) {
    panel.hidden = !open;
    launch.setAttribute("aria-expanded", String(open));
    root.classList.toggle("is-open", open);
    if (open) {
      contextLabel.textContent = contextText();
      renderMessages();
      input.focus();
    }
  }

  function setBusy(value) {
    busy = value;
    input.disabled = value;
    sendButton.disabled = value;
    sendButton.innerHTML = value ? "Thinking..." : "Send <span>↗</span>";
  }

  async function askTutor(question) {
    const userMessage = { role: "user", content: question };
    messages.push(userMessage);
    renderMessages();
    setBusy(true);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: currentState(),
          messages
        })
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "The tutor could not respond.");
      }

      messages.push({ role: "assistant", content: result.response });
    } catch (error) {
      messages.push({
        role: "assistant",
        content: error.message.includes("Failed to fetch")
          ? "Start the Flask app to connect to the tutor."
          : error.message
      });
    } finally {
      setBusy(false);
      renderMessages();
      contextLabel.textContent = contextText();
    }
  }

  launch.addEventListener("click", () => setOpen(panel.hidden));
  close.addEventListener("click", () => setOpen(false));
  clearButton.addEventListener("click", () => {
    messages = [];
    renderMessages();
    input.focus();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question || busy) return;
    input.value = "";
    askTutor(question);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  renderSuggestions();
  renderMessages();
})();

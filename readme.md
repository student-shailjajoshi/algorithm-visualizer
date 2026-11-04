# ALGOVIZ

ALGOVIZ is an interactive algorithm-learning platform. It combines step-by-step visualizations, pseudocode highlighting, playback controls, custom input, live metrics, and a context-aware Groq AI Tutor.

## Features

- Bubble, Insertion, Selection, Merge, and Quick Sort visualizers
- Linear Search and Binary Search visualizers
- Learn and Explore playback modes
- Previous, next, reset, replay, speed, and progress controls
- Custom arrays, random data, and live statistics
- Responsive layouts for desktop, tablet, and mobile
- Floating AI Tutor with chat history and suggested questions
- Flask backend with secure server-side Groq requests

## Requirements

- Python 3.10 or newer
- A Groq API key for AI Tutor responses

## Setup

Create and activate the virtual environment:

```powershell
py -m venv .venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
python -m pip install -r requirements.txt
```

Create a local environment file:

```powershell
Copy-Item .env.example .env
```

Open `.env` and add a newly generated Groq key:

```dotenv
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=openai/gpt-oss-120b
```

Never commit `.env` or expose the API key in frontend code.

## Run

Start the Flask development server:

```powershell
python app.py
```

Open [http://127.0.0.1:5000](http://127.0.0.1:5000) in a browser.

## Project Structure

```text
app.py                       Flask server and Groq API routes
index.html                   Homepage
css/                         Shared and page-specific styles
js/app.js                    Homepage interactions
js/ai-tutor.js               Floating AI Tutor UI
js/visualizer-core.js        Sorting visualizer controller
js/search-core.js            Linear Search controller
js/algorithms/               Algorithm implementations and step generators
pages/sorting/               Sorting visualizer pages
pages/searching/             Searching visualizer pages
```

## AI Tutor

The Tutor sends the current algorithm context to Flask, including the algorithm name, data, target or range, current step, and progress. Flask forwards the request to Groq using the configured model and consumes the streamed response before returning it to the browser.

The API endpoint is:

```text
POST /api/tutor
```

The existing step explanation endpoint is also available at:

```text
POST /api/explain-step
```

## Algorithms

Sorting pages preserve the algorithm implementations in `js/algorithms/` and expose their generated execution timeline to the shared visualizer. Searching pages use their own search-specific rendering while publishing the same `window.ALGOVIZ_STATE` context contract for the AI Tutor.

## Security

- Keep API credentials in `.env` only.
- Do not place Groq keys in HTML or JavaScript.
- Revoke any key that has been accidentally shared or committed.
- The Flask backend limits request payload size and validates tutor input before calling Groq.

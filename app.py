import json
import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, abort, jsonify, request, send_from_directory
from groq import (
    Groq,
    APIConnectionError,
    APIStatusError,
    APITimeoutError,
    RateLimitError,
)

PROJECT_ROOT = Path(__file__).resolve().parent

load_dotenv(PROJECT_ROOT / ".env", override=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s:%(name)s:%(message)s"
)

logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 32 * 1024

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = "openai/gpt-oss-120b"

client = None

if GROQ_API_KEY:
    client = Groq(
        api_key=GROQ_API_KEY,
        timeout=30.0,
        max_retries=2,
    )
    logger.info("Groq initialized with model: %s", GROQ_MODEL)
else:
    logger.warning("GROQ_API_KEY is not configured.")


SYSTEM_PROMPT = """
You are an expert algorithms tutor helping beginners understand
how algorithms execute step by step.

Your job is to explain ONLY the current execution step.

Instructions:
- Explain exactly what is happening in the current step.
- Explain why this operation is being performed.
- Reference actual array values and indices where relevant.
- Use simple, natural, beginner-friendly language.
- Do not explain the entire algorithm.
- Never invent operations or results.
- Keep explanations concise (2-3 sentences).
- Do not use markdown headings.
- Avoid unnecessary introductions.
- Sound like a patient human tutor.
"""

TUTOR_SYSTEM_PROMPT = """
You are ALGOVIZ Tutor, a precise and encouraging algorithms teacher.
Use the supplied algorithm context and execution state as the source of truth.
Answer the learner's question directly in 2-4 concise sentences.
Reference concrete values, indices, targets, pivots, or ranges when present.
Never invent state that is not in the context. If the learner asks about a
different algorithm, explain the current one first and keep the answer short.
Do not use markdown headings.
"""


@app.route("/")
def home():
    return send_from_directory(PROJECT_ROOT, "index.html")


@app.post("/api/explain-step")
def explain_step():

    if not client:
        return jsonify(
            error="GROQ_API_KEY is not configured."
        ), 503

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify(
            error="Invalid JSON request."
        ), 400

    algorithm = data.get("algorithm", "sorting")
    array = data.get("array", [])
    step = data.get("step", {})

    if not isinstance(array, list):
        return jsonify(
            error="Array must be a list."
        ), 400

    if not isinstance(step, dict):
        return jsonify(
            error="Invalid step data."
        ), 400

    prompt = {
        "algorithm": str(algorithm)[:80],
        "array": array[:20],
        "step": {
            "title": str(step.get("title", ""))[:160],
            "explanation": str(step.get("explanation", ""))[:500],
            "next": str(step.get("next", ""))[:200],
            "comparisons": step.get("comparisons", 0),
            "swaps": step.get("swaps", 0),
        }
    }

    try:
        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": json.dumps(prompt)
                }
            ],
            temperature=1,
            max_completion_tokens=2048,
            top_p=1,
            reasoning_effort="medium",
            stream=True,
            stop=None
        )

        explanation = []

        for chunk in completion:
            if not chunk.choices:
                continue

            content = chunk.choices[0].delta.content

            if content:
                explanation.append(content)

        result = "".join(explanation).strip()

        if not result:
            logger.warning("Groq returned an empty explanation.")

            return jsonify(
                error="Groq returned no explanation."
            ), 502

        return jsonify(
            explanation=result
        )

    except RateLimitError:
        logger.warning("Groq rate limit reached.")

        return jsonify(
            error="AI service is busy. Please try again shortly."
        ), 429

    except APITimeoutError:
        logger.exception("Groq request timed out.")

        return jsonify(
            error="AI request timed out. Please try again."
        ), 504

    except APIConnectionError:
        logger.exception("Groq connection failed.")

        return jsonify(
            error="Unable to connect to Groq."
        ), 502

    except APIStatusError as exc:
        logger.error(
            "Groq API error: status=%s response=%s",
            exc.status_code,
            exc.response.text,
        )

        return jsonify(
            error="Groq API request failed.",
            status=exc.status_code,
        ), 502

    except Exception:
        logger.exception("Unexpected explanation generation error.")

        return jsonify(
            error="Something went wrong while generating the explanation."
        ), 500


@app.post("/api/tutor")
def tutor():

    if not client:
        return jsonify(error="GROQ_API_KEY is not configured."), 503

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify(error="Invalid JSON request."), 400

    context = data.get("context", {})
    history = data.get("messages", [])

    if not isinstance(context, dict) or not isinstance(history, list):
        return jsonify(error="Invalid tutor request."), 400

    safe_history = []
    for message in history[-8:]:
        if not isinstance(message, dict):
            continue

        role = message.get("role")
        content = message.get("content")

        if role in {"user", "assistant"} and isinstance(content, str):
            safe_history.append({
                "role": role,
                "content": content[:1200]
            })

    messages = [
        {
            "role": "system",
            "content": TUTOR_SYSTEM_PROMPT
        },
        {
            "role": "system",
            "content": "Current ALGOVIZ execution context:\n"
            + json.dumps(context)[:5000]
        },
        *safe_history,
    ]

    if not safe_history or safe_history[-1]["role"] != "user":
        return jsonify(error="Ask the tutor a question first."), 400

    try:
        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=messages,
            temperature=1,
            max_completion_tokens=2048,
            top_p=1,
            reasoning_effort="medium",
            stream=True,
            stop=None
        )

        response_parts = []

        for chunk in completion:
            if not chunk.choices:
                continue

            content = chunk.choices[0].delta.content

            if content:
                response_parts.append(content)

        response = "".join(response_parts).strip()

        if not response:
            return jsonify(error="Groq returned no tutor response."), 502

        return jsonify(response=response)

    except RateLimitError:
        return jsonify(error="AI service is busy. Please try again shortly."), 429
    except APITimeoutError:
        return jsonify(error="AI request timed out. Please try again."), 504
    except APIConnectionError:
        return jsonify(error="Unable to connect to Groq."), 502
    except APIStatusError as exc:
        logger.error("Groq tutor API error: status=%s", exc.status_code)
        return jsonify(error="Groq API request failed.", status=exc.status_code), 502
    except Exception:
        logger.exception("Unexpected tutor generation error.")
        return jsonify(error="Something went wrong while contacting the tutor."), 500


@app.route("/<path:requested_path>")
def serve_project_file(requested_path):

    requested_file = (PROJECT_ROOT / requested_path).resolve()

    if not requested_file.is_relative_to(PROJECT_ROOT):
        abort(403)

    if not requested_file.is_file():
        abort(404)

    return send_from_directory(
        PROJECT_ROOT,
        requested_path
    )


@app.errorhandler(413)
def request_too_large(_):
    return jsonify(
        error="Request payload is too large."
    ), 413


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
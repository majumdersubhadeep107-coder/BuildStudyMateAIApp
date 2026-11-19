#!/usr/bin/env python3
"""
StudyMate AI — Python Study Intelligence Engine
Provides keyword extraction, extractive note summarization, automatic flashcard
generation, multiple-choice quiz synthesis, study-plan scheduling, and SM-2
spaced repetition scoring.

Modes:
  1. Stdin/Stdout JSON IPC (used by Node.js gateway):
       echo '{"action":"analyze","title":"Backpropagation","notes":"..."}' | python3 studymate_engine.py
  2. Standalone HTTP API server:
       python3 studymate_engine.py --serve 8001
"""

from __future__ import annotations

import collections
import datetime
import json
import math
import platform
import re
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Any

STOPWORDS = {
    "the", "and", "for", "that", "with", "this", "from", "are", "was", "were",
    "have", "has", "had", "not", "but", "what", "all", "can", "when", "your",
    "more", "will", "into", "than", "then", "them", "these", "those", "their",
    "its", "also", "such", "used", "using", "each", "which", "where", "while",
    "between", "through", "during", "before", "after", "above", "below", "over",
    "under", "again", "further", "once", "here", "there", "because", "about",
    "into", "only", "other", "some", "very", "just", "most", "both", "does",
    "how", "why", "who", "whom", "being", "been", "same", "may", "might", "must",
    "shall", "should", "would", "could", "upon", "within", "without", "across",
}


def split_sentences(text: str) -> list[str]:
    cleaned = re.sub(r"\s+", " ", text.strip())
    if not cleaned:
        return []
    parts = re.split(r"(?<=[.!?])\s+(?=[A-Z0-9])", cleaned)
    result = [p.strip() for p in parts if len(p.strip()) >= 24]
    if not result and cleaned:
        return [cleaned]
    return result


def extract_keywords(text: str, top_k: int = 8) -> list[dict[str, Any]]:
    words = re.findall(r"\b[A-Za-z][A-Za-z0-9\-]{3,}\b", text)
    freq: collections.Counter[str] = collections.Counter()
    canonical: dict[str, str] = {}

    for word in words:
        low = word.lower()
        if low in STOPWORDS or low.isdigit():
            continue
        freq[low] += 1
        if low not in canonical or (word[0].isupper() and not canonical[low][0].isupper()):
            canonical[low] = word

    total = max(sum(freq.values()), 1)
    ranked = freq.most_common(top_k)
    return [
        {
            "term": canonical[k],
            "count": count,
            "salience": round(min(0.99, (count / total) * 4.2 + 0.18), 2),
        }
        for k, count in ranked
    ]


def summarize_notes(sentences: list[str], keywords: list[dict[str, Any]], max_sentences: int = 4) -> list[str]:
    if not sentences:
        return []
    kw_weights = {item["term"].lower(): item["salience"] for item in keywords}
    scored: list[tuple[float, int, str]] = []

    for idx, sentence in enumerate(sentences):
        tokens = re.findall(r"\b[A-Za-z][A-Za-z0-9\-]{3,}\b", sentence.lower())
        if not tokens:
            continue
        score = sum(kw_weights.get(tok, 0.0) for tok in tokens) / math.sqrt(len(tokens) + 3)
        if idx == 0:
            score += 0.25
        if ":" in sentence or "—" in sentence or " is " in sentence.lower():
            score += 0.12
        scored.append((score, idx, sentence))

    top = sorted(scored, key=lambda item: item[0], reverse=True)[:max_sentences]
    ordered = [s for _, _, s in sorted(top, key=lambda item: item[1])]
    return ordered


def build_flashcards(title: str, sentences: list[str], keywords: list[dict[str, Any]]) -> list[dict[str, Any]]:
    cards: list[dict[str, Any]] = []
    used_sentences: set[int] = set()

    # Pass 1: Definition-oriented sentences ("X is ...", "X refers to ...", "X: ...")
    def_pattern = re.compile(
        r"^([A-Z][A-Za-z0-9\s\-/\(\)]{2,48}?)\s*(?:is defined as|refers to|describes|is|means|:|—)\s+(.{20,})$"
    )
    for idx, sent in enumerate(sentences):
        match = def_pattern.match(sent)
        if match and len(cards) < 5:
            concept = match.group(1).strip(" -—:")
            explanation = match.group(2).strip()
            cards.append(
                {
                    "id": f"py-card-{len(cards) + 1}",
                    "front": f"In {title}, what is {concept} and how does it function?",
                    "back": sent if len(explanation) < 28 else explanation[0].upper() + explanation[1:],
                    "tag": concept[:26],
                    "difficulty": "Medium",
                }
            )
            used_sentences.add(idx)

    # Pass 2: Keyword-anchored active recall cards
    for kw in keywords:
        if len(cards) >= 6:
            break
        term = kw["term"]
        for idx, sent in enumerate(sentences):
            if idx in used_sentences:
                continue
            if re.search(rf"\b{re.escape(term)}\b", sent, re.IGNORECASE):
                cards.append(
                    {
                        "id": f"py-card-{len(cards) + 1}",
                        "front": f"Explain the role of {term} in {title}.",
                        "back": sent,
                        "tag": term,
                        "difficulty": "Core",
                    }
                )
                used_sentences.add(idx)
                break

    if not cards and sentences:
        cards.append(
            {
                "id": "py-card-1",
                "front": f"What is the primary takeaway from {title}?",
                "back": sentences[0],
                "tag": "Core Concept",
                "difficulty": "Core",
            }
        )
    return cards


def build_quiz(title: str, sentences: list[str], keywords: list[dict[str, Any]]) -> list[dict[str, Any]]:
    questions: list[dict[str, Any]] = []
    kw_terms = [k["term"] for k in keywords]
    fallback_distractors = ["Stochastic Drift", "Equilibrium Threshold", "Linear Approximation", "Boundary Constraint"]

    for idx, term in enumerate(kw_terms[:4]):
        target_sentence = next(
            (s for s in sentences if re.search(rf"\b{re.escape(term)}\b", s, re.IGNORECASE)),
            None,
        )
        if not target_sentence:
            continue
        masked = re.sub(rf"\b{re.escape(term)}\b", "________", target_sentence, count=1, flags=re.IGNORECASE)
        distractors = [t for t in kw_terms if t.lower() != term.lower()][:3]
        while len(distractors) < 3:
            candidate = fallback_distractors[len(distractors)]
            if candidate.lower() != term.lower() and candidate not in distractors:
                distractors.append(candidate)

        options = distractors[:3]
        correct_index = (idx * 2 + 1) % 4
        options.insert(correct_index, term)

        questions.append(
            {
                "id": f"py-quiz-{len(questions) + 1}",
                "question": f"Complete the concept from {title}: \"{masked}\"",
                "options": options,
                "correctIndex": correct_index,
                "explanation": f"\"{term}\" accurately completes the source principle: {target_sentence}",
            }
        )

    return questions


def sm2_schedule(quality: int, repetitions: int = 0, ease_factor: float = 2.5, interval_days: int = 1) -> dict[str, Any]:
    """SuperMemo SM-2 spaced repetition interval computation."""
    q = max(0, min(5, int(quality)))
    if q < 3:
        repetitions = 0
        next_interval = 1
    else:
        if repetitions == 0:
            next_interval = 1
        elif repetitions == 1:
            next_interval = 4
        else:
            next_interval = max(1, round(interval_days * ease_factor))
        repetitions += 1

    new_ease = max(1.3, ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
    return {
        "repetitions": repetitions,
        "easeFactor": round(new_ease, 2),
        "intervalDays": next_interval,
        "nextReviewLabel": "< 10 mins" if q < 3 else (f"{next_interval} day" if next_interval == 1 else f"{next_interval} days"),
    }


def tutor_reply(prompt: str, title: str, notes: str, mode: str = "direct") -> dict[str, Any]:
    sentences = split_sentences(notes)
    keywords = extract_keywords(notes, top_k=6)
    prompt_tokens = [
        w.lower()
        for w in re.findall(r"\b[A-Za-z][A-Za-z0-9\-]{2,}\b", prompt)
        if w.lower() not in STOPWORDS
    ]

    ranked: list[tuple[int, str]] = []
    for s in sentences:
        low_s = s.lower()
        hits = sum(2 if tok in low_s else 0 for tok in prompt_tokens)
        ranked.append((hits, s))

    best_matches = [s for hits, s in sorted(ranked, key=lambda x: x[0], reverse=True) if hits > 0][:3]
    if not best_matches:
        best_matches = summarize_notes(sentences, keywords, max_sentences=2)

    key_list = ", ".join(k["term"] for k in keywords[:4]) or title
    if mode == "socratic":
        answer = (
            f"Let's reason through **{title}** step by step.\n\n"
            f"1. **Anchor Principle:** {best_matches[0] if best_matches else 'Consider how the core variables interact.'}\n"
            f"2. **Guided Check:** Notice how **{key_list}** connect in your notes. "
            f"{best_matches[1] if len(best_matches) > 1 else 'If one constraint changes, how does the system respond?'}\n\n"
            f"**Your turn:** Based on that mechanism, how would you state the relationship in your own words before we test it with a flashcard?"
        )
    else:
        bullets = "\n".join(f"- {line}" for line in best_matches) or f"- Focus on the core definitions in {title}."
        answer = (
            f"Here is a synthesized breakdown from **{title}**:\n\n"
            f"{bullets}\n\n"
            f"**High-Yield Concepts:** {key_list}.\n"
            f"**Exam Tip:** Practice active recall on how each term modifies system behavior rather than memorizing isolated definitions."
        )

    return {
        "reply": answer,
        "citations": best_matches[:2],
        "keywords": keywords,
    }


def build_study_plan(title: str, exam_days: int, keywords: list[dict[str, Any]]) -> list[dict[str, Any]]:
    horizon = max(3, min(14, int(exam_days or 7)))
    terms = [k["term"] for k in keywords] or [title]
    stages = [
        ("Concept Encoding", f"Synthesize lecture notes on {', '.join(terms[:2])} and build summary map", 45),
        ("Active Recall Seeding", f"Complete first SM-2 flashcard pass covering {', '.join(terms[1:4] or terms[:2])}", 35),
        ("Problem & Quiz Drill", f"Run timed adaptive quiz on {title} and log error patterns", 50),
        ("Interleaved Review", f"Cross-link {', '.join(terms[:3])} with prior problem sets without open notes", 40),
        ("Exam Simulation", f"Full mastery check + rapid review of flagged {title} cards", 60),
    ]
    plan = []
    for i in range(min(horizon, len(stages))):
        stage_name, focus, minutes = stages[i]
        plan.append(
            {
                "day": f"Day {i + 1}",
                "phase": stage_name,
                "task": focus,
                "durationMinutes": minutes,
            }
        )
    return plan


def handle_payload(payload: dict[str, Any]) -> dict[str, Any]:
    action = payload.get("action", "analyze")
    title = str(payload.get("title") or "Course Notes").strip()
    notes = str(payload.get("notes") or "").strip()

    if action == "health":
        return {
            "ok": True,
            "engine": "StudyMate Python NLP & SM-2 Engine",
            "pythonVersion": platform.python_version(),
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }

    if action == "sm2":
        return {
            "ok": True,
            "engine": f"Python {platform.python_version()}",
            "schedule": sm2_schedule(
                quality=int(payload.get("quality", 4)),
                repetitions=int(payload.get("repetitions", 0)),
                ease_factor=float(payload.get("easeFactor", 2.5)),
                interval_days=int(payload.get("intervalDays", 1)),
            ),
        }

    if action == "tutor":
        result = tutor_reply(
            prompt=str(payload.get("prompt") or ""),
            title=title,
            notes=notes,
            mode=str(payload.get("mode") or "direct"),
        )
        return {
            "ok": True,
            "engine": f"Python {platform.python_version()}",
            **result,
        }

    sentences = split_sentences(notes)
    keywords = extract_keywords(notes, top_k=8)
    summary = summarize_notes(sentences, keywords, max_sentences=4)
    flashcards = build_flashcards(title, sentences, keywords)
    quiz = build_quiz(title, sentences, keywords)
    plan = build_study_plan(title, int(payload.get("examDays", 5)), keywords)
    word_count = len(re.findall(r"\S+", notes))

    return {
        "ok": True,
        "engine": f"Python {platform.python_version()} · StudyMate NLP",
        "title": title,
        "stats": {
            "wordCount": word_count,
            "sentenceCount": len(sentences),
            "estimatedReadMinutes": max(1, round(word_count / 190)),
            "generatedCards": len(flashcards),
            "generatedQuizItems": len(quiz),
        },
        "keywords": keywords,
        "summary": summary,
        "flashcards": flashcards,
        "quiz": quiz,
        "studyPlan": plan,
    }


class StudyMateHTTPHandler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, data: dict[str, Any]) -> None:
        encoded = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def do_OPTIONS(self) -> None:  # noqa: N802
        self._send_json(200, {"ok": True})

    def do_GET(self) -> None:  # noqa: N802
        self._send_json(200, handle_payload({"action": "health"}))

    def do_POST(self) -> None:  # noqa: N802
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
        try:
            payload = json.loads(raw)
            self._send_json(200, handle_payload(payload))
        except Exception as exc:  # noqa: BLE001
            self._send_json(400, {"ok": False, "error": str(exc)})


def main() -> None:
    if len(sys.argv) >= 2 and sys.argv[1] == "--serve":
        port = int(sys.argv[2]) if len(sys.argv) >= 3 else 8001
        server = HTTPServer(("127.0.0.1", port), StudyMateHTTPHandler)
        print(f"StudyMate Python Engine listening on http://127.0.0.1:{port}", flush=True)
        server.serve_forever()
        return

    raw_input = sys.stdin.read().strip()
    payload = json.loads(raw_input) if raw_input else {"action": "health"}
    output = handle_payload(payload)
    sys.stdout.write(json.dumps(output))


if __name__ == "__main__":
    main()

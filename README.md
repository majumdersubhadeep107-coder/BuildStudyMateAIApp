# StudyMate AI 📚

### Your learning companion for smarter and more organized studying.

StudyMate AI is an educational software project exploring how programming and lightweight natural-language processing can make studying more structured and interactive.

The project includes a React + TypeScript frontend scaffold, a Python study engine, a browser-side TypeScript engine, and a Node.js backend gateway.

> **Status:** Work in Progress 🚧

## ✨ Features

- 📝 **Smart Note Analysis** – Extract keywords and generate concise summaries.
- 🗂️ **Flashcard Generation** – Create active-recall flashcards from study notes.
- 🧠 **Quiz Generation** – Generate multiple-choice questions from learning material.
- 📅 **Study Planner** – Generate topic-focused revision plans.
- 🔁 **Spaced Repetition** – Calculate review intervals using the SM-2 algorithm.
- 🤖 **Study Assistant** – Explore direct and Socratic-style study guidance.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend |
| TypeScript | Application logic |
| Python | Study processing engine |
| Node.js | Backend gateway |
| Tailwind CSS | Styling |
| Vite | Development and build |
| Lucide React | Icons |

## 🧠 How It Works

StudyMate AI explores two study-engine implementations:

**Python Engine**
- Keyword extraction
- Extractive summarization
- Flashcard generation
- Quiz generation
- Study planning
- SM-2 scheduling

**TypeScript Engine**
- Browser-side study processing
- Local note analysis
- Typed study results
- API integration helpers

**Node.js Gateway**

Connects HTTP requests to the Python study engine.

*Note: Current processing is rule-based and extractive, not powered by a hosted generative-AI model.*

## 📂 Project Structure

```text
BuildStudyMateAIApp/
├── backend/
│   ├── node/
│   │   └── server.mjs
│   └── python/
│       └── studymate_engine.py
├── public/
│   └── standalone/
├── src/
│   ├── components/
│   ├── data/
│   ├── lib/
│   │   └── studyEngine.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── vite.config.ts
```

## 🚀 Getting Started

### Prerequisites
- Node.js compatible with Vite 8
- pnpm
- Python 3

### Installation

```bash
git clone https://github.com/majumdersubhadeep107-coder/BuildStudyMateAIApp.git

cd BuildStudyMateAIApp

pnpm install
```

### Run the frontend

```bash
pnpm dev
```

### Run the backend

```bash
node backend/node/server.mjs
```

The Node.js gateway runs on port 4050 by default.

### Production build

```bash
pnpm build
```

## 🗺️ Future Improvements

- [ ] Complete frontend and study-engine integration.
- [ ] Add user authentication.
- [ ] Add PDF note uploads.
- [ ] Implement personalized learning progress.
- [ ] Improve quiz generation.
- [ ] Add topic-wise performance tracking.
- [ ] Improve AI-powered tutoring capabilities.

## ⚠️ Project Notes

This is a student development project currently under active development. Some frontend screens and sample course data are demonstration content. Generated study material should be verified against original learning resources.

## 👨‍💻 Developer

**Subhadeep Majumder**

BCA Student | Siliguri Institute of Technology

- GitHub: [@majumdersubhadeep107-coder](https://github.com/majumdersubhadeep107-coder)
- LinkedIn: [Connect with me](https://www.linkedin.com/in/subhadeep-majumder-895384273/)

---

⭐ Learning, building, and improving one project at a time.

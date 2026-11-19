export interface KeywordSalience {
  term: string
  count: number
  salience: number
}

export interface GeneratedCard {
  id: string
  front: string
  back: string
  tag: string
  difficulty: 'Core' | 'Medium' | 'Advanced'
}

export interface GeneratedQuizItem {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface StudyPlanStep {
  day: string
  phase: string
  task: string
  durationMinutes: number
}

export interface RuntimeTelemetry {
  gateway: string
  pythonEngine: string
  latencyMs: number
  mode: 'node-python' | 'browser-js'
}

export interface StudyAnalysisResult {
  ok: boolean
  engine: string
  title: string
  stats: {
    wordCount: number
    sentenceCount: number
    estimatedReadMinutes: number
    generatedCards: number
    generatedQuizItems: number
  }
  keywords: KeywordSalience[]
  summary: string[]
  flashcards: GeneratedCard[]
  quiz: GeneratedQuizItem[]
  studyPlan: StudyPlanStep[]
  runtime: RuntimeTelemetry
}

export interface TutorReplyResult {
  ok: boolean
  reply: string
  citations: string[]
  keywords: KeywordSalience[]
  runtime: RuntimeTelemetry
}

export interface SM2Result {
  repetitions: number
  easeFactor: number
  intervalDays: number
  nextReviewLabel: string
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'that', 'with', 'this', 'from', 'are', 'was', 'were',
  'have', 'has', 'had', 'not', 'but', 'what', 'all', 'can', 'when', 'your',
  'more', 'will', 'into', 'than', 'then', 'them', 'these', 'those', 'their',
  'its', 'also', 'such', 'used', 'using', 'each', 'which', 'where', 'while',
  'between', 'through', 'during', 'before', 'after', 'above', 'below', 'over',
  'under', 'again', 'further', 'once', 'here', 'there', 'because', 'about',
  'only', 'other', 'some', 'very', 'just', 'most', 'both', 'does', 'how',
  'why', 'who', 'whom', 'being', 'been', 'same', 'may', 'might', 'must',
  'shall', 'should', 'would', 'could', 'upon', 'within', 'without', 'across',
])

function apiEndpoint(subpath: string): string {
  const base = import.meta.env.BASE_URL || '/'
  return `${base.endsWith('/') ? base : `${base}/`}api/study/${subpath}`
}

export function computeSM2Local(
  quality: number,
  repetitions = 0,
  easeFactor = 2.5,
  intervalDays = 1,
): SM2Result {
  const q = Math.max(0, Math.min(5, Math.round(quality)))
  let nextReps = repetitions
  let nextInterval = 1

  if (q < 3) {
    nextReps = 0
    nextInterval = 1
  } else {
    if (repetitions === 0) nextInterval = 1
    else if (repetitions === 1) nextInterval = 4
    else nextInterval = Math.max(1, Math.round(intervalDays * easeFactor))
    nextReps = repetitions + 1
  }

  const nextEase = Math.max(1.3, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
  return {
    repetitions: nextReps,
    easeFactor: Math.round(nextEase * 100) / 100,
    intervalDays: nextInterval,
    nextReviewLabel: q < 3 ? '< 10 mins' : nextInterval === 1 ? '1 day' : `${nextInterval} days`,
  }
}

function splitSentencesLocal(text: string): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (!cleaned) return []
  const parts = cleaned
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 24)
  return parts.length > 0 ? parts : [cleaned]
}

function extractKeywordsLocal(text: string, topK = 8): KeywordSalience[] {
  const matches = text.match(/\b[A-Za-z][A-Za-z0-9-]{3,}\b/g) ?? []
  const counts = new Map<string, number>()
  const canonical = new Map<string, string>()

  for (const word of matches) {
    const low = word.toLowerCase()
    if (STOPWORDS.has(low) || /^\d+$/.test(low)) continue
    counts.set(low, (counts.get(low) ?? 0) + 1)
    const prev = canonical.get(low)
    if (!prev || (word[0] === word[0].toUpperCase() && prev[0] !== prev[0].toUpperCase())) {
      canonical.set(low, word)
    }
  }

  let total = 0
  counts.forEach((v) => {
    total += v
  })
  total = Math.max(total, 1)

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([key, count]) => ({
      term: canonical.get(key) ?? key,
      count,
      salience: Math.round(Math.min(0.99, (count / total) * 4.2 + 0.18) * 100) / 100,
    }))
}

function analyzeNotesLocal(title: string, notes: string, examDays = 5): StudyAnalysisResult {
  const t0 = performance.now()
  const sentences = splitSentencesLocal(notes)
  const keywords = extractKeywordsLocal(notes, 8)
  const kwMap = new Map(keywords.map((k) => [k.term.toLowerCase(), k.salience]))

  const scored = sentences.map((sentence, idx) => {
    const words = sentence.toLowerCase().match(/\b[A-Za-z][A-Za-z0-9-]{3,}\b/g) ?? []
    const base = words.reduce((acc, w) => acc + (kwMap.get(w) ?? 0), 0) / Math.sqrt(words.length + 3)
    return { idx, sentence, score: base + (idx === 0 ? 0.25 : 0) }
  })

  const summary = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .sort((a, b) => a.idx - b.idx)
    .map((item) => item.sentence)

  const flashcards: GeneratedCard[] = keywords.slice(0, 5).map((kw, idx) => {
    const matchedSentence =
      sentences.find((s) => s.toLowerCase().includes(kw.term.toLowerCase())) ?? sentences[0] ?? notes
    return {
      id: `js-card-${Date.now()}-${idx}`,
      front: `Explain the role and mechanism of ${kw.term} in ${title}.`,
      back: matchedSentence,
      tag: kw.term,
      difficulty: idx % 2 === 0 ? 'Core' : 'Medium',
    }
  })

  const fallbacks = ['Equilibrium Drift', 'Stochastic Constraint', 'Linear Projection', 'Threshold Decay']
  const kwTerms = keywords.map((k) => k.term)
  const quiz: GeneratedQuizItem[] = kwTerms.slice(0, 4).map((term, idx) => {
    const target =
      sentences.find((s) => s.toLowerCase().includes(term.toLowerCase())) ?? sentences[0] ?? title
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const masked = target.replace(new RegExp(`\\b${escaped}\\b`, 'i'), '________')
    const distractors = kwTerms.filter((t) => t.toLowerCase() !== term.toLowerCase()).slice(0, 3)
    while (distractors.length < 3) {
      const cand = fallbacks[distractors.length]
      if (!distractors.includes(cand)) distractors.push(cand)
    }
    const correctIndex = (idx * 2 + 1) % 4
    const options = [...distractors]
    options.splice(correctIndex, 0, term)
    return {
      id: `js-quiz-${Date.now()}-${idx}`,
      question: `Complete the principle from ${title}: "${masked}"`,
      options,
      correctIndex,
      explanation: `"${term}" completes the source statement: ${target}`,
    }
  })

  const terms = kwTerms.length > 0 ? kwTerms : [title]
  const stages: [string, string, number][] = [
    ['Concept Encoding', `Synthesize lecture notes on ${terms.slice(0, 2).join(', ')}`, 45],
    ['Active Recall Seeding', `First SM-2 flashcard pass covering ${terms.slice(1, 4).join(', ') || title}`, 35],
    ['Adaptive Quiz Drill', `Timed conceptual quiz on ${title} + error log`, 50],
    ['Interleaved Synthesis', `Connect ${terms.slice(0, 3).join(', ')} across problem sets`, 40],
    ['Exam Simulation', `Closed-book mastery check on ${title}`, 60],
  ]
  const horizon = Math.max(3, Math.min(5, examDays))
  const studyPlan: StudyPlanStep[] = stages.slice(0, horizon).map(([phase, task, durationMinutes], i) => ({
    day: `Day ${i + 1}`,
    phase,
    task,
    durationMinutes,
  }))

  const wordCount = (notes.trim().match(/\S+/g) ?? []).length

  return {
    ok: true,
    engine: 'Browser Isomorphic JS NLP Engine',
    title,
    stats: {
      wordCount,
      sentenceCount: sentences.length,
      estimatedReadMinutes: Math.max(1, Math.round(wordCount / 190)),
      generatedCards: flashcards.length,
      generatedQuizItems: quiz.length,
    },
    keywords,
    summary,
    flashcards,
    quiz,
    studyPlan,
    runtime: {
      gateway: 'Browser ES2024 Runtime',
      pythonEngine: 'Isomorphic JS Fallback',
      latencyMs: Math.max(0.4, Math.round((performance.now() - t0) * 10) / 10),
      mode: 'browser-js',
    },
  }
}

export async function checkBackendHealth(): Promise<{
  online: boolean
  gateway: string
  pythonVersion: string
  latencyMs: number
}> {
  const startedAt = performance.now()
  try {
    const res = await fetch(apiEndpoint('health'))
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (data?.ok) {
      return {
        online: true,
        gateway: data.runtime?.gateway ?? 'Node.js Gateway',
        pythonVersion: data.pythonVersion ? `Python ${data.pythonVersion}` : 'Python 3',
        latencyMs: data.runtime?.latencyMs ?? Math.round((performance.now() - startedAt) * 10) / 10,
      }
    }
  } catch {
    // Graceful fallback when running as static build
  }
  return {
    online: false,
    gateway: 'Isomorphic Browser JS',
    pythonVersion: 'Local SM-2 + NLP Engine',
    latencyMs: 0.8,
  }
}

export async function analyzeStudyNotes(
  title: string,
  notes: string,
  examDays = 5,
): Promise<StudyAnalysisResult> {
  try {
    const res = await fetch(apiEndpoint('analyze'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'analyze', title, notes, examDays }),
    })
    if (res.ok) {
      const data = await res.json()
      if (data?.ok) {
        return {
          ...data,
          flashcards: (data.flashcards ?? []).map((c: GeneratedCard, idx: number) => ({
            ...c,
            id: `${c.id || 'py-card'}-${Date.now()}-${idx}`,
            difficulty:
              c.difficulty === 'Core' || c.difficulty === 'Medium' || c.difficulty === 'Advanced'
                ? c.difficulty
                : 'Core',
          })),
          quiz: (data.quiz ?? []).map((q: GeneratedQuizItem, idx: number) => ({
            ...q,
            id: `${q.id || 'py-quiz'}-${Date.now()}-${idx}`,
          })),
          runtime: {
            gateway: data.runtime?.gateway ?? 'Node.js',
            pythonEngine: data.engine ?? 'Python 3',
            latencyMs: data.runtime?.latencyMs ?? 12,
            mode: 'node-python',
          },
        }
      }
    }
  } catch {
    // Fall back to local engine
  }
  return analyzeNotesLocal(title, notes, examDays)
}

export async function askStudyTutor(
  prompt: string,
  title: string,
  notes: string,
  mode: 'direct' | 'socratic',
): Promise<TutorReplyResult> {
  try {
    const res = await fetch(apiEndpoint('analyze'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'tutor', prompt, title, notes, mode }),
    })
    if (res.ok) {
      const data = await res.json()
      if (data?.ok) {
        return {
          ok: true,
          reply: data.reply,
          citations: data.citations ?? [],
          keywords: data.keywords ?? [],
          runtime: {
            gateway: data.runtime?.gateway ?? 'Node.js',
            pythonEngine: data.engine ?? 'Python 3',
            latencyMs: data.runtime?.latencyMs ?? 10,
            mode: 'node-python',
          },
        }
      }
    }
  } catch {
    // Local fallback
  }

  const local = analyzeNotesLocal(title, notes)
  const topKeywords = local.keywords.slice(0, 4).map((k) => k.term)
  const citations = local.summary.slice(0, 2)
  const reply =
    mode === 'socratic'
      ? `Let's unpack **${title}** together.\n\n1. **Core Anchor:** ${citations[0] ?? 'Focus on the primary mechanism in your notes.'}\n2. **Key Interaction:** Notice how **${topKeywords.join(', ')}** reinforce one another.\n\n**Guided Question:** If one of those constraints shifts, how would the downstream output respond?`
      : `Here is a synthesized breakdown from **${title}**:\n\n${citations.map((c) => `- ${c}`).join('\n')}\n\n**High-Yield Terms:** ${topKeywords.join(', ')}.\n**Study Tip:** Convert this relationship into an active-recall card to lock in long-term retention.`

  return {
    ok: true,
    reply,
    citations,
    keywords: local.keywords,
    runtime: local.runtime,
  }
}

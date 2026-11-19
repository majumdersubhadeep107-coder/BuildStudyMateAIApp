import React, { useEffect, useRef, useState } from 'react'
import {
  BookmarkPlus,
  Bot,
  Check,
  FileText,
  Layers,
  Loader2,
  Send,
  Sparkles,
  Target,
  Upload,
  Wand2,
} from 'lucide-react'
import type { Course, FlashcardItem, NavSection, QuizQuestion } from '../data/studyData'
import {
  analyzeStudyNotes,
  askStudyTutor,
  type StudyAnalysisResult,
} from '../lib/studyEngine'

interface ChatMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
  citations?: string[]
  engineBadge?: string
  savedAsCard?: boolean
}

interface CopilotViewProps {
  courses: Course[]
  selectedCourse: Course
  onSelectCourseId: (courseId: string) => void
  initialPrompt?: string | null
  onClearInitialPrompt: () => void
  onAddFlashcards: (cards: Omit<FlashcardItem, 'id'>[]) => void
  onAddQuizQuestions: (questions: QuizQuestion[]) => void
  onNavigate: (nav: NavSection) => void
  isDark: boolean
}

export const CopilotView: React.FC<CopilotViewProps> = ({
  courses,
  selectedCourse,
  onSelectCourseId,
  initialPrompt,
  onClearInitialPrompt,
  onAddFlashcards,
  onAddQuizQuestions,
  onNavigate,
  isDark,
}) => {
  const [noteTitle, setNoteTitle] = useState(selectedCourse.lectureTitle)
  const [noteBody, setNoteBody] = useState(selectedCourse.lectureNotes)
  const [analysis, setAnalysis] = useState<StudyAnalysisResult | null>(null)
  const [isSynthesizing, setIsSynthesizing] = useState(false)
  const [activeOutputTab, setActiveOutputTab] = useState<'summary' | 'cards' | 'plan'>('summary')
  const [cardsSaved, setCardsSaved] = useState(false)
  const [quizSaved, setQuizSaved] = useState(false)

  const [tutorMode, setTutorMode] = useState<'direct' | 'socratic'>('direct')
  const [chatInput, setChatInput] = useState('')
  const [isTutorThinking, setIsTutorThinking] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Loaded **${selectedCourse.code}: ${selectedCourse.lectureTitle}**.\n\nAsk me to clarify any equation or mechanism, switch to **Socratic Mode** for guided exam coaching, or click **Synthesize Notes** on the left to run our Python + Node.js study pipeline.`,
      engineBadge: 'StudyMate AI Tutor',
    },
  ])

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  // Sync course notes when selectedCourse changes
  useEffect(() => {
    setNoteTitle(selectedCourse.lectureTitle)
    setNoteBody(selectedCourse.lectureNotes)
    setCardsSaved(false)
    setQuizSaved(false)
    void runSynthesis(selectedCourse.lectureTitle, selectedCourse.lectureNotes, selectedCourse.examDaysAway)
  }, [selectedCourse.id])

  // Auto-run initialPrompt when navigated from Dashboard
  useEffect(() => {
    if (initialPrompt) {
      const promptToRun = initialPrompt
      onClearInitialPrompt()
      void sendTutorMessage(promptToRun)
    }
  }, [initialPrompt])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function runSynthesis(title: string, body: string, examDays = 5) {
    if (!body.trim()) return
    setIsSynthesizing(true)
    setCardsSaved(false)
    setQuizSaved(false)
    try {
      const res = await analyzeStudyNotes(title, body, examDays)
      setAnalysis(res)
    } finally {
      setIsSynthesizing(false)
    }
  }

  async function sendTutorMessage(promptText: string) {
    const clean = promptText.trim()
    if (!clean) return
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: clean,
    }
    setMessages((prev) => [...prev, userMsg])
    setChatInput('')
    setIsTutorThinking(true)

    try {
      const response = await askStudyTutor(clean, noteTitle, noteBody, tutorMode)
      const botMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        citations: response.citations,
        engineBadge: `${response.runtime.gateway} · ${response.runtime.pythonEngine} (${response.runtime.latencyMs}ms)`,
      }
      setMessages((prev) => [...prev, botMsg])
    } finally {
      setIsTutorThinking(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      const nextTitle = file.name.replace(/\.[^.]+$/, '')
      setNoteTitle(nextTitle)
      setNoteBody(text)
      void runSynthesis(nextTitle, text, selectedCourse.examDaysAway)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleSaveGeneratedCards = () => {
    if (!analysis || analysis.flashcards.length === 0 || cardsSaved) return
    onAddFlashcards(
      analysis.flashcards.map((c) => ({
        courseId: selectedCourse.id,
        front: c.front,
        back: c.back,
        tag: c.tag,
        difficulty: c.difficulty,
        repetitions: 0,
        easeFactor: 2.5,
        intervalDays: 1,
        dueToday: true,
      })),
    )
    setCardsSaved(true)
  }

  const handlePushGeneratedQuiz = () => {
    if (!analysis || analysis.quiz.length === 0 || quizSaved) return
    onAddQuizQuestions(
      analysis.quiz.map((q, idx) => ({
        id: `gen-q-${Date.now()}-${idx}`,
        courseId: selectedCourse.id,
        topic: noteTitle,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      })),
    )
    setQuizSaved(true)
  }

  const saveMessageAsFlashcard = (msgId: string, content: string) => {
    onAddFlashcards([
      {
        courseId: selectedCourse.id,
        front: `Key Insight from ${selectedCourse.code}: ${noteTitle}`,
        back: content.replace(/\*\*/g, '').slice(0, 340),
        tag: 'AI Tutor Note',
        difficulty: 'Core',
        repetitions: 0,
        easeFactor: 2.5,
        intervalDays: 1,
        dueToday: true,
      },
    ])
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, savedAsCard: true } : m)))
  }

  const cardSurface = isDark
    ? 'bg-[#151821] border-[#232838] text-[#F3F4F6]'
    : 'bg-white border-[#E6E4DD] text-[#14151A]'
  const subtleText = isDark ? 'text-slate-400' : 'text-[#5C606B]'
  const wordCount = (noteBody.trim().match(/\S+/g) ?? []).length

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-7 py-6 space-y-5">
      {/* Course Context Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {courses.map((course) => {
            const active = course.id === selectedCourse.id
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => onSelectCourseId(course.id)}
                className={`px-3.5 py-1.5 rounded-xl text-[12.5px] font-semibold border transition-all flex items-center gap-2 ${
                  active
                    ? 'text-white border-transparent shadow-xs'
                    : isDark
                      ? 'bg-[#151821] border-[#252B3D] text-slate-300 hover:border-slate-500'
                      : 'bg-white border-[#E6E4DD] text-[#4B4F5C] hover:border-[#CFCBC1]'
                }`}
                style={active ? { backgroundColor: course.accentHex } : undefined}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: active ? '#FFFFFF' : course.accentHex }}
                />
                <span className="font-mono">{course.code}</span>
                <span className="hidden sm:inline">· {course.title}</span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`px-3 py-1.5 rounded-xl border text-[12.5px] font-semibold inline-flex items-center gap-1.5 ${
              isDark
                ? 'bg-[#151821] border-[#262C3D] text-slate-200 hover:border-[#3B4FE4]'
                : 'bg-white border-[#E6E4DD] text-[#14151A] hover:border-[#3B4FE4]'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-[#3B4FE4]" />
            <span>Import .txt / .md Notes</span>
          </button>
        </div>
      </div>

      {/* Split Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Course Notes Editor + Live Python/Node Synthesis */}
        <div className="lg:col-span-7 space-y-5">
          <div className={`rounded-2xl border p-5 space-y-4 ${cardSurface}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#3B4FE4]" />
                <span className="text-[13px] font-bold uppercase tracking-wider text-[#3B4FE4] dark:text-[#8E9BFF]">
                  Source Lecture Notes
                </span>
              </div>
              <span className={`font-mono text-[11.5px] ${subtleText}`}>
                {wordCount} words · ~{Math.max(1, Math.round(wordCount / 190))} min read
              </span>
            </div>

            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Lecture or chapter title..."
              className={`w-full px-3.5 py-2 rounded-xl border font-semibold text-[14.5px] outline-none ${
                isDark
                  ? 'bg-[#0F121A] border-[#252C3F] focus:border-[#3B4FE4]'
                  : 'bg-[#FAF9F6] border-[#E6E4DD] focus:border-[#3B4FE4]'
              }`}
            />

            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              rows={8}
              placeholder="Paste lecture notes, textbook excerpts, or syllabus topics here..."
              className={`w-full p-3.5 rounded-xl border text-[13.5px] leading-relaxed outline-none resize-y ${
                isDark
                  ? 'bg-[#0F121A] border-[#252C3F] focus:border-[#3B4FE4]'
                  : 'bg-[#FAF9F6] border-[#E6E4DD] focus:border-[#3B4FE4]'
              }`}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                disabled={isSynthesizing}
                onClick={() => runSynthesis(noteTitle, noteBody, selectedCourse.examDaysAway)}
                className="px-4 py-2.5 rounded-xl bg-[#3B4FE4] hover:bg-[#2E40CE] disabled:opacity-60 text-white text-[13px] font-semibold inline-flex items-center gap-2 transition-colors"
              >
                {isSynthesizing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                <span>{isSynthesizing ? 'Synthesizing...' : 'Synthesize Notes with AI'}</span>
              </button>

              {analysis && (
                <span className={`font-mono text-[11px] ${subtleText}`}>
                  Engine: {analysis.runtime.gateway} &rarr; {analysis.runtime.pythonEngine} (
                  {analysis.runtime.latencyMs}ms)
                </span>
              )}
            </div>
          </div>

          {/* AI Synthesis Output Tabs */}
          {analysis && (
            <div className={`rounded-2xl border p-5 space-y-4 ${cardSurface}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-inherit pb-3.5">
                <div className="flex items-center gap-1.5">
                  {[
                    { id: 'summary' as const, label: 'Executive Summary' },
                    {
                      id: 'cards' as const,
                      label: `Extracted Cards (${analysis.flashcards.length})`,
                    },
                    { id: 'plan' as const, label: `${analysis.studyPlan.length}-Day Study Plan` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveOutputTab(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-[12.5px] font-semibold transition-colors ${
                        activeOutputTab === tab.id
                          ? 'bg-[#3B4FE4] text-white'
                          : isDark
                            ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                            : 'text-[#5C606B] hover:bg-[#F4F3EE] hover:text-[#14151A]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePushGeneratedQuiz}
                    className={`px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold border inline-flex items-center gap-1.5 ${
                      quizSaved
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : isDark
                          ? 'border-[#283044] hover:border-[#3B4FE4] text-slate-200'
                          : 'border-[#E6E4DD] hover:border-[#3B4FE4] text-[#14151A]'
                    }`}
                  >
                    {quizSaved ? <Check className="w-3.5 h-3.5" /> : <Target className="w-3.5 h-3.5 text-[#3B4FE4]" />}
                    <span>{quizSaved ? 'Added to Quiz Lab' : 'Send to Quiz Lab'}</span>
                  </button>
                  {quizSaved && (
                    <button
                      type="button"
                      onClick={() => onNavigate('quiz')}
                      className="text-[11.5px] font-semibold text-[#3B4FE4] hover:underline"
                    >
                      Open &rarr;
                    </button>
                  )}
                </div>
              </div>

              {/* High-Salience Extracted Keywords */}
              <div>
                <div className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${subtleText}`}>
                  High-Salience Concepts
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.keywords.map((kw) => (
                    <span
                      key={kw.term}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium ${
                        isDark ? 'bg-[#1E2436] text-indigo-300' : 'bg-[#EEF0FF] text-[#2C3EC9]'
                      }`}
                    >
                      <span>{kw.term}</span>
                      <span className="font-mono text-[10.5px] opacity-75">
                        {Math.round(kw.salience * 100)}%
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {activeOutputTab === 'summary' && (
                <ul className="space-y-2.5 pt-1">
                  {analysis.summary.map((point, idx) => (
                    <li
                      key={idx}
                      className={`p-3 rounded-xl border text-[13.5px] leading-relaxed flex gap-3 ${
                        isDark ? 'bg-[#10131C] border-[#22283A]' : 'bg-[#FAF9F6] border-[#ECEAE2]'
                      }`}
                    >
                      <span className="font-mono text-[11.5px] font-bold text-[#3B4FE4] mt-0.5">
                        0{idx + 1}
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}

              {activeOutputTab === 'cards' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[12.5px] ${subtleText}`}>
                      Ready for SM-2 active recall scheduling in <strong>{selectedCourse.code}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveGeneratedCards}
                        className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold inline-flex items-center gap-1.5 ${
                          cardsSaved
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#3B4FE4] hover:bg-[#2F42D1] text-white'
                        }`}
                      >
                        {cardsSaved ? <Check className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
                        <span>{cardsSaved ? 'Saved to Deck!' : 'Save All to SM-2 Deck'}</span>
                      </button>
                      {cardsSaved && (
                        <button
                          type="button"
                          onClick={() => onNavigate('flashcards')}
                          className="text-[12px] font-semibold text-[#3B4FE4] hover:underline"
                        >
                          Study Now &rarr;
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {analysis.flashcards.map((card) => (
                      <div
                        key={card.id}
                        className={`p-3.5 rounded-xl border space-y-1.5 ${
                          isDark ? 'bg-[#10131C] border-[#22283A]' : 'bg-[#FAF9F6] border-[#ECEAE2]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-[13px]">Q: {card.front}</span>
                          <span className="font-mono text-[10.5px] px-2 py-0.5 rounded bg-[#3B4FE4]/12 text-[#3B4FE4] dark:text-[#8E9BFF] shrink-0">
                            {card.tag}
                          </span>
                        </div>
                        <p className={`text-[12.5px] leading-relaxed ${subtleText}`}>A: {card.back}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeOutputTab === 'plan' && (
                <div className="space-y-2">
                  {analysis.studyPlan.map((step) => (
                    <div
                      key={step.day}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 ${
                        isDark ? 'bg-[#10131C] border-[#22283A]' : 'bg-[#FAF9F6] border-[#ECEAE2]'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11.5px] font-bold text-[#3B4FE4]">
                            {step.day}
                          </span>
                          <span className="text-[13px] font-semibold">{step.phase}</span>
                        </div>
                        <p className={`text-[12.5px] ${subtleText}`}>{step.task}</p>
                      </div>
                      <span className="font-mono text-[11.5px] px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/8 shrink-0">
                        {step.durationMinutes} min
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: StudyMate Conversational AI Tutor */}
        <div className={`lg:col-span-5 rounded-2xl border flex flex-col h-[680px] ${cardSurface}`}>
          {/* Tutor Header */}
          <div className="p-4 border-b border-inherit flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#3B4FE4] text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold leading-tight">StudyMate AI Tutor</h3>
                <p className={`text-[11.5px] ${subtleText}`}>Grounded in active {selectedCourse.code} notes</p>
              </div>
            </div>

            {/* Direct vs Socratic Toggle */}
            <div
              className={`p-1 rounded-xl border flex items-center text-[11.5px] font-semibold ${
                isDark ? 'bg-[#0F121A] border-[#252C3F]' : 'bg-[#F6F5F0] border-[#E6E4DD]'
              }`}
            >
              <button
                type="button"
                onClick={() => setTutorMode('direct')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  tutorMode === 'direct' ? 'bg-[#3B4FE4] text-white' : subtleText
                }`}
              >
                Direct
              </button>
              <button
                type="button"
                onClick={() => setTutorMode('socratic')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  tutorMode === 'socratic' ? 'bg-[#3B4FE4] text-white' : subtleText
                }`}
              >
                Socratic
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-[#3B4FE4] text-white'
                      : isDark
                        ? 'bg-[#10131C] border border-[#23293B] text-slate-100'
                        : 'bg-[#FAF9F5] border border-[#E8E6DF] text-[#14151A]'
                  }`}
                >
                  {msg.content}

                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2.5 pt-2.5 border-t border-black/8 dark:border-white/10 space-y-1">
                      <div className="font-mono text-[10px] uppercase tracking-wider opacity-65">
                        Note Citations
                      </div>
                      {msg.citations.map((cit, i) => (
                        <div key={i} className="text-[11.5px] opacity-80 italic line-clamp-2">
                          "{cit}"
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-3 mt-1 px-1">
                    {msg.engineBadge && (
                      <span className={`font-mono text-[10px] ${subtleText}`}>{msg.engineBadge}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => saveMessageAsFlashcard(msg.id, msg.content)}
                      disabled={msg.savedAsCard}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3B4FE4] dark:text-[#8E9BFF] hover:underline disabled:opacity-60"
                    >
                      <BookmarkPlus className="w-3 h-3" />
                      <span>{msg.savedAsCard ? 'Saved to Deck' : 'Save as Card'}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {isTutorThinking && (
              <div className="flex items-center gap-2 text-[12.5px] px-3 py-2 text-[#3B4FE4]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing explanation from course notes...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Tutor Prompts + Input */}
          <div className="p-3.5 border-t border-inherit space-y-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {[
                'Give me an exam-style practice question',
                'Summarize the core intuition in 3 bullets',
                'What is the most common exam pitfall here?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void sendTutorMessage(suggestion)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors ${
                    isDark
                      ? 'bg-[#10131C] border-[#252C3F] text-slate-300 hover:border-[#3B4FE4]'
                      : 'bg-[#F8F7F3] border-[#E6E4DD] text-[#4B4F5C] hover:border-[#3B4FE4]'
                  }`}
                >
                  <Sparkles className="w-3 h-3 inline mr-1 text-[#3B4FE4]" />
                  {suggestion}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                void sendTutorMessage(chatInput)
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Ask ${tutorMode === 'socratic' ? 'for Socratic coaching' : 'any question'} about ${selectedCourse.code}...`}
                className={`flex-1 text-[13px] px-3.5 py-2.5 rounded-xl border outline-none ${
                  isDark
                    ? 'bg-[#0F121A] border-[#252C3F] focus:border-[#3B4FE4]'
                    : 'bg-[#FAF9F6] border-[#E6E4DD] focus:border-[#3B4FE4]'
                }`}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isTutorThinking}
                className="p-2.5 rounded-xl bg-[#3B4FE4] hover:bg-[#2F42D1] disabled:opacity-50 text-white transition-colors"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

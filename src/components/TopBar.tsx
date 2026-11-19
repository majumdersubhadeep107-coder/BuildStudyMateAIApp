import React, { useEffect, useState } from 'react'
import {
  BookOpen,
  Layers,
  Menu,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Sun,
  Timer,
  X,
} from 'lucide-react'
import type { Course, FlashcardItem, NavSection, StudyTask } from '../data/studyData'

interface TopBarProps {
  activeNav: NavSection
  onSelectNav: (nav: NavSection) => void
  courses: Course[]
  selectedCourse: Course
  onSelectCourseId: (id: string) => void
  flashcards: FlashcardItem[]
  tasks: StudyTask[]
  pomodoroSeconds: number
  pomodoroRunning: boolean
  onTogglePomodoro: () => void
  onResetPomodoro: () => void
  isDark: boolean
  onToggleDark: () => void
  onOpenMobileMenu: () => void
}

const SECTION_TITLES: Record<NavSection, { title: string; subtitle: string }> = {
  dashboard: { title: 'Academic Overview', subtitle: 'Coursework mastery, schedule & study telemetry' },
  copilot: { title: 'AI Study Copilot', subtitle: 'Synthesize notes, ask tutor & generate study materials' },
  flashcards: { title: 'SM-2 Spaced Repetition', subtitle: 'Active recall cards calibrated to memory decay' },
  quiz: { title: 'Adaptive Quiz Lab', subtitle: 'Exam-grade conceptual checks with instant rationales' },
  planner: { title: 'Focus & Syllabus Planner', subtitle: 'Pomodoro deep work sessions & coursework board' },
  stack: {
    title: 'Python + Node.js + HTML/JS Stack',
    subtitle: 'Live backend API playground & downloadable source modules',
  },
}

export const TopBar: React.FC<TopBarProps> = ({
  activeNav,
  onSelectNav,
  courses,
  selectedCourse,
  onSelectCourseId,
  flashcards,
  tasks,
  pomodoroSeconds,
  pomodoroRunning,
  onTogglePomodoro,
  onResetPomodoro,
  isDark,
  onToggleDark,
  onOpenMobileMenu,
}) => {
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      } else if (e.key === 'Escape') {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const mins = String(Math.floor(pomodoroSeconds / 60)).padStart(2, '0')
  const secs = String(pomodoroSeconds % 60).padStart(2, '0')
  const meta = SECTION_TITLES[activeNav]

  const trimmed = query.trim().toLowerCase()
  const matchedCourses = trimmed
    ? courses.filter(
        (c) =>
          c.code.toLowerCase().includes(trimmed) ||
          c.title.toLowerCase().includes(trimmed) ||
          c.lectureTitle.toLowerCase().includes(trimmed),
      )
    : courses.slice(0, 3)

  const matchedCards = trimmed
    ? flashcards
        .filter((f) => f.front.toLowerCase().includes(trimmed) || f.tag.toLowerCase().includes(trimmed))
        .slice(0, 4)
    : flashcards.slice(0, 3)

  const matchedTasks = trimmed
    ? tasks.filter((t) => t.title.toLowerCase().includes(trimmed)).slice(0, 3)
    : []

  return (
    <>
      <header
        className={`sticky top-0 z-30 h-16 px-4 sm:px-7 border-b flex items-center justify-between gap-3 backdrop-blur-md ${
          isDark
            ? 'bg-[#0D0F14]/90 border-[#232838] text-[#F3F4F6]'
            : 'bg-[#F8F7F4]/90 border-[#E6E4DD] text-[#14151A]'
        }`}
      >
        {/* Left Title & Mobile Trigger */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className={`lg:hidden p-2 rounded-xl border ${
              isDark ? 'border-[#232838] bg-[#151821]' : 'border-[#E6E4DD] bg-white'
            }`}
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-[15px] sm:text-[16px] font-bold tracking-tight truncate">{meta.title}</h1>
            <p
              className={`hidden md:block text-[12px] truncate ${
                isDark ? 'text-slate-400' : 'text-[#6A6E79]'
              }`}
            >
              {meta.subtitle}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Course Focus Selector */}
          <div className="hidden xl:flex items-center">
            <select
              aria-label="Active course context"
              value={selectedCourse.id}
              onChange={(e) => onSelectCourseId(e.target.value)}
              className={`text-[12.5px] font-semibold rounded-xl px-3 py-1.5 border outline-none transition-colors ${
                isDark
                  ? 'bg-[#151821] border-[#262C3D] text-slate-200 hover:border-[#3B4FE4]'
                  : 'bg-white border-[#E6E4DD] text-[#14151A] hover:border-[#3B4FE4]'
              }`}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} · {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Global Search Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-[12.5px] transition-colors ${
              isDark
                ? 'bg-[#151821] border-[#262C3D] text-slate-400 hover:text-white hover:border-slate-600'
                : 'bg-white border-[#E6E4DD] text-[#6A6E79] hover:text-[#14151A] hover:border-[#CFCBC1]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search study studio...</span>
            <kbd
              className={`hidden sm:inline-block font-mono text-[10.5px] px-1.5 py-0.5 rounded ${
                isDark ? 'bg-[#222736] text-slate-300' : 'bg-[#F2F1EC] text-[#5C606B]'
              }`}
            >
              ⌘K
            </kbd>
          </button>

          {/* Live Pomodoro Mini Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${
              pomodoroRunning
                ? 'bg-[#3B4FE4] border-[#3B4FE4] text-white'
                : isDark
                  ? 'bg-[#151821] border-[#262C3D] text-slate-200'
                  : 'bg-white border-[#E6E4DD] text-[#14151A]'
            }`}
          >
            <button
              type="button"
              onClick={() => onSelectNav('planner')}
              className="flex items-center gap-1.5 font-mono text-[12px] font-semibold"
              title="Open Focus Timer"
            >
              <Timer className="w-3.5 h-3.5" />
              <span>
                {mins}:{secs}
              </span>
            </button>
            <button
              type="button"
              onClick={onTogglePomodoro}
              className={`p-1 rounded-md transition-colors ${
                pomodoroRunning ? 'hover:bg-white/20' : 'hover:bg-black/5 dark:hover:bg-white/10'
              }`}
              aria-label={pomodoroRunning ? 'Pause focus timer' : 'Start focus timer'}
            >
              {pomodoroRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            <button
              type="button"
              onClick={onResetPomodoro}
              className={`hidden sm:inline-flex p-1 rounded-md transition-colors ${
                pomodoroRunning ? 'hover:bg-white/20' : 'hover:bg-black/5 dark:hover:bg-white/10'
              }`}
              aria-label="Reset focus timer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Dark / Light Focus Switch */}
          <button
            type="button"
            onClick={onToggleDark}
            className={`p-2 rounded-xl border transition-colors ${
              isDark
                ? 'bg-[#151821] border-[#262C3D] text-amber-300 hover:border-slate-600'
                : 'bg-white border-[#E6E4DD] text-[#4B4F5C] hover:border-[#CFCBC1]'
            }`}
            aria-label={isDark ? 'Switch to light studio mode' : 'Switch to dark focus mode'}
            title={isDark ? 'Light Studio Mode' : 'Dark Focus Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Global Command Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={() => setSearchOpen(false)}
            aria-hidden="true"
          />
          <div
            className={`relative z-10 w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden ${
              isDark ? 'bg-[#151821] border-[#283044] text-white' : 'bg-white border-[#E6E4DD] text-[#14151A]'
            }`}
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-inherit">
              <Search className="w-4 h-4 text-[#3B4FE4]" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to course notes, SM-2 flashcards, or AI Copilot..."
                className="flex-1 bg-transparent outline-none text-[14px]"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-3 space-y-4">
              {/* Quick AI Action */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    onSelectNav('copilot')
                    setSearchOpen(false)
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#3B4FE4]/10 text-[#3B4FE4] dark:text-[#8A98FF] font-semibold text-[13px]"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {trimmed
                        ? `Ask StudyMate AI Copilot about "${query.trim()}"`
                        : 'Open StudyMate AI Note Synthesizer'}
                    </span>
                  </span>
                  <span className="font-mono text-[11px]">Enter &rarr;</span>
                </button>
              </div>

              {/* Courses */}
              {matchedCourses.length > 0 && (
                <div>
                  <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Courses
                  </div>
                  <div className="space-y-1">
                    {matchedCourses.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onSelectCourseId(c.id)
                          onSelectNav('copilot')
                          setSearchOpen(false)
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-left text-[13px]"
                      >
                        <span className="flex items-center gap-2.5">
                          <BookOpen className="w-4 h-4" style={{ color: c.accentHex }} />
                          <span>
                            <strong className="font-mono">{c.code}</strong> · {c.title}
                          </span>
                        </span>
                        <span className="font-mono text-[11px] opacity-60">{c.mastery}% mastery</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Flashcards */}
              {matchedCards.length > 0 && (
                <div>
                  <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Flashcards
                  </div>
                  <div className="space-y-1">
                    {matchedCards.map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => {
                          onSelectCourseId(card.courseId)
                          onSelectNav('flashcards')
                          setSearchOpen(false)
                        }}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-left text-[13px]"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <Layers className="w-3.5 h-3.5 shrink-0 text-[#3B4FE4]" />
                          <span className="truncate">{card.front}</span>
                        </span>
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 shrink-0">
                          {card.tag}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedTasks.length > 0 && (
                <div>
                  <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Coursework Tasks
                  </div>
                  {matchedTasks.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        onSelectNav('planner')
                        setSearchOpen(false)
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-left text-[13px]"
                    >
                      <span className="truncate">{t.title}</span>
                      <span className="font-mono text-[11px] opacity-60">{t.dueLabel}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

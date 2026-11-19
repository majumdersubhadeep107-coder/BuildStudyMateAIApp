import React, { useState } from 'react'
import {
  ArrowRight,
  Award,
  Brain,
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock,
  Code2,
  Flame,
  Layers,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'
import {
  STUDENT_PROFILE,
  WEEKLY_METRICS,
  type Course,
  type NavSection,
  type StudyTask,
} from '../data/studyData'

interface DashboardViewProps {
  courses: Course[]
  tasks: StudyTask[]
  dueCardsCount: number
  totalCardsCount: number
  onToggleTask: (taskId: string) => void
  onAddTask: (title: string, courseId: string, priority: 'high' | 'medium' | 'low') => void
  onOpenCourseCopilot: (courseId: string, initialPrompt?: string) => void
  onOpenCourseFlashcards: (courseId: string) => void
  onNavigate: (nav: NavSection) => void
  isDark: boolean
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  courses,
  tasks,
  dueCardsCount,
  totalCardsCount,
  onToggleTask,
  onAddTask,
  onOpenCourseCopilot,
  onOpenCourseFlashcards,
  onNavigate,
  isDark,
}) => {
  const [quickPrompt, setQuickPrompt] = useState('')
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskCourse, setNewTaskCourse] = useState(courses[0]?.id ?? 'cs301')

  const cardSurface = isDark
    ? 'bg-[#151821] border-[#232838] text-[#F3F4F6]'
    : 'bg-white border-[#E6E4DD] text-[#14151A]'
  const subtleText = isDark ? 'text-slate-400' : 'text-[#5C606B]'

  const completedTasks = tasks.filter((t) => t.completed).length

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onOpenCourseCopilot(courses[0].id, quickPrompt.trim() || undefined)
  }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    onAddTask(newTaskTitle.trim(), newTaskCourse, 'medium')
    setNewTaskTitle('')
  }

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-7 py-6 sm:py-8 space-y-7">
      {/* Hero Synthesis & Student Welcome Card */}
      <section
        className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 ${
          isDark
            ? 'bg-gradient-to-br from-[#171C2B] via-[#141824] to-[#10131C] border-[#262E45]'
            : 'bg-gradient-to-br from-white via-[#FCFBF8] to-[#F2F3FF] border-[#E4E2DA]'
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-semibold bg-[#3B4FE4]/10 text-[#3B4FE4] dark:text-[#8E9BFF]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{STUDENT_PROFILE.term} · Midterm Readiness Sprint</span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-[32px] font-bold tracking-tight leading-[1.15]">
                Welcome back, {STUDENT_PROFILE.name.split(' ')[0]}.{' '}
                <span className="font-serif italic font-normal text-[#3B4FE4] dark:text-[#8E9BFF]">
                  Ready to lock in today’s recall?
                </span>
              </h2>
              <p className={`text-[14px] sm:text-[15px] max-w-2xl leading-relaxed ${subtleText}`}>
                You have <strong className="font-semibold text-inherit">{dueCardsCount} SM-2 flashcards</strong>{' '}
                calibrated for optimal review today and your{' '}
                <strong className="font-semibold text-inherit">BIO 214 Synaptic Lab Quiz</strong> in 48 hours.
              </p>
            </div>

            {/* Quick AI Study Launcher */}
            <form onSubmit={handlePromptSubmit} className="pt-1 max-w-2xl">
              <div
                className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 rounded-2xl border shadow-xs ${
                  isDark ? 'bg-[#0E1118] border-[#283046]' : 'bg-white border-[#DCD9CF]'
                }`}
              >
                <input
                  type="text"
                  value={quickPrompt}
                  onChange={(e) => setQuickPrompt(e.target.value)}
                  placeholder="Ask StudyMate AI to explain a concept, summarize notes, or quiz you..."
                  className="flex-1 px-3.5 py-2 text-[13.5px] bg-transparent outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3B4FE4] hover:bg-[#2F42D1] text-white text-[13px] font-semibold transition-colors shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch AI Copilot</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                {[
                  { label: 'Explain Scaled Dot-Product Attention', courseId: 'cs301' },
                  { label: 'Compare NMDA vs AMPA in LTP', courseId: 'bio214' },
                  { label: 'Derive Taylor Rule real-rate shift', courseId: 'econ202' },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => onOpenCourseCopilot(chip.courseId, chip.label)}
                    className={`text-[11.5px] font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                      isDark
                        ? 'border-[#272E42] bg-[#171B26] text-slate-300 hover:border-[#3B4FE4]'
                        : 'border-[#E6E4DD] bg-[#FAF9F5] text-[#4B4F5C] hover:border-[#3B4FE4]'
                    }`}
                  >
                    {chip.label} &rarr;
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Right Profile & Stack Quick Card */}
          <div className="lg:col-span-4">
            <div
              className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${
                isDark ? 'bg-[#12151F]/90 border-[#252C40]' : 'bg-white/90 border-[#E6E4DD]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <img
                  src={STUDENT_PROFILE.avatarUrl}
                  alt={STUDENT_PROFILE.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-[#3B4FE4]/25"
                />
                <div className="min-w-0">
                  <div className="font-bold text-[15px] truncate">{STUDENT_PROFILE.name}</div>
                  <div className={`text-[12px] truncate ${subtleText}`}>{STUDENT_PROFILE.program}</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[12px]">
                  <span className={subtleText}>Weekly Deep Study Target</span>
                  <span className="font-mono font-semibold">
                    {STUDENT_PROFILE.loggedHours}h / {STUDENT_PROFILE.weeklyGoalHours}h
                  </span>
                </div>
                <div className="h-2 rounded-full bg-black/8 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#3B4FE4]"
                    style={{
                      width: `${Math.min(100, Math.round((STUDENT_PROFILE.loggedHours / STUDENT_PROFILE.weeklyGoalHours) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('quiz')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-[12px] font-semibold transition-colors ${
                    isDark
                      ? 'border-[#283044] hover:bg-white/5 text-slate-200'
                      : 'border-[#E6E4DD] hover:bg-[#F6F5F0] text-[#14151A]'
                  }`}
                >
                  <Target className="w-3.5 h-3.5 text-[#3B4FE4]" />
                  <span>Practice Quiz</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('stack')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-[12px] font-semibold transition-colors ${
                    isDark
                      ? 'border-[#283044] hover:bg-white/5 text-slate-200'
                      : 'border-[#E6E4DD] hover:bg-[#F6F5F0] text-[#14151A]'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Py/Node Code</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Key Telemetry Strip Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {[
          {
            label: 'Memory Retention',
            value: `${STUDENT_PROFILE.retentionRate}%`,
            sub: '+3.2% vs last week',
            icon: <Brain className="w-4 h-4 text-[#3B4FE4]" />,
            tint: 'bg-[#3B4FE4]/10',
          },
          {
            label: 'Cards Due Today',
            value: `${dueCardsCount}`,
            sub: `of ${totalCardsCount} active SM-2 cards`,
            icon: <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />,
            tint: 'bg-teal-500/12',
          },
          {
            label: 'Consistency Streak',
            value: `${STUDENT_PROFILE.streakDays} Days`,
            sub: 'Personal semester record',
            icon: <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
            tint: 'bg-amber-500/12',
          },
          {
            label: 'Coursework Done',
            value: `${completedTasks}/${tasks.length}`,
            sub: 'Milestones completed',
            icon: <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
            tint: 'bg-purple-500/12',
          },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-2xl border p-4 sm:p-5 ${cardSurface}`}>
            <div className="flex items-center justify-between">
              <span className={`text-[12px] font-medium ${subtleText}`}>{stat.label}</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${stat.tint}`}>
                {stat.icon}
              </div>
            </div>
            <div className="font-mono text-xl sm:text-2xl font-bold mt-2.5 tracking-tight">
              {stat.value}
            </div>
            <div className={`text-[11.5px] mt-1 ${subtleText}`}>{stat.sub}</div>
          </div>
        ))}
      </section>

      {/* Enrolled Courses Mastery Grid */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[17px] font-bold tracking-tight">Active Coursework & Exam Readiness</h3>
            <p className={`text-[12.5px] ${subtleText}`}>
              Select a course to synthesize lecture notes with AI or drill spaced-repetition flashcards
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('flashcards')}
            className="text-[12.5px] font-semibold text-[#3B4FE4] dark:text-[#8E9BFF] inline-flex items-center gap-1 hover:underline"
          >
            <span>Review All Decks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {courses.map((course) => (
            <article
              key={course.id}
              className={`rounded-2xl border overflow-hidden flex flex-col transition-all hover:-translate-y-0.5 hover:shadow-md ${cardSurface}`}
            >
              <div className="relative h-24 overflow-hidden">
                <img
                  src={course.coverImage}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
                <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between">
                  <span
                    className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md text-white"
                    style={{ backgroundColor: course.accentHex }}
                  >
                    {course.code}
                  </span>
                  <span className="font-mono text-[11px] font-medium px-2 py-0.5 rounded-md bg-black/55 text-white backdrop-blur-xs">
                    {course.examLabel}: {course.examDaysAway}d
                  </span>
                </div>
                <div className="absolute bottom-2 left-3 right-3 text-white font-semibold text-[14px] leading-snug truncate">
                  {course.title}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className={`flex items-center justify-between text-[12px] ${subtleText}`}>
                    <span>{course.instructor}</span>
                    <span className="font-mono font-semibold text-inherit">{course.mastery}% Mastery</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-black/8 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${course.mastery}%`, backgroundColor: course.accentHex }}
                    />
                  </div>
                  <p className={`text-[12px] line-clamp-2 leading-relaxed ${subtleText}`}>
                    {course.lectureTitle}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenCourseCopilot(course.id)}
                    className={`py-2 px-2.5 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      isDark
                        ? 'bg-white/7 hover:bg-white/12 text-white'
                        : 'bg-[#F5F4EF] hover:bg-[#EAE8E0] text-[#14151A]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" style={{ color: course.accentHex }} />
                    <span>AI Notes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenCourseFlashcards(course.id)}
                    className="py-2 px-2.5 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 text-white transition-opacity hover:opacity-95"
                    style={{ backgroundColor: course.accentHex }}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Drill ({course.dueCount})</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Bottom Analytics + Smart Coursework Checklist */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Interactive Study Velocity & Retention SVG Chart */}
        <div className={`lg:col-span-7 rounded-2xl border p-5 sm:p-6 flex flex-col justify-between ${cardSurface}`}>
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#3B4FE4]" />
                <h3 className="text-[16px] font-bold tracking-tight">
                  Study Velocity & Recall Retention Curve
                </h3>
              </div>
              <p className={`text-[12.5px] mt-0.5 ${subtleText}`}>
                Daily deep-focus hours paired with active-recall accuracy across the past 7 days
              </p>
            </div>
            <div className="flex items-center gap-4 text-[11.5px] font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#3B4FE4]" />
                <span>Focus Hours</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Retention %</span>
              </span>
            </div>
          </div>

          <div className="relative pt-2">
            <svg viewBox="0 0 560 210" className="w-full h-52 overflow-visible">
              {/* Horizontal Reference Grid Lines */}
              {[0, 1, 2, 3].map((row) => {
                const y = 24 + row * 46
                return (
                  <line
                    key={row}
                    x1={28}
                    x2={540}
                    y1={y}
                    y2={y}
                    stroke={isDark ? '#252B3D' : '#ECEAE2'}
                    strokeDasharray="4 4"
                  />
                )
              })}

              {/* Focus Hours Bars */}
              {WEEKLY_METRICS.map((item, idx) => {
                const x = 52 + idx * 72
                const maxHours = 4.5
                const barHeight = (item.focusHours / maxHours) * 138
                const y = 162 - barHeight
                const isHovered = hoveredBar === idx
                return (
                  <g
                    key={item.day}
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                    className="cursor-pointer"
                  >
                    <rect
                      x={x - 18}
                      y={y}
                      width={36}
                      height={barHeight}
                      rx={8}
                      fill={isHovered ? '#293CD4' : '#3B4FE4'}
                      opacity={isHovered ? 1 : 0.85}
                    />
                    <text
                      x={x}
                      y={184}
                      textAnchor="middle"
                      className="text-[11px] font-mono"
                      fill={isDark ? '#94A3B8' : '#6A6E79'}
                    >
                      {item.day}
                    </text>
                    <text
                      x={x}
                      y={y - 7}
                      textAnchor="middle"
                      className="text-[10.5px] font-mono font-semibold"
                      fill={isDark ? '#CBD5E1' : '#3B4FE4'}
                    >
                      {item.focusHours}h
                    </text>
                  </g>
                )
              })}

              {/* Retention % Polyline */}
              <polyline
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                points={WEEKLY_METRICS.map((item, idx) => {
                  const x = 52 + idx * 72
                  const y = 162 - ((item.retentionPct - 75) / 25) * 138
                  return `${x},${y}`
                }).join(' ')}
              />
              {WEEKLY_METRICS.map((item, idx) => {
                const x = 52 + idx * 72
                const y = 162 - ((item.retentionPct - 75) / 25) * 138
                return (
                  <circle
                    key={`pt-${item.day}`}
                    cx={x}
                    cy={y}
                    r={hoveredBar === idx ? 5.5 : 4}
                    fill="#10B981"
                    stroke={isDark ? '#151821' : '#FFFFFF'}
                    strokeWidth="2"
                  />
                )
              })}
            </svg>

            <div
              className={`mt-2 px-3.5 py-2.5 rounded-xl text-[12px] flex flex-wrap items-center justify-between gap-2 ${
                isDark ? 'bg-[#10131C] text-slate-300' : 'bg-[#F8F7F3] text-[#4B4F5C]'
              }`}
            >
              {hoveredBar !== null ? (
                <>
                  <span>
                    <strong>{WEEKLY_METRICS[hoveredBar].day}:</strong>{' '}
                    {WEEKLY_METRICS[hoveredBar].focusHours} hrs deep work ·{' '}
                    {WEEKLY_METRICS[hoveredBar].cardsReviewed} cards reviewed
                  </span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {WEEKLY_METRICS[hoveredBar].retentionPct}% Recall Accuracy
                  </span>
                </>
              ) : (
                <>
                  <span>Hover any day bar to inspect cards drilled & memory retention</span>
                  <span className="font-mono font-semibold text-[#3B4FE4] dark:text-[#8E9BFF]">
                    262 Cards Reviewed This Week
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Coursework & Actionable Deadlines */}
        <div className={`lg:col-span-5 rounded-2xl border p-5 sm:p-6 flex flex-col justify-between ${cardSurface}`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-[#3B4FE4]" />
                <h3 className="text-[16px] font-bold tracking-tight">Priority Coursework Queue</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('planner')}
                className="text-[12px] font-semibold text-[#3B4FE4] dark:text-[#8E9BFF] hover:underline"
              >
                Full Board &rarr;
              </button>
            </div>

            <div className="space-y-2 max-h-68 overflow-y-auto pr-1">
              {tasks.map((task) => {
                const course = courses.find((c) => c.id === task.courseId)
                return (
                  <div
                    key={task.id}
                    onClick={() => onToggleTask(task.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onToggleTask(task.id)
                      }
                    }}
                    className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                      task.completed
                        ? isDark
                          ? 'bg-[#11141D] border-[#1E2332] opacity-60'
                          : 'bg-[#FAF9F6] border-[#ECEAE3] opacity-65'
                        : isDark
                          ? 'bg-[#191D29] border-[#262D42] hover:border-[#3B4FE4]'
                          : 'bg-[#FCFBF9] border-[#E6E4DD] hover:border-[#3B4FE4]'
                    }`}
                  >
                    <span className="mt-0.5 text-[#3B4FE4] shrink-0">
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-[13px] font-medium leading-snug ${
                          task.completed ? 'line-through' : ''
                        }`}
                      >
                        {task.title}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px]">
                        {course && (
                          <span
                            className="font-mono font-semibold px-1.5 py-0.5 rounded text-white"
                            style={{ backgroundColor: course.accentHex }}
                          >
                            {course.code}
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 ${subtleText}`}>
                          <Clock className="w-3 h-3" />
                          {task.dueLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Inline Add Task */}
          <form onSubmit={handleCreateTask} className="mt-4 pt-3.5 border-t border-inherit flex gap-2">
            <select
              aria-label="Course for new task"
              value={newTaskCourse}
              onChange={(e) => setNewTaskCourse(e.target.value)}
              className={`font-mono text-[11.5px] font-semibold px-2.5 py-2 rounded-xl border outline-none ${
                isDark ? 'bg-[#10131C] border-[#262D42]' : 'bg-[#F8F7F4] border-[#E6E4DD]'
              }`}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add coursework milestone..."
              className={`flex-1 min-w-0 text-[12.5px] px-3 py-2 rounded-xl border outline-none ${
                isDark
                  ? 'bg-[#10131C] border-[#262D42] focus:border-[#3B4FE4]'
                  : 'bg-[#F8F7F4] border-[#E6E4DD] focus:border-[#3B4FE4]'
              }`}
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-[#3B4FE4] hover:bg-[#2F42D1] text-white text-[12.5px] font-semibold inline-flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}

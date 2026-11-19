import React from 'react'
import {
  BrainCircuit,
  CheckSquare,
  Code2,
  Flame,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Sparkles,
  Target,
  X,
} from 'lucide-react'
import type { Course, NavSection } from '../data/studyData'

interface SidebarProps {
  activeNav: NavSection
  onSelectNav: (nav: NavSection) => void
  courses: Course[]
  selectedCourseId: string
  onSelectCourse: (courseId: string, openCopilot?: boolean) => void
  dueCardsCount: number
  streakDays: number
  backendStatus: {
    online: boolean
    gateway: string
    pythonVersion: string
    latencyMs: number
  }
  isDark: boolean
  mobileOpen: boolean
  onCloseMobile: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onSelectNav,
  courses,
  selectedCourseId,
  onSelectCourse,
  dueCardsCount,
  streakDays,
  backendStatus,
  isDark,
  mobileOpen,
  onCloseMobile,
}) => {
  const navItems: {
    id: NavSection
    label: string
    icon: React.ReactNode
    badge?: string | number
  }[] = [
    { id: 'dashboard', label: 'Overview Hub', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'copilot', label: 'AI Study Copilot', icon: <Sparkles className="w-4 h-4" />, badge: 'AI' },
    {
      id: 'flashcards',
      label: 'SM-2 Flashcards',
      icon: <Layers className="w-4 h-4" />,
      badge: dueCardsCount > 0 ? dueCardsCount : undefined,
    },
    { id: 'quiz', label: 'Adaptive Quiz Lab', icon: <Target className="w-4 h-4" /> },
    { id: 'planner', label: 'Focus & Planner', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'stack', label: 'Python + Node Stack', icon: <Code2 className="w-4 h-4" />, badge: 'API' },
  ]

  const railClasses = isDark
    ? 'bg-[#12151E] border-[#232838] text-[#F3F4F6]'
    : 'bg-white border-[#E6E4DD] text-[#14151A]'

  const content = (
    <div className={`flex flex-col h-full w-68 border-r select-none ${railClasses}`}>
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-inherit">
        <button
          type="button"
          onClick={() => {
            onSelectNav('dashboard')
            onCloseMobile()
          }}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#3B4FE4] text-white flex items-center justify-center shadow-sm group-hover:scale-[1.03] transition-transform">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-[15px] leading-none">StudyMate</span>
              <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#3B4FE4]/12 text-[#3B4FE4] dark:text-[#8190FF]">
                AI
              </span>
            </div>
            <p className={`text-[11px] mt-1 leading-none ${isDark ? 'text-slate-400' : 'text-[#6A6E79]'}`}>
              Cognitive Study Studio
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
          aria-label="Close navigation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div
            className={`px-2.5 mb-2 text-[11px] font-semibold uppercase tracking-wider ${
              isDark ? 'text-slate-500' : 'text-[#7C808C]'
            }`}
          >
            Study Workspace
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = activeNav === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectNav(item.id)
                    onCloseMobile()
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all ${
                    active
                      ? isDark
                        ? 'bg-[#3B4FE4] text-white shadow-sm'
                        : 'bg-[#EEF0FF] text-[#2A3BC7] font-semibold'
                      : isDark
                        ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                        : 'text-[#4B4F5C] hover:bg-[#F5F4F0] hover:text-[#14151A]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                  {item.badge !== undefined && (
                    <span
                      className={`font-mono text-[11px] px-1.5 py-0.5 rounded-md font-semibold ${
                        active
                          ? isDark
                            ? 'bg-white/20 text-white'
                            : 'bg-[#3B4FE4] text-white'
                          : isDark
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-[#F0EFEA] text-[#4B4F5C]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Enrolled Courses */}
        <div>
          <div className="px-2.5 mb-2 flex items-center justify-between">
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider ${
                isDark ? 'text-slate-500' : 'text-[#7C808C]'
              }`}
            >
              Enrolled Courses
            </span>
            <GraduationCap className={`w-3.5 h-3.5 ${isDark ? 'text-slate-500' : 'text-[#7C808C]'}`} />
          </div>
          <div className="space-y-1">
            {courses.map((course) => {
              const isSelected = course.id === selectedCourseId
              return (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => {
                    onSelectCourse(course.id, true)
                    onCloseMobile()
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-left transition-all flex items-center justify-between group ${
                    isSelected
                      ? isDark
                        ? 'bg-white/8 text-white'
                        : 'bg-[#F6F5F1] text-[#14151A]'
                      : isDark
                        ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                        : 'text-[#5C606B] hover:bg-[#F8F7F4] hover:text-[#14151A]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: course.accentHex }}
                      />
                      <span className="font-mono text-[11.5px] font-semibold tracking-tight">
                        {course.code}
                      </span>
                    </div>
                    <div className="text-[12.5px] truncate mt-0.5 font-medium">{course.title}</div>
                  </div>
                  <span
                    className={`font-mono text-[11px] shrink-0 ${
                      isDark ? 'text-slate-400' : 'text-[#6A6E79]'
                    }`}
                  >
                    {course.mastery}%
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Streak + Runtime Telemetry */}
      <div className="p-3.5 border-t border-inherit space-y-2.5">
        <div
          className={`px-3 py-2.5 rounded-xl flex items-center justify-between ${
            isDark ? 'bg-[#1B2030]' : 'bg-[#FAF9F5] border border-[#ECEAE3]'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[12px] font-semibold leading-tight">{streakDays}-Day Study Streak</div>
              <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-[#6A6E79]'}`}>
                Top 4% consistency
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onSelectNav('stack')
            onCloseMobile()
          }}
          className={`w-full px-3 py-2.5 rounded-xl text-left transition-colors border ${
            isDark
              ? 'bg-[#0E1118] border-[#232838] hover:border-[#3B4FE4]'
              : 'bg-[#F8F7F4] border-[#E6E4DD] hover:border-[#3B4FE4]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus.online ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'
                }`}
              />
              <span>{backendStatus.online ? 'Node + Python Live' : 'JS Hybrid Engine'}</span>
            </span>
            <span className="font-mono text-[10.5px] text-[#3B4FE4] dark:text-[#8190FF]">
              {backendStatus.latencyMs}ms
            </span>
          </div>
          <div
            className={`font-mono text-[10.5px] truncate mt-1 ${
              isDark ? 'text-slate-400' : 'text-[#6A6E79]'
            }`}
          >
            {backendStatus.gateway} · {backendStatus.pythonVersion}
          </div>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Rail */}
      <aside className="hidden lg:block shrink-0 h-dvh sticky top-0">{content}</aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">{content}</div>
        </div>
      )}
    </>
  )
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WeeklyGoal {
  employeeId: string
  targetAmount: number
  currentAmount: number
  weekStart: string
  xpPoints: number
  level: number
  streak: number
  lastPunchDate: string | null
}

interface GoalStore {
  goals: Record<string, WeeklyGoal>
  setGoalTarget: (employeeId: string, target: number) => void
  updateProgress: (employeeId: string, amount: number) => void
  addXP: (employeeId: string, xp: number) => void
  updateStreak: (employeeId: string) => void
  getGoal: (employeeId: string) => WeeklyGoal
  resetWeeklyProgress: (employeeId: string) => void
}

function getWeekStart(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  return monday.toISOString().split('T')[0]
}

function xpForLevel(level: number): number {
  return level * 1000 + (level - 1) * 500
}

function calcLevel(xp: number): number {
  let level = 1
  while (xp >= xpForLevel(level + 1)) level++
  return level
}

const defaultGoal = (employeeId: string): WeeklyGoal => ({
  employeeId,
  targetAmount: 500,
  currentAmount: 0,
  weekStart: getWeekStart(),
  xpPoints: 0,
  level: 1,
  streak: 0,
  lastPunchDate: null,
})

export const useGoalStore = create<GoalStore>()(
  persist(
    (set, get) => ({
      goals: {},

      getGoal: (employeeId) => {
        const goal = get().goals[employeeId]
        if (!goal) return defaultGoal(employeeId)
        // Reset si nouvelle semaine
        const currentWeek = getWeekStart()
        if (goal.weekStart !== currentWeek) {
          return { ...goal, currentAmount: 0, weekStart: currentWeek }
        }
        return goal
      },

      setGoalTarget: (employeeId, target) => set(state => ({
        goals: {
          ...state.goals,
          [employeeId]: {
            ...(state.goals[employeeId] ?? defaultGoal(employeeId)),
            targetAmount: target,
          },
        },
      })),

      updateProgress: (employeeId, amount) => set(state => {
        const existing = state.goals[employeeId] ?? defaultGoal(employeeId)
        const currentWeek = getWeekStart()
        const base = existing.weekStart !== currentWeek
          ? { ...existing, currentAmount: 0, weekStart: currentWeek }
          : existing
        const newAmount = base.currentAmount + amount
        // XP bonus si objectif atteint
        const justCompleted = base.currentAmount < base.targetAmount && newAmount >= base.targetAmount
        const bonusXP = justCompleted ? 500 : Math.floor(amount * 2)
        const newXP = base.xpPoints + bonusXP
        return {
          goals: {
            ...state.goals,
            [employeeId]: {
              ...base,
              currentAmount: newAmount,
              xpPoints: newXP,
              level: calcLevel(newXP),
            },
          },
        }
      }),

      addXP: (employeeId, xp) => set(state => {
        const existing = state.goals[employeeId] ?? defaultGoal(employeeId)
        const newXP = existing.xpPoints + xp
        return {
          goals: {
            ...state.goals,
            [employeeId]: {
              ...existing,
              xpPoints: newXP,
              level: calcLevel(newXP),
            },
          },
        }
      }),

      updateStreak: (employeeId) => set(state => {
        const existing = state.goals[employeeId] ?? defaultGoal(employeeId)
        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        let newStreak = existing.streak
        if (existing.lastPunchDate === yesterday) {
          newStreak = existing.streak + 1
        } else if (existing.lastPunchDate !== today) {
          newStreak = 1
        }
        return {
          goals: {
            ...state.goals,
            [employeeId]: {
              ...existing,
              streak: newStreak,
              lastPunchDate: today,
            },
          },
        }
      }),

      resetWeeklyProgress: (employeeId) => set(state => ({
        goals: {
          ...state.goals,
          [employeeId]: {
            ...(state.goals[employeeId] ?? defaultGoal(employeeId)),
            currentAmount: 0,
            weekStart: getWeekStart(),
          },
        },
      })),
    }),
    { name: 'gcp-goals-v1' }
  )
)

export { xpForLevel, calcLevel }


// src/store/useProjectStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PayMode = 'hourly' | 'job' | 'sqft';

export interface MaterialEntry {
  id: string;
  material: string;
  sqft: number;
  ratePerSqft: number;
}

export interface EmployeeWorkLog {
  employeeId: string;
  employeeName: string;
  hourlyRate: number;
  punchIn: string;
  punchOut?: string;
  hoursWorked?: number;
  materials?: MaterialEntry[];
  jobPay?: number;
  date: string;
  // ✅ Nouveaux champs pour punch sans projet assigné
  chantier?: string;          // adresse/nom du chantier entré par l'employé
  payMode?: PayMode;          // mode choisi au punch in
}

export interface ProjectExpense {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  address: string;
  city: string;
  payMode: PayMode;
  hourlyRate?: number;
  jobAmount?: number;
  sqftRate?: number;
  clientAmount?: number;
  assignedEmployeeIds: string[];
  workLogs: EmployeeWorkLog[];
  expenses: ProjectExpense[];
  status: 'open' | 'closed' | 'invoiced';
  createdAt: string;
  closedAt?: string;
  invoiceId?: string;
  notes?: string;
  // ✅ Projet virtuel = créé automatiquement au punch in sans projet assigné
  isVirtual?: boolean;
}

// ─── Calculs ──────────────────────────────────────────────────────────────────

export function calcProjectStats(project: Project) {
  const completedLogs = project.workLogs.filter((l) => l.punchOut);

  const byEmployee: Record<string, {
    employeeId: string;
    employeeName: string;
    hourlyRate: number;
    totalHours: number;
    totalPay: number;
    sessions: number;
  }> = {};

  let totalLaborCost = 0;
  let totalSqft = 0;
  let totalSqftRevenue = 0;

  for (const log of completedLogs) {
    if (!byEmployee[log.employeeId]) {
      byEmployee[log.employeeId] = {
        employeeId: log.employeeId,
        employeeName: log.employeeName,
        hourlyRate: log.hourlyRate,
        totalHours: 0,
        totalPay: 0,
        sessions: 0,
      };
    }
    const emp = byEmployee[log.employeeId];
    emp.sessions++;

    const effectivePayMode = log.payMode ?? project.payMode;

    if (effectivePayMode === 'hourly') {
      const hours = log.hoursWorked ?? 0;
      emp.totalHours += hours;
      emp.totalPay += hours * log.hourlyRate;
      totalLaborCost += hours * log.hourlyRate;
    } else if (effectivePayMode === 'job') {
      emp.totalPay += log.jobPay ?? 0;
      totalLaborCost += log.jobPay ?? 0;
    } else if (effectivePayMode === 'sqft') {
      const hours = log.hoursWorked ?? 0;
      emp.totalHours += hours;
      for (const mat of log.materials ?? []) {
        totalSqft += mat.sqft;
        totalSqftRevenue += mat.sqft * mat.ratePerSqft;
      }
      emp.totalPay += hours * log.hourlyRate;
      totalLaborCost += hours * log.hourlyRate;
    }
  }

  const totalExpenses = project.expenses.reduce((s, e) => s + e.amount, 0);
  const clientRevenue = project.payMode === 'sqft'
    ? totalSqftRevenue
    : (project.clientAmount ?? 0);

  const totalHours = Object.values(byEmployee).reduce((s, e) => s + e.totalHours, 0);
  const effectiveRate = totalHours > 0 ? (clientRevenue - totalExpenses) / totalHours : 0;
  const margin = clientRevenue - totalLaborCost - totalExpenses;
  const marginPercent = clientRevenue > 0 ? (margin / clientRevenue) * 100 : 0;
  const activeLog = project.workLogs.find((l) => !l.punchOut);

  return {
    byEmployee, totalLaborCost, totalExpenses, totalHours,
    totalSqft, totalSqftRevenue, clientRevenue, effectiveRate,
    margin, marginPercent, activeLog,
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface ProjectStore {
  projects: Project[];
  addProject: (p: Omit<Project, 'id' | 'createdAt' | 'workLogs' | 'expenses' | 'status'>) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  closeProject: (id: string) => void;
  punchIn: (projectId: string, log: Omit<EmployeeWorkLog, 'punchOut' | 'hoursWorked'>) => void;
  punchOut: (projectId: string, employeeId: string, data: {
    materials?: MaterialEntry[];
    jobPay?: number;
  }) => void;
  addExpense: (projectId: string, expense: Omit<ProjectExpense, 'id'>) => void;
  removeExpense: (projectId: string, expenseId: string) => void;
  getOpenProjects: () => Project[];
  getProjectsForEmployee: (employeeId: string) => Project[];
  getActiveLogForEmployee: (employeeId: string) => { project: Project; log: EmployeeWorkLog } | null;
  // ✅ Nouveau — punch in sans projet assigné (crée un projet virtuel)
  punchInVirtual: (log: Omit<EmployeeWorkLog, 'punchOut' | 'hoursWorked'>) => string;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],

      addProject: (p) => {
        const id = uid();
        set((state) => ({
          projects: [
            ...state.projects,
            { ...p, id, createdAt: new Date().toISOString(), workLogs: [], expenses: [], status: 'open' },
          ],
        }));
        return id;
      },

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) => p.id === id ? { ...p, ...updates } : p),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),

      closeProject: (id) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, status: 'closed', closedAt: new Date().toISOString() } : p
          ),
        })),

      punchIn: (projectId, log) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, workLogs: [...p.workLogs, log] } : p
          ),
        })),

      // ✅ Crée un projet virtuel automatiquement et punch in dedans
      punchInVirtual: (log) => {
        const projectId = `virtual-${log.employeeId}-${Date.now()}`
        const chantierName = log.chantier || 'Chantier sans nom'
        set((state) => ({
          projects: [
            ...state.projects,
            {
              id: projectId,
              name: chantierName,
              clientId: '',
              clientName: '',
              address: chantierName,
              city: '',
              payMode: log.payMode ?? 'hourly',
              assignedEmployeeIds: [log.employeeId],
              workLogs: [log],
              expenses: [],
              status: 'open',
              createdAt: new Date().toISOString(),
              isVirtual: true,
            },
          ],
        }))
        return projectId
      },

      punchOut: (projectId, employeeId, data) =>
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const punchOutTime = new Date().toISOString();
            return {
              ...p,
              workLogs: p.workLogs.map((log) => {
                if (log.employeeId !== employeeId || log.punchOut) return log;
                const hoursWorked =
                  (new Date(punchOutTime).getTime() - new Date(log.punchIn).getTime()) / (1000 * 60 * 60);
                return {
                  ...log,
                  punchOut: punchOutTime,
                  hoursWorked: Math.round(hoursWorked * 100) / 100,
                  ...data,
                };
              }),
            };
          }),
        })),

      addExpense: (projectId, expense) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, expenses: [...p.expenses, { ...expense, id: uid() }] }
              : p
          ),
        })),

      removeExpense: (projectId, expenseId) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, expenses: p.expenses.filter((e) => e.id !== expenseId) }
              : p
          ),
        })),

      getOpenProjects: () =>
        get().projects.filter((p) => p.status === 'open'),

      getProjectsForEmployee: (employeeId) =>
        get().projects.filter(
          (p) => p.status === 'open' && p.assignedEmployeeIds.includes(employeeId)
        ),

      getActiveLogForEmployee: (employeeId) => {
        for (const project of get().projects) {
          const log = project.workLogs.find(
            (l) => l.employeeId === employeeId && !l.punchOut
          );
          if (log) return { project, log };
        }
        return null;
      },
    }),
    { name: 'project-store-v1' }
  )
);

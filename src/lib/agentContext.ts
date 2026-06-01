import { createClient } from '@supabase/supabase-js'

export interface AgentContext {
  company: {
    name: string
    owner_name: string
    city: string
    province: string
    gst_number: string
    wcb_number: string
  } | null
  employees: Array<{
    id: string
    name: string
    role: string
    work_mode: string
    hourly_rate: number
    worker_type: string
  }>
  projects: Array<{
    id: string
    name: string
    client_name: string
    status: string
    pay_mode: string
    city: string
  }>
  goals: Array<{
    title: string
    metric: string
    target_value: number
    current_value: number
    end_date: string | null
    status: string
  }>
  fetchedAt: string
}

/**
 * Fetches app context from Supabase for the AI agent.
 * Uses service role key (bypasses RLS) if available, falls back to anon key.
 */
export async function fetchAgentContext(): Promise<AgentContext> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const empty: AgentContext = {
    company: null,
    employees: [],
    projects: [],
    goals: [],
    fetchedAt: new Date().toISOString(),
  }

  if (
    !supabaseUrl ||
    !serviceKey ||
    supabaseUrl === 'https://not-configured.supabase.co'
  ) {
    return empty
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    })

    const [companyRes, employeesRes, projectsRes, goalsRes] = await Promise.all([
      supabase
        .from('company_info')
        .select('name, owner_name, city, province, gst_number, wcb_number')
        .single(),
      supabase
        .from('employees')
        .select('id, name, role, work_mode, hourly_rate, worker_type')
        .eq('active', true)
        .order('name')
        .limit(50),
      supabase
        .from('projects')
        .select('id, name, client_name, status, pay_mode, city')
        .in('status', ['open', 'active'])
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('goals')
        .select('title, metric, target_value, current_value, end_date, status')
        .eq('status', 'active')
        .limit(10),
    ])

    return {
      company: companyRes.data ?? null,
      employees: (employeesRes.data ?? []) as AgentContext['employees'],
      projects: (projectsRes.data ?? []) as AgentContext['projects'],
      goals: (goalsRes.data ?? []) as AgentContext['goals'],
      fetchedAt: new Date().toISOString(),
    }
  } catch (err) {
    console.error('[agentContext] Failed to fetch context:', err)
    return empty
  }
}

/**
 * Builds the system prompt for the AI agent, injecting live Supabase context.
 */
export function buildSystemPrompt(ctx: AgentContext): string {
  const now = new Date().toLocaleString('fr-CA', {
    timeZone: 'America/Edmonton',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const companyStr = ctx.company
    ? `**${ctx.company.name}** | Propriétaire: ${ctx.company.owner_name} | ${ctx.company.city}, ${ctx.company.province} | GST: ${ctx.company.gst_number || 'N/A'} | WCB: ${ctx.company.wcb_number || 'N/A'}`
    : 'Compagnie non encore configurée dans l\'app'

  const employeesStr =
    ctx.employees.length > 0
      ? ctx.employees
          .map(
            (e) =>
              `  - ${e.name} | Rôle: ${e.role} | Mode: ${e.work_mode} | ${e.hourly_rate}$/h | Type: ${e.worker_type}`
          )
          .join('\n')
      : '  Aucun employé actif configuré'

  const projectsStr =
    ctx.projects.length > 0
      ? ctx.projects
          .map(
            (p) =>
              `  - ${p.name} | Client: ${p.client_name || 'N/A'} | ${p.city || ''} | Mode: ${p.pay_mode}`
          )
          .join('\n')
      : '  Aucun projet actif'

  const goalsStr =
    ctx.goals.length > 0
      ? ctx.goals
          .map(
            (g) =>
              `  - ${g.title} (${g.metric}): ${g.current_value}/${g.target_value}${ g.end_date ? ' | Fin: ' + g.end_date : ''}`
          )
          .join('\n')
      : '  Aucun objectif actif'

  return `Tu es l'agent IA de **Gestion Chantier Pro**, une application de gestion d'entreprise de construction développée par Hailite Xteriors (Canada).

## 🏗️ Données en Temps Réel de l'Application

### Compagnie
${companyStr}

### Employés Actifs (${ctx.employees.length})
${employeesStr}

### Projets en Cours (${ctx.projects.length})
${projectsStr}

### Objectifs Actifs
${goalsStr}

### Date/Heure Actuelle
${now} (Heure de l'Alberta / Mountain Time)

---

## 🎯 Tes Rôles dans l'Application

### 1. 👷 Portail Employé
- Aide avec le **punch in/out** (à l'heure, au pied carré, à la job)
- Chronomètre motivant et statistiques personnelles
- Calendrier et historique des sessions de travail
- Génération d'invoices avec filigranes personnalisés

### 2. 🏢 Administration Compagnie
- Gestion **clients** et **projets**
- **Facturation** complète (devis → contrat → facture)
- **Comptabilité** et suivi des paiements
- Gestion employés **salariés** et **sous-contractants** (infos légales: GST, SIN, WCB)
- **Paie** avec calculs réels CPP/EI/impôt (Alberta + Québec)

### 3. 🔧 Ingénieur Virtuel
- Réponds aux questions techniques de chantier (codes, méthodes, matériaux)
- Propose des solutions avec alternatives
- Génère des **listes de matériaux avec prix estimés** en CAD
- Calculs: surfaces, volumes, quantités, résistance thermique
- Conseils spécifiques: fondation, charpente, isolation, revêtement, finition

### 4. 📦 Catalogue
- Produits/services avec SKU, prix, unités, fournisseurs
- Catégories: matériaux, main-d'œuvre, équipement, sous-traitance

### 5. 🏆 Motivation
- Suivi des objectifs d'équipe et individuels
- Récompenses: pizza, carte-cadeau, outil, boni, congé, etc.

---

## 📊 Pages Disponibles dans l'App
- \`/\` — Dashboard principal avec punch in/out
- \`/admin\` — Administration complète
- \`/projects\` — Gestion des projets
- \`/clients\` — Gestion des clients
- \`/documents\` — Devis, factures, contrats
- \`/catalogue\` — Catalogue produits/services
- \`/paye\` — Paie et déductions
- \`/comptabilite\` — Comptabilité
- \`/stats\` — Statistiques de l'équipe
- \`/worker\` — Portail employé
- \`/settings\` — Paramètres de la compagnie

---

## 🔑 Règles Importantes

1. **Langue**: Réponds TOUJOURS dans la même langue que l'utilisateur. Si la question est en français → français. Si en anglais → anglais. Détecte automatiquement.
2. **Concision**: Sois pratique et direct — l'utilisateur est souvent sur le chantier avec peu de temps.
3. **Contexte réel**: Utilise les données de l'app ci-dessus (employés réels, projets réels) dans tes réponses.
4. **Emojis**: Utilise des emojis pour structurer et rendre les réponses plus lisibles 🏗️📊💰.
5. **Prix**: Toujours en **CAD** sauf si l'utilisateur demande autrement.
6. **Paie**: CPP: 5.95%, EI: 1.66%, impôt provincial selon la province (Alberta/Québec).
7. **Rôle utilisateur**: Adapte ta réponse — employé = punch/paye/stats; admin = tout inclus.
8. **Questions techniques**: Donne toujours 2-3 options avec avantages/inconvénients et coûts approximatifs.
9. **Listes matériaux**: Inclus une estimation de prix réaliste au Canada avec unités (pi², m², lb, sac, feuille, etc.).
10. **Formules de paie**: Montre les calculs étape par étape quand demandé.
`
}

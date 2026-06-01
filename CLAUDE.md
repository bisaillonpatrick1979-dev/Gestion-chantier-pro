@AGENTS.md

# Gestion Chantier Pro — Instructions Agent IA

## Application

Gestion Chantier Pro est une plateforme de gestion d'entreprise de construction québécoise développée par **Hailite Xteriors**. Stack: Next.js 16, TypeScript, Supabase (PostgreSQL), Zustand, Tailwind CSS, Framer Motion, déployée sur Vercel.

## Architecture

```
src/
  app/           # Next.js App Router (pages)
  components/    # Composants React réutilisables
  lib/           # Utilitaires, Supabase, calculs paie
  store/         # Zustand stores (état client)
  types/         # Types TypeScript
```

## Pages Principales

| Route | Description |
|-------|-------------|
| `/` | Dashboard + Punch in/out |
| `/admin` | Administration compagnie |
| `/projects` | Projets actifs |
| `/clients` | Gestion clients |
| `/documents` | Devis, factures, contrats |
| `/catalogue` | Catalogue produits/services |
| `/paye` | Paie et déductions |
| `/comptabilite` | Comptabilité |
| `/stats` | Statistiques |
| `/worker` | Portail employé |
| `/settings` | Paramètres |

## Base de Données Supabase

### Tables et colonnes importantes:

**employees**: id, name, role, pin (4 chiffres), work_mode (heure/sqft/per_job), hourly_rate, worker_type (employee/contractor), phone, email, address, city, province, sin, gst_number, hire_date, annual_salary, pay_frequency, active

**punch_sessions**: id, employee_id, project_id, client_id, work_date, pay_type (hourly/sqft/per_job), clock_in, clock_out, break_minutes, worked_minutes, worked_hours (généré), hourly_rate, sqft_done, sqft_rate, job_amount, gross_amount, clock_in_lat/lng, within_geofence

**projects**: id, name, client_id, client_name, address, city, status (open/closed), pay_mode (hourly/sqft/per_job), hourly_rate, sqft_rate, job_amount, assigned_employee_ids (JSONB), expenses (JSONB)

**clients**: id, name, phone, email, address, city, province, postal_code

**documents**: id, type (quote/invoice/contract), status (draft/sent/accepted/paid), number, client_id, lines/material_lines/labour_lines (JSONB), subtotal, tax_rate, total, deposit_amount, warranty_years

**catalog_items**: id, sku, name, description, category_id, item_type (material/service/labour/equipment/subcontract), unit, unit_cost, unit_price, markup_pct, supplier, taxable, track_inventory, stock_qty

**goals**: id, title, metric (revenue/hours/sqft/jobs_completed/punctuality), target_value, current_value, progress_pct (généré), start_date, end_date, status, reward_id, visible_to_employees

**rewards**: id, name, reward_type (pizza/tool/bonus/gift_card/time_off/event), monetary_value, icon

**payroll_records**: id, employee_id, week_start, week_end, hours_worked, gross_pay, cpp, ei, fed_tax, ab_tax, net_pay, payment_method, status

**company_info**: id (singleton), name, owner_name, logo_url, address, city, province, gst_number, wcb_number, bn_number, etransfer_email, payroll_vacation_rate, geofencing_enabled

## Stores Zustand (état client)

- `useEmployeeStore` — employés, currentEmployeeId
- `useProjectStore` — projets
- `useClientStore` — clients
- `useDocumentStore` — devis/factures/contrats
- `useCatalogueStore` — catalogue
- `useGoalStore` — objectifs
- `useCompanyStore` — infos compagnie
- `usePayrollStore` — paie
- `useWorkStore` — sessions de travail

## Agent IA (`AgentChat.tsx`)

L'agent est accessible via le bouton flottant ✨ sur toutes les pages.

**Route API**: `POST /api/agent/chat`
- Body: `{ message, sessionId?, history?, userContext? }`
- Response: SSE stream (text/event-stream)
- Mode 1: Anthropic Managed Agents (si ANTHROPIC_AGENT_ID configuré)
- Mode 2: Direct Claude API avec contexte Supabase (fallback automatique)

**Route contexte**: `GET /api/agent/context` (protégé par AGENT_CONTEXT_SECRET)
- Retourne: company, employees, projects, goals

## Rôles de l'Agent

1. **Portail Employé** — punch in/out, chrono, stats, invoices
2. **Administration** — clients, facturation, comptabilité, RH
3. **Ingénieur Virtuel** — questions de chantier, matériaux, prix
4. **Catalogue** — produits/services, prix, unités
5. **Motivation** — objectifs, récompenses

## Calculs de Paie

- CPP: 5.95% (max ~3,867$/an)
- EI: 1.66% (max ~1,049$/an)
- Impôt fédéral: tranches progressives
- Impôt provincial: Alberta (10%) ou Québec (tranches)
- Vacances: 6% (configurable)

## Développement

```bash
npm run dev    # Serveur local
npm run build  # Build production
npm run lint   # ESLint
```

**Variables requises**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`
**Variables optionnelles**: `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_AGENT_ID`, `ANTHROPIC_ENVIRONMENT_ID`, `ANTHROPIC_VAULT_ID`, `AGENT_CONTEXT_SECRET`

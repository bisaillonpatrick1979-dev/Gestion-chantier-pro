# Sécurité Supabase SaaS — Gestion Chantier Pro

Ce document décrit les changements nécessaires avant de vendre l’application à plusieurs compagnies.

## Constats actuels importants

Le code contient déjà une intégration Supabase dans `src/lib/sync.ts`, mais les tables synchronisées ne sont pas encore prêtes pour un vrai SaaS multi-compagnies.

Données sensibles actuellement synchronisées :

- employés
- PIN employés
- adresses
- contacts d’urgence
- SIN / NAS
- salaires
- clients
- documents / factures / contrats
- compagnie
- paies
- projets

Avant une vente publique, il faut isoler chaque compagnie avec une architecture multi-tenant.

## Règle obligatoire

Toutes les tables sensibles doivent contenir :

```sql
company_id uuid not null
```

Exemples :

- employees
- day_details
- clients
- documents
- company_info
- payroll_records
- projects
- photos
- expenses
- dispatches

Aucune requête client ne doit lire ou écrire sans être limitée par `company_id`.

## Tables de base recommandées

```sql
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid references auth.users(id),
  plan text not null default 'trial',
  subscription_status text not null default 'inactive',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists company_members (
  company_id uuid not null references companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','foreman','employee','subcontractor','accountant')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);
```

## Fonction de sécurité recommandée

```sql
create or replace function public.is_company_member(target_company_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = target_company_id
      and cm.user_id = auth.uid()
      and cm.active = true
  );
$$;

create or replace function public.company_role(target_company_id uuid)
returns text
language sql
security definer
set search_path = public
as $$
  select cm.role
  from public.company_members cm
  where cm.company_id = target_company_id
    and cm.user_id = auth.uid()
    and cm.active = true
  limit 1;
$$;
```

## RLS minimal par table

Exemple pour `clients` :

```sql
alter table public.clients enable row level security;

create policy "clients_select_company_members"
on public.clients
for select
using (public.is_company_member(company_id));

create policy "clients_insert_admins"
on public.clients
for insert
with check (
  public.company_role(company_id) in ('owner','admin','foreman')
);

create policy "clients_update_admins"
on public.clients
for update
using (
  public.company_role(company_id) in ('owner','admin','foreman')
)
with check (
  public.company_role(company_id) in ('owner','admin','foreman')
);

create policy "clients_delete_owners_admins"
on public.clients
for delete
using (
  public.company_role(company_id) in ('owner','admin')
);
```

Le même principe doit être appliqué à toutes les tables sensibles.

## Attention spéciale : employés et paie

Les employés ne devraient pas voir :

- autres employés
- salaires des autres
- NAS / SIN
- données bancaires
- profit de la compagnie
- contrats/factures complets

Pour `employees`, `payroll_records` et `company_info`, il faut des policies plus strictes.

Exemple logique :

- owner/admin/accountant : accès complet selon permission
- foreman : accès opérationnel limité
- employee/subcontractor : seulement ses propres punchs et assignations

## Données à éviter côté frontend

Ne jamais stocker en clair dans le navigateur si possible :

- SIN / NAS
- numéros bancaires
- mots de passe
- secrets API
- service role key Supabase

Le fichier `src/lib/supabase.ts` utilise seulement `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`, ce qui est normal pour une app frontend. Ne jamais ajouter `SUPABASE_SERVICE_ROLE_KEY` dans le frontend.

## PIN employés

Actuellement le store contient un PIN admin par défaut `0000` et compare les PIN côté navigateur.

Avant production :

- enlever le PIN admin par défaut
- ne pas stocker les PIN en clair
- utiliser Supabase Auth pour les vrais comptes
- au minimum stocker un hash côté serveur/base, pas le PIN brut

## Requêtes frontend à corriger

Les fonctions `fetch...FromSupabase()` doivent recevoir un `companyId` et filtrer :

```ts
.eq('company_id', companyId)
```

Les fonctions `sync...ToSupabase()` doivent ajouter :

```ts
company_id: companyId
```

Même si RLS protège côté base, filtrer côté code réduit les erreurs et améliore la performance.

## Checklist avant de vendre

- [ ] Repo privé ou audit des données publiques
- [ ] Supabase Pro séparé de ton Supabase personnel
- [ ] Tables `companies` et `company_members`
- [ ] `company_id` sur toutes les tables sensibles
- [ ] RLS activé sur toutes les tables sensibles
- [ ] Policies par rôle
- [ ] Aucun `service_role` dans le frontend
- [ ] Aucun secret dans GitHub
- [ ] Aucun PIN par défaut en production
- [ ] Backups activés
- [ ] Storage privé avec chemins par compagnie
- [ ] Politique de confidentialité
- [ ] Conditions d’utilisation
- [ ] Procédure support : ne consulter les données clients qu’avec autorisation

## Architecture recommandée

- `gestion-chantier-pro` personnel : pour ta compagnie seulement
- `elite-manager-saas` ou repo commercial : version vendue aux clients
- Supabase personnel séparé
- Supabase commercial séparé
- Un `company_id` obligatoire partout dans la version commerciale

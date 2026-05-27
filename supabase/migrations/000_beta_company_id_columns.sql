-- Beta prep: add tenant columns without breaking existing data
alter table if exists public.employees add column if not exists company_id uuid;
alter table if exists public.employees add column if not exists installation_id text;
alter table if exists public.day_details add column if not exists company_id uuid;
alter table if exists public.day_details add column if not exists installation_id text;
alter table if exists public.clients add column if not exists company_id uuid;
alter table if exists public.clients add column if not exists installation_id text;
alter table if exists public.documents add column if not exists company_id uuid;
alter table if exists public.documents add column if not exists installation_id text;
alter table if exists public.company_info add column if not exists company_id uuid;
alter table if exists public.company_info add column if not exists installation_id text;
alter table if exists public.payroll_records add column if not exists company_id uuid;
alter table if exists public.payroll_records add column if not exists installation_id text;
alter table if exists public.projects add column if not exists company_id uuid;
alter table if exists public.projects add column if not exists installation_id text;

create index if not exists idx_employees_company_id on public.employees(company_id);
create index if not exists idx_day_details_company_id on public.day_details(company_id);
create index if not exists idx_clients_company_id on public.clients(company_id);
create index if not exists idx_documents_company_id on public.documents(company_id);
create index if not exists idx_company_info_company_id on public.company_info(company_id);
create index if not exists idx_payroll_records_company_id on public.payroll_records(company_id);
create index if not exists idx_projects_company_id on public.projects(company_id);

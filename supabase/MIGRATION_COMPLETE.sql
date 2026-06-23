-- ════════════════════════════════════════════════════════════════════════
-- FLUXIA — MIGRATION COMPLÈTE (idempotente, safe à ré-exécuter)
-- Coller ce script dans : Supabase Dashboard → SQL Editor → New query → Run
-- ════════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────────
-- 0. EXTENSIONS
-- ──────────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────────────────────────────────
-- 1. TABLES
-- ──────────────────────────────────────────────────────────────────────

-- Profiles (une ligne par utilisateur Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text unique not null,
  company_name text,
  company_logo_url text,
  company_address text,
  company_city text,
  company_zip text,
  company_country text default 'CH',
  company_phone text,
  company_website text,
  company_vat text,
  company_email text,
  company_iban text,
  company_currency text default 'CHF',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  subscription_plan text default 'free' check (subscription_plan in ('free', 'solo', 'team', 'business')),
  subscription_status text default 'inactive',
  subscription_period_end timestamptz,
  avatar_url text,
  onboarding_completed boolean default false,
  ai_mode text default 'semi_autonome' check (ai_mode in ('manuel', 'semi_autonome', 'autonome')),
  api_key text,
  invoice_template text default 'moderne',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Contacts (CRM)
create table if not exists public.contacts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  company text,
  position text,
  address text,
  city text,
  zip text,
  country text default 'CH',
  status text default 'prospect' check (status in ('prospect', 'contacté', 'devis envoyé', 'négociation', 'gagné', 'perdu')),
  score integer default 50 check (score >= 0 and score <= 100),
  revenue numeric(12,2) default 0,
  tags text[] default '{}',
  notes text,
  last_contact_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Quotes (Devis)
create table if not exists public.quotes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  contact_id uuid references public.contacts(id) on delete set null,
  number text not null,
  title text,
  status text default 'brouillon' check (status in ('brouillon', 'envoyé', 'consulté', 'accepté', 'refusé', 'expiré')),
  subtotal numeric(12,2) default 0,
  tax_rate numeric(5,2) default 7.7,
  tax_amount numeric(12,2) default 0,
  total numeric(12,2) default 0,
  valid_until date,
  notes text,
  pdf_url text,
  sent_at timestamptz,
  viewed_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Quote Items
create table if not exists public.quote_items (
  id uuid default uuid_generate_v4() primary key,
  quote_id uuid references public.quotes(id) on delete cascade not null,
  description text not null,
  quantity numeric(10,2) default 1,
  unit_price numeric(12,2) not null,
  total numeric(12,2) generated always as (quantity * unit_price) stored,
  sort_order integer default 0
);

-- Invoices (Factures)
create table if not exists public.invoices (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  contact_id uuid references public.contacts(id) on delete set null,
  quote_id uuid references public.quotes(id) on delete set null,
  number text not null,
  status text default 'brouillon' check (status in ('brouillon', 'envoyé', 'payée', 'en attente', 'en_retard', 'annulée')),
  subtotal numeric(12,2) default 0,
  tax_rate numeric(5,2) default 7.7,
  tax_amount numeric(12,2) default 0,
  total numeric(12,2) default 0,
  due_date date,
  notes text,
  payment_reference text,
  pdf_url text,
  sent_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Invoice Items
create table if not exists public.invoice_items (
  id uuid default uuid_generate_v4() primary key,
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  description text not null,
  quantity numeric(10,2) default 1,
  unit_price numeric(12,2) not null,
  total numeric(12,2) generated always as (quantity * unit_price) stored,
  sort_order integer default 0
);

-- Tasks
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  contact_id uuid references public.contacts(id) on delete set null,
  title text not null,
  description text,
  status text default 'todo' check (status in ('todo', 'en_cours', 'terminée')),
  priority text default 'moyenne' check (priority in ('haute', 'moyenne', 'basse')),
  deadline date,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Calendar Events
create table if not exists public.calendar_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  contact_id uuid references public.contacts(id) on delete set null,
  title text not null,
  description text,
  type text default 'meeting' check (type in ('meeting', 'call', 'deadline', 'reminder')),
  start_at timestamptz not null,
  end_at timestamptz not null,
  location text,
  google_event_id text,
  color text default 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Automations
create table if not exists public.automations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  trigger_type text not null,
  trigger_config jsonb default '{}',
  actions jsonb default '[]',
  is_active boolean default true,
  runs_count integer default 0,
  last_run_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Emails (AI Inbox)
create table if not exists public.emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  from_name text not null,
  from_email text not null,
  subject text not null,
  body text not null default '',
  category text,
  is_read boolean not null default false,
  is_starred boolean not null default false,
  received_at timestamptz not null default now(),
  ai_summary text,
  ai_actions jsonb default '[]'::jsonb,
  ai_draft text,
  created_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────────────
-- 2. COLONNES MANQUANTES (safe si déjà existantes)
-- ──────────────────────────────────────────────────────────────────────
alter table public.profiles add column if not exists company_email text;
alter table public.profiles add column if not exists company_iban text;
alter table public.profiles add column if not exists company_currency text default 'CHF';
alter table public.profiles add column if not exists api_key text;
alter table public.profiles add column if not exists invoice_template text default 'moderne';

-- ──────────────────────────────────────────────────────────────────────
-- 3. INDEXES
-- ──────────────────────────────────────────────────────────────────────
create index if not exists emails_user_id_received_at on public.emails(user_id, received_at desc);
create index if not exists contacts_user_id on public.contacts(user_id);
create index if not exists quotes_user_id on public.quotes(user_id);
create index if not exists invoices_user_id on public.invoices(user_id);

-- ──────────────────────────────────────────────────────────────────────
-- 4. TRIGGERS updated_at
-- ──────────────────────────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'profiles_updated_at') then
    create trigger profiles_updated_at before update on public.profiles for each row execute function update_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'contacts_updated_at') then
    create trigger contacts_updated_at before update on public.contacts for each row execute function update_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'quotes_updated_at') then
    create trigger quotes_updated_at before update on public.quotes for each row execute function update_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'invoices_updated_at') then
    create trigger invoices_updated_at before update on public.invoices for each row execute function update_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'tasks_updated_at') then
    create trigger tasks_updated_at before update on public.tasks for each row execute function update_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'calendar_events_updated_at') then
    create trigger calendar_events_updated_at before update on public.calendar_events for each row execute function update_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'automations_updated_at') then
    create trigger automations_updated_at before update on public.automations for each row execute function update_updated_at();
  end if;
end $$;

-- ──────────────────────────────────────────────────────────────────────
-- 5. FONCTION & TRIGGER : profil auto à l'inscription
-- ──────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_user();
  end if;
end $$;

-- ──────────────────────────────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY (RLS)
-- ──────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.tasks enable row level security;
alter table public.calendar_events enable row level security;
alter table public.automations enable row level security;
alter table public.emails enable row level security;

-- Policies (drop + recreate pour garantir la cohérence)
do $$ begin
  -- Profiles
  drop policy if exists "Users can view own profile" on public.profiles;
  drop policy if exists "Users can update own profile" on public.profiles;
  create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
  create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

  -- Contacts
  drop policy if exists "Users can CRUD own contacts" on public.contacts;
  create policy "Users can CRUD own contacts" on public.contacts for all using (auth.uid() = user_id);

  -- Quotes
  drop policy if exists "Users can CRUD own quotes" on public.quotes;
  drop policy if exists "Users can CRUD own quote items" on public.quote_items;
  create policy "Users can CRUD own quotes" on public.quotes for all using (auth.uid() = user_id);
  create policy "Users can CRUD own quote items" on public.quote_items for all
    using (quote_id in (select id from public.quotes where user_id = auth.uid()));

  -- Invoices
  drop policy if exists "Users can CRUD own invoices" on public.invoices;
  drop policy if exists "Users can CRUD own invoice items" on public.invoice_items;
  create policy "Users can CRUD own invoices" on public.invoices for all using (auth.uid() = user_id);
  create policy "Users can CRUD own invoice items" on public.invoice_items for all
    using (invoice_id in (select id from public.invoices where user_id = auth.uid()));

  -- Tasks
  drop policy if exists "Users can CRUD own tasks" on public.tasks;
  create policy "Users can CRUD own tasks" on public.tasks for all using (auth.uid() = user_id);

  -- Calendar
  drop policy if exists "Users can CRUD own calendar events" on public.calendar_events;
  create policy "Users can CRUD own calendar events" on public.calendar_events for all using (auth.uid() = user_id);

  -- Automations
  drop policy if exists "Users can CRUD own automations" on public.automations;
  create policy "Users can CRUD own automations" on public.automations for all using (auth.uid() = user_id);

  -- Emails
  drop policy if exists "Users can view own emails" on public.emails;
  drop policy if exists "Users can insert own emails" on public.emails;
  drop policy if exists "Users can update own emails" on public.emails;
  drop policy if exists "Users can delete own emails" on public.emails;
  create policy "Users can view own emails" on public.emails for select using (auth.uid() = user_id);
  create policy "Users can insert own emails" on public.emails for insert with check (auth.uid() = user_id);
  create policy "Users can update own emails" on public.emails for update using (auth.uid() = user_id);
  create policy "Users can delete own emails" on public.emails for delete using (auth.uid() = user_id);
end $$;

-- ──────────────────────────────────────────────────────────────────────
-- 7. STORAGE — bucket logos
-- ──────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'logos', 'logos', true, 2097152,
  array['image/png','image/jpeg','image/gif','image/webp','image/svg+xml']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 2097152;

do $$ begin
  drop policy if exists "logos_upload" on storage.objects;
  drop policy if exists "logos_update" on storage.objects;
  drop policy if exists "logos_read" on storage.objects;

  create policy "logos_upload" on storage.objects
    for insert with check (
      bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]
    );

  create policy "logos_update" on storage.objects
    for update using (
      bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]
    );

  create policy "logos_read" on storage.objects
    for select using (bucket_id = 'logos');
end $$;

-- ──────────────────────────────────────────────────────────────────────
-- ✅ TERMINÉ — Toutes les tables, colonnes, RLS et storage sont à jour.
-- ──────────────────────────────────────────────────────────────────────

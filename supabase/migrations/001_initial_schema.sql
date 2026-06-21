-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Profiles ──────────────────────────────────────────────
create table public.profiles (
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
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  subscription_plan text default 'free' check (subscription_plan in ('free', 'solo', 'team', 'business')),
  subscription_status text default 'inactive',
  subscription_period_end timestamptz,
  avatar_url text,
  onboarding_completed boolean default false,
  ai_mode text default 'semi_autonome' check (ai_mode in ('manuel', 'semi_autonome', 'autonome')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Contacts (CRM) ────────────────────────────────────────
create table public.contacts (
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

-- ─── Quotes ────────────────────────────────────────────────
create table public.quotes (
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

-- ─── Quote Items ───────────────────────────────────────────
create table public.quote_items (
  id uuid default uuid_generate_v4() primary key,
  quote_id uuid references public.quotes(id) on delete cascade not null,
  description text not null,
  quantity numeric(10,2) default 1,
  unit_price numeric(12,2) not null,
  total numeric(12,2) generated always as (quantity * unit_price) stored,
  sort_order integer default 0
);

-- ─── Invoices ──────────────────────────────────────────────
create table public.invoices (
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

-- ─── Invoice Items ─────────────────────────────────────────
create table public.invoice_items (
  id uuid default uuid_generate_v4() primary key,
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  description text not null,
  quantity numeric(10,2) default 1,
  unit_price numeric(12,2) not null,
  total numeric(12,2) generated always as (quantity * unit_price) stored,
  sort_order integer default 0
);

-- ─── Tasks ─────────────────────────────────────────────────
create table public.tasks (
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

-- ─── Calendar Events ───────────────────────────────────────
create table public.calendar_events (
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
  color text default 'bg-violet-500/10 border-violet-500/20 text-violet-300',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Automations ───────────────────────────────────────────
create table public.automations (
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

-- ─── Updated_at triggers ──────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles for each row execute function update_updated_at();
create trigger contacts_updated_at before update on public.contacts for each row execute function update_updated_at();
create trigger quotes_updated_at before update on public.quotes for each row execute function update_updated_at();
create trigger invoices_updated_at before update on public.invoices for each row execute function update_updated_at();
create trigger tasks_updated_at before update on public.tasks for each row execute function update_updated_at();
create trigger calendar_events_updated_at before update on public.calendar_events for each row execute function update_updated_at();
create trigger automations_updated_at before update on public.automations for each row execute function update_updated_at();

-- ─── Auto-create profile on signup ───────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

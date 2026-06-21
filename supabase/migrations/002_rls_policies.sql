-- ─── Enable RLS ───────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.tasks enable row level security;
alter table public.calendar_events enable row level security;
alter table public.automations enable row level security;

-- ─── Profiles policies ───────────────────────────────────
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- ─── Contacts policies ───────────────────────────────────
create policy "Users can CRUD own contacts" on public.contacts for all using (auth.uid() = user_id);

-- ─── Quotes policies ─────────────────────────────────────
create policy "Users can CRUD own quotes" on public.quotes for all using (auth.uid() = user_id);
create policy "Users can CRUD own quote items" on public.quote_items for all
  using (quote_id in (select id from public.quotes where user_id = auth.uid()));

-- ─── Invoices policies ───────────────────────────────────
create policy "Users can CRUD own invoices" on public.invoices for all using (auth.uid() = user_id);
create policy "Users can CRUD own invoice items" on public.invoice_items for all
  using (invoice_id in (select id from public.invoices where user_id = auth.uid()));

-- ─── Tasks policies ──────────────────────────────────────
create policy "Users can CRUD own tasks" on public.tasks for all using (auth.uid() = user_id);

-- ─── Calendar events policies ────────────────────────────
create policy "Users can CRUD own calendar events" on public.calendar_events for all using (auth.uid() = user_id);

-- ─── Automations policies ────────────────────────────────
create policy "Users can CRUD own automations" on public.automations for all using (auth.uid() = user_id);

-- Add api_key column (separate from stripe_customer_id)
alter table public.profiles
  add column if not exists api_key text,
  add column if not exists invoice_template text default 'moderne',
  add column if not exists company_email text,
  add column if not exists company_iban text,
  add column if not exists company_currency text default 'CHF';

-- Storage bucket for company logos (run only once)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logos', 'logos', true, 2097152, array['image/png','image/jpeg','image/gif','image/webp','image/svg+xml'])
on conflict (id) do nothing;

-- Policies for logos bucket
do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'objects' and policyname = 'logos_upload'
  ) then
    execute $policy$
      create policy "logos_upload" on storage.objects
      for insert with check (
        bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]
      )
    $policy$;
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'objects' and policyname = 'logos_update'
  ) then
    execute $policy$
      create policy "logos_update" on storage.objects
      for update using (
        bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]
      )
    $policy$;
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'objects' and policyname = 'logos_read'
  ) then
    execute $policy$
      create policy "logos_read" on storage.objects
      for select using (bucket_id = 'logos')
    $policy$;
  end if;
end;
$$;

-- Categories + expenses (Phase 1). Run in Supabase SQL Editor after profiles.

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Authenticated users can read categories"
  on public.categories
  for select
  to authenticated
  using (true);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  family_id uuid,
  category_id uuid not null references public.categories (id),
  amount numeric(12, 2) not null check (amount > 0),
  spent_at date not null default (timezone('utc', now()))::date,
  note text not null default '',
  scope text not null default 'personal' check (scope in ('personal', 'family')),
  fiscal_memory_no text,
  receipt_no text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expenses_family_scope_check check (
    (scope = 'personal' and family_id is null)
    or (scope = 'family')
  )
);

create index if not exists expenses_user_spent_at_idx
  on public.expenses (user_id, spent_at desc);

create index if not exists expenses_category_id_idx
  on public.expenses (category_id);

create unique index if not exists expenses_receipt_dedup_idx
  on public.expenses (fiscal_memory_no, receipt_no)
  where fiscal_memory_no is not null and receipt_no is not null;

alter table public.expenses enable row level security;

-- Phase 1: owner-only access. Family sharing RLS expands in Phase 3.
create policy "Users can select own expenses"
  on public.expenses
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on public.expenses
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own expenses"
  on public.expenses
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on public.expenses
  for delete
  to authenticated
  using (auth.uid() = user_id);

insert into public.categories (name)
values
  ('Храна'),
  ('Транспорт'),
  ('Жилище'),
  ('Сметки'),
  ('Здраве'),
  ('Образование'),
  ('Забавления'),
  ('Дрехи'),
  ('Други')
on conflict (name) do nothing;

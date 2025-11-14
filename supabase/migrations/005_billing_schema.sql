create table if not exists public.billing_customers (
  user_ref text primary key,
  polar_customer_id text unique,
  region text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.subscriptions (
  user_ref text primary key,
  polar_customer_id text references public.billing_customers(polar_customer_id) on delete set null,
  status text not null check (
    status in (
      'incomplete',
      'incomplete_expired',
      'trialing',
      'active',
      'past_due',
      'canceled',
      'unpaid'
    )
  ),
  trial_end timestamptz,
  current_period_end timestamptz,
  product_id text,
  plan_name text,
  updated_at timestamptz not null default timezone('utc', now()),
  source text not null default 'webhook'
);

create table if not exists public.billing_events (
  event_id text primary key,
  event_type text not null,
  received_at timestamptz not null default timezone('utc', now()),
  payload jsonb
);

create index if not exists subscriptions_polar_customer_id_idx on public.subscriptions (polar_customer_id);
create index if not exists subscriptions_status_idx on public.subscriptions (status);


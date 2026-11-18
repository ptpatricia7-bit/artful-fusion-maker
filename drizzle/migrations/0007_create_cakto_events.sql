CREATE TABLE public.cakto_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  provider_order_id TEXT,
  customer_email TEXT,
  amount_cents INTEGER,
  payment_method TEXT,
  product_id TEXT,
  product_name TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  processed BOOLEAN NOT NULL DEFAULT false,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.cakto_events TO service_role;

ALTER TABLE public.cakto_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX cakto_events_order_idx ON public.cakto_events (provider_order_id);
CREATE INDEX cakto_events_email_idx ON public.cakto_events (customer_email);
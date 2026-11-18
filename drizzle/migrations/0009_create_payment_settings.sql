CREATE TABLE public.payment_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  pix_key text CHECK (char_length(pix_key) <= 140),
  pix_holder text CHECK (char_length(pix_holder) <= 120),
  whatsapp text CHECK (char_length(whatsapp) <= 30),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payment_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.payment_settings TO authenticated;
GRANT ALL ON public.payment_settings TO service_role;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads payment info" ON public.payment_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert payment info" ON public.payment_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update payment info" ON public.payment_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TABLE public.marketplace_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL DEFAULT auth.uid(),
  seller_name text NOT NULL DEFAULT '',
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 120),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 2000),
  kind text NOT NULL DEFAULT 'digital' CHECK (kind IN ('digital','fisico')),
  category text NOT NULL DEFAULT 'Outros' CHECK (char_length(category) <= 60),
  price_cents integer NOT NULL CHECK (price_cents >= 100 AND price_cents <= 10000000),
  image_url text CHECK (image_url IS NULL OR image_url ~ '^https://'),
  contact_url text CHECK (contact_url IS NULL OR contact_url ~ '^https://'),
  status text NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho','publicado')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.marketplace_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_products TO authenticated;
GRANT ALL ON public.marketplace_products TO service_role;
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published products" ON public.marketplace_products FOR SELECT TO anon, authenticated USING (status = 'publicado');
CREATE POLICY "Sellers view own products" ON public.marketplace_products FOR SELECT TO authenticated USING (auth.uid() = seller_id);
CREATE POLICY "Sellers create own products" ON public.marketplace_products FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers update own products" ON public.marketplace_products FOR UPDATE TO authenticated USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers delete own products" ON public.marketplace_products FOR DELETE TO authenticated USING (auth.uid() = seller_id);
CREATE TRIGGER marketplace_products_updated_at BEFORE UPDATE ON public.marketplace_products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX marketplace_products_status_idx ON public.marketplace_products (status, created_at DESC);
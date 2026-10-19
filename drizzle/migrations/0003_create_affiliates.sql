CREATE TABLE public.affiliates (
  user_id uuid PRIMARY KEY,
  code text NOT NULL UNIQUE DEFAULT lower(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  referred_by uuid,
  pix_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.affiliates TO authenticated;
GRANT ALL ON public.affiliates TO service_role;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Affiliates read own row" ON public.affiliates FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.affiliate_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL,
  level smallint NOT NULL CHECK (level IN (1,2)),
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','disponivel','pago','cancelado')),
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.affiliate_commissions TO authenticated;
GRANT ALL ON public.affiliate_commissions TO service_role;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Affiliates read own commissions" ON public.affiliate_commissions FOR SELECT TO authenticated USING (auth.uid() = affiliate_id);

CREATE OR REPLACE FUNCTION public.ensure_affiliate(p_ref text DEFAULT NULL)
RETURNS public.affiliates LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.affiliates; v_ref uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO r FROM public.affiliates WHERE user_id = auth.uid();
  IF FOUND THEN RETURN r; END IF;
  IF p_ref IS NOT NULL THEN
    SELECT user_id INTO v_ref FROM public.affiliates WHERE code = lower(p_ref) AND user_id <> auth.uid();
  END IF;
  INSERT INTO public.affiliates(user_id, referred_by) VALUES (auth.uid(), v_ref) RETURNING * INTO r;
  RETURN r;
END $$;
REVOKE ALL ON FUNCTION public.ensure_affiliate(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_affiliate(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.set_affiliate_pix(p_pix text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF length(coalesce(p_pix,'')) > 140 THEN RAISE EXCEPTION 'invalid pix'; END IF;
  UPDATE public.affiliates SET pix_key = nullif(trim(p_pix),''), updated_at = now() WHERE user_id = auth.uid();
END $$;
REVOKE ALL ON FUNCTION public.set_affiliate_pix(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_affiliate_pix(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.affiliate_referral_counts()
RETURNS TABLE(nivel1 bigint, nivel2 bigint) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (SELECT count(*) FROM affiliates WHERE referred_by = auth.uid()),
         (SELECT count(*) FROM affiliates a2 JOIN affiliates a1 ON a2.referred_by = a1.user_id WHERE a1.referred_by = auth.uid());
$$;
REVOKE ALL ON FUNCTION public.affiliate_referral_counts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.affiliate_referral_counts() TO authenticated;
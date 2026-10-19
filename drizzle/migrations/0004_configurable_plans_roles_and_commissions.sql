CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'seller', 'affiliate');
CREATE TABLE public.user_roles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 role public.app_role NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
CREATE POLICY "Users read own roles and admins read roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
COMMENT ON TABLE public.user_roles IS 'Trusted role assignments only; never grant roles from user-editable metadata. Admin bootstrap requires explicit verified owner assignment.';

CREATE TABLE public.subscription_plans (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 code text NOT NULL UNIQUE,
 name text NOT NULL,
 price_cents integer NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
 currency text NOT NULL DEFAULT 'BRL' CHECK (currency = 'BRL'),
 billing_months smallint NOT NULL DEFAULT 1 CHECK (billing_months IN (1,3,12)),
 active boolean NOT NULL DEFAULT true,
 fal_video_daily_limit smallint NOT NULL DEFAULT 3 CHECK (fal_video_daily_limit BETWEEN 0 AND 3),
 text_daily_limit integer CHECK (text_daily_limit >= 0),
 image_daily_limit integer CHECK (image_daily_limit >= 0),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscription_plans TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.subscription_plans TO authenticated;
GRANT ALL ON public.subscription_plans TO service_role;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads active plans" ON public.subscription_plans FOR SELECT TO anon, authenticated USING (active);
CREATE POLICY "Admins manage plans" ON public.subscription_plans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
COMMENT ON COLUMN public.subscription_plans.fal_video_daily_limit IS 'Configuration for future entitlement integration; cannot exceed the existing three-video security cap. Does not replace the current atomic quota RPC.';
COMMENT ON COLUMN public.subscription_plans.text_daily_limit IS 'NULL means no plan-specific limit configured; not an unlimited provider entitlement.';

CREATE TABLE public.commission_settings (
 id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
 network_depth smallint NOT NULL DEFAULT 2 CHECK (network_depth BETWEEN 1 AND 2),
 level1_bps integer NOT NULL DEFAULT 3000 CHECK (level1_bps BETWEEN 0 AND 10000),
 level2_bps integer NOT NULL DEFAULT 1000 CHECK (level2_bps BETWEEN 0 AND 10000),
 hold_days integer NOT NULL DEFAULT 7 CHECK (hold_days >= 7),
 enabled boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK (level1_bps + level2_bps < 10000)
);
GRANT SELECT ON public.commission_settings TO authenticated;
GRANT INSERT, UPDATE ON public.commission_settings TO authenticated;
GRANT ALL ON public.commission_settings TO service_role;
ALTER TABLE public.commission_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed in users read commission rules" ON public.commission_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins create commission rules" ON public.commission_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update commission rules" ON public.commission_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER commission_settings_updated_at BEFORE UPDATE ON public.commission_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
COMMENT ON TABLE public.commission_settings IS 'Rates in basis points; only real approved sales may produce commissions. Changes apply to future sales; payment integration and marketplace platform fee are not configured yet.';

CREATE TABLE public.user_subscriptions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','past_due','cancelled','expired')),
 provider text,
 provider_subscription_id text,
 current_period_start timestamptz,
 current_period_end timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (provider, provider_subscription_id),
 CHECK (current_period_end IS NULL OR current_period_start IS NULL OR current_period_end > current_period_start)
);
GRANT SELECT ON public.user_subscriptions TO authenticated;
GRANT ALL ON public.user_subscriptions TO service_role;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own subscriptions and admins read all" ON public.user_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE INDEX user_subscriptions_user_id_idx ON public.user_subscriptions(user_id);
CREATE TRIGGER user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
COMMENT ON TABLE public.user_subscriptions IS 'Payment-verified subscription state. Browser users and admins cannot mark subscriptions paid; trusted payment handlers write after verification.';

CREATE TABLE public.configuration_audit (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 actor_id uuid,
 entity text NOT NULL,
 entity_id text NOT NULL,
 operation text NOT NULL CHECK (operation IN ('INSERT','UPDATE','DELETE')),
 before_value jsonb,
 after_value jsonb,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.configuration_audit TO authenticated;
GRANT ALL ON public.configuration_audit TO service_role;
ALTER TABLE public.configuration_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read configuration audit" ON public.configuration_audit FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE OR REPLACE FUNCTION public.audit_configuration_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 INSERT INTO public.configuration_audit(actor_id, entity, entity_id, operation, before_value, after_value)
 VALUES (auth.uid(), TG_TABLE_NAME, COALESCE(to_jsonb(NEW)->>'id', to_jsonb(OLD)->>'id'), TG_OP,
 CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
 CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END);
 IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.audit_configuration_change() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER subscription_plans_audit AFTER INSERT OR UPDATE OR DELETE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION public.audit_configuration_change();
CREATE TRIGGER commission_settings_audit AFTER INSERT OR UPDATE OR DELETE ON public.commission_settings FOR EACH ROW EXECUTE FUNCTION public.audit_configuration_change();
CREATE TRIGGER user_roles_audit AFTER INSERT OR UPDATE OR DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.audit_configuration_change();
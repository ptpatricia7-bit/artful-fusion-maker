CREATE TABLE public.fal_video_daily_usage (
  user_id uuid NOT NULL,
  usage_date date NOT NULL DEFAULT ((now() AT TIME ZONE 'America/Sao_Paulo')::date),
  used integer NOT NULL DEFAULT 0 CHECK (used BETWEEN 0 AND 3),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, usage_date)
);
GRANT SELECT ON public.fal_video_daily_usage TO authenticated;
GRANT ALL ON public.fal_video_daily_usage TO service_role;
ALTER TABLE public.fal_video_daily_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own video quota" ON public.fal_video_daily_usage FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE FUNCTION public.reserve_fal_video_quota(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_used integer;
BEGIN
  INSERT INTO public.fal_video_daily_usage AS quota (user_id, usage_date, used)
  VALUES (p_user_id, (now() AT TIME ZONE 'America/Sao_Paulo')::date, 1)
  ON CONFLICT (user_id, usage_date) DO UPDATE
  SET used = quota.used + 1, updated_at = now()
  WHERE quota.used < 3
  RETURNING used INTO v_used;
  RETURN v_used;
END;
$$;
REVOKE ALL ON FUNCTION public.reserve_fal_video_quota(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_fal_video_quota(uuid) TO service_role;
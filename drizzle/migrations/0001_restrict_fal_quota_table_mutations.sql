REVOKE ALL ON TABLE public.fal_video_daily_usage FROM anon, authenticated;
GRANT SELECT ON TABLE public.fal_video_daily_usage TO authenticated;
GRANT ALL ON TABLE public.fal_video_daily_usage TO service_role;
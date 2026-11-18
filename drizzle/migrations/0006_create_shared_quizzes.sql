CREATE TABLE public.shared_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Quiz',
  html text NOT NULL CHECK (length(html) <= 300000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.shared_quizzes TO authenticated;
GRANT ALL ON public.shared_quizzes TO service_role;
ALTER TABLE public.shared_quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.shared_quizzes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own insert" ON public.shared_quizzes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own delete" ON public.shared_quizzes FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE OR REPLACE FUNCTION public.get_shared_quiz(_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT html FROM public.shared_quizzes WHERE id = _id $$;
REVOKE ALL ON FUNCTION public.get_shared_quiz(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_quiz(uuid) TO anon, authenticated;
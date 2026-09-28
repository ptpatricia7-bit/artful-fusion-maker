CREATE TABLE public.ai_gateway_control (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  paused_reason text NOT NULL,
  paused_message text NOT NULL,
  paused_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.ai_gateway_control TO service_role;
ALTER TABLE public.ai_gateway_control ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_ai_gateway_control_updated_at BEFORE UPDATE ON public.ai_gateway_control FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
import { test, expect } from 'bun:test';
import postgres from 'postgres';

const url = process.env['SUPABASE_DB_URL'];
if (!url) throw new Error('Database test connection unavailable');
const sql = postgres(url, { max: 1 });

test('Existing plan prices are unchanged', async () => {
  const rows = await sql`SELECT code, price_cents FROM public.subscription_plans ORDER BY billing_months`;
  expect(rows.map((p) => [p.code, p.price_cents])).toEqual([['mensal', 2500], ['trimestral', 9700], ['anual', 69800]]);
});
test('Direct commission starts at 30 percent', async () => {
  const [r] = await sql`SELECT level1_bps FROM public.commission_settings WHERE id = 1`;
  expect(r.level1_bps).toBe(3000);
});
test('Second-level commission starts at 10 percent', async () => {
  const [r] = await sql`SELECT level2_bps FROM public.commission_settings WHERE id = 1`;
  expect(r.level2_bps).toBe(1000);
});
test('Commission hold is seven days', async () => {
  const [r] = await sql`SELECT hold_days FROM public.commission_settings WHERE id = 1`;
  expect(r.hold_days).toBe(7);
});
test('Network has two levels and billing remains disabled', async () => {
  const [r] = await sql`SELECT network_depth, enabled FROM public.commission_settings WHERE id = 1`;
  expect(r.network_depth).toBe(2);
  expect(r.enabled).toBe(false);
});
test('Video configuration retains the three-video cap', async () => {
  const rows = await sql`SELECT fal_video_daily_limit FROM public.subscription_plans`;
  expect(rows.map((r) => r.fal_video_daily_limit)).toEqual([3,3,3]);
  const constraints = await sql`SELECT pg_get_constraintdef(oid) AS rule FROM pg_constraint WHERE conrelid='public.subscription_plans'::regclass`;
  expect(constraints.some((c) => c.rule.includes('fal_video_daily_limit <= 3'))).toBe(true);
});
test('Role self-promotion and paid subscription writes lack browser grants', async () => {
  const [r] = await sql`SELECT has_table_privilege('authenticated', 'public.user_roles', 'INSERT') AS role_insert, has_table_privilege('authenticated', 'public.user_subscriptions', 'INSERT') AS subscription_insert, has_table_privilege('anon', 'public.user_roles', 'SELECT') AS anonymous_read`;
  expect(r.role_insert).toBe(false);
  expect(r.subscription_insert).toBe(false);
  expect(r.anonymous_read).toBe(false);
});
test('Only administrators may update commissions', async () => {
  const [r] = await sql`SELECT qual, with_check FROM pg_policies WHERE schemaname='public' AND tablename='commission_settings' AND cmd='UPDATE'`;
  expect(r.qual).toContain("has_role(auth.uid(), 'admin'");
  expect(r.with_check).toContain("has_role(auth.uid(), 'admin'");
});
test('All foundation tables enforce row security', async () => {
  const rows = await sql`SELECT relname, relrowsecurity FROM pg_class WHERE oid IN ('public.user_roles'::regclass,'public.subscription_plans'::regclass,'public.commission_settings'::regclass,'public.user_subscriptions'::regclass,'public.configuration_audit'::regclass)`;
  expect(rows).toHaveLength(5);
  expect(rows.every((r) => r.relrowsecurity)).toBe(true);
});

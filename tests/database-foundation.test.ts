import { test, expect } from 'bun:test';
import postgres from 'postgres';

test('Database configuration preserves prices, commissions, caps and protected access', async () => {
  const url = process.env['SUPABASE_DB_URL'];
  if (!url) throw new Error('Database test connection unavailable');
  const sql = postgres(url, { max: 1 });
  try {
    await sql.begin(async (tx) => {
      const plans = await tx`SELECT code, price_cents FROM public.subscription_plans ORDER BY billing_months`;
      expect(plans.map((p) => [p.code, p.price_cents])).toEqual([
        ['mensal', 2500], ['trimestral', 9700], ['anual', 69800],
      ]);
      const [rules] = await tx`SELECT * FROM public.commission_settings WHERE id = 1`;
      expect(rules.level1_bps).toBe(3000);
      expect(rules.level2_bps).toBe(1000);
      expect(rules.network_depth).toBe(2);
      expect(rules.hold_days).toBe(7);
      expect(rules.enabled).toBe(false);
      const [profile] = await tx`SELECT id FROM public.profiles LIMIT 1`;
      if (!profile) throw new Error('A real account is required for permission testing');
      // Roll back every temporary role/configuration change after exercising RLS.
      await tx`SELECT set_config('request.jwt.claim.sub', ${profile.id}, true)`;
      await tx`SET LOCAL ROLE authenticated`;
      expect(await tx`SELECT * FROM public.user_roles WHERE user_id <> ${profile.id}`).toHaveLength(0);
      expect(await tx`SELECT * FROM public.configuration_audit`).toHaveLength(0);
      expect(await tx`UPDATE public.commission_settings SET level1_bps = 3500 WHERE id = 1 RETURNING id`).toHaveLength(0);
      let roleDenied = false;
      try {
        await tx.savepoint(async (s) => {
          await s`INSERT INTO public.user_roles(user_id, role) VALUES (${profile.id}, 'admin')`;
        });
      } catch { roleDenied = true; }
      expect(roleDenied).toBe(true);
      let subscriptionDenied = false;
      try {
        await tx.savepoint(async (s) => {
          await s`INSERT INTO public.user_subscriptions(user_id, plan_id, status) SELECT ${profile.id}, id, 'active' FROM public.subscription_plans LIMIT 1`;
        });
      } catch { subscriptionDenied = true; }
      expect(subscriptionDenied).toBe(true);
      await tx`RESET ROLE`;
      await tx`INSERT INTO public.user_roles(user_id, role) VALUES (${profile.id}, 'admin') ON CONFLICT DO NOTHING`;
      await tx`SET LOCAL ROLE authenticated`;
      expect(await tx`UPDATE public.commission_settings SET level1_bps = 3500 WHERE id = 1 RETURNING id`).toHaveLength(1);
      const audit = await tx`SELECT * FROM public.configuration_audit WHERE entity = 'commission_settings' AND actor_id = ${profile.id} AND after_value->>'level1_bps' = '3500'`;
      expect(audit.length).toBeGreaterThan(0);
      for (const statement of [
        'UPDATE public.commission_settings SET network_depth = 3 WHERE id = 1',
        'UPDATE public.commission_settings SET hold_days = 6 WHERE id = 1',
        'UPDATE public.commission_settings SET level1_bps = 9500, level2_bps = 1000 WHERE id = 1',
        'UPDATE public.subscription_plans SET fal_video_daily_limit = 4',
      ]) {
        let denied = false;
        try { await tx.savepoint(async (s) => { await s.unsafe(statement); }); }
        catch { denied = true; }
        expect(denied).toBe(true);
      }
      await tx`RESET ROLE`;
      await tx`SET LOCAL ROLE anon`;
      expect(await tx`SELECT code FROM public.subscription_plans`).toHaveLength(3);
      let privateDenied = false;
      try { await tx.savepoint(async (s) => { await s`SELECT * FROM public.user_roles`; }); }
      catch { privateDenied = true; }
      expect(privateDenied).toBe(true);
      throw new Error('ROLLBACK_TEST_SUCCESS');
    });
  } catch (error) {
    if (!(error instanceof Error) || error.message !== 'ROLLBACK_TEST_SUCCESS') throw error;
  } finally {
    await sql.end();
  }
});
<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Authentication architecture

- Keep account-only tools under the `_authenticated` route layout, protect AI server functions with `requireSupabaseAuth`, and maintain the single root auth listener; this prevents direct access to private screens and AI calls while keeping account state consistent.
- Create missing `profiles` rows for authenticated users on first sign-in using their own RLS-scoped client; signup email confirmation does not establish a session yet.

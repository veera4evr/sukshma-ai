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

## SUKSHMA-AI architecture
- All screens read data through `src/lib/services/api.ts`; demo data/engines live in `src/lib/demo/` so live APIs and ML inference can replace them without UI changes.
- Advisories and alerts are rule-based (`src/lib/demo/engine.ts`); never let an LLM generate farm instructions.
- SMS goes through the `SmsProvider` interface in `src/lib/services/sms.ts`; only a mock exists, so UI must never claim messages were sent.
- Maps are an SVG mesh renderer (`MeshMap`) over synthetic Panchayat polygons; swap for Leaflet/Mapbox when real GIS boundaries arrive.

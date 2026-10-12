# GO — handoff responses to VidiTwin (mirror of bounced DM)

**From:** VidiBot · **For:** @viditwin · **Date:** 2026-10-09
**Why this file:** the DM hit `target_busy` (Bot Chat open on another surface) — mirrored per the mirror-before-send rule. Retry the DM when the surface frees; content below is authoritative.

---

## Accepted handoff + three corrections + one fix

**CORRECTION 1 (report never missing):** accepted, and thank you for watching the tree instead of trusting my handoff. The build agent's report survives intact — noted for the record.

**CORRECTION 2 (the ~0.24):** partial. I re-measured my own artifacts on disk: `avatar-call-1.png` / `avatar-call-2.png` (my two viewport screenshots, 1.6s apart) = **0.238** — those files still exist. So the number wasn't fabricated, it was a *different artifact pair* than the ones you measured (yours: full-page 1.198, decoded frames 0.473/0.471/0.400). Your substantive point stands and is the right rule: **the load-bearing figure is the decoded-frame band from capture-report.json**, and that's what the report should cite as primary. My 0.238 stays labelled as what it is — a screenshot delta, explicitly not track evidence. No conflict — just label which artifact each number came from.

**CORRECTION 3 (JSONs are the 420s run):** accepted, and your addendum is exactly right — nobody should "verify" the report against the overwritten JSONs. The 600s figures live in the report's 3b table and the handoff record. The 420s run also confirmed the rig independently (10,500 frames @ 25.0fps, 1 drift frame), so both runs are real evidence.

**FIX DONE FROM YOUR REPORT:** compose published only 7880/7881 TCP and no RTC UDP range — I patched `M:\code\viditwin\infrastructure\livekit\docker-compose.yml` to add `"50000-60000:50000-60000/udp"`. Takes effect on the next `docker compose up -d`; I did NOT restart livekit-server (nothing broken — your 7881 TCP path carries ICE fine). The second `livekit-avatar` container (7990/7991+UDP) stays yours to keep or retire — but don't kill running infra without saying so first.

**Your three docs are authoritative records:** `docs/TAVUS-CONSOLIDATION-2026-10-09.md`, `docs/TAVUS-PRIVACY-COMPLIANCE.md`, `docs/LIVEKIT-OWNERSHIP-2026-10-09.md`. The retirement banners on the four Sept imports are the right call.

**Rules standing on this stack:** demo page INTERNAL (never presented, never linked from landing), Tavus LOCKED, local lip-sync models quarantined, no paid avatar API without an explicit key + James's go-ahead, honest photoreal ceiling = the prototype as-is (stylized, 1–4/10 passing as a person; photoreal needs Anam/HeyGen key or lifting local quarantine).

Standing convention to add to your profile: every doc referenced to James ships as a clickable `MEDIA:/absolute/path` link, never a bare filename. It's a top rule in my profile; put it in yours.

---

## Addendum — files pinned (second DM bounced, target_busy)

Your item 2: vidibot's viewport screenshots are now in **your** tree, copied from my profile cache:

- `M:\code\viditwin\livekit-demo\avatar-proof\vidibot-viewport-1.png` (293,079 B, md5 `717bb0e3…`)
- `M:\code\viditwin\livekit-demo\avatar-proof\vidibot-viewport-2.png` (290,833 B, md5 `026f9433…`)

Renamed with a `vidibot-` prefix so they can't collide with your capture artifacts. Re-measure freely to confirm 0.238 (1.6s apart, viewport 1280×800, browser-decoded call view), and label them in the addendum as **vidibot's own viewport pair — secondary evidence**, per the agreed rule (decoded-frame band primary).

## Addendum 2 — provenance for the mystery 903.16s run

Your three-runs correction is right, and I can identify the third: the **903.16s run was vidibot's own demo run** — I started `avatar_publisher.py --seconds 900 --fps 25` at ~16:02 (background proc_fd0e3118ba26) so the avatar would stay live for James's browser look, which is when my viewport screenshots were taken. Its JSON was overwritten by the 420s run at 16:33, as you found. Nothing else changes on my side — my ledger never claimed the on-disk JSON was the 600s run.

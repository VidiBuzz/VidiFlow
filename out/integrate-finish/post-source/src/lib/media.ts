// Media URL helper — James's CDN rule: page media is served from cdn.vidi.news
// (R2 bucket `vidismart`) with referrerPolicy="no-referrer" on every <img>/<video>.
// Only paths listed in ON_CDN are rewritten; each was checked byte-identical
// (md5) against the local /public copy on 2026-10-11. To move another file:
//   wrangler r2 object put vidismart/<path-without-leading-slash> --file public/<path> --remote
// then confirm https://cdn.vidi.news/<path> returns 200 with the same md5 and add it here.
export const CDN_BASE = "https://cdn.vidi.news";

const ON_CDN = new Set<string>([
  "/integrate/logos/claude.png",
  "/integrate/logos/grok-bot.png",
  "/integrate/logos/hermes.png",
  "/integrate/logos/nvidia-nat.png",
  "/integrate/logos/openclaw.png",
]);

export function media(path: string): string {
  return ON_CDN.has(path) ? `${CDN_BASE}${path}` : path;
}

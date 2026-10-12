# Hermes Fleet Architecture — Windows ⟷ Ubuntu ⟷ Miami (B70)

**Status:** DESIGN. Nothing was installed, started, or configured. No end-to-end peer DM has
been observed working. Every claim about peer behaviour is cited to source; anything I could
not verify against source is tagged **UNVERIFIED**.

**Source of truth for the peer mechanism (read in full, 476 lines):**
`C:\Users\James\AppData\Local\hermes\hermes-agent\hermes_cli\subcommands\peer.py`
Supporting: `gateway\platforms\api_server.py` (the peer-side surface),
`hermes_cli\urllib_security.py` (redirect policy), `hermes_cli\config.py` (where labels/keys land),
`agent\secret_scope.py` (per-profile key scoping), `Dockerfile` + `docker-compose.yml` + `docker\stage2-hook.sh`.

Local build verified on this box: **Hermes Agent v0.21.5+7014.gaf8839d (2026.9.24) · upstream af8839df**.

---

## 0. Two corrections to the brief, before anything else

| Brief said | Source says | Consequence |
|---|---|---|
| Ubuntu `api_server` on **:8377** | `DEFAULT_PORT = 8642`, `DEFAULT_HOST = "127.0.0.1"` — `gateway/platforms/api_server.py:216-217` | 8377 appears **only** in `peer.py`'s help text/epilog (`peer.py:232,435,450`) as a *style example* (`http://spark.lan:8377`). It is not a default. Either accept 8642 or **explicitly pin** `API_SERVER_PORT=8377` on Ubuntu and use that exact port in the peer URL. |
| key in `~/.hermes/.env` | Path is `get_hermes_home()/".env"` — `hermes_cli/config.py:477-479` | On **Windows** that is `C:\Users\James\AppData\Local\hermes\.env`, **not** `C:\Users\James\.hermes\.env`. `peer.py:242` prints the literal string `~/.hermes/.env` because that string is correct on macOS/Linux. |

**Also already flagged, confirming the risk:** this box's own `config.yaml` line 258 carries the
note *"PORT 8377 IS AN UNVERIFIED ASSUMPTION - source default for api_server is 8642"*, and the
registered peer has no key:

```
$ hermes peer list
ubuntu   http://192.168.4.40:8377   [NO KEY (HERMES_PEER_UBUNTU_KEY unset)] — Ubuntu house server - api_server pending enable
```

**Live reachability probes from this sandbox (real output):**

```
$ curl -m 6 http://192.168.4.40:8377/v1/models   → code=000  exit=28 (timeout)
$ curl -m 6 http://192.168.4.40:8642/v1/models   → code=000  exit=28 (timeout)
$ bash /dev/tcp/192.168.4.40/22                   → timed out at the 8s harness limit
```

So: **no Hermes api_server is listening on Ubuntu on either port right now**, and port 22 is not
answering within the sandbox's tolerance. Consistent with "api_server pending enable". Nothing
downstream of this can be proven until Ubuntu's listener exists.

**This box's gateway state (real output):** `hermes gateway status` → `✗ Gateway is not running`;
`hermes profile list` → **14 profiles**, all `stopped`; `config.yaml` line 228 already has
`gateway.multiplex_profiles: true`.

---

## 1. Primary architecture diagram

Transport on every edge is the **peer's stock `api_server`** — `peer.py:1-9`: *"its stock API is the
transport (no new server surface)."* Auth on every edge is one bearer token; the token is minted by
the **listener** and held by the **dialer**.

```
╔══════════════════════════════════════════════════════════════════════════════════════════════╗
║  NODE 1 — WINDOWS DESKTOP  (this box)                          HERMES_HOME =                    ║
║  14 profiles · RTX 4090 24 GB · 63.7 GB RAM                     C:\Users\James\AppData\Local\   ║
║  gateway: stopped  ·  multiplex_profiles: true                    hermes                          ║
║                                                                                                ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────────┐  ║
║  │ VidiBot profile `vidibot`  (fleet commander)                                             │  ║
║  │   • learns peer roster automatically — agent.bot_mode_protocol (bot-mode.md:286)          │  ║
║  │   • reaches peers by message_agent(target="ubuntu/<profile>") or the CLI below            │  ║
║  └──────────────────────────────────────────────────────────────────────────────────────────┘  ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────────┐  ║
║  │ `hermes peer` CLI  —  peer.py                                                             │  ║
║  │   labels+URLs ──────────► config.yaml : bot_peers:        (peer.py:44-49 → _save_peers) │  ║
║  │   ubuntu → http://192.168.4.40:8642                                                      │  ║
║  │   miami  → https://<tunnel-host>                                                         │  ║
║  │   keys ────────────────► .env : HERMES_PEER_UBUNTU_KEY, HERMES_PEER_MIAMI_KEY            │  ║
║  │                             (peer.py:32-34 _peer_key_env; config.py:477 get_env_path)     │  ║
║  └──────────────────────────────────────────────────────────────────────────────────────────┘  ║
╚══════════════════════════════════════════════════════════════════════════════════════════════╝
        │                                    │                                   │
        │ EDGE A                             │ EDGE B                            │ EDGE C
        │ LAN, no TLS                        │ LAN, no TLS                       │ HTTPS 443 via Cloudflare Tunnel
        │ http:// + Bearer                   │ http:// + Bearer                  │ Bearer survives tunnel TLS
        │                                    │                                   │
        ▼                                    ▼                                   ▼
┌───────────────────────────────────┐  ┌───────────────────────────────────────────────────────┐
│ NODE 2 — UBUNTU  192.168.4.40     │  │ NODE 3 — MIAMI  (candid-server)                     │
│ Hermes gateway, api_server on      │  │ 2× Intel Arc Pro B70 · 64 GB VRAM · vLLM XPU        │
│ 0.0.0.0:8642  (API_SERVER_HOST)   │  │ ssh host `candid-server`, user vidibuzz             │
│                                   │  │ REACHABLE ONLY via Cloudflare Tunnel — no LAN IP    │
│ ┌───────────────────────────────┐ │  │ ┌───────────────────────────────────────────────────┐ │
│ │ default profile  ────────────┼─┼──┼─►│ api_server binds 127.0.0.1:8642 (UNTOUCHED)      │ │
│ │  ← owns API_SERVER_KEY_A      │ │  │ │  cloudflared egress-only dials OUT to the edge    │ │
│ │  serves the un-prefixed routes│ │  │ │  edge → tunnel → 127.0.0.1:8642                  │ │
│ ├───────────────────────────────┤ │  │ ├───────────────────────────────────────────────────┤ │
│ │ /p/<profile>/  mirrors        │ │  │ │ profile `miami-inference` (hypothetical)           │ │
│ │  profiles: coder, vidibot, …  │ │  │ │  ← needs its OWN API_SERVER_KEY_B in its .env     │ │
│ │  ← each needs its OWN key     │ │  │ └───────────────────────────────────────────────────┘ │
│ │    .env (fail-closed 401)     │ │  │                                                       │
│ └───────────────────────────────┘ │  │  agents: vLLM XPU server (BT70), 64 GB VRAM pool      │
│ agents run on the Ubuntu host     │  │  (image/video inference is served, not the peer API)  │
│                                   │  └───────────────────────────────────────────────────────┘
└───────────────────────────────────┘
```

### Where each node's agents live

| Node | Agents live in | Reachability from this sandbox |
|---|---|---|
| Windows | 14 profile homes under `$HERMES_HOME\profiles\`, one gateway process multiplexing them | ✅ local |
| Ubuntu | Its own `$HERMES_HOME` (`~/.hermes`), profile homes under `~/.hermes/profiles/<name>/`, agent turns execute **on the Ubuntu host** with Ubuntu's filesystem + terminal | ❌ timeout (probed) |
| Miami | Its own `$HERMES_HOME`, agents execute on the Miami host against the B70s | ❌ **structurally unreachable** — Cloudflare Tunnel is egress-only from Miami; there is no inbound route, and this sandbox has no SSH path in. UNVERIFIED that a tunnel is even configured for the api_server port. |

### The one rule that governs routing (`_base_url`, `peer.py:91-96`)

```python
def _base_url(peer: dict, profile: str | None) -> str:
    url = str(peer.get("url") or "").rstrip("/")
    if profile:
        # Multiplex mirror: same handlers, scoped to the named profile.
        return f"{url}/p/{urllib.parse.quote(profile, safe='')}"
    return url
```

That is the entire addressing model. `ubuntu` → `http://192.168.4.40:8642`.
`ubuntu/coder` → `http://192.168.4.40:8642/p/coder`. Same handlers, different secret.

### Per-profile auth is a hard boundary (the thing most likely to bite us)

`api_server.py:1562-1608` — `_expected_api_key()` returns the **default** listener's key for the
un-prefixed listener, but for a `/p/<profile>/` request it resolves **that profile's own**
`API_SERVER_KEY` from the routed profile's secret scope, and returns `""` (fail closed) if that
profile has no usable key. `_check_auth` then 401s. Documented at `api-server.md:683-706`:

> *"Requests to `/p/<profile>/v1/...` must present that profile's own `API_SERVER_KEY` (from
> `~/.hermes/profiles/<profile>/.env`). The default listener's key is rejected on named-profile
> prefixes."* … *"reused default keys on named prefixes now return `401`."*

**Design consequence:** for `ubuntu/coder` to be addressable, Ubuntu needs `API_SERVER_KEY` in
`~/.hermes/profiles/coder/.env` — a *different* secret from the default profile's. And then
`hermes peer add ubuntu --key <default_key>` gives us access to `ubuntu` but **not**
`ubuntu/coder`, which needs a second registration (see §3). This is a real constraint, not a
style preference.

---

## 2. Docker variant — what actually changes

### 2a. Two networking shapes, two different answers

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│  VARIANT A — network_mode: host   (what hermes-agent's own docker-compose.yml ships)       │
├────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                            │
│    WINDOWS ── http://192.168.4.40:8642 ──► ┌──────────────── UBUNTU HOST ──────────────┐  │
│             Authorization: Bearer K        │  docker0 NOT used; no NAT, no port publish  │  │
│                                            │  ┌── container `hermes` ───────────────┐  │  │
│                                            │  │ HERMES_HOME=/opt/data               │  │  │
│                                            │  │ api_server → 0.0.0.0:8642  ◄── binds │  │  │
│                                            │  │          the HOST's interfaces      │  │  │
│                                            │  │          directly, no -p needed     │  │  │
│                                            │  │ s6-overlay PID1 supervises gateway  │  │  │
│                                            │  └────────────────────────────────────┘  │  │
│                                            └──────────────────────────────────────────┘  │
│  key mounts:  ~/.hermes → /opt/data   (so ~/.hermes/.env IS the container's .env)        │
│  ⚠ every published port on the host is the container's; container 0.0.0.0 = host 0.0.0.0    │
└────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────┐
│  VARIANT B — bridge + -p  (the documented `docker run` form, docker.md:65-75)              │
├────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                            │
│    WINDOWS ── http://192.168.4.40:8642 ──► ┌──────── UBUNTU HOST ──────────────────────┐ │
│                                            │  iptables DNAT :8642 → :8642              │ │
│            ┌───────────────────────────────┼─►│  ┌── container `hermes` ─────────────┐  │ │
│            │  PublishedPort 8642           │  │  │ eth0 172.17.0.x                   │  │ │
│            │  (BIND ON 0.0.0.0 by default) │  │  │ api_server MUST bind 0.0.0.0:8642 │  │ │
│            └───────────────────────────────┘  │  │  (127.0.0.1 inside container =     │  │ │
│                                               │  │   UNREACHABLE from the LAN)        │  │ │
│                                               │  └───────────────────────────────────┘  │ │
│                                               └──────────────────────────────────────────┘ │
│  ⚠ -p 8642:8642 alone is NOT enough — without API_SERVER_HOST=0.0.0.0 you get a           │
│    connection-refused that looks exactly like "api_server not enabled".                       │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

Both keep the **client-visible URL identical** — `http://192.168.4.40:8642`. The container is a
deployment detail behind the port; `peer.py` never learns it exists. That is the whole point:
`hermes peer add` stores a URL and nothing else (`peer.py:235`).

### 2b. Where the secrets mount

| Secret | Container location | Source |
|---|---|---|
| `API_SERVER_KEY` (listener's own) | `~/.hermes/.env` → `/opt/data/.env` | the volume mount; *or* `-e` |
| `HERMES_PEER_<NAME>_KEY` (if Ubuntu dials out) | same file, same mount | same |
| profile `API_SERVER_KEY` | `~/.hermes/profiles/<name>/.env` → `/opt/data/profiles/<name>/.env` | same |
| image's writable state | `/opt/data` (`Dockerfile:448` `ENV HERMES_HOME=/opt/data`); `/opt/hermes` is immutable | verified |

**⚠ The trap, quoted from `docker/stage2-hook.sh:473-475`:**

> `[stage2] Warning: API_SERVER_KEY is set in both the container environment and $HERMES_HOME/.env
>  — the .env value wins at runtime (loaded with override=True)`

So `-e API_SERVER_KEY=NEW` while a stale `API_SERVER_KEY=OLD` line sits in `~/.hermes/.env` yields a
listener that authenticates **OLD**. You set the peer key to NEW, get a clean 401, and lose an
afternoon. Set it in exactly one place. (The hook also self-heals an *empty* `API_SERVER_KEY=`
line and auto-generates one when neither is present — `stage2-hook.sh:484-521`.)

### 2c. The s6 / PID-1 rule

`ENTRYPOINT ["/opt/hermes/docker/entrypoint-dispatch.sh"]`, `CMD []` (`Dockerfile:529-530`).
`docker-compose.yml:18-24` is explicit: *"If you override entrypoint, keep `/init` as the first
command in the chain … Bypassing it skips all of that setup and the gateway will not work
correctly."* Compose also requires `HERMES_UID=$(id -u) HERMES_GID=$(id -g)` so the s6 stage-2 hook
can chown the mounted `~/.hermes` (`docker-compose.yml:4-11`). Get this wrong and you get
permission errors on `state.db`, not a clean error.

---

## 3. Exact bring-up sequence

### VARIANT 1 — Native (recommended; fewest moving parts)

```
──────────────────────────────────────────────────────────────────────────────
[UBUNTU] 1. install + configure the listener
──────────────────────────────────────────────────────────────────────────────
  hermes setup                                  # provider/tools; needs a real TTY
  openssl rand -hex 32                          # run ON ubuntu; never paste the result anywhere

  # → ~/.hermes/.env  (append, do not overwrite the file)
  API_SERVER_ENABLED=true
  API_SERVER_HOST=0.0.0.0                       # overrides DEFAULT_HOST 127.0.0.1
  API_SERVER_PORT=8642                          # matches DEFAULT_PORT; set 8377 iff you want 8377
  API_SERVER_KEY=<the 64-hex string from above>

  # → ~/.hermes/config.yaml
  gateway:
    multiplex_profiles: true                    # explicit true bypasses the migration preflight

  hermes gateway run                            # FOREGROUND first — read the log line
    # expect:  [API Server] API server listening on http://0.0.0.0:8642
    # a refusal here is the startup guard, §5 row 3
  # only after it listens:
  hermes gateway install                        # systemd unit, survives reboot

──────────────────────────────────────────────────────────────────────────────
[UBUNTU] 2. per-profile keys — REQUIRED for <peer>/<profile> addressing
──────────────────────────────────────────────────────────────────────────────
  # for EACH profile you intend to address as ubuntu/<profile>:
  openssl rand -hex 32
  # → ~/.hermes/profiles/<profile>/.env
  API_SERVER_KEY=<distinct 64-hex string>       # distinct from the default profile's
  hermes gateway run                            # restart so the new scope is loaded

──────────────────────────────────────────────────────────────────────────────
[UBUNTU] 3. open the port
──────────────────────────────────────────────────────────────────────────────
  sudo ufw allow from 192.168.4.0/24 to any port 8642 proto tcp   # or the host's actual firewall

──────────────────────────────────────────────────────────────────────────────
[UBUNTU] 4. prove it from ubuntu's own loopback before involving Windows
──────────────────────────────────────────────────────────────────────────────
  curl -sS http://127.0.0.1:8642/health
  curl -sS -H "Authorization: Bearer $API_SERVER_KEY" \
       http://127.0.0.1:8642/v1/models
  curl -sS -H "Authorization: Bearer $API_SERVER_KEY" \
       http://127.0.0.1:8642/p/coder/v1/models   # 401 ⇒ §5 row 4 (that profile's key is unset/wrong)

──────────────────────────────────────────────────────────────────────────────
[WINDOWS] 5. register the peer
──────────────────────────────────────────────────────────────────────────────
  hermes peer add ubuntu --url http://192.168.4.40:8642 --key <ubuntu default key>
      # → prints: Peer 'ubuntu' saved (http://192.168.4.40:8642) — key stored as
      #            HERMES_PEER_UBUNTU_KEY in ~/.hermes/.env
      #   …which on this box is C:\Users\James\AppData\Local\hermes\.env

  # already registered at :8377 — re-point it (add is also `set`; it overwrites in place)
  hermes peer add ubuntu --url http://192.168.4.40:8642 --key <ubuntu default key>

  hermes peer list
      # expect: ubuntu  http://192.168.4.40:8642  [key set]

──────────────────────────────────────────────────────────────────────────────
[WINDOWS] 6. first DM (ONE synchronous turn, 600 s timeout — peer.py:28)
──────────────────────────────────────────────────────────────────────────────
  hermes peer dm ubuntu "Reply with the literal string: PEER OK"

──────────────────────────────────────────────────────────────────────────────
[WINDOWS] 7. long work → async Runs API
──────────────────────────────────────────────────────────────────────────────
  hermes peer run ubuntu --idempotency-key ticket-2026-10-05-001 "…"   # returns run_id immediately
  hermes peer status ubuntu <run_id>
  hermes peer stop   ubuntu <run_id>

──────────────────────────────────────────────────────────────────────────────
[WINDOWS] 8. address a specific Ubuntu profile (needs §1 step 2 done on Ubuntu)
──────────────────────────────────────────────────────────────────────────────
  # the default key does NOT work here — register the profile's own key as its own peer name
  hermes peer add ubuntu-coder --url http://192.168.4.40:8642/p/coder --key <coder profile key>
  hermes peer dm ubuntu-coder "…"
  # …OR just use the inline form when the SAME key serves both (single-profile gateway case):
  hermes peer dm ubuntu/coder "…"
```

**Sub-command surface is exactly this** (`peer.py:392-394,446-474`): `add`|`set`,
`remove`|`rm`, `list`|`ls`, `dm`, `run`, `status`, `stop`. `dm`/`run` take an optional message
argument **or stdin** (`_message_from_args`, `peer.py:183-187`); `status`/`stop` take a `run_id`.
All four accept `--json`. Exit codes: **0** ok, **1** delivery/peer error, **2** usage
(`peer.py:443-444`).

### VARIANT 2 — Docker on Ubuntu

```
──────────────────────────────────────────────────────────────────────────────
[UBUNTU] 1. host prep (keys are generated on the HOST — the volume is host-owned)
──────────────────────────────────────────────────────────────────────────────
  openssl rand -hex 32        # → K_STAGE2 / default profile listener key
  openssl rand -hex 32        # → K_CODER / per-profile key, only if you need ubuntu/coder

──────────────────────────────────────────────────────────────────────────────
[UBUNTU] 2a. COMPOSE (host networking — mirrors docker-compose.yml as shipped)
──────────────────────────────────────────────────────────────────────────────
  # ~/.hermes/.env  (create on the host; this IS the container's /opt/data/.env)
  API_SERVER_ENABLED=true
  API_SERVER_HOST=0.0.0.0
  API_SERVER_PORT=8642
  API_SERVER_KEY=K_STAGE2

  # docker-compose.yml
  services:
    gateway:
      build: .
      image: hermes-agent
      container_name: hermes
      restart: unless-stopped
      network_mode: host                       # ← no `ports:` block needed
      volumes:
        - ~/.hermes:/opt/data
      environment:
        - HERMES_UID=${HERMES_UID:-10000}
        - HERMES_GID=${HERMES_GID:-10000}
      command: ["gateway", "run"]

  HERMES_UID=$(id -u) HERMES_GID=$(id -g) docker compose up -d --build
  docker logs hermes 2>&1 | grep -i "api server"
      # expect: [API Server] API server listening on http://0.0.0.0:8642

──────────────────────────────────────────────────────────────────────────────
[UBUNTU] 2b. OR plain `docker run` (bridge networking — needs an explicit publish)
──────────────────────────────────────────────────────────────────────────────
  docker run -d --name hermes --restart unless-stopped \
    -v ~/.hermes:/opt/data \
    -p 8642:8642 \
    -e HERMES_UID="$(id -u)" -e HERMES_GID="$(id -g)" \
    nousresearch/hermes-agent gateway run

  # ⚠ API_SERVER_HOST=0.0.0.0 must ALREADY be in ~/.hermes/.env on the host.
  #   Do NOT also pass -e API_SERVER_KEY here if .env already has it → stage2-hook.sh:473-475,
  #   the .env value wins and the -e value is silently ignored.
  #
  # ⚠ do NOT pass -e API_SERVER_CORS_ORIGINS='*' here. It is in docker.md's example, but this
  #   is not a browser peer and '*' buys nothing while widening browser reach (api-server.md:709).

──────────────────────────────────────────────────────────────────────────────
[UBUNTU] 3-7. IDENTICAL to native steps 3-7 above
──────────────────────────────────────────────────────────────────────────────
  # firewall still belongs to the HOST in both shapes
  sudo ufw allow from 192.168.4.0/24 to any port 8642 proto tcp
  # then: curl loopback probes, then on WINDOWS `hermes peer add ubuntu --url
  # http://192.168.4.40:8642 --key K_STAGE2`, `hermes peer dm ubuntu "…"`

──────────────────────────────────────────────────────────────────────────────
[WINDOWS] — MIAMI, both variants (dial-OUT only; Windows is the caller)
──────────────────────────────────────────────────────────────────────────────
  # cloudflared config.txt lives ON MIAMI and must point at the api_server port:
  #   ingress:
  #     - hostname: hermes-miami.<your-domain>
  #       service: http://127.0.0.1:8642
  # UNVERIFIED: no tunnel config for port 8642 exists in any file I can read.

  hermes peer add miami --url https://hermes-miami.<your-domain> --key <miami default key>
  hermes peer dm   miami "GPU inventory + vLLM health, one line each"
  hermes peer dm   miami/inference "…"      # needs ~/.hermes/profiles/inference/.env on MIAMI
```

**Directionality is a hard fact, not a preference.** `bot-mode.md:290-297`: *"Cross-gateway links
are direct gateway-to-gateway connections — Desktop is a viewer, not a relay. A gateway behind
home NAT can dial out to a public peer (laptop → VPS works), but the reverse direction has no
inbound route."* Miami can never initiate to Windows or Ubuntu through a Cloudflare Tunnel. **Both
edges terminate at Miami.** To let Miami reach the others you would need Miami to dial out to a
publicly-reachable node, or a mesh overlay (Tailscale/WireGuard).

---

## 4. How VidiBot commands the fleet

### The mapping, concretely

James says, in the VidiBot chat:

> *"Set up X on the Ubuntu server."*

That becomes an agent turn on `vidibot`, whose model calls the `message_agent` tool with
`target="ubuntu/<profile>"`. **The tool call, not a special API, is the whole mechanism.**
`bot-mode.md:286` — verified:

> *"Once a peer is registered, the messaging protocol taught to every Bot Chat
> (`agent.bot_mode_protocol`) automatically includes the peer roster, and `message_agent` accepts
> peer targets directly — `message_agent(target="spark/researcher", …)`, or `target="spark"` for
> the peer's main agent — so **your bots learn on their own** that teammates exist on other
> machines and how to reach them."*

The same target string, typed by hand at the prompt, is the CLI path:

| James's intent | CLI equivalent (run on the VidiBot profile) |
|---|---|
| talk to Ubuntu's main agent | `hermes peer dm ubuntu "<msg>"` |
| talk to a specific Ubuntu profile | `hermes peer dm ubuntu/coder "<msg>"` |
| kick off long work, keep working | `hermes peer run ubuntu --idempotency-key ticket-1 "<msg>"` |
| check on it | `hermes peer status ubuntu <run_id>` |
| kill it | `hermes peer stop ubuntu <run_id>` |
| talk to Miami | `hermes peer dm miami "<msg>"` |

### Addressing semantics, precisely

`_parse_target` (`peer.py:146-156`) — the whole grammar:

```python
raw = (target or "").strip()
peer, _, profile = raw.partition("/")     # splits on the FIRST "/" only
if not peer: raise ValueError("Peer name required (hermes peer dm <peer>[/<agent>] ...)")
if profile and not _PROFILE_RE.match(profile):
    raise ValueError(f"Invalid agent/profile name: {profile!r}")
```

- `_PEER_NAME_RE = ^[a-z0-9][a-z0-9_-]{0,63}$` — peer names **lowercase only**, digits/`-`/`_`,
  ≤64 chars, must not start with `-`/`_`. `peer add` lowercases input and rejects otherwise
  (`peer.py:226-229, 227`): `Invalid peer name: 'Ubuntu' (lowercase, digits, -, _; max 64)`.
- `_PROFILE_RE = ^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$` — profile names allow uppercase. `ubuntu/coder`
  ok; `ubuntu/Vidi Bot` → `Invalid agent/profile name: 'Vidi Bot'`.
- `ubuntu/a/b` → `profile = "a/b"` → rejected by the regex. There is no nesting.
- **No ambiguity is possible.** Peer names cannot contain `/`, so `ubuntu/coder` can only ever mean
  "the coder profile on the ubuntu peer". (Contrast the *other* cross-machine path, the Desktop
  relay, where duplicate bot names across machines are real and must be disambiguated as
  `target="moxie@<connection>"` — `bot-mode.md:250`. Peers sidestep that entirely.)
- `--url` must start with `http://` or `https://` (`peer.py:231-233`) and is stored rstripped of
  `/`. It is a **base URL only** — no `/v1`, no `/api`, no path. `_base_url` appends the profile
  prefix; the handlers append `/api/sessions/…`.

### What happens when the remote profile does not exist

Three distinct outcomes, depending on which side is at fault — worth knowing because they look
alike from the prompt:

1. **Profile name is not in the served set** → the peer's prefix middleware 404s.
   `_resolve_request_profile` (`api_server.py:1674-1689`) computes `profiles_to_serve(multiplex=True)`
   and returns `_PROFILE_REJECTED` for anything absent; the middleware
   (`api_server.py:1723-1727`) returns:
   ```
   HTTP 404  {"error": "Unknown or unconfigured profile"}
   ```
   surfaced by `peer.py:205-213` as:
   ```
   Peer 'ubuntu' rejected the request (HTTP 404): Unknown or unconfigured profile
   ```
   Fix: the profile directory does not exist on Ubuntu, or the gateway there did not settle on
   multiplexing. Note the fail-closed design in `api_server.py:37-43`: *"Fail closed: a
   single-profile gateway answering /p/<x>/ served the owner's toolsets under another URL."*

2. **Profile exists but has no `API_SERVER_KEY`** → **401**, not 404.
   `_expected_api_key()` returns `""` and `_check_auth` fails closed (`api_server.py:1567-1599`).
   Distinguishing 404 from 401 is the whole diagnosis: **404 = profile missing, 401 = key missing.**

3. **`multiplex_profiles` is off on the remote** and the prefix names a *different* profile →
   `_PROFILE_REJECTED` → 404 (`api_server.py:1682-1683`). Multiplexing defaults to **on** and an
   *unset* flag is settled at boot, not a verdict (`gateway/config.py:606-612`; `bot-mode.md:
   multi-profile-gateways.md:101-117`), so this only bites when a real blocker forced standalone.

### The timeout semantics that prevent double-delivery

`_peer_dm` (`peer.py:345-375`) has a distinction that matters operationally, so read the error
text before resending anything:

- **Timeout while connecting** → `urllib` raises `URLError` → `Could not reach peer 'ubuntu': …`.
  The request never arrived. **Safe to resend.**
- **Timeout after the Bot Chat was resolved** (`session_id` is set, bare `TimeoutError` at
  600 s) → the message **was** delivered and the turn is still running on the peer:
  ```
  Peer 'ubuntu' accepted the message but its turn is still running after 600s: the message is
  already in its Bot Chat (session <id>) and will be answered there. The reply cannot come back on
  this call. Do NOT resend.
  ```
  **Resending runs the turn twice.** This is a code comment, not folklore — `peer.py:356-360`.
- **Peer's Bot Chat open in its Desktop** → the peer answers
  `{"object": "hermes.session.chat.queued"}` and `peer.py:368-375` says the message went into
  that chat and is answered there. **Do NOT resend.**
- `peer run` is immune to this whole class of problem: it returns a `run_id` immediately and
  takes `--idempotency-key` (`peer.py:313-328`), so a retry replays the original run
  (`"replayed": true`) instead of starting new work.

### Attribution and silence handling

- `_turn_body` (`peer.py:301-309`) adds an `author` field **only** when a dispatcher set
  `HERMES_TURN_AUTHOR` (`agent.turn_author.turn_author_from_env`). That is how the reply-safe
  signature `Message from 🤖 dixie (@dixie)` gets into the transcript.
- A reply that is a bare silence marker is treated as a **delivery decision, not a message**:
  `is_intentional_silence_response(reply)` → `reply = ""` → prints `(no reply)`
  (`peer.py:376-389`). The sending agent never sees `NO_REPLY`/`[SILENT]` as a real reply.
- `peer run` probes `GET /v1/capabilities` first (`peer.py:190-202, 319-323`) and warns if the
  peer does not advertise durable run replay: *"keep the run ID and avoid blind retries after a
  gateway restart."*

### The alternative path (don't confuse the two)

There are **two** distinct cross-machine mechanisms in Hermes, and they coexist:

| | `hermes peer` | Desktop relay |
|---|---|---|
| Setup | CLI + `bot_peers` + key | Settings → Connections |
| Topology | direct gateway→gateway | Desktop is the courier, holding the sockets + creds |
| Needs a Desktop running? | **No** | Yes |
| Works with the Desktop closed? | Yes | No — sender told the reply didn't arrive |
| Addressing | `peer[/profile]` | `name@connection` |
| NAT | one-way only | needs the Desktop reachable to both |

`bot-mode.md:251` — *"For always-on machine-to-machine messaging with no Desktop in the loop,
register a peer (`hermes peer`, below) — the two routes coexist."* **For James's "tell VidiBot to go
set up something on Ubuntu" requirement, peers are the correct mechanism**: the Ubuntu box has no
Hermes Desktop, only a headless gateway, so the Desktop-relay route is not even available for it.

---

## 5. Failure-mode table

Error text in the "what you'll see" column is verbatim from the cited source.

| # | Symptom | Exact error text | Root cause | Fix |
|---|---|---|---|---|
| 1 | Peer name not registered | `No peer named 'ubuntu'. Run: hermes peer list` — `peer.py:174` | no entry in `bot_peers` | `hermes peer add ubuntu --url … --key …` |
| 2 | Registered but keyless | `No API key for peer 'ubuntu'. Set it: hermes peer add ubuntu --url <url> --key <key> (or add HERMES_PEER_UBUNTU_KEY=<key> to ~/.hermes/.env)` — `peer.py:177-179` | `HERMES_PEER_UBUNTU_KEY` unset in the **default profile's** `.env`. `peer list` shows `[NO KEY (HERMES_PEER_UBUNTU_KEY unset)]`. Name→env mapping: `name.upper().replace('-','_')` (`peer.py:32-34`), so a peer named `ubuntu-coder` becomes `HERMES_PEER_UBUNTU_CODER_KEY`. | Re-run `hermes peer add … --key …`. Watch the path: `C:\Users\James\AppData\Local\hermes\.env` on Windows. |
| 3 | **Remote gateway won't start its api_server** | `[api_server] Refusing to start: API_SERVER_KEY is required for the API server, including loopback-only binds on 127.0.0.1.` / `…is a placeholder or too short (<16 chars). This endpoint dispatches terminal-capable agent work — a guessable key is remote code execution. Generate a strong secret (e.g. \`openssl rand -hex 32\`)…` — `api_server.py:4450-4476` | key missing, placeholder-shaped, or <16 chars (`has_usable_secret`, `hermes_cli/auth.py:311-318`). Non-retryable fatal: `_set_fatal_error("api_server_key_invalid", …, retryable=False)` (`api_server.py:4486-4505`) — the reconnect watcher drops it rather than looping. | `openssl rand -hex 32` → set it → `/platform resume api_server`. **Docs conflict to be aware of:** `docker.md:98` says "minimum 8 characters"; the code enforces **16**. Follow the code. |
| 4 | **Named profile 401s** | `Peer 'ubuntu' rejected the request (HTTP 401): Invalid gateway API key (API_SERVER_KEY)` (`{"type":"gateway_auth_error","code":"gateway_auth_failed"}`, `api_server.py:1580-1584`) | you sent the **default** profile's key to `/p/<profile>/`. Named prefixes require that profile's own key (`api_server.py:1562-1577`; `api-server.md:690-706`) | put a distinct `API_SERVER_KEY` in `~/.hermes/profiles/<profile>/.env`, restart that gateway, register the peer with **that** key |
| 5 | Profile unknown | `Peer 'ubuntu' rejected the request (HTTP 404): Unknown or unconfigured profile` — `api_server.py:1727` | profile dir missing on the remote, or not in `profiles_to_serve`, or multiplexing settled off | `hermes profile list` on Ubuntu; confirm the profile carries an identity file; confirm `gateway.multiplex_profiles: true`. **404 = profile missing; 401 = key missing.** |
| 6 | **Wrong URL / port** — the one already biting us | `Could not reach peer 'ubuntu': <urlopen error [WinError 10061] Connection refused>` or `[Errno 11001] getaddrinfo failed`, or `Peer returned non-JSON response: <html>…` (`peer.py:85, 212`) | wrong port (8377 vs 8642), api_server still on `127.0.0.1`, firewall closed, or container published nothing | match `API_SERVER_PORT`; set `API_SERVER_HOST=0.0.0.0`; `ufw allow from 192.168.4.0/24 to any port 8642 proto tcp`. Note the port-22 timeout and both `code=000 exit=28` probes in §0. |
| 7 | **Cloudflare 403 at the edge** — *UNVERIFIED, no Cloudflare code in Hermes* | `Peer 'miami' rejected the request (HTTP 403): <!DOCTYPE html>…` — `_http_error_detail` falls back to the raw body when it isn't JSON (`peer.py:159-166`), so you get Cloudflare's HTML inlined. Known CF body includes `error code: 1010` / the access-denied page. | A Cloudflare WAF/JS-challenge/Browser-Integrity rule is inspecting the **`python-urllib` TLS+HTTP fingerprint** and rejecting it, while `curl` from the same host passes. Mechanism UNVERIFIED (nothing in the repo references CF rule IDs), but the asymmetry is a well-known CF behaviour and `peer.py` sends a fixed UA `hermes-peer-dm` (`peer.py:72`) that is trivially fingerprintable. | (a) Best: **a WAF skip rule on the tunnel hostname limited to the api paths** — `/api/sessions*`, `/v1/runs*`, `/v1/capabilities*`, `/health*`. (b) Confirm the tunnel routes to 8642 (`service: http://127.0.0.1:8642`). (c) Don't put Cloudflare **Access** in front of it — Access demands its own JWT and `peer.py` can only send `Authorization: Bearer <API_SERVER_KEY>`. (d) If a tunnel can't be made to pass, the fallback is Tailscale on Miami. |
| 8 | Duplicate bot names across boxes | *No error — this is the dangerous one.* For **peers**: structurally impossible to collide (`peer` regex forbids `/`, so `ubuntu/coder` is unambiguous). For the **Desktop relay** path: a real collision, disambiguated `target="moxie@<connection>"` (`bot-mode.md:250`). On one box, a **duplicate bot credential blocks multiplexing** (`gateway_multiplex_mode.py:124-131`) — that's a same-host issue, not cross-host. | naming discipline | prefix peer names by machine: `ubuntu`, `miami`. Never register two machines' agents under one peer name. |
| 9 | Peer is slow / long turn | `Peer 'ubuntu' accepted the message but its turn is still running after 600s: … Do NOT resend.` — `peer.py:361-366` | turn outlasted `DM_TIMEOUT_S = 600` (`peer.py:28`) | **do not resend.** Read the answer in the peer's Bot Chat, or switch to `hermes peer run` + `status` |
| 10 | Ran out of concurrent turns | HTTP **429** `Too many concurrent runs (max N)` | `gateway.api_server.max_concurrent_runs`, **default 10**, `0` disables (`api-server.md:746`) | back off and retry; raise the cap if the fleet legitimately needs it |
| 11 | Both hosts have a `Bot Chat` but the peer is old | `Peer 'ubuntu' already has a 'Bot Chat' session but it is hidden and the peer's gateway is too old to expose hidden sessions to this lookup (HTTP 400: …). Update the peer's hermes-agent, or unhide the session there: PATCH /api/sessions/<id> {"hidden": false}.` — `peer.py:132-136` | the exact-title lookup needs `include_hidden=1` (issue #91583) | update the peer's hermes-agent, or `PATCH /api/sessions/<id> {"hidden": false}` |
| 12 | Peer API is mid-restart | `Peer 'ubuntu' did not return a session id for the new Bot Chat` / `Peer returned a non-object JSON response` (`peer.py:86-87, 141-142`) | gateway restarting; 5 bind attempts on EADDRINUSE then it settles (`api_server.py:218`, #91547) | retry once; if persistent, `hermes gateway status` on the peer |
| 13 | Docker: key set but 401 anyway | *(no Hermes error — silent)* | **`.env` wins over `-e`** per `docker/stage2-hook.sh:473-475` (`override=True`) | set `API_SERVER_KEY` in exactly one place; verify with `docker exec hermes grep -c '^API_SERVER_KEY=' /opt/data/.env` |
| 14 | Docker: permission errors on `state.db` | non-Hermes, from s6 stage2 | `HERMES_UID`/`HERMES_GID` not set so the mounted `~/.hermes` is root-owned | `HERMES_UID=$(id -u) HERMES_GID=$(id -g) docker compose up -d` |
| 15 | Docker: gateway "not reachable" from LAN | `Could not reach peer … Connection refused` | container api_server still on `127.0.0.1` inside the bridge | `API_SERVER_HOST=0.0.0.0` in the mounted `.env`. `-p 8642:8642` alone does nothing. |

---

## 6. Security notes

**The key is remote code execution, not a session token.** Verbatim, `api_server.py:4469-4472`:

> *"API_SERVER_KEY is a placeholder or too short (<16 chars). This endpoint dispatches
> terminal-capable agent work — a guessable key is remote code execution."*

Anyone holding it gets `terminal`, file ops, and every toolset of the profile it unlocks, on that
machine. `api-server.md:708-710` adds: *"The API server gives full access to hermes-agent's
toolset, **including terminal commands**. API_SERVER_KEY is **required for every deployment**,
including the default loopback bind on 127.0.0.1."* So there is no "it's only localhost, relax the
key" option — the guard fires on loopback too.

### Where the secret lives

| Side | Location | Protection |
|---|---|---|
| Ubuntu/Miami listener | `~/.hermes/.env` → `API_SERVER_KEY` (Docker: `/opt/data/.env`) | file perms; this file is the credential store |
| Ubuntu/Miami, per profile | `~/.hermes/profiles/<name>/.env` → its own `API_SERVER_KEY` | distinct value per profile — required by §1's per-profile auth |
| Windows caller | `C:\Users\James\AppData\Local\hermes\.env` → `HERMES_PEER_<NAME>_KEY` | written by `save_env_value` (`config.py:2772-2776`) |
| In flight | `Authorization: Bearer <key>`, `User-Agent: hermes-peer-dm` | **plaintext on LAN edges** |
| Process memory | `self._api_key` / `get_secret(...)` | in RAM; never logged |

**Do not log the key.** This is enforced in the code where it matters:
- `api_server.py:1573` — *"Fail closed; never log the key or exception text."*
- `api_server.py:1607` — the 401 path logs `self._request_audit_log_suffix(request)` (request
  metadata), never the presented token.
- `api_server.py:1601-1605` — the token is compared with `hmac.compare_digest` over **bytes**, not
  `==`: *"compare_digest raises TypeError on non-ASCII str, and the token is raw client input — a
  stray byte must 401, not 500."* (Constant-time, and a non-ASCII probe can't crash the listener.)
- Operational rule for us: never paste a key into a chat, an issue, a doc, or a shell history.
  `openssl rand -hex 32` on the listening host, then `hermes peer add … --key` from a variable.
  If a key is ever committed, printed, or pasted into a transcript: rotate it
  (`openssl rand -hex 32`, update the peer's `.env`, restart, re-`peer add`) — treat it as burned.

### Redirect-header stripping (`open_credentialed_url`) — read this before adding a proxy

`peer.py:76-80` documents the intent:

> *"The peer URL is user-registered (`hermes peer add`); a redirect to a different origin must not
> carry the `Authorization: Bearer ***` with it — a compromised/MITM'd peer could otherwise
> harvest it. open_credentialed_url strips non-safelisted headers across a cross-origin redirect."*

Mechanism, from `hermes_cli/urllib_security.py`:

1. `_CROSS_ORIGIN_SAFE_HEADERS = frozenset({"accept", "user-agent"})` (line 17) — everything else
   is dropped. Allowlist, not a guess at which header names carry secrets (lines 53-56).
2. `SafeCredentialRedirectHandler.redirect_request` (lines 47-57) — after urllib enforces
   status/method semantics (notably 307/308), if
   `url_origin(urljoin(req.full_url, newurl)) != self._original_origin` it calls
   `_strip_headers(redirected, safe)`. So a **same-origin** redirect keeps the Bearer (necessary —
   `http://` → `https://` on the same host is a common upgrade), and a **cross-origin** one loses it.
3. `_CrossOriginRequestSanitizer` (lines 60-78) runs at `handler_order = float("inf")` so it is
   **last** after any installed cookie/auth/instrumentation processor — comment at lines 62-67:
   *"a stable sort keeps this appended handler after another infinity-ordered one"*.
4. Lines 121-124 handle the `addheaders` back-door: `OpenerDirector` injects `addheaders` *after*
   request processors, so the sanitizer can't see it; Hermes moves them onto the initial request
   instead (`secured.addheaders = []`).

**Operational consequences:**
- A peer URL must be the **final** origin. If you register `https://hermes-miami.example` and
  Cloudflare 302s to a different hostname, the Bearer is stripped → 401 from the far side with no
  hint why. Register the exact origin, or expect silent 401s.
- `open_credentialed_url` *preserves* an application-installed opener's proxy, TLS, cookies, and
  instrumentation (lines 137-141). If a system-wide proxy or a TLS-intercepting middlebox rewrites
  the origin, the Bearer is dropped. With Cloudflare Tunnel in front, TLS terminates at the edge
  and the tunnel forwards to `127.0.0.1` — same origin as far as urllib is concerned, so the
  header survives. That is the configuration we want.
- TLS policy: Hermes-owned openers verify against the OS trust store (`_resolved_https_context`
  → `agent.ssl_verify.install_truststore`, lines 81-91). A self-signed cert on the tunnel's
  **origin** server is fine (TLS ends at the CF edge, which has a publicly-trusted cert), but a
  corporate TLS-intercepting proxy would need its CA in the store. Note `peer.py` never passes
  `ssl_context`, so per-provider `ssl_verify` settings do **not** apply to peer calls.
- **LAN edges are plaintext.** `http://192.168.4.40:8642` sends the Bearer in clear. Fine on a
  trusted wired LAN; on Wi-Fi or any shared segment, put the LAN peer behind TLS or a mesh overlay
  instead.

### Scope of blast radius

Because per-profile keys are separate (§1), holding the `ubuntu` default-profile key does **not**
let you address `ubuntu/coder` — you get 401 from `_expected_api_key`. That is a genuine
containment property: a leaked default key does not fan out across the profile fleet. Keep the
default-profile key the most valuable secret on the box, and give `/p/<profile>/` targets
their own keys so a leak is scoped to one agent.

`hermes peer remove` deletes the label but **keeps the `.env` entry** — verbatim
(`peer.py:259`): *"Peer 'ubuntu' removed (its HERMES_PEER_UBUNTU_KEY entry in .env is kept; delete
it manually if unused)."* Removing a peer is therefore **not** revoking its credential. On
decommissioning a machine, rotate that peer's `API_SERVER_KEY` on the listener — that is the
revocation.

---

## 7. What is proven, what is not

**Proven (read in source or executed here):**
- `hermes peer` exists with exactly `add|set`, `remove|rm`, `list|ls`, `dm`, `run`, `status`, `stop`; labels in `bot_peers`, keys in `.env` as `HERMES_PEER_<NAME>_KEY`; `dm` = one synchronous turn, `DM_TIMEOUT_S = 600`; exit codes 0/1/2.
- `_base_url` addressing; per-profile auth binding and its fail-closed 401; 404 for unknown profiles; redirect-header stripping in `open_credentialed_url`.
- `DEFAULT_PORT = 8642`, `DEFAULT_HOST = 127.0.0.1`, `API_SERVER_HOST/PORT` overrides, `API_SERVER_KEY` ≥16 chars enforced at startup.
- Docker: `HERMES_HOME=/opt/data`, `~/.hermes:/opt/data`, `network_mode: host` in compose, `-p 8642:8642` in the `docker run` form, s6 PID-1 rule, **`.env` beats `-e`** for `API_SERVER_KEY`.
- Live probes: `192.168.4.40` answers nothing on 8377/8642/22; this box has 14 profiles, gateway stopped, `multiplex_profiles: true`; peer `ubuntu` registered with no key.

**Not proven:**
- Any working peer DM, in either direction, on any edge. Nothing has been brought up.
- Ubuntu's Hermes install state, profiles, firewall, or real api_server port.
- That a Cloudflare Tunnel routes to Miami's 8642 — no such config is readable from here.
- The Cloudflare 403 / `1010` causal explanation (§5 row 7) — **UNVERIFIED**, no CF reference exists in the Hermes codebase. The fix list is defensive, not evidence-backed.
- Whether Ubuntu and Miami can be given SSH working, which is what §2's firewall steps and §5's diagnostics assume.

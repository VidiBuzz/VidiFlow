# PEER-WINDOWS-SETUP — Windows Hermes as peer client to the Ubuntu box

Date: 2026-10-05
Scope: Windows side only. No Hermes/gateway/desktop process was restarted, killed, or modified.

## TL;DR — status

| Item | State |
|---|---|
| Working `hermes` CLI invocation | **DONE, verified** |
| `ubuntu` peer registered in root `config.yaml` | **DONE, verified** (`peer list` shows it) |
| Peer API key (`HERMES_PEER_UBUNTU_KEY`) | **NOT SET — deliberately. No key exists; none was invented.** |
| End-to-end `peer dm` | **NOT WORKING, NOT VERIFIED.** Blocked on: (a) unknown Ubuntu api_server port, (b) missing key. |
| Ubuntu host reachable on LAN | **YES** — `ping 192.168.4.40` OK, 0% loss. But **no api_server port answered.** |

Two independent blockers prevent a working peer link right now. Both are Ubuntu-side.

---

## STEP 1 — The working CLI invocation

`hermes` is **not on PATH**. `python -m hermes_cli` also fails. The install is a uv-managed
editable venv that ships a real `hermes.exe`.

**Working invocation (verified, use this):**

```bash
env -u PYTHONPATH HERMES_HOME='C:/Users/James/AppData/Local/hermes' \
  'C:/Users/James/AppData/Local/hermes/installs/a51fe2f89cc151b2/environments/52ac5d4dc3da4c7298814bf04c720af5/venv/Scripts/hermes.exe' \
  <args>
```

As a one-liner for interactive use:

```bash
alias hermescli='env -u PYTHONPATH HERMES_HOME=C:/Users/James/AppData/Local/hermes /c/Users/James/AppData/Local/hermes/installs/a51fe2f89cc151b2/environments/52ac5d4dc3da4c7298814bf04c720af5/venv/Scripts/hermes.exe'
```

### Why each part is required

- **`env -u PYTHONPATH`** — the agent runtime exports a `PYTHONPATH` that shadows child venvs.
  Without stripping it the child interpreter resolves the wrong packages.
- **`HERMES_HOME=.../hermes`** (the ROOT, not the profile) — see the trap below.
- **Forward-slash `C:/...` path** — this host has MSYS path translation DISABLED. `/c/Users/...`
  does **not** work as an argument to a native binary; it fails with "cannot change to"/"not found".
  (`cd /c/...` works, because that is a bash builtin.)
- The venv's `__editable__.hermes_agent-0.0.0.pth` maps every module into
  `.../environments/52ac5d4dc3da4c7298814bf04c720af5/workspace/`, **not** into
  `hermes-agent/`. Both copies of `peer.py` were diffed and are byte-identical, so reading
  either one is authoritative.

### TRAP: `HERMES_HOME` must be the root, and the ambient shell value is the PROFILE

This shell already exports `HERMES_HOME=C:\Users\James\AppData\Local\hermes\profiles\vidiflow_vidibio_hx`.

If you omit the override, `peer add` writes to the **profile's** config, not the shared root
one, and the peer silently does not appear for the root profile. Always pass the root explicitly.

Verified resolution under the explicit root override:

```
config_path: C:\Users\James\AppData\Local\hermes\config.yaml
env_path   : C:\Users\James\AppData\Local\hermes\.env
```

### All four venvs work

`19600dfe…`, `34cdc68…`, `52ac5d4…`, `e5f926c…` each returned `No peers registered.` with
exit 0 before the edit. `52ac5d4…` is used here. All are the same editable code.

---

## STEP 2 — Real `config.yaml` shape (from source, not invented)

Read from `hermes_cli/subcommands/peer.py` (`_peer_add` / `_save_peers`):

```python
peers[name] = {"url": url.rstrip("/"), **({"note": args.note.strip()} if ... else {})}
cfg["bot_peers"] = peers          # save_config()
```

So the ONLY recognized per-peer keys are **`url`** and **`note`**. There is **no** `key`,
`port`, or `host` key in `config.yaml` — the key is a credential and lives only in `.env`.

Key name derivation (`_peer_key_env`): `HERMES_PEER_{NAME.upper().replace('-','_')}_KEY`
→ for `ubuntu`, exactly **`HERMES_PEER_UBUNTU_KEY`**.

`bot_peers` is **absent** from `DEFAULT_CONFIG` — it is purely user-created, so adding it
introduces no default-conflict risk.

---

## STEP 3 — Backups

Created before any edit:

- `C:\Users\James\AppData\Local\hermes\config.yaml.bak-peer-20261005`
- `C:\Users\James\AppData\Local\hermes\.env.bak-peer-20261005`

Checksums:

```
before: 62994ff9768b4dd7e9fbaddbff2ce140  config.yaml
        e7a6b411cd7478fc2cac036f7ecdb220  .env
after:  0e6972c26a1aa711c931eb10b97130ad  config.yaml
        e7a6b411cd7478fc2cac036f7ecdb220  .env   <-- unchanged, correct
```

## STEP 4 — The exact diff made

Additive only. This is the complete `diff config.yaml.bak-peer-20261005 config.yaml`:

```diff
254a255,258
> bot_peers:
>   ubuntu:
>     url: http://192.168.4.40:8377
>     note: Ubuntu Hermes box (LAN 192.168.4.40). PORT 8377 IS AN UNVERIFIED ASSUMPTION - source default for api_server is 8642 (gateway/platforms/api_server.py DEFAULT_PORT). Confirm real port + API_SERVER_KEY on the Ubuntu side.
```

Written by the CLI's own `save_config()`, not hand-edited — no indentation risk.

`.env` was **not modified**: no `HERMES_PEER_UBUNTU_KEY` line exists. Verified:

```
grep -c 'HERMES_PEER' .env   ->   0
```

---

## Read-back verification (real output)

```
$ ... hermes.exe peer list
ubuntu	http://192.168.4.40:8377	[NO KEY (HERMES_PEER_UBUNTU_KEY unset)] — Ubuntu Hermes box
(LAN 192.168.4.40). PORT 8377 IS AN UNVERIFIED ASSUMPTION - source default for api_server is
8642 (gateway/platforms/api_server.py DEFAULT_PORT). Confirm real port + API_SERVER_KEY on
the Ubuntu side.
exit=0
```

Registration is confirmed. The `[NO KEY …]` marker is the CLI telling the truth, not a bug.

## Honest failure test — `peer dm` does NOT work yet

```
$ ... hermes.exe peer dm ubuntu "ping from windows"
No API key for peer 'ubuntu'. Set it: hermes peer add ubuntu --url <url> --key <key>
(or add HERMES_PEER_UBUNTU_KEY=<key> to ~/.hermes/.env)
exit=1
```

This is the expected, correct pre-key failure. **No message was delivered to Ubuntu. No
handshake was performed. No key was fabricated.**

---

## ⚠️ THE PORT IS PROBABLY WRONG — 8377 vs 8642

The task brief assumed Hermes' default api_server port is 8377. **The source says otherwise.**

`gateway/platforms/api_server.py`:

```python
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8642
```

- Module docstring: "any OpenAI-compatible frontend connects at `http://localhost:8642/v1`".
- `_resolve_bind`: `raw_port = extra.get("port")` → else `API_SERVER_PORT` → else `DEFAULT_PORT`.

**8377 appears ONLY in `peer.py` CLI help-text examples** (`"e.g. http://spark.lan:8377"`), which
is illustrative prose, not a default. It is not a bind default anywhere in the codebase.

I registered **8377 as instructed**, and embedded the uncertainty in the peer's `note` so it is
visible in `peer list`. But treat the port as **an unverified assumption that the Ubuntu-side
agent must confirm.**

### Network probe evidence (192.168.4.40 is up, but silent)

```
$ ping -n 2 192.168.4.40
Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)

$ curl --connect-timeout 5 http://192.168.4.40:8377/health  -> exit=28 http_code=000 (timeout)
$ curl --connect-timeout 5 http://192.168.4.40:8642/health  -> exit=28 http_code=000 (timeout)
$ curl --connect-timeout 5 http://192.168.4.40:8641/health  -> exit=28 http_code=000 (timeout)
```

Host is alive; **no api_server answered on any port tried**. So the link is blocked by more
than the key — the api_server is either not running, not yet enabled as a platform, or bound
to `127.0.0.1` (the default `DEFAULT_HOST`!) and therefore unreachable from the LAN.

That last point is likely the real trap: **a stock api_server binds `127.0.0.1` and is not
LAN-reachable until `API_SERVER_HOST` / `platforms.api_server.host` is set to `0.0.0.0`.**

---

## STEP 5 — Exact commands the Ubuntu-side agent must run

### 1. Enable the api_server platform and make it LAN-reachable

```bash
hermes config set platforms.api_server.host 0.0.0.0     # else it binds 127.0.0.1 only
hermes config set platforms.api_server.port 8377        # or 8642 — pick ONE and tell Windows
```

(Confirm the exact key path against that box's `hermes config --help`; port resolution also
honours the `API_SERVER_PORT` env var, which is the simpler option.)

### 2. Report back two facts to the Windows agent

- the **actual** port
- the value of that box's **`API_SERVER_KEY`**

### 3. On the Ubuntu box, confirm it answers from off-box

```bash
curl -s -H "Authorization: Bearer $API_SERVER_KEY" http://192.168.4.40:<PORT>/health
curl -s -H "Authorization: Bearer $API_SERVER_KEY" http://192.168.4.40:<PORT>/v1/capabilities
```

### 4. Windows side then finishes the job (one command)

```bash
env -u PYTHONPATH HERMES_HOME='C:/Users/James/AppData/Local/hermes' \
  'C:/Users/James/AppData/Local/hermes/installs/a51fe2f89cc151b2/environments/52ac5d4dc3da4c7298814bf04c720af5/venv/Scripts/hermes.exe' \
  peer add ubuntu --url http://192.168.4.40:<PORT> --key <API_SERVER_KEY>
```

`peer add` is idempotent and overwrites both the `url` (fixing the port) and the key in one
step. Note that `--key` writes to **root** `.env` as `HERMES_PEER_UBUNTU_KEY` — the peer will
only resolve for the root profile, not for `vidiflow_vidibio_hx`, because this session's
ambient `HERMES_HOME` points at the profile dir.

### 5. Verify end-to-end

```bash
... hermes.exe peer list                       # expect [key set], no [NO KEY]
... hermes.exe peer dm ubuntu "ping from windows"
```

Optional, for a named profile on the multiplexed peer (Windows has
`gateway.multiplex_profiles: true`, and Ubuntu's default is also `true`):

```bash
... hermes.exe peer dm ubuntu/<profile> "..."
```

---

## Files touched

- `C:\Users\James\AppData\Local\hermes\config.yaml` — **modified additively** (`bot_peers:` block only)
- `C:\Users\James\AppData\Local\hermes\config.yaml.bak-peer-20261005` — backup, created
- `C:\Users\James\AppData\Local\hermes\.env` — **unchanged** (verified by md5)
- `C:\Users\James\AppData\Local\hermes\.env.bak-peer-20261005` — backup, created
- `M:\code\VidiFlow\out\fleet\PEER-WINDOWS-SETUP.md` — this file

No other profile's config, skills, plugins, cron, or memories were touched. No process was
restarted or killed.
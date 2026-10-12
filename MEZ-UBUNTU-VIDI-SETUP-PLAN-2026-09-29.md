# Mez platform setup plan — local Ubuntu (`vidi`)

**Saved:** 2026-09-29 ~8:24 PM ET  
**Owner lane:** VidiFlow / Mez (Hermes Agent)  
**Scope of this file:** Documentation only. No installs were performed when this plan was written.  
**Install ownership:** James will review Hermes Agent himself; **Space Bunny** will run the install.

**Locked naming:** Client-facing name is **Mez**. Product upstream is **Hermes Agent** (Nous Research). Prefer “Mez” in VidiSmart/VidiFlow talk.

**Canonical upstream docs:**  
- Installation: https://hermes-agent.nousresearch.com/docs/getting-started/installation  
- Desktop remote backend: https://hermes-agent.nousresearch.com/docs/user-guide/desktop  
- Related runbook already on disk: `M:\code\VidiBot\MEZ-BUILTINS-GLANCE-MAP-2026-09-23.md` and box copies of `MEZ-UBUNTU-HERMES-SERVE-INSTALL-2026-09-29.md`

---

## 1. Miami stack — already done (do not reinstall)

**Mez is already deployed on Ryan’s Miami stack** (dual Intel Arc Pro B70 private AI server / Candid Studios contact).

- Do **not** reinstall or reconfigure Mez on Miami for this local-Ubuntu effort.
- Miami remains the remote/private-GPU lane; this plan is only about the **house Ubuntu host** used as the Mez server for Windows thin-client Desktop.

---

## 2. Local target host (correct machine)

| Item | Truth |
|---|---|
| **Target** | Grok Bot Local Execution machine **`vidi`** |
| **OS** | Ubuntu **26.04.1 LTS** (kernel `7.0.0-31-generic`) |
| **User checked** | `vidiman` (`HOME=/home/vidiman`) |
| **RAM / CPU** | ~**14 GB** RAM · **12** CPUs |
| **GPU** | Intel **UHD Graphics 630** only (iGPU; `/dev/dri` present). No discrete NVIDIA. |
| **Key software present** | Docker **29.1.3**, Python **3.14.4**, Node **v22.14.0**, git **2.53.0** |
| **NOT the target** | The Grok Bot **agent shared VM** (Debian 13 / ~15 GB / **no GPU** / **no Docker**). Do not install Mez there. |

M-drive paths on `vidi` appear under `/mnt/m/code/…` (Windows: `M:\code\…`).

---

## 3. Current state on `vidi` (read-only check, 2026-09-29)

### Mez / Hermes runtime

| Check | Result |
|---|---|
| `hermes` on PATH | **No** |
| `~/.hermes/` home | **Missing** |
| Listener on **port 9119** | **Nothing** (`curl http://127.0.0.1:9119/api/status` fails) |
| User systemd unit for Hermes/Mez | **None** |
| Running `hermes` / Mez serve process | **None** |

### Source tree (partial / not usable as install)

- Path: **`/mnt/m/code/dev/hermes-agent`** (Windows: `M:\code\dev\hermes-agent`)
- Full-ish clone with README, `agent/`, skills, Dockerfile, `.venv/`, etc.
- **`.venv` is broken / unusable** (no working interpreter for a real `hermes` binary from that venv).
- **Do not** try to “fix” this venv as the primary install path. Use the **official installer** instead.

### VidiSmart / VidiFlow code on M-drive

- Folders under `M:\code\vidismart` and `M:\code\vidiflow` (and related) contain **bridge docs, helpers, logos, and planning notes** that *mention* Hermes/Mez.
- Examples (non-exhaustive): Hermes bridge scripts under VidiSmart (`hermes_bridge.py`, `check-hermes.js`, profile helpers), plus several Mez/Hermes planning markdowns under VidiBot.
- **No live Mez install** lives inside VidiSmart/VidiFlow product trees. Those are integration/docs surfaces only.

### Agent Debian VM (for clarity)

- Holds planning docs only (e.g. `/workspace/vidiflow-stack-report/MEZ-UBUNTU-HERMES-SERVE-INSTALL-2026-09-29.md`, `/workspace/VidiBot/MEZ-BUILTINS-GLANCE-MAP-2026-09-23.md`, `/workspace/mez-security/…`).
- **Not** a Mez runtime host.

---

## 4. Recommended install steps (for Space Bunny — after James reviews Hermes)

**Goal end state**

1. Official Hermes (Mez) installed on **`vidi`**.
2. `hermes serve --host 0.0.0.0 --port 9119` running (prefer **user systemd** so it survives reboot).
3. Basic auth in `~/.hermes/.env`.
4. Reachable URL for Windows: `http://<vidi-lan-or-tailscale-ip>:9119` (prefer **Tailscale**; do **not** expose password auth to the public internet).
5. Windows **Hermes Desktop** → Settings → Gateways → **Remote gateway** → that URL → Sign in → Save/reconnect.
6. Verify: `curl http://127.0.0.1:9119/api/status` (with auth as required) and Desktop “Test connection”.

### 4a. Prereqs (on `vidi`)

```bash
sudo apt-get update -y
sudo apt-get install -y git curl xz-utils build-essential
```

### 4b. Official installer (preferred over the broken clone)

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash -s -- --skip-browser
# or full (with browser): curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash

source ~/.bashrc 2>/dev/null || true
hash -r
hermes --version
```

**Do not** use `/mnt/m/code/dev/hermes-agent/.venv` as the production binary.

### 4c. Basic auth for remote gateway (trusted LAN / Tailscale only)

```bash
mkdir -p ~/.hermes
umask 077
cat >> ~/.hermes/.env <<'ENV'
HERMES_DASHBOARD_BASIC_AUTH_USERNAME=admin
HERMES_DASHBOARD_BASIC_AUTH_PASSWORD=CHANGE_ME_STRONG
HERMES_DASHBOARD_BASIC_AUTH_SECRET=REPLACE_WITH_openssl_rand_base64_32
ENV
chmod 600 ~/.hermes/.env
# then set a real secret:
sed -i "s|REPLACE_WITH_openssl_rand_base64_32|$(openssl rand -base64 32)|" ~/.hermes/.env
# and replace CHANGE_ME_STRONG with a strong password James chooses
```

### 4d. Foreground smoke test

```bash
hermes serve --host 0.0.0.0 --port 9119
# other terminal:
curl -sS http://127.0.0.1:9119/api/status
```

### 4e. User systemd unit (keep serving across reboot)

File: `~/.config/systemd/user/hermes-serve.service`

```ini
[Unit]
Description=Mez / Hermes serve (desktop remote gateway)
After=network-online.target

[Service]
Type=simple
EnvironmentFile=%h/.hermes/.env
ExecStart=%h/.local/bin/hermes serve --host 0.0.0.0 --port 9119
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```

```bash
systemctl --user daemon-reload

systemctl --user enable --now hermes-serve.service
sudo loginctl enable-linger "$USER"
curl -sS http://127.0.0.1:9119/api/status
```

### 4f. Windows thin client

1. Install Hermes Desktop on Windows if missing.  
2. Settings → Gateways → Remote gateway.  
3. URL: `http://<vidi-ip-or-tailscale-name>:9119`  
4. Sign in with the basic-auth user/password.  
5. Save / reconnect; run Test.

**Product policy reminder (from earlier locks):** Mez is the **single primary** coding/agent platform on this Ubuntu path. Do not start OpenCode / Cline / other platforms as the primary stack for this lane unless James explicitly changes that lock.

---

## 5. Who does what next

| Role | Action |
|---|---|
| **James** | Look at Hermes Agent himself (product/docs fit). |
| **Space Bunny** | Run the install on **`vidi`** per §4 when James gives GO. |
| **This agent / Miami** | Do **not** reinstall Mez on Ryan’s Miami stack. Do **not** install Mez on the agent Debian VM unless James overrides. |

---

## Quick checklist (Space Bunny)

- [ ] Confirm work is on machine **`vidi`** (Ubuntu 26.04), not agent Debian VM, not Miami  
- [ ] Official `install.sh` → `hermes --version` works  
- [ ] `~/.hermes/.env` basic auth set (strong password + secret)  
- [ ] `hermes serve` on **9119**; systemd user unit + linger  
- [ ] Local `curl` status OK  
- [ ] Windows Hermes Desktop remote gateway connected  
- [ ] Leave Miami Mez alone  

---

*Path of this plan:* `M:\code\vidiflow\MEZ-UBUNTU-VIDI-SETUP-PLAN-2026-09-29.md`  
*(Linux on vidi: `/mnt/m/code/vidiflow/MEZ-UBUNTU-VIDI-SETUP-PLAN-2026-09-29.md`)*

---

## 6. Analytics engine decision (appended 2026-09-29 ~8:28 PM ET)

**Decision:** The team will use **ClickHouse** as the open-source analytics engine.

| Option considered | Outcome |
|---|---|
| **ClickHouse** | **Chosen** — open-source analytics engine; preferred for **cost** vs cloud warehouse alternatives |
| MotherDuck | Not selected as the primary analytics engine (cost) |
| Snowflake | Not selected as the primary analytics engine (cost) |

### Related: MotherDuck on Windows V20

There is an **existing MotherDuck container on the Windows V20 machine** that holds a database of the **top 20 AI models**.

- That registry may later be **migrated into ClickHouse**, **or** kept as a **separate** model registry (decision still open).
- Do not tear down or migrate the V20 MotherDuck container as part of Mez / Hermes install work unless James explicitly says so.
- This analytics note does **not** change Mez install ownership (James reviews Hermes; Space Bunny runs Ubuntu `vidi` install) or the Miami “do not reinstall” lock.

*Docs-only append — no installs or system changes when this section was written.*

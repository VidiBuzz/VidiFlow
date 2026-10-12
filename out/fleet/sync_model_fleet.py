#!/usr/bin/env python3
"""Fleet model sync — propagate the master (vidibot) model/provider config to every bot profile.

MASTER = the profile you make model changes in (vidibot). Everything it defines for
model_aliases + custom_providers + the API keys it uses gets copied into every other
profile under C:/Users/James/AppData/Local/hermes/profiles/. Then every profile's
provider_models_cache.json is refreshed so pickers show the new set without a full
session reload (same effect as the Refresh button, automated).

Run after ANY model/provider change:  python sync_model_fleet.py
Idempotent — safe to run any time. Never prints secret values.
"""
import os, sys, json, glob, shutil, urllib.request

HERMES = r"C:\Users\James\AppData\Local\hermes"
PROFILES = os.path.join(HERMES, "profiles")
MASTER = "vidibot"
CACHE_NAME = "provider_models_cache.json"
KEY_VARS = ["CHEAPER_INFERENCE_API_KEY", "CLINE_API_KEY", "OPENROUTER_API_KEY", "KILOCODE_API_KEY"]  # extend when new providers join the fleet


def load_yaml(path):
    import yaml
    if not os.path.exists(path):
        return {}
    return yaml.safe_load(open(path, encoding="utf-8", errors="replace")) or {}


def save_yaml(path, data):
    import yaml
    with open(path, "w", encoding="utf-8") as f:
        yaml.dump(data, f, default_flow_style=False, sort_keys=False)


def main():
    master_cfg = load_yaml(os.path.join(PROFILES, MASTER, "config.yaml"))
    master_env = open(os.path.join(PROFILES, MASTER, ".env"), encoding="utf-8",
                      errors="replace").read() if os.path.exists(os.path.join(PROFILES, MASTER, ".env")) else ""
    master_cache = os.path.join(PROFILES, MASTER, CACHE_NAME)

    payload = {k: master_cfg[k] for k in ("model_aliases", "custom_providers", "providers") if k in master_cfg}
    keys = {}
    for var in KEY_VARS:
        for line in master_env.splitlines():
            if line.startswith(var + "="):
                keys[var] = line.split("=", 1)[1].strip()

    bots = [d for d in sorted(os.listdir(PROFILES))
            if os.path.isdir(os.path.join(PROFILES, d)) and d != MASTER and not d.startswith(".")]
    changed_env = changed_cfg = caches_seeded = 0

    for bot in bots:
        bdir = os.path.join(PROFILES, bot)
        # .env keys
        env_path = os.path.join(bdir, ".env")
        env_text = open(env_path, encoding="utf-8", errors="replace").read() if os.path.exists(env_path) else ""
        add = [f"{k}={v}" for k, v in keys.items()
               if k not in {l.split("=", 1)[0] for l in env_text.splitlines() if "=" in l}]
        if add:
            with open(env_path, "a", encoding="utf-8") as f:
                if env_text and not env_text.endswith("\n"):
                    f.write("\n")
                f.write("\n# fleet-synced keys\n" + "\n".join(add) + "\n")
            changed_env += 1
        # config blocks (merge: never delete bot-specific entries)
        cfg_path = os.path.join(bdir, "config.yaml")
        cfg = load_yaml(cfg_path)
        dirty = False
        for section, values in payload.items():
         if section == "model_aliases":
          target = cfg.setdefault("model_aliases", {})
         elif section == "providers":
          target = cfg.setdefault("providers", {})
         else:
          target = cfg.setdefault("custom_providers", [])
         if isinstance(values, dict) and isinstance(target, dict):
                for name, entry in values.items():
                    if target.get(name) != entry:
                        target[name] = entry; dirty = True
         elif section in ("custom_providers", "fallback_providers") and isinstance(values, list) and isinstance(target, list):
                for entry in values:
                    nm = entry.get("name") if isinstance(entry, dict) else None
                    if nm and not any(isinstance(e, dict) and e.get("name") == nm for e in target):
                        target.append(entry); dirty = True
        if dirty:
            save_yaml(cfg_path, cfg); changed_cfg += 1
        # cache: master's cache carries the fresh custom-provider model list
        if os.path.exists(master_cache):
            dst = os.path.join(bdir, CACHE_NAME)
            if not os.path.exists(dst):
                shutil.copy(master_cache, dst); caches_seeded += 1

    print(f"fleet sync done: {len(bots)} bots | .env updated: {changed_env} | config updated: {changed_cfg} | caches seeded: {caches_seeded}")
    if not os.path.exists(master_cache):
        print("NOTE: master cache missing — run /model --refresh once in the master profile.")


if __name__ == "__main__":
    sys.exit(main())

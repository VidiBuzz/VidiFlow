import json, os, shutil, sys

ROOT = r"M:\code\VidiFlow\roster\vidiflow-roster.json"
OUT = r"M:\code\VidiFlow\out\org-page"
SRC = r"M:\code\VidiFlow\vidiflow-demo-site\images"

with open(ROOT, "r", encoding="utf-8") as f:
    r = json.load(f)

people = {p["id"]: p for p in r["people"]}
agents = {a["id"]: a for a in r["agents"]}
print("schema:", r["schema"], "| people:", len(r["people"]), "| agents:", len(r["agents"]))

# validate pairings + counts
agent_to_person = {}
for a in r["agents"]:
    pw = a.get("pairedWith")
    agent_to_person.setdefault(pw, []).append(a["id"])
problems = []
for p in r["people"]:
    cnt = len(p.get("agents", []))
    for aid in p.get("agents", []):
        if aid not in agents:
            problems.append(f"{p['id']} references missing agent {aid}")
        elif agents[aid].get("pairedWith") != p["id"]:
            problems.append(f"{aid}.pairedWith={agents[aid].get('pairedWith')} != {p['id']}")
    if cnt < 2 and not p.get("needsAgents"):
        problems.append(f"{p['id']} has {cnt} agents but needsAgents not set")
    print(f"  {p['name']:16s} division={p['division']:10s} agents={cnt} needsAgents={p.get('needsAgents', False)}")

unpaired = [a["id"] for a in r["agents"] if a.get("pairedWith") not in people]
if unpaired:
    problems.append("agents paired to unknown person: " + ", ".join(unpaired))

print("problems:", problems if problems else "none")

# copy people headshots
os.makedirs(os.path.join(OUT, "img", "people"), exist_ok=True)
os.makedirs(os.path.join(OUT, "img", "agents"), exist_ok=True)
people_map = {
    "person:james": "org-head-james", "person:casey": "org-head-casey", "person:ledger": "org-head-ledger",
    "person:marcus": "org-head-marcus", "person:sofia": "org-head-sofia", "person:ryan": "org-head-ryan",
    "person:daniel": "org-head-daniel", "person:priya": "org-head-priya", "person:tomas": "org-head-tomas",
    "person:elena": "org-head-elena",
}
agent_src_map = {
    "agent:max-riker": "org-head-hermes", "agent:iris-novak": "org-head-vidiflow",
    "agent:dex-harmon": "org-head-vidinews", "agent:kenji-mori": "org-head-smartgen",
    "agent:zola-grant": "org-head-brandswap", "agent:greta-lindholm": "org-head-directus",
    "agent:miles-turner": "org-head-deploy", "agent:nadia-rehn": "org-head-airpmd",
}
copied = []
for pid, base in people_map.items():
    slug = pid.split(":")[1]
    src = os.path.join(SRC, base + ".png")
    dst = os.path.join(OUT, "img", "people", slug + ".png")
    if os.path.exists(src):
        shutil.copyfile(src, dst); copied.append(("people", slug))
    else:
        problems.append(f"missing people src {src}")
for aid, base in agent_src_map.items():
    slug = aid.split(":")[1]
    src = os.path.join(SRC, base + ".png")
    dst = os.path.join(OUT, "img", "agents", slug + ".png")
    if os.path.exists(src):
        shutil.copyfile(src, dst); copied.append(("agents", slug))
    else:
        problems.append(f"missing agent src {src}")

print("copied:", len(copied), "files")

# write roster copy into data/
with open(os.path.join(OUT, "data", "roster.json"), "w", encoding="utf-8") as f:
    json.dump(r, f, indent=2, ensure_ascii=False)
print("wrote data/roster.json")

# agents needing generated portraits
missing = [a["id"].split(":")[1] for a in r["agents"] if a["portrait"]["src"].split("/")[-1] not in
           [os.path.basename(p) for k, p in [(k, os.path.join(OUT, "img", "agents", k.split(":")[1] + ".png")) for k in agent_src_map]]]
print("agents needing portrait:", missing)

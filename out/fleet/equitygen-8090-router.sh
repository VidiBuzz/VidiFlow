#!/usr/bin/env bash
# Free :8090 for nginx host-routing so equitygen.app gets its own origin.
#
# WHY: the Cloudflare tunnel ingress for equitygen.app points at localhost:8090,
# which is VidiFlow HX ("next start -p 8090"). nginx:80 already serves the correct
# EquityGen page for Host: equitygen.app. We cannot edit the tunnel (no
# Account->Cloudflare Tunnel:Edit credential), so instead we make :8090 itself
# host-aware: nginx on :8090 serves EquityGen for the equitygen.app hostnames and
# proxies everything else to HX, which moves to 127.0.0.1:8091.
#
# REVERT (fully restores the previous state):
#   rm -f ~/.config/systemd/user/vidiflow-hx.service.d/10-port-8091.conf
#   systemctl --user daemon-reload && systemctl --user restart vidiflow-hx.service
#   sudo rm -f /etc/nginx/sites-enabled/equitygen-8090 /etc/nginx/sites-available/equitygen-8090
#   sudo nginx -t && sudo systemctl reload nginx
set -uo pipefail

HX_UNIT="vidiflow-hx.service"
DROPIN_DIR="$HOME/.config/systemd/user/${HX_UNIT}.d"
DROPIN="$DROPIN_DIR/10-port-8091.conf"
NGX_AVAIL=/etc/nginx/sites-available/equitygen-8090
NGX_ENABLED=/etc/nginx/sites-enabled/equitygen-8090

say(){ printf '\n=== %s ===\n' "$*"; }
die(){ printf 'ABORT: %s\n' "$*"; exit 1; }

say "1. Move VidiFlow HX to 127.0.0.1:8091 (systemd user drop-in)"
mkdir -p "$DROPIN_DIR"
cat > "$DROPIN" <<'EOF'
[Service]
# Max 2026-10-07: free :8090 so nginx can host-route there for equitygen.app.
# HX stays reachable on :8090 through the nginx proxy below.
ExecStart=
ExecStart=/home/vidiman/tools/node/bin/npx next start -H 127.0.0.1 -p 8091
EOF
systemctl --user daemon-reload
systemctl --user restart "$HX_UNIT"

ok=0
for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 http://127.0.0.1:8091/ 2>/dev/null || true)
  if [ "$code" = "200" ]; then ok=1; break; fi
  sleep 1
done

if [ "$ok" != "1" ]; then
  say "HX did not come up on 8091 - REVERTING to :8090"
  rm -f "$DROPIN"
  systemctl --user daemon-reload
  systemctl --user restart "$HX_UNIT"
  sleep 3
  curl -s -o /dev/null -w "restored :8090 -> %{http_code}\n" --max-time 5 http://127.0.0.1:8090/ || true
  die "HX restart failed; original state restored, nothing else touched"
fi
printf 'HX now on 8091: '; curl -s --max-time 5 http://127.0.0.1:8091/ | grep -io '<title>[^<]*</title>' | head -1

say "2. nginx host-router on :8090"
sudo -n tee "$NGX_AVAIL" >/dev/null <<'EOF'
# Max 2026-10-07 - host-aware origin for :8090.
# equitygen.app/www -> EquityGen static site; anything else -> VidiFlow HX on 8091.
log_format eshost '$remote_addr host="$host" uri="$request_uri" status=$status';

server {
    listen 8090;
    server_name equitygen.app www.equitygen.app;
    access_log /var/log/nginx/equitygen-8090.log eshost;
    root /mnt/m/code/EquityGen/site;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|mp4)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

server {
    listen 8090 default_server;
    access_log /var/log/nginx/hx-8090.log eshost;
    location / {
        proxy_pass http://127.0.0.1:8091;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF
sudo -n ln -sf "$NGX_AVAIL" "$NGX_ENABLED"

if ! sudo -n nginx -t 2>&1; then
  sudo -n rm -f "$NGX_ENABLED"
  die "nginx config test failed - symlink removed, nginx left untouched"
fi
sudo -n systemctl reload nginx || die "nginx reload failed"
sleep 1

say "3. LOCAL verification on :8090"
printf 'Host equitygen.app -> '; curl -s --max-time 5 -H 'Host: equitygen.app'  http://127.0.0.1:8090/ | grep -io '<title>[^<]*</title>' | head -1
printf 'Host vidiflow.net   -> '; curl -s --max-time 5 -H 'Host: vidiflow.net'    http://127.0.0.1:8090/ | grep -io '<title>[^<]*</title>' | head -1
printf 'no Host (default)   -> '; curl -s --max-time 5                            http://127.0.0.1:8090/ | grep -io '<title>[^<]*</title>' | head -1

say "4. PUBLIC verification"
curl -s -o /dev/null -w 'https://equitygen.app  -> %{http_code} size=%{size_download}\n' --max-time 15 "https://equitygen.app/?cb=$(date +%s)"
printf '   title: '; curl -s --max-time 15 "https://equitygen.app/?cb=$(date +%s)" | grep -io '<title>[^<]*</title>' | head -1
curl -s -o /dev/null -w 'https://vidiflow.net   -> %{http_code} size=%{size_download}\n' --max-time 15 "https://vidiflow.net/?cb=$(date +%s)"
printf '   title: '; curl -s --max-time 15 "https://vidiflow.net/?cb=$(date +%s)" | grep -io '<title>[^<]*</title>' | head -1

say "5. What Host header did the tunnel actually send?"
sudo -n tail -6 /var/log/nginx/equitygen-8090.log 2>/dev/null || echo "(no equitygen-8090 hits yet)"
sudo -n tail -6 /var/log/nginx/hx-8090.log 2>/dev/null || echo "(no hx-8090 hits yet)"

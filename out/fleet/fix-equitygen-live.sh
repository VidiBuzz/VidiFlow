#!/usr/bin/env bash
# Make equitygen.app serve the EquityGen site - end to end, no Cloudflare API credential.
#
# The tunnel ingress for equitygen.app targets localhost:8090 (VidiFlow HX) and is
# remote-managed, so it cannot be edited from this box. Instead:
#   1. move VidiFlow HX to 127.0.0.1:8091
#   2. nginx listens on :8090 and host-routes  -> equitygen.app = EquityGen static,
#      everything else = proxied to HX on 8091 (so vidiflow.net is unaffected)
#   3. bring the equitygen tunnel connector back up as a managed service
#      (it was a bare process that had died, leaving equitygen.app on CF 1033/530)
#
# REVERT:
#   rm -f ~/.config/systemd/user/vidiflow-hx.service.d/10-port-8091.conf
#   systemctl --user daemon-reload && systemctl --user restart vidiflow-hx.service
#   sudo rm -f /etc/nginx/sites-enabled/equitygen-8090 /etc/nginx/sites-available/equitygen-8090
#   sudo nginx -t && sudo systemctl reload nginx
#   sudo systemctl disable --now cloudflared-equitygen && sudo rm -f /etc/systemd/system/cloudflared-equitygen.service
set -uo pipefail

HX_UNIT="vidiflow-hx.service"
DROPIN_DIR="$HOME/.config/systemd/user/${HX_UNIT}.d"
DROPIN="$DROPIN_DIR/10-port-8091.conf"
NGX_AVAIL=/etc/nginx/sites-available/equitygen-8090
NGX_ENABLED=/etc/nginx/sites-enabled/equitygen-8090
CF_UNIT_SRC=/tmp/cloudflared-equitygen.service
CF_UNIT_DST=/etc/systemd/system/cloudflared-equitygen.service

say(){ printf '\n=== %s ===\n' "$*"; }

say "1. Move VidiFlow HX to 127.0.0.1:8091"
if [ ! -f "/mnt/m/code/VidiBot/vidiflow-hx/.next/BUILD_ID" ]; then
  echo "REFUSING: .next has no BUILD_ID - HX cannot start. Restore a build first."
  exit 1
fi
mkdir -p "$DROPIN_DIR"
cat > "$DROPIN" <<'EOF'
[Service]
# Max 2026-10-07: free :8090 so nginx can host-route there for equitygen.app.
# HX remains reachable on :8090 through the nginx proxy.
ExecStart=
ExecStart=/home/vidiman/tools/node/bin/npx next start -H 127.0.0.1 -p 8091
EOF
systemctl --user daemon-reload
systemctl --user restart "$HX_UNIT"
ok=0
for i in $(seq 1 40); do
  c=$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 http://127.0.0.1:8091/ 2>/dev/null || true)
  [ "$c" = "200" ] && { ok=1; echo "HX up on 8091 after ${i}s"; break; }
  sleep 1
done
if [ "$ok" != "1" ]; then
  echo "HX failed on 8091 - REVERTING"
  rm -f "$DROPIN"; systemctl --user daemon-reload; systemctl --user restart "$HX_UNIT"
  exit 1
fi
printf 'HX 8091 title: '; curl -s --max-time 5 http://127.0.0.1:8091/ | grep -io '<title>[^<]*</title>' | head -1

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
  echo "nginx test failed - symlink removed"
  exit 1
fi
sudo -n systemctl reload nginx || { echo "nginx reload failed"; exit 1; }
sleep 1
printf '   :8090 Host equitygen.app -> '; curl -s --max-time 5 -H 'Host: equitygen.app' http://127.0.0.1:8090/ | grep -io '<title>[^<]*</title>' | head -1
printf '   :8090 Host vidiflow.net   -> '; curl -s --max-time 5 -H 'Host: vidiflow.net'   http://127.0.0.1:8090/ | grep -io '<title>[^<]*</title>' | head -1

say "3. Restore the equitygen tunnel connector (managed, was a dead bare process)"
if [ -f "$CF_UNIT_SRC" ]; then
  sudo -n cp "$CF_UNIT_SRC" "$CF_UNIT_DST"
  sudo -n chmod 600 "$CF_UNIT_DST"
  sudo -n systemctl daemon-reload
  sudo -n systemctl enable --now cloudflared-equitygen.service 2>&1 | tail -3
  sleep 4
  printf '   unit state: '; systemctl is-active cloudflared-equitygen.service 2>&1
else
  echo "   no staged unit at $CF_UNIT_SRC - skipping"
fi

say "4. PUBLIC verification (polling up to 90s)"
for i in $(seq 1 18); do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 12 "https://equitygen.app/?cb=$(date +%s)" 2>/dev/null || true)
  title=$(curl -s --max-time 12 "https://equitygen.app/?cb=$(date +%s)" 2>/dev/null | grep -io '<title>[^<]*</title>' | head -1)
  echo "   [$i] equitygen.app -> $code  $title"
  case "$title" in *EquityGen*) echo "   *** EQUITYGEN IS LIVE ***"; break;; esac
  sleep 5
done
echo
printf '   vidiflow.net  -> '; curl -s -o /dev/null -w '%{http_code} ' --max-time 12 "https://vidiflow.net/?cb=$(date +%s)"; curl -s --max-time 12 "https://vidiflow.net/?cb=$(date +%s)" | grep -io '<title>[^<]*</title>' | head -1

say "5. What Host header did the tunnel actually send?"
sudo -n tail -4 /var/log/nginx/equitygen-8090.log 2>/dev/null || echo "(no hits on the equitygen vhost yet)"
sudo -n tail -4 /var/log/nginx/hx-8090.log 2>/dev/null || echo "(no hits on the HX fallback vhost yet)"

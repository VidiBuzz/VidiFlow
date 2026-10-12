# Fleet dashboard — empty tables on /f

Date: 2026-10-05

## Root cause

**The JS was never executed. The HTTP responses had no `Content-Length`.**

`fleet_dashboard.py`'s handler class sets `protocol_version = "HTTP/1.1"` (keep-alive
by default), but `_send()` wrote only `Content-Type` and `Cache-Control` — no
`Content-Length`, and no `Transfer-Encoding: chunked`. Under HTTP/1.1 a response
body is framed by one of those two; with neither, the only legal body delimiter
is connection close, which a keep-alive server never sends.

Consequence: the browser receives all 9,045 bytes of `fleet.html` but never sees
the message complete, so the document stays in "loading" state and the inline
`<script>` at the bottom of `<body>` never runs. No `render()`, so
`#bots` and `#lanes` keep their server-sent empty `<tbody>`. The headers were
static HTML, which is exactly why the page looked *almost* right.

This hit every route, not just `/f` — `/`, `/ai`, and all `/api/*` were equally
broken; the browser just happened to recover on the JSON ones.

### Ruled out (the hypotheses worth checking)

| Hypothesis | Result |
|---|---|
| `/api/fleet` shadowed by the `/f` branch | **No.** Order is `/api/health` → `/api/stack` → `/api/fleet` → `/api/lanes` → `/ai` → `/f` → `/`, and `"/api/fleet".startswith("/f")` is `False`. Safe. |
| Runtime exception before the `innerHTML` assignments | **No.** Headless run of the extracted script against real `fleet.json` produced 46 + 66 rows, zero exceptions. |
| `sortBy`'s `b` shadowing outer references | **No.** `b` is block-scoped to the comparator; no outer `b` exists. Rendering is order-independent — verified by re-running with sorted output. |
| Duplicate `cls` / `dot` helpers | **No.** They are declared once each and never referenced by `render()`. Dead code, harmless. |
| `esc()` throwing | **No.** Its regex `/[<>&\"]/g` is well-formed; exercised 46× and 66× without error. |
| Malformed `fleet.json` | **No.** All 66 lanes have numeric `files` and an `md` key, so `l.files.toLocaleString()` cannot throw. |
| Missing element ids | **No.** All referenced ids exist. |

The misleading detail: `curl`/raw-socket probes *appear* to work — the bytes do
arrive. The failure is only that the response never terminates, which a byte-count
check cannot see. `curl --max-time` timing out at 28 after "receiving" 9,045 bytes
was the tell.

## Changes made

### 1. `fleet_dashboard.py` — `_send()`: add `Content-Length` (the actual fix)

```python
self.send_header("Content-Type", ctype)
self.send_header("Content-Length", str(len(body)))   # <-- added
self.send_header("Cache-Control", "no-store")
```

One line. Frames every response; the browser now finishes the document and runs
the script.

### 2. `fleet_dashboard.py` — `cx` false positive on port 8765

`tcp_up()` returned `True` for *any* listener. Port 8765 is an unrelated Hermes
`http.server` serving a directory listing, so the dashboard painted it green.

- `SERVICES` entry for `cx` gained probe params: `("cx", "Smart Channel CX", 8765, "http", "/", "smart channel")`
- New `http_up(port, path, marker)`: requires HTTP 200, a `text/html` content type,
  and the `marker` string in the body. A directory listing fails all three.
- `services()` dispatches per entry — `"http"` → `http_up()`, otherwise the
  original `tcp_up()`. The other five checks are byte-for-byte unchanged.
- Entry shape is backward compatible: 3-tuples still work.

### 3. `fleet.html` — visible error banner

The original failure was silent *by construction*: an exception, a bad status, or
a dead fetch left the page blank with no signal. Added:

- `<div id="errbar">` + `#errbar` CSS (hidden via `display:none`, `.on` shows it),
  styled to match the existing dark palette.
- `fail(where, e)` writes the message and stack into the banner.
- `window.onerror` / `unhandledrejection` → `fail()`, catching anything outside `tick()`.
- `render()` is now a thin wrapper that try/catches `renderRows()` (the old body,
  renamed) and reports before rethrowing — so sort-click failures surface too.
- `tick()` now checks `!r.ok` and reports the HTTP status, and clears the banner
  on a good poll.

Look and behaviour are otherwise unchanged.

## Verification

### Before — response never terminates

```
/f            *** NO EOF after 3s — connection still OPEN, total=9202 bytes
  -> has Content-Length: False | chunked: False | body bytes: 9045
/api/fleet    *** NO EOF after 3s — connection still OPEN, total=30395 bytes
  -> has Content-Length: False | chunked: False | body bytes: 30246
/             *** NO EOF after 3s — connection still OPEN, total=14656 bytes
```

```
$ curl --max-time 6 http://127.0.0.1:8790/f
curl: (28) Operation timed out after 6016 milliseconds with 9045 bytes received
```

### After — framed and complete

```
/f            200  Content-Length hdr=10199  actual_read=10199  match=True
/api/fleet    200  Content-Length hdr=31001  actual_read=31001  match=True
/             200  Content-Length hdr=14499  actual_read=14499  match=True
/api/health   200  Content-Length hdr=3418   actual_read=3418   match=True
```

### Headless render (extracted script, stubbed DOM, real fleet.json)

```
=== RENDER OK ===
fetch calls        : 1
#bots rows         : 46
#lanes rows        : 66
#botN text         : 46 documented · 5 with a live profile
#laneN text        : 66 lanes · 4,770 files
#strip children    : 5
#root text         : M:\code\VidiBot
```

No exception at any point — confirming the JS was never the problem.

### Real browser at http://127.0.0.1:8790/f

```python
{'botRows': 46, 'laneRows': 66,
 'botN': '46 documented · 12 with a live profile',
 'laneN': '66 lanes · 4,772 files',
 'stripTiles': 5,
 'errbarVisible': False, 'errbarText': ''}
```

Screenshot confirms populated tables, populated stat strip, no error banner.

### CX tile corrected

```
  kumiho   port=9190   up=True
  neo4j    port=7474   up=True
  redis    port=6379   up=True
  cx       port=8765   up=False     <-- was a false green
  revka    port=42617  up=True
  9miho    port=9999   up=True
```

Port 8765 confirmed to be `<title>Directory listing for /</title>` — a Python
`SimpleHTTP/0.6` server, not Smart Channel CX.

## Row count

| | bot rows | lane rows |
|---|---|---|
| Before | 0 | 0 |
| After | **46** | **66** |

Matches `fleet.json` totals exactly (46 bots, 66 lanes). Totals drift slightly
between reads (`matched` 5→12, `lane_files` 4770→4772) because `scan_fleet.py`
refreshes `fleet.json` on a background loop — not a defect.

## Note

The server must be restarted for the Python fix to take effect; the page file is
read per-request so `fleet.html` changes apply immediately. The running instance
was restarted as part of this verification.
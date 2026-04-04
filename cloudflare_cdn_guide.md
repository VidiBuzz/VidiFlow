# Cloudflare CDN Configuration Guide
## Resolving 403 Forbidden Image Errors

**The Problem:**
Currently, loading images or videos directly from the `cdn.vidi.news` subdomain onto `vidismart.com` results in a **403 Forbidden** error. This occurs because the CDN is rejecting requests that contain `vidismart.com` in their `Referer` header. 
- *Local environments (`localhost`, `file:///`) work fine because they do not send a referrer header.*

**The Temporary Fix:**
Adding `referrerpolicy="no-referrer"` to all `<img>` and `<video>` tags. This forces the browser to drop the `vidismart.com` referrer, bypassing the CDN's block.
```html
<img src="https://cdn.vidi.news/image.png" referrerpolicy="no-referrer">
```
*Note: This is a band-aid solution and should be removed once the CDN is properly configured.*

---

## 🛠️ The Permanent Fix: Cloudflare Configuration

To solve this at the root level, we need to instruct Cloudflare (which manages `vidi.news`) to explicitly trust and allow requests originating from `vidismart.com`.

### Option 1: Adjust Cloudflare Scrape Shield (Easiest)
Cloudflare has a built-in feature to prevent other websites from stealing your bandwidth by embedding your files (Hotlink Protection).
1. Log into Cloudflare and select the **vidi.news** domain.
2. On the left sidebar, click on **Scrape Shield**.
3. Look for the **Hotlink Protection** toggle.
   - If it is **ON**, Cloudflare is actively blocking `vidismart.com` from embedding files from `vidi.news`.
   - **Fix:** Turn Hotlink Protection **OFF**. If you still want to protect against bandwidth theft, keep it off and follow Option 2 instead.

### Option 2: Create a Custom WAF Rule (Smartest/Most Secure)
If you want to keep Hotlink Protection active but specifically whitelist your own domains:
1. Go to the **vidi.news** dashboard in Cloudflare.
2. Go to **Security** -> **WAF** -> **Custom rules**.
3. Click **Create rule**.
4. Name it `"CDN Hotlink Protection Whitelist"`.
5. Set the logic to block anything that IS NOT your approved domains:
   - Field: `Referer` | Operator: `does not contain` | Value: `vidismart.com`
   - **AND**
   - Field: `Referer` | Operator: `does not contain` | Value: `vidi.news`
6. Set the Action to **Block**.

*(Note: If you do this, ensure Cloudflare's default Scrape Shield Hotlink Protection is turned OFF, as this custom rule replaces it.)*

---

## ⚙️ A Note on CORS (Cross-Origin Resource Sharing)
Hotlink Protection (what was blocking us above) is enforced by the *server*. CORS is enforced by the *browser*.
- Standard `<img>` and `<video>` tags **do not require CORS** to simply display content.
- However, if you load images using JavaScript (like `fetch()`), WebGL (Three.js), or `<canvas>` manipulations, the browser will block it unless CORS headers are present.

**How to enable CORS on Cloudflare:**
If you ever need JavaScript to read image data from the CDN:
1. In Cloudflare (**vidi.news**), go to **Rules** -> **Transform Rules** -> **HTTP Response Header Modification**.
2. Create a rule to add a static header.
3. Header Name: `Access-Control-Allow-Origin`
4. Value: `https://vidismart.com` (or `*` to allow all domains).

---

## 🌐 Bonus: Hosting the Entire Site on Cloudflare
You mentioned considering moving your entire hosting to Cloudflare. This is absolutely possible and highly recommended for static/SPA sites like VidiSmart.
- The product is called **Cloudflare Pages**.
- It is incredibly fast (served directly from edge nodes globally).
- It integrates directly with GitHub for automatic deployments when you push code.
- It is often cheaper (or free) compared to traditional hosting for static assets.

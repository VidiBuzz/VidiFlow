# 🚀 QUICK START CHECKLIST - Caribbean Consultants Website

**Goal:** Get website live in the next 60 minutes

---

## ⏱️ 60-MINUTE LAUNCH PLAN

### Phase 1: Download Images (30 min) ⭐ CRITICAL
**Start here → Open:** `IMAGES-INVENTORY.md`

**Minutes 0-20:** Download homepage slider images (6 images)
- [ ] `project-1-lermitage-hero.jpg`
- [ ] `project-2-hyatt-kauai-hero.jpg`
- [ ] `project-3-stregis-hero.jpg`
- [ ] `project-4-dorado-hero.jpg`
- [ ] `project-5-plaza-lotus-hero.jpg`
- [ ] `project-6-caribbean-hero.jpg`

**Minutes 20-30:** Download other essential images
- [ ] `doug-welles-portrait-hero.jpg` (leadership page)
- [ ] `doug-welles-portrait.jpg` (about page)
- [ ] `video-thumbnail.jpg` (video page)
- [ ] `about-company.jpg`
- [ ] `services-hero.jpg`

**Save ALL images to:** `M:\code\vidismart\cc\assets\images\`

---

### Phase 2: Setup Contact Form (10 min)

**Minutes 30-35:**
1. Go to https://formspree.io → Sign up (free)
2. Create new form
3. Copy form URL (looks like: `https://formspree.io/f/xyz123`)
4. Open `M:\code\vidismart\cc\contact.html`
5. Find line ~120: `<form id="contact-form">`
6. Change to: `<form id="contact-form" action="YOUR_FORMSPREE_URL" method="POST">`
7. Save

**Minute 36:** Test form
- Open `contact.html` in browser
- Fill out form, submit
- Check email for Formspree notification

---

### Phase 3: Deploy (20 min)

**Minutes 37-45: Deploy to Netlify**
1. Go to https://netlify.com
2. Log in (or sign up free)
3. Click "Add new site" → "Import an existing project"
4. Drag folder: `M:\code\vidismart\cc\` onto drop zone
5. Wait 2 minutes
6. Site is live! You get URL like: `happy-water-12345.netlify.app`

**Minutes 46-55: Test Live Site**
1. Click your Netlify URL
2. Test homepage slider (should auto-rotate)
3. Click through all 7 pages
4. Resize browser to mobile width - test mobile menu
5. Click a project filter button (Luxury/Golf/International)
6. Submit contact form again to confirm it works on live site

**Minutes 56-60: Custom Domain (Optional)**
1. In Netlify dashboard → Site settings → Domain management
2. Add domain: `CaribbeanConsultants.net`
3. Follow DNS instructions at your registrar
4. Wait 5-30 minutes for propagation

---

## ✅ POST-LAUNCH (Tomorrow)

- [ ] Buy domain if you haven't (Namecheap, GoDaddy, etc.)
- [ ] Add Google Analytics to all pages
- [ ] Submit sitemap to Google Search Console
- [ ] Share site with Doug for approval
- [ ] Download real project photos from Doug to replace stock images
- [ ] Consider video production (use VIDEO-SCRIPT.md)

---

## 🆘 TROUBLESHOOTING

**"I don't have images folder"**
→ You need to create it: `M:\code\vidismart\cc\assets\images\`

**Images show broken icons?**
→ Check filenames match exactly. Case-sensitive!

**Slider not auto-advancing?**
→ Open browser console (F12) - look for errors

**Mobile menu not opening?**
→ Check that styles.css loaded (View source → check link tag)

**Form not sending email?**
→ Formspree not configured yet - follow Step 2 above

---

## 📞 SUPPORT

All files are in `M:\code\vidismart\cc\`  
Read `README.md` for full documentation

**What you're launching:** 7-page professional website for Caribbean Consultants Management, LLC  
**What it does:** Showcases Douglas Welles' 30+ year portfolio, builds credibility, generates leads

**You are 1 hour away from a live website.** Start with Phase 1.

---

**Last updated:** 2025-05-09  
**Created by:** Agentic build system  
**Status:** ✅ Ready for image download & deployment

# VidiCity.net WordPress Admin Fix - Self-Service Guide

## Date: March 31, 2026

---

## Problem Summary

**Issue:** WordPress admin pages not loading on vidicity.net

**Root Cause:** Critical JavaScript errors detected:
- `jQuery is not defined` (multiple occurrences)
- `moment is not defined`
- `Vue is not defined`
- JSON parse errors

**Impact:** These missing libraries break the WordPress admin dashboard after login.

---

## Quick Fix Options (Try in Order)

### Option 1: Disable All Plugins (Most Likely Fix) ⭐

**Via SiteGround File Manager:**

1. **Login to SiteGround**
   - Go to: https://my.siteground.com
   - Enter your credentials

2. **Navigate to File Manager**
   - Click **Site Tools** → **VidiCity.net**
   - Click **Site** → **File Manager**

3. **Find the Plugins Folder**
   - Navigate to: `vidicity.net/vidicity.net/public_html/wp-content/`

4. **Disable Plugins**
   - Right-click on the `plugins` folder
   - Select **Rename**
   - Change name to: `plugins_disabled`
   - Click **OK**

5. **Test Admin Access**
   - Open new browser tab
   - Go to: https://vidicity.net/wp-admin/
   - Try to login

6. **If Admin Works Now:**
   - A plugin is causing the issue
   - Go back to File Manager
   - Rename `plugins_disabled` back to `plugins`
   - Login to WordPress admin
   - Go to **Plugins** → **Installed Plugins**
   - Deactivate ALL plugins
   - Reactivate one-by-one, testing admin after each

---

### Option 2: Clear WordPress Cache

**Via SiteGround Control Panel:**

1. Login to SiteGround at https://my.siteground.com

2. Go to **Site Tools** → **VidiCity.net**

3. Click **Speed** → **Caching**

4. Click **Flush Cache** or **Disable Cache** temporarily

5. Test wp-admin access

**Alternative - Via File Manager:**

1. Navigate to: `vidicity.net/vidicity.net/public_html/wp-content/`

2. Find the `cache` folder

3. Right-click → **Rename** → `cache_disabled`

4. Test admin access

---

### Option 3: Switch to Default Theme

**Via File Manager:**

1. Navigate to: `vidicity.net/vidicity.net/public_html/wp-content/themes/`

2. Identify your active theme folder (e.g., `astra`, `divi`, `elementor`)

3. Rename the theme folder (e.g., `astra` → `astra-disabled`)

4. WordPress will automatically switch to default theme

5. Test wp-admin access

---

### Option 4: Enable WordPress Debug Mode

This will reveal the exact error causing the admin to fail.

**Via File Manager:**

1. Navigate to: `vidicity.net/vidicity.net/public_html/`

2. Find `wp-config.php`

3. Right-click → **Edit**

4. Find this line:
   ```php
   /* That's all, stop editing! Happy publishing. */
   ```

5. Add these lines BEFORE it:
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   define('WP_DEBUG_DISPLAY', false);
   @ini_set('display_errors', 0);
   ```

6. Save the file

7. Try accessing wp-admin again

8. Check error log at:
   - `vidicity.net/vidicity.net/public_html/wp-content/debug.log`
   - Or SiteGround **Site Tools** → **Devs** → **Error Log**

---

### Option 5: Check PHP Version

1. Login to SiteGround

2. Go to **Site Tools** → **VidiCity.net**

3. Click **Devs** → **PHP Manager**

4. Ensure **PHP 8.0** or higher is selected

5. If changed, wait 5 minutes and test admin

---

### Option 6: Regenerate .htaccess

**Via File Manager:**

1. Navigate to: `vidicity.net/vidicity.net/public_html/`

2. Find `.htaccess` file (may be hidden - enable "Show Hidden Files")

3. Download a backup copy

4. Edit the file and replace contents with default WordPress .htaccess:
   ```apache
   # BEGIN WordPress
   <IfModule mod_rewrite.c>
   RewriteEngine On
   RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
   RewriteBase /
   RewriteRule ^index\.php$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.php [L]
   </IfModule>
   # END WordPress
   ```

5. Save and test admin

---

## Nuclear Option: Complete Reset

If nothing else works:

### Step 1: Backup Everything
1. Use SiteGround **Backup** tool
2. Or download entire `vidicity.net/vidicity.net/public_html/` folder

### Step 2: Disable Everything
```
Rename these folders in wp-content/:
- plugins → plugins_disabled
- cache → cache_disabled
- [your-theme] → [your-theme]-disabled
```

### Step 3: Test Admin
- If admin works, issue is plugin/theme related
- Re-enable one at a time to find culprit

### Step 4: Check Database
1. SiteGround **Site Tools** → **MySQL** → **phpMyAdmin**
2. Select WordPress database
3. Browse `wp_options` table
4. Find `active_plugins` row
5. Edit value to: `a:0:{}`
6. This deactivates all plugins from database

---

## Common Culprit Plugins

If you identify a plugin as the cause, common offenders include:

| Plugin Type | Examples |
|-------------|----------|
| Security | Wordfence, iThemes Security, Sucuri |
| Caching | WP Rocket, W3 Total Cache, SG Optimizer |
| Page Builders | Elementor, Divi Builder, WPBakery |
| Analytics | Google Analytics plugins, MonsterInsights |
| Custom Code | Code snippets, custom functions plugins |

---

## After Fixing

Once admin access is restored:

1. **Update Everything:**
   - WordPress core
   - All plugins
   - Active theme

2. **Re-enable Features:**
   - Reactivate plugins one-by-one
   - Test after each activation

3. **Clear All Caches:**
   - Browser cache
   - WordPress cache
   - CDN cache (if using Cloudflare)

4. **Monitor:**
   - Check site functionality
   - Watch for recurring errors

---

## SiteGround Support Contact

If self-service doesn't work:

1. **Live Chat:** https://my.siteground.com → Support → Contact Us
2. **Ticket:** Submit via SiteGround control panel
3. **Phone:** Check SiteGround website for current numbers

**What to tell support:**
```
My WordPress admin won't load on vidicity.net. 
I'm getting JavaScript errors (jQuery, moment, Vue not defined).
I've tried disabling plugins and clearing cache.
Can you check server error logs and help identify the issue?
```

---

## Quick Reference

| Property | Value |
|----------|-------|
| Domain | vidicity.net |
| Host | SiteGround |
| Path | vidicity.net/vidicity.net/public_html/ |
| Admin URL | https://vidicity.net/wp-admin/ |
| Login URL | https://vidicity.net/wp-login.php |

---

## Troubleshooting Checklist

- [ ] Tried disabling plugins via File Manager
- [ ] Cleared WordPress cache
- [ ] Switched to default theme
- [ ] Enabled debug mode and checked logs
- [ ] Verified PHP version is 8.0+
- [ ] Regenerated .htaccess
- [ ] Checked SiteGround error logs
- [ ] Cleared browser cache and cookies
- [ ] Tried incognito/private browser mode
- [ ] Contacted SiteGround support (if needed)

---

*Guide generated: March 31, 2026*

# VidiCity Theme Deployment Guide

## ✅ What We've Accomplished

### 1. Backup Files Organized 📦
All backup and old files have been moved to `/_backup-archive/`:
- `BAK.Oldstyle.css`
- `bashrc_backup`
- `index.backup.html`
- `moderntechguidelines.html.bak`
- `moderntechguidelines.html.old`
- `vidismart.2026stream.html.local-backup`
- `vidismart.masterlist.backup.20260214_174919.html`
- `INVENTORY.md` (catalog)

### 2. VidiCity Pro Theme Created 🎨
A complete, modern WordPress theme with:

#### Theme Files
| File | Description |
|------|-------------|
| `style.css` | 1000+ lines of modern CSS with dark theme |
| `index.php` | Homepage template with hero, search, video cards |
| `header.php` | Fixed header with blur effect, navigation |
| `footer.php` | Multi-column footer with social links |
| `functions.php` | Theme setup, ACF support, custom post types |
| `js/vidicity.js` | Vanilla JS: animations, search, modals |
| `README.md` | Full documentation |

#### Key Features
- 🌙 **Dark theme** with cyan (#00D4FF) accents
- 🔍 **Visual search UI** ready for AI integration
- 🎬 **Video card layout** with play buttons & modals
- 📱 **Fully responsive** (mobile, tablet, desktop)
- ✨ **Smooth animations** (scroll reveal, counters, hover)
- 🎨 **Theme toggle** (dark/light mode)
- ⚡ **Performance optimized** (no jQuery, deferred scripts)

### 3. Screenshot Preview

## 📤 How to Deploy to VidiCity.net

### Method 1: Zip & Upload via WordPress (Easiest)

1. **Create the ZIP file:**
```bash
cd m:\code\vidismart
powershell Compress-Archive -Path vidicity-theme -DestinationPath vidicity-pro.zip
```

2. **Log in to WordPress Admin:**
   - Go to `https://vidicity.net/wp-admin`

3. **Upload the theme:**
   - Navigate to **Appearance → Themes → Add New**
   - Click **Upload Theme**
   - Select `vidicity-pro.zip`
   - Click **Install Now**

4. **Activate the theme:**
   - Click **Activate**

### Method 2: FTP/SFTP to SiteGround

1. **Get SiteGround credentials** from your `.siteground` file

2. **Connect via FTP:**
   - Server: `gtxm1044.siteground.biz`
   - Port: `21` (FTP) or `22` (SFTP)

3. **Upload via FileZilla or similar:**
   - Local: `m:\code\vidismart\vidicity-theme`
   - Remote: `/home/customer/www/vidicity.net/public_html/wp-content/themes/vidicity-theme`

4. **Activate in WordPress:**
   - Appearance → Themes → activate "VidiCity Pro"

## 🎨 After Installation - Quick Setup

### Step 1: Set Homepage
1. Create a page named "Home"
2. Go to Settings → Reading
3. Set "Homepage" to display the "Home" page
4. Save

### Step 2: Create Menu
1. Appearance → Menus
2. Create "Primary Menu"
3. Add pages: Home, Discover, Cities, For Businesses
4. Assign to "Primary Menu" location
5. Save

### Step 3: Customize Colors (Optional)
1. Appearance → Customize
2. Click "Brand Colors"
3. Adjust primary color
4. Publish

### Step 4: Add ACF Plugin (Optional but Recommended)
1. Plugins → Add New
2. Search "Advanced Custom Fields"
3. Install & activate
4. Theme will auto-add business profile fields

## 🔗 Connecting to Your AI Backend

The theme is designed to work with your existing AI infrastructure:

### Visual Search
The visual search button (`vc-visual-search-btn`) triggers a file picker. 
To connect to your AI:

1. **Modify `js/vidicity.js`** - Find `handleVisualSearch()` function
2. **Replace the demo code** with actual API call:
```javascript
const handleVisualSearch = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    // Send to your AI endpoint
    const response = await fetch('https://your-ai-api.com/visual-search', {
        method: 'POST',
        body: formData
    });
    
    const results = await response.json();
    // Display results or redirect to results page
};
```

### Video Embeddings
Each video card has data attributes ready for vector integration:
```html
<article class="vc-video-card" data-video-id="123" data-embedding="vector-data">
```

### Search Integration
The search box already integrates with WordPress search. To add AI enhancements:

1. Keep the WordPress search for basic text
2. Add visual search for images
3. Display AI-sorted results

## 🚀 Next Steps

1. **Deploy the theme** using one of the methods above
2. **Test responsiveness** on mobile devices
3. **Add real content** - Videos, business listings, blog posts
4. **Connect AI backend** - Visual search, recommendations
5. **SEO optimization** - Add Yoast SEO plugin

## 📋 Files Summary

```
m:\code\vidismart\vidicity-theme\
├── style.css          (1000+ lines, dark theme)
├── index.php          (homepage design)
├── header.php         (fixed header)
├── footer.php         (4-column footer)
├── functions.php      (theme functions)
├── js/
│   └── vidicity.js    (animations, search)
└── README.md          (documentation)

m:\code\vidismart\_backup-archive\
├── INVENTORY.md       (backup catalog)
└── [all backup files] (7 files)
```

## 🆘 Troubleshooting

### Theme doesn't show up?
- Check WordPress version (requires 5.0+)
- Verify PHP version (requires 7.4+)
- Clear browser cache

### Styles not loading?
- Check file permissions (should be 644 for CSS/PHP)
- Verify all files uploaded correctly

### Images not showing?
- The theme uses placeholder images from Unsplash
- Replace with your actual content

## 📞 Support

For customization or issues:
- Check `README.md` in the theme folder
- Review the architecture plan in `plans/vidicity-architecture-plan.md`
- Contact VidiSmart development team

---

**Ready to deploy!** 🎉

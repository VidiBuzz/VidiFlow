# VidiCity Pro Theme

A modern, AI-powered hyperlocal video discovery WordPress theme for VidiCity.net.

![VidiCity Pro Theme](screenshot.png)

## Features

🎬 **Modern Dark Theme**
- Sophisticated dark color scheme with cyan accent (#00D4FF)
- Smooth gradients and glass-morphism effects
- Animated grid background with perspective transformation

🔍 **Visual Search Integration**
- Text search with WordPress integration
- Visual search button (image upload for AI-powered search)
- Modern search box with glow effects

📱 **Fully Responsive**
- Mobile-first design approach
- Hamburger menu for mobile navigation
- Adaptive grid layouts

✨ **Interactive Elements**
- Animated statistics counters
- Hover effects on video cards
- Video modal/lightbox
- Smooth scroll animations
- Theme toggle (dark/light mode)

🎨 **Customizable**
- WordPress Customizer integration
- Custom color picker for brand colors
- ACF (Advanced Custom Fields) support

## Installation

### Method 1: WordPress Admin
1. Download the theme as a ZIP file
2. Go to Appearance → Themes → Add New
3. Click "Upload Theme"
4. Choose the ZIP file and click "Install Now"
5. Activate the theme

### Method 2: FTP/SFTP
1. Extract the theme folder
2. Upload to `wp-content/themes/`
3. Go to Appearance → Themes
4. Activate "VidiCity Pro"

## Quick Start

### Setting Up the Homepage
1. Create a new page called "Home"
2. Go to Settings → Reading
3. Set "Homepage" to your new "Home" page
4. Save changes

### Adding a Navigation Menu
1. Go to Appearance → Menus
2. Create a new menu named "Primary"
3. Add your pages/links
4. Check "Primary Menu" location
5. Save menu

### Customizing Colors
1. Go to Appearance → Customize
2. Click "Brand Colors"
3. Change the primary color to match your brand
4. Publish changes

## File Structure

```
vidicity-theme/
├── style.css              # Main stylesheet with theme header
├── index.php              # Main template (homepage design)
├── header.php             # Site header with navigation
├── footer.php             # Site footer
├── functions.php          # Theme functions and setup
├── screenshot.png         # Theme screenshot (1200x900)
├── js/
│   └── vidicity.js        # JavaScript functionality
└── README.md              # This file
```

## Tech Stack

- **CSS**: Custom properties (variables), Grid, Flexbox, Animations
- **JavaScript**: Vanilla JS, Intersection Observer API
- **Typography**: Inter (body) + Space Grotesk (display) from Google Fonts
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

## WordPress Integration

### Custom Post Types
The theme registers a `video` custom post type for better content organization.

### Widget Areas
- **Sidebar**: Appears on blog posts and archive pages
- **Footer**: Multi-column footer widget area

### ACF Fields
If Advanced Custom Fields is installed, the theme adds:
- Business Address
- Phone Number
- Business Hours
- Featured Video URL
- City

## Performance

- ✅ No jQuery dependency
- ✅ Deferred JavaScript loading
- ✅ Optimized CSS with CSS custom properties
- ✅ Intersection Observer for lazy loading
- ✅ Emoji scripts disabled for faster load

## Customization

### CSS Variables
Override these in the Customizer or child theme:

```css
:root {
  --vc-primary: #00D4FF;
  --vc-secondary: #FF6B6B;
  --vc-bg-primary: #0A0E1A;
  --vc-bg-card: #1A2342;
}
```

### Template Parts
To customize further, you can create:
- `page.php` - Custom page template
- `single.php` - Blog post template
- `archive.php` - Archive pages

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Credits

- **Design**: Tailwind-inspired utility classes with custom dark theme
- **Icons**: Lucide-inspired SVG icons
- **Fonts**: Inter & Space Grotesk from Google Fonts

## License

GPL v2 or later

## Support

For support or customizations, contact the VidiSmart team or visit vidicity.net.

---

**Version**: 1.0.0  
**Last Updated**: March 2026

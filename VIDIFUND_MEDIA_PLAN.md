# VidiFund Media Enhancement Plan

## Current State Analysis

The `vidifund.acct.html` page currently has:
- **Basic media placeholders** in the Summary hero section:
  - Audio: `audio_summary.mp3` (Strategy Audio)
  - Video: `strategy_video.mp4` (Market Analysis Video)
- **No images** for fund cards or stock details
- **No audio/video** for individual fund pages

## Enhancement Plan

### Phase 1: Media Assets Organization

Create a folder structure for media assets:

```
M:\code\vidismart\
└── vidifund-media\
    ├── audio\
    │   ├── summary\                    # Overview page audio
    │   │   ├── strategy-overview.mp3
    │   │   ├── market-analysis.mp3
    │   │   └── monthly-report.mp3
    │   ├── funds\                      # Per-fund audio briefings
    │   │   ├── fcpi-analysis.mp3
    │   │   ├── fdrr-analysis.mp3
    │   │   ├── fdvv-analysis.mp3
    │   │   ├── ftec-analysis.mp3
    │   │   └── spy-analysis.mp3
    │   └── stocks\                     # Per-stock audio (top holdings)
    │       ├── aapl-briefing.mp3
    │       ├── msft-briefing.mp3
    │       └── nvda-briefing.mp3
    │
    ├── video\
    │   ├── summary\                    # Overview videos
    │   │   ├── market-outlook-2026.mp4
    │   │   ├── portfolio-review.mp4
    │   │   └── sector-rotation-guide.mp4
    │   ├── funds\                      # Fund-specific videos
    │   │   ├── fcpi-deep-dive.mp4
    │   │   ├── fdrr-income-strategy.mp4
    │   │   ├── fdvv-dividend-focus.mp4
    │   │   ├── ftec-tech-growth.mp4
    │   │   └── spy-benchmark.mp4
    │   └── tutorials\                   # Educational content
    │       ├── how-to-read-holdings.mp4
    │       ├── understanding-yield.mp4
    │       └── rebalancing-guide.mp4
    │
    └── images\
        ├── funds\                       # Fund visual cards
        │   ├── fcpi-hero.jpg           # Inflation protection theme
        │   ├── fdrr-hero.jpg           # Rising rates/dividend theme
        │   ├── fdvv-hero.jpg           # High dividend theme
        │   ├── ftec-hero.jpg           # Technology/growth theme
        │   └── spy-hero.jpg            # S&P 500/benchmark theme
        ├── stocks\                      # Company logos/thumbnails
        │   ├── aapl.png
        │   ├── msft.png
        │   ├── nvda.png
        │   └── [etc for all 80+ holdings]
        ├── charts\                      # Data visualizations
        │   ├── portfolio-allocation.jpg
        │   ├── performance-2025.jpg
        │   ├── sector-breakdown.jpg
        │   └── yield-comparison.jpg
        └── icons\                       # UI enhancement icons
            ├── audio-icon.svg
            ├── video-icon.svg
            ├── play-button.svg
            └── pause-button.svg
```

### Phase 2: HTML Structure Enhancements

#### 2.1 Enhanced Summary Page Media Section

Replace current simple media-stack with an interactive media gallery:

```html
<!-- Enhanced Media Section -->
<div class="media-dashboard">
    <!-- Featured Video Player -->
    <div class="featured-video">
        <video id="main-player" controls poster="vidifund-media/images/funds/portfolio-hero.jpg">
            <source src="vidifund-media/video/summary/market-outlook-2026.mp4" type="video/mp4">
        </video>
        <div class="video-playlist">
            <div class="playlist-item active" data-video="market-outlook-2026.mp4">
                <img src="vidifund-media/images/thumbs/outlook-thumb.jpg">
                <span>2026 Market Outlook</span>
            </div>
            <div class="playlist-item" data-video="portfolio-review.mp4">
                <img src="vidifund-media/images/thumbs/review-thumb.jpg">
                <span>Q1 Portfolio Review</span>
            </div>
            <div class="playlist-item" data-video="sector-rotation-guide.mp4">
                <img src="vidifund-media/images/thumbs/sector-thumb.jpg">
                <span>Sector Rotation Guide</span>
            </div>
        </div>
    </div>
    
    <!-- Audio Briefing Panel -->
    <div class="audio-panel">
        <h4><i class="audio-icon"></i> Daily Audio Briefings</h4>
        <div class="audio-list">
            <div class="audio-item" data-audio="strategy-overview.mp3">
                <button class="play-btn">▶</button>
                <span class="audio-title">Strategy Overview</span>
                <span class="audio-duration">3:42</span>
            </div>
            <div class="audio-item" data-audio="market-analysis.mp3">
                <button class="play-btn">▶</button>
                <span class="audio-title">Market Analysis</span>
                <span class="audio-duration">5:18</span>
            </div>
            <div class="audio-item" data-audio="monthly-report.mp3">
                <button class="play-btn">▶</button>
                <span class="audio-title">Monthly Report</span>
                <span class="audio-duration">8:24</span>
            </div>
        </div>
        <audio id="global-audio-player" controls style="width:100%; margin-top:10px;"></audio>
    </div>
</div>
```

#### 2.2 Fund Cards with Images

Enhance fund cards to include visual thumbnails:

```html
<div class="fund-card ${f.isSell ? 'sell-order' : ''}" onclick="switchPage('${f.symbol.toLowerCase()}')">
    <div class="fund-image">
        <img src="vidifund-media/images/funds/${f.symbol.toLowerCase()}-hero.jpg" 
             alt="${f.name}">
        <div class="fund-overlay">
            <span class="fund-gain">${f.gain}</span>
        </div>
    </div>
    <div class="fund-content">
        <h3>${f.symbol}</h3>
        <div class="fund-tag">${f.name}</div>
        <div style="font-size:0.75rem; font-weight:900; color:${f.isSell ? '#dc2626' : '#16a34a'}; text-transform:uppercase;">
            ${f.rec}
        </div>
    </div>
    <!-- Quick Actions -->
    <div class="fund-actions">
        <button class="media-btn audio-trigger" data-fund="${f.symbol}" title="Listen to Analysis">
            🔊
        </button>
        <button class="media-btn video-trigger" data-fund="${f.symbol}" title="Watch Video">
            ▶️
        </button>
    </div>
</div>
```

#### 2.3 Individual Fund Page Media Section

Add media section to each fund detail page:

```html
<!-- Fund Media Header -->
<div class="fund-media-header">
    <div class="fund-hero-image">
        <img src="vidifund-media/images/funds/${f.symbol.toLowerCase()}-hero.jpg">
    </div>
    <div class="fund-media-controls">
        <button class="media-control-btn" onclick="playFundAudio('${f.symbol}')">
            <span class="icon">🔊</span>
            <span>Listen to Analysis</span>
        </button>
        <button class="media-control-btn" onclick="playFundVideo('${f.symbol}')">
            <span class="icon">▶️</span>
            <span>Watch Video Briefing</span>
        </button>
        <button class="media-control-btn" onclick="showFundCharts('${f.symbol}')">
            <span class="icon">📊</span>
            <span>View Charts</span>
        </button>
    </div>
</div>

<!-- Audio Player for Fund -->
<audio id="fund-audio-${f.symbol}" class="fund-audio-player" controls style="display:none;">
    <source src="vidifund-media/audio/funds/${f.symbol.toLowerCase()}-analysis.mp3" type="audio/mpeg">
</audio>

<!-- Video Modal -->
<div id="video-modal-${f.symbol}" class="video-modal" style="display:none;">
    <div class="modal-content">
        <span class="close-btn" onclick="closeVideoModal('${f.symbol}')">&times;</span>
        <video controls width="100%">
            <source src="vidifund-media/video/funds/${f.symbol.toLowerCase()}-deep-dive.mp4" type="video/mp4">
        </video>
    </div>
</div>
```

#### 2.4 Stock Cards with Company Images

Enhance individual stock cards:

```html
<div class="stock-card">
    <div class="stock-header">
        <img class="company-logo" src="vidifund-media/images/stocks/${s.sym.toLowerCase()}.png" 
             alt="${s.name} logo">
        <div class="stock-title">
            <a href="https://finance.yahoo.com/quote/${s.sym}" target="_blank" class="ticker-link">${s.sym}</a>
            <span class="perf-badge ${s.perf25.startsWith('+') ? 'up' : 'down'}">${s.perf25} (2025)</span>
        </div>
    </div>
    <div style="font-size:0.6rem; font-weight:900; color:var(--vidi-green); text-transform:uppercase; margin-bottom:0.5rem;">
        ${s.name}
    </div>
    <p class="company-desc">${s.desc}</p>
    
    <!-- Mini Chart Placeholder -->
    <div class="mini-chart">
        <img src="vidifund-media/images/charts/${s.sym.toLowerCase()}-trend.jpg" 
             alt="${s.sym} performance chart">
    </div>
    
    <div class="metric-grid">
        <div class="met-item"><span>Market Cap</span><strong>${s.cap}</strong></div>
        <div class="met-item"><span>Profit Status</span><strong>${s.profit}</strong></div>
        <div class="met-item"><span>Earnings/EPS</span><strong>${s.earn}</strong></div>
        <div class="met-item"><span>2026 Trend</span><strong style="color:var(--vidi-green)">POSITIVE</strong></div>
    </div>
    
    <!-- Stock Audio Briefing -->
    <button class="stock-audio-btn" onclick="playStockAudio('${s.sym}')">
        🔊 ${s.sym} Briefing
    </button>
</div>
```

### Phase 3: CSS Styling Enhancements

Add these styles to the existing CSS:

```css
/* Media Dashboard */
.media-dashboard {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.featured-video {
    background: #0f172a;
    border-radius: 20px;
    overflow: hidden;
}

.featured-video video {
    width: 100%;
    display: block;
}

.video-playlist {
    display: flex;
    gap: 10px;
    padding: 15px;
    background: rgba(255,255,255,0.05);
    overflow-x: auto;
}

.playlist-item {
    min-width: 150px;
    cursor: pointer;
    opacity: 0.6;
    transition: 0.3s;
}

.playlist-item.active,
.playlist-item:hover {
    opacity: 1;
}

.playlist-item img {
    width: 100%;
    border-radius: 10px;
    margin-bottom: 5px;
}

.playlist-item span {
    font-size: 0.7rem;
    color: #fff;
    display: block;
}

/* Audio Panel */
.audio-panel {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px;
    padding: 1.5rem;
}

.audio-panel h4 {
    font-size: 0.8rem;
    text-transform: uppercase;
    color: var(--vidi-green);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
}

.audio-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    background: rgba(255,255,255,0.05);
    border-radius: 10px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: 0.2s;
}

.audio-item:hover {
    background: rgba(255,255,255,0.1);
}

.play-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--vidi-green);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.audio-title {
    flex: 1;
    font-size: 0.85rem;
    color: #fff;
}

.audio-duration {
    font-size: 0.75rem;
    color: #94a3b8;
}

/* Enhanced Fund Cards */
.fund-card {
    overflow: hidden;
}

.fund-image {
    position: relative;
    height: 150px;
    overflow: hidden;
}

.fund-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
}

.fund-card:hover .fund-image img {
    transform: scale(1.05);
}

.fund-overlay {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0,0,0,0.7);
    padding: 5px 10px;
    border-radius: 20px;
}

.fund-content {
    padding: 1.5rem;
}

.fund-actions {
    display: flex;
    gap: 8px;
    padding: 0 1.5rem 1.5rem;
}

.media-btn {
    flex: 1;
    padding: 8px;
    background: var(--vidi-green-light);
    border: 1px solid var(--vidi-green);
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.2rem;
    transition: 0.2s;
}

.media-btn:hover {
    background: var(--vidi-green);
}

/* Fund Media Header */
.fund-media-header {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 2rem;
    margin-bottom: 2rem;
    background: #0f172a;
    border-radius: 30px;
    overflow: hidden;
}

.fund-hero-image {
    height: 300px;
}

.fund-hero-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.fund-media-controls {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1rem;
}

.media-control-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 15px 20px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    color: #fff;
    cursor: pointer;
    transition: 0.2s;
    text-align: left;
}

.media-control-btn:hover {
    background: var(--vidi-green);
    border-color: var(--vidi-green);
}

.media-control-btn .icon {
    font-size: 1.5rem;
}

/* Enhanced Stock Cards */
.stock-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 1rem;
}

.company-logo {
    width: 40px;
    height: 40px;
    object-fit: contain;
    border-radius: 8px;
    background: #f8fafc;
    padding: 5px;
}

.stock-title {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.mini-chart {
    margin: 1rem 0;
    height: 80px;
    border-radius: 10px;
    overflow: hidden;
    background: #f8fafc;
}

.mini-chart img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.stock-audio-btn {
    width: 100%;
    padding: 10px;
    background: var(--vidi-green-light);
    border: 1px solid var(--vidi-green);
    border-radius: 8px;
    color: var(--vidi-green);
    font-weight: 700;
    cursor: pointer;
    transition: 0.2s;
    margin-top: 10px;
}

.stock-audio-btn:hover {
    background: var(--vidi-green);
    color: white;
}

/* Video Modal */
.video-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.modal-content {
    width: 80%;
    max-width: 900px;
    position: relative;
}

.close-btn {
    position: absolute;
    top: -40px;
    right: 0;
    color: white;
    font-size: 2rem;
    cursor: pointer;
}
```

### Phase 4: JavaScript Functionality

Add these JavaScript functions:

```javascript
// Media Player State
let currentAudio = null;
let currentVideo = null;

// Video Playlist Switching
document.querySelectorAll('.playlist-item').forEach(item => {
    item.addEventListener('click', function() {
        // Remove active from all
        document.querySelectorAll('.playlist-item').forEach(i => i.classList.remove('active'));
        // Add active to clicked
        this.classList.add('active');
        
        // Switch video source
        const videoFile = this.dataset.video;
        const player = document.getElementById('main-player');
        player.src = `vidifund-media/video/summary/${videoFile}`;
        player.play();
    });
});

// Audio Player
function playAudio(audioFile, title) {
    const player = document.getElementById('global-audio-player');
    
    // Stop current if playing
    if (currentAudio && currentAudio !== audioFile) {
        player.pause();
    }
    
    player.src = `vidifund-media/audio/summary/${audioFile}`;
    player.play();
    currentAudio = audioFile;
    
    // Update UI to show playing
    document.querySelectorAll('.audio-item').forEach(item => {
        item.classList.remove('playing');
        if (item.dataset.audio === audioFile) {
            item.classList.add('playing');
            item.querySelector('.play-btn').textContent = '⏸';
        } else {
            item.querySelector('.play-btn').textContent = '▶';
        }
    });
}

// Fund Audio
function playFundAudio(fundSymbol) {
    const audioId = `fund-audio-${fundSymbol}`;
    const player = document.getElementById(audioId);
    
    if (player) {
        player.style.display = 'block';
        player.play();
    }
}

// Fund Video Modal
function playFundVideo(fundSymbol) {
    const modalId = `video-modal-${fundSymbol}`;
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeVideoModal(fundSymbol) {
    const modalId = `video-modal-${fundSymbol}`;
    const modal = document.getElementById(modalId);
    if (modal) {
        const video = modal.querySelector('video');
        video.pause();
        modal.style.display = 'none';
    }
}

// Stock Audio
function playStockAudio(symbol) {
    const audio = new Audio(`vidifund-media/audio/stocks/${symbol.toLowerCase()}-briefing.mp3`);
    audio.play();
}

// Audio Item Click Handlers
document.querySelectorAll('.audio-item').forEach(item => {
    item.addEventListener('click', function() {
        const audioFile = this.dataset.audio;
        playAudio(audioFile);
    });
});

// Close modal on outside click
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('video-modal')) {
        e.target.style.display = 'none';
        e.target.querySelector('video').pause();
    }
});

// Keyboard controls
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close all modals
        document.querySelectorAll('.video-modal').forEach(modal => {
            modal.style.display = 'none';
            modal.querySelector('video').pause();
        });
    }
});
```

### Phase 5: File Naming Conventions

**Audio Files:**
- Format: MP3, 128-192 kbps
- Naming: `{category}-{descriptor}.mp3`
- Examples: `fcpi-analysis.mp3`, `aapl-briefing.mp3`

**Video Files:**
- Format: MP4 (H.264), 720p or 1080p
- Naming: `{category}-{descriptor}.mp4`
- Examples: `market-outlook-2026.mp4`, `ftec-tech-growth.mp4`

**Image Files:**
- Fund hero images: JPG, 800x400px
- Stock logos: PNG (transparent), 200x200px
- Charts: JPG, 600x300px
- Thumbnails: JPG, 300x170px (16:9)

### Phase 6: Implementation Timeline

**Week 1: Setup & Structure**
- [ ] Create folder structure
- [ ] Set up base HTML modifications
- [ ] Add CSS styles
- [ ] Implement basic JavaScript functionality

**Week 2: Content Creation**
- [ ] Record/produce audio briefings (5 fund analyses)
- [ ] Create video content (market outlook, tutorials)
- [ ] Design fund hero images
- [ ] Source company logos for top 20 holdings

**Week 3: Integration & Testing**
- [ ] Integrate all media assets
- [ ] Test audio playback across browsers
- [ ] Test video modal functionality
- [ ] Mobile responsiveness testing

**Week 4: Polish & Launch**
- [ ] Add loading states for media
- [ ] Implement error handling (fallback images)
- [ ] Performance optimization (lazy loading)
- [ ] Final testing and deployment

### Phase 7: Technical Considerations

**Performance:**
- Use lazy loading for images: `loading="lazy"`
- Compress videos for web (max 5MB per video)
- Use poster images for videos to reduce initial load
- Consider CDN for media delivery

**Accessibility:**
- Add alt text for all images
- Provide transcripts for audio content
- Add captions/subtitles for videos
- Ensure keyboard navigation works

**Browser Support:**
- Test audio/video in Chrome, Firefox, Safari, Edge
- Provide fallback for unsupported formats
- Use standard MP3/MP4 for maximum compatibility

**Storage Requirements (Estimated):**
- Audio: ~50MB (15 files × ~3MB each)
- Video: ~500MB (10 files × ~50MB each)
- Images: ~30MB (100 files × ~300KB each)
- **Total: ~580MB**

### Phase 8: Fallback Strategy

If media files don't exist yet, implement fallbacks:

```javascript
// Check if media exists before displaying
function mediaExists(url) {
    return fetch(url, { method: 'HEAD' })
        .then(res => res.ok)
        .catch(() => false);
}

// Show placeholder if image missing
<img src="image.jpg" 
     onerror="this.src='placeholder.jpg'" 
     alt="description">

// Show audio button only if file exists
if (await mediaExists(audioUrl)) {
    // Show audio button
}
```

---

## Next Steps

1. **Create the folder structure** in `M:\code\vidismart\vidifund-media\`
2. **Modify HTML** to add media sections (I can do this next)
3. **Add CSS styles** for media components
4. **Implement JavaScript** for media controls
5. **Source or create** initial media assets

Would you like me to proceed with implementing the HTML/CSS/JS modifications to `vidifund.acct.html`?
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VidiSmart Corporate Bundle | Flat-Rate $3,000 Package</title>
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="icon" href="assets/images/favicon.ico">
  <style>
    /* Corporate Bundle specific overrides */
    .bundle-hero {
      background: linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.06) 40%, rgba(245,158,11,0.05) 100%);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 3rem 2.5rem;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .bundle-hero::before {
      content: "";
      position: absolute;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%);
      top: -200px;
      right: -100px;
      pointer-events: none;
    }
    .bundle-hero-img {
      width: 100%;
      height: 400px;
      object-fit: cover;
      border-radius: 12px;
      margin-top: 1.5rem;
      display: block;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .deliverable-img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .gallery-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 400px));
      gap: 1.25rem;
      margin-top: 2rem;
      justify-content: center;
    }
    .gallery-img {
      width: 100%;
      height: 220px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid var(--border-subtle);
      transition: var(--ts);
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .gallery-img:hover {
      transform: scale(1.03);
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    }
    .gallery-title {
      font-family: var(--font-heading);
      font-size: 1.5rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
    }
    .gallery-subtitle {
      text-align: center;
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
    }
    .bundle-price {
      font-family: var(--font-display);
      font-size: clamp(2.5rem, 6vw, 5rem);
      font-weight: 900;
      color: var(--accent-gold);
      line-height: 1;
      margin: 1.5rem 0 .5rem;
      position: relative;
    }
    .bundle-subtitle {
      font-size: 1.1rem;
      color: var(--text-secondary);
      max-width: 650px;
      margin: 0 auto 1.5rem;
    }
    .bundle-badge {
      display: inline-block;
      background: rgba(245,158,11,0.12);
      border: 1px solid rgba(245,158,11,0.3);
      color: var(--accent-gold);
      padding: 6px 16px;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .deliverable-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 2rem 1.5rem;
      transition: var(--ts);
      position: relative;
      overflow: hidden;
      text-align: center;
    }
    .deliverable-card:hover {
      border-color: var(--border-light);
      transform: translateY(-2px);
      box-shadow: var(--shadow-glow);
    }
    .deliverable-num {
      font-family: var(--font-display);
      font-weight: 900;
      font-size: 3rem;
      line-height: 1;
      color: rgba(59,130,246,0.15);
      margin-bottom: 0.75rem;
    }
    .deliverable-card:nth-child(2) .deliverable-num { color: rgba(16,185,129,0.15); }
    .deliverable-card:nth-child(3) .deliverable-num { color: rgba(139,92,246,0.15); }
    .deliverable-card:nth-child(4) .deliverable-num { color: rgba(245,158,11,0.15); }
    .deliverable-card:nth-child(5) .deliverable-num { color: rgba(239,68,68,0.15); }
    .deliverable-card:nth-child(6) .deliverable-num { color: rgba(16,185,129,0.15); }
    .deliverable-icon {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
    }
    .deliverable-title {
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 1.15rem;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
    }
    .deliverable-desc {
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.6;
    }
    .cta-section {
      background: linear-gradient(135deg, var(--bg-card) 0%, rgba(59,130,246,0.06) 50%, rgba(139,92,246,0.06) 100%);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 3rem 2.5rem;
      text-align: center;
    }
    .cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--accent-primary);
      color: #fff;
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 1rem;
      padding: 14px 32px;
      border-radius: 100px;
      text-decoration: none;
      transition: var(--ts);
      margin-top: 1.5rem;
      box-shadow: 0 0 30px rgba(59,130,246,0.25);
    }
    .cta-btn:hover {
      background: #2563eb;
      transform: translateY(-2px);
      box-shadow: 0 0 45px rgba(59,130,246,0.4);
    }
    .cta-btn.secondary {
      background: transparent;
      border: 1px solid var(--border-light);
      color: var(--text-primary);
      box-shadow: none;
      margin-left: 1rem;
    }
    .cta-btn.secondary:hover {
      background: var(--bg-elevated);
      box-shadow: var(--shadow-glow);
    }
    .bundle-includes {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }
    .value-prop {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }
    .value-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-elevated);
      border-radius: var(--radius-md);
    }
    .value-text strong {
      display: block;
      font-family: var(--font-heading);
      font-size: 0.95rem;
      margin-bottom: 0.25rem;
    }
    .value-text p {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    @media (max-width: 1024px) {
      .bundle-includes {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 768px) {
      .bundle-hero { padding: 2rem 1.25rem; }
      .cta-section { padding: 2rem 1.25rem; }
      .cta-btn.secondary { margin-left: 0; margin-top: 0.75rem; }
      .bundle-includes {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
<div class="bg-mesh"></div>
<nav class="nav">
  <div class="nav-in">
    <a class="nav-logo" href="index.html"><img src="assets/images/logo-vidismart.svg" alt="VidiSmart" style="height:32px;width:auto;"> <span class="rk-badge">TOP 9</span></a>
    <ul class="nav-links">
      <li><a href="index.html">Overview</a></li>
      <li class="dd"><a href="#">Plans &#9662;</a>
        <div class="ddm">
          <a href="plan-01-vidifund.html"><span class="pn">1</span>VidiFund<span class="pm hi">HIGH</span></a><a href="plan-02-vidishop.html"><span class="pn">2</span>VidiShop<span class="pm hi">HIGH</span></a><a href="plan-03-vidipitch.html"><span class="pn">3</span>VidiPitch<span class="pm hi">HIGH</span></a><a href="plan-04-smartchannel.html"><span class="pn">4</span>Smart Channel<span class="pm md">MED</span></a><a href="plan-05-vidibuzz.html"><span class="pn">5</span>VidiBuzz Media<span class="pm md">MED</span></a><a href="plan-06-smartdeck.html"><span class="pn">6</span>SmartDeck<span class="pm md">MED</span></a><a href="plan-07-consulting.html"><span class="pn">7</span>VidiSmart Consulting<span class="pm ">LOW</span></a><a href="plan-08-vidicity.html"><span class="pn">8</span>VidiCity<span class="pm md">MED</span></a><a href="plan-09-vidi-news.html"><span class="pn">9</span>Vidi.NEWS<span class="pm md">MED</span></a><a href="plan-10-smartbook.html"><span class="pn">10</span>SmartBook<span class="pm ">LOW</span></a><a href="plan-11-modality-vector.html"><span class="pn">11</span>Modality & Vector<span class="pm md">MED</span></a>
          <div style="border-top:1px solid var(--border-subtle);margin:.25rem 0;"></div>
          <a href="corporate-bundle.html" class="active"><span class="pn" style="background:rgba(245,158,11,0.2);color:var(--accent-gold);">CB</span>Corporate Bundle<span class="pm hi" style="background:rgba(245,158,11,0.15);color:var(--accent-gold);">$3K</span></a>
        </div>
      </li>
      <li><a href="roadmap.html">Roadmap</a></li>
      <li><a href="agent-plan.html">Agent Plan</a></li>
    </ul>
  </div>
</nav>

<section class="sec pt-nav">
  <div class="container">
    <div class="bundle-hero">
      <span class="bundle-badge">&#10003; Flat-Rate Package</span>
      <h1 class="d-lg" style="margin-top:1.25rem;">VidiSmart Corporate Bundle</h1>
      <div class="bundle-price">$3,000</div>
      <p class="bundle-subtitle">Everything your business needs to launch, pitch, and scale — one flat rate. Six professional-grade deliverables designed for corporate teams, startups, and agencies that need results fast.</p>
      <div style="display:flex;align-items:center;justify-content:center;gap:1rem;flex-wrap:wrap;margin-top:1.5rem;">
        <span class="tag growth">ONE-TIME</span>
        <span class="tag saas">6 DELIVERABLES</span>
        <span class="tag recurring">FLAT RATE</span>
      </div>
      <img src="visual-agentic-ai.jpg" alt="VidiSmart Corporate Bundle - Visual Agentic AI Technology" class="bundle-hero-img" loading="lazy">
    </div>
  </div>
</section>

<section class="sec" style="padding-top:0;">
  <div class="container">
    <div style="text-align:center;margin-bottom:2.5rem;">
      <div class="rh gold" style="justify-content:center;"><span class="rn">&#9733;</span> WHAT'S INCLUDED</div>
      <h2 style="font-size:1.75rem;margin-top:1rem;">Six Professional Deliverables</h2>
      <p style="color:var(--text-secondary);margin-top:.5rem;max-width:600px;margin-left:auto;margin-right:auto;">Every bundle includes all six items below — no add-ons, no hidden fees.</p>
    </div>
    <div class="bundle-includes">
      <div class="deliverable-card">
        <img src="smart-stack-cover.png" alt="Smart Stack App - Visual Agentic AI Upgrade Plan" class="deliverable-img" loading="lazy">
        <svg class="app-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:40px;height:40px;margin:0 auto 0.75rem;display:block;">
          <style>
            @keyframes stack-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
            .st-top { fill: var(--accent-gold); animation: stack-bounce 2s ease-in-out infinite; }
            .st-mid { fill: var(--accent-primary); animation: stack-bounce 2s ease-in-out infinite 0.4s; }
            .st-bot { fill: var(--accent-violet); animation: stack-bounce 2s ease-in-out infinite 0.8s; }
          </style>
          <path class="st-top" d="M12 2L2 7L12 12L22 7L12 2Z" />
          <path class="st-mid" d="M12 7L2 12L12 17L22 12L12 7Z" opacity="0.8" />
          <path class="st-bot" d="M12 12L2 17L12 22L22 17L12 12Z" opacity="0.6" />
        </svg>
        <div class="deliverable-num">01</div>
        <div class="deliverable-title">Smart Stack App & Analysis</div>
        <div class="deliverable-desc">Our flagship interactive recommendation system. A comprehensive dashboard mapping your custom Visual Agentic AI technology stack, combined with a 20-page boardroom-ready technical migration roadmap.</div>
      </div>
      <div class="deliverable-card">
        <img src="front-1.jpg" alt="Pitch Deck" class="deliverable-img" loading="lazy">
        <svg class="app-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:40px;height:40px;margin:0 auto 0.75rem;display:block;">
          <style>
            @keyframes deck-slide-alt { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(3px); } }
            .deck-p { stroke: var(--accent-primary); stroke-width: 2; animation: deck-slide-alt 2s ease-in-out infinite; }
          </style>
          <rect class="deck-p" x="3" y="3" width="18" height="14" rx="2" />
          <line class="deck-p" x1="7" y1="21" x2="17" y2="21" />
          <line class="deck-p" x1="12" y1="17" x2="12" y2="21" />
        </svg>
        <div class="deliverable-num">02</div>
        <div class="deliverable-title">Pitch Deck</div>
        <div class="deliverable-desc">Professional presentation deck designed for investor meetings, client proposals, and stakeholder buy-in. Compelling narrative structure with clean, modern visuals that sell your vision.</div>
      </div>
      <div class="deliverable-card">
        <img src="viral-video-shoot.jpg" alt="Viral Video Production" class="deliverable-img" loading="lazy">
        <svg class="app-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:40px;height:40px;margin:0 auto 0.75rem;display:block;">
          <style>
            @keyframes video-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
            .v-cam { stroke: var(--accent-crimson); stroke-width: 2; }
            .v-red { fill: var(--accent-crimson); animation: video-pulse 1s infinite; }
          </style>
          <path class="v-cam" d="M23 7L16 12L23 17V7Z" stroke-linejoin="round" />
          <rect class="v-cam" x="1" y="5" width="15" height="14" rx="2" />
          <circle class="v-red" cx="5" cy="9" r="2" />
        </svg>
        <div class="deliverable-num">03</div>
        <div class="deliverable-title">Viral Video</div>
        <div class="deliverable-desc">High-impact video content engineered for social media engagement and shareability. Optimized for TikTok, Instagram Reels, YouTube Shorts, and LinkedIn — designed to spread.</div>
      </div>
      <div class="deliverable-card">
        <img src="microsite-vidismart2.jpg" alt="Micro Site" class="deliverable-img" loading="lazy">
        <svg class="app-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:40px;height:40px;margin:0 auto 0.75rem;display:block;">
          <style>
            @keyframes site-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .s-globe { stroke: var(--accent-emerald); stroke-width: 2; transform-origin: 12px 12px; animation: site-spin 15s linear infinite; }
          </style>
          <circle class="s-globe" cx="12" cy="12" r="10" />
          <path class="s-globe" d="M12 2C12 2 15 7 15 12C15 17 12 22 12 22M12 2C12 2 9 7 9 12C9 17 12 22 12 22M2 12H22" />
        </svg>
        <div class="deliverable-num">04</div>
        <div class="deliverable-title">Micro Site</div>
        <div class="deliverable-desc">Dedicated landing page or microsite built for your campaign, product launch, or corporate initiative. Responsive, fast-loading, and conversion-optimized for your target audience.</div>
      </div>
      <div class="deliverable-card">
        <img src="vidi-news2.jpg" alt="News Story" class="deliverable-img" loading="lazy">
        <svg class="app-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:40px;height:40px;margin:0 auto 0.75rem;display:block;">
          <style>
            @keyframes pulse-signal { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
            .news-b { stroke: var(--accent-gold); stroke-width: 2; }
            .news-s { stroke: var(--accent-gold); stroke-width: 2; animation: pulse-signal 1.2s infinite; }
          </style>
          <path class="news-b" d="M4 4H20V20H4V4Z" />
          <path class="news-s" d="M8 8H16M8 12H16" />
          <path class="news-b" d="M8 16H12" />
        </svg>
        <div class="deliverable-num">05</div>
        <div class="deliverable-title">News Story</div>
        <div class="deliverable-desc">Professionally written press release and editorial content formatted for media distribution. Newswire-ready with compelling angles that journalists and publications will want to cover.</div>
      </div>
      <div class="deliverable-card">
        <img src="written-plan-1.jpg" alt="Executive Summary - Written Strategy Plan" class="deliverable-img" loading="lazy">
        <svg class="app-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:40px;height:40px;margin:0 auto 0.75rem;display:block;">
          <style>
            @keyframes summary-turn { 0%, 100% { transform: rotateY(0); } 50% { transform: rotateY(-20deg); } }
            .sum-p { fill: none; stroke: var(--accent-violet); stroke-width: 2; transform-origin: 12px center; animation: summary-turn 3s ease-in-out infinite; }
          </style>
          <path d="M12 21V3" stroke="var(--text-primary)" stroke-width="2" />
          <path class="sum-p" d="M12 3C8 3 4 5 4 5V19C4 19 8 17 12 17M12 3C16 3 20 5 20 5V19C20 19 16 17 12 17" />
        </svg>
        <div class="deliverable-num">06</div>
        <div class="deliverable-title">10-Page Executive Summary</div>
        <div class="deliverable-desc">Comprehensive overview document covering strategy, market analysis, financial projections, and implementation roadmap. Boardroom-ready and designed to drive decisions.</div>
      </div>
    </div>
  </div>
</section>

<section class="sec" style="padding-top:0;">
  <div class="container-n">
    <div style="text-align:center;margin-bottom:2rem;">
      <h2 style="font-size:1.5rem;">Why the Corporate Bundle?</h2>
      <p style="color:var(--text-secondary);margin-top:.5rem;">Designed for busy teams that need a complete launch package without the complexity of á la carte pricing.</p>
    </div>
    <div class="g2" style="gap:1rem;">
      <div class="value-prop">
        <div class="value-icon">&#9889;</div>
        <div class="value-text"><strong>One Price. One Invoice.</strong><p>No per-deliverable pricing. No surprise fees. $3,000 covers everything — start to finish.</p></div>
      </div>
      <div class="value-prop">
        <div class="value-icon">&#9201;</div>
        <div class="value-text"><strong>Fast Turnaround</strong><p>All six deliverables produced in parallel. Typical delivery within 2-3 weeks of kickoff.</p></div>
      </div>
      <div class="value-prop">
        <div class="value-icon">&#127919;</div>
        <div class="value-text"><strong>Cohesive Brand Story</strong><p>Every deliverable shares a unified narrative, visual identity, and messaging strategy — no disconnected pieces.</p></div>
      </div>
      <div class="value-prop">
        <div class="value-icon">&#128188;</div>
        <div class="value-text"><strong>Corporate-Ready Output</strong><p>Built for professional environments: board presentations, investor decks, media distribution, and client-facing campaigns.</p></div>
      </div>
    </div>
  </div>
</section>

<section class="sec" style="padding-top:0;">
  <div class="container-n">
    <div style="text-align:center;margin-bottom:2rem;">
      <div class="rh gold" style="justify-content:center;"><span class="rn">&#127912;</span> PROJECT SHOWCASE</div>
      <h2 class="gallery-title">Our Work in Action</h2>
      <p class="gallery-subtitle">A sample of visual assets, designs, and creative work we've produced for clients.</p>
    </div>
    <div class="gallery-section">
      <img src="7or0.png" alt="Project showcase - visual design sample 1" class="gallery-img" loading="lazy">
      <img src="agentic-visual-ai2.png" alt="Agentic Visual AI - sample work" class="gallery-img" loading="lazy">
      <img src="un9.png" alt="Project showcase - visual design sample 2" class="gallery-img" loading="lazy">
    </div>
  </div>
</section>

<section class="sec" style="padding-top:0;">
  <div class="container-n">
    <div class="cta-section">
      <span class="bundle-badge" style="margin-bottom:1rem;">&#128640; READY TO START</span>
      <h2 style="font-size:1.75rem;margin-top:.75rem;">Get Your Corporate Bundle</h2>
      <p style="color:var(--text-secondary);margin-top:.75rem;max-width:550px;margin-left:auto;margin-right:auto;">Flat-rate $3,000. Six deliverables. Everything your business needs to make an impact. Reach out and we'll get you started within 24 hours.</p>
      <div style="margin-top:1.5rem;">
        <a href="mailto:info@vidismart.com?subject=VidiSmart%20Corporate%20Bundle%20%243%2C000%20Inquiry" class="cta-btn">&#9993; Contact Us — Get Started</a>
        <a href="index.html" class="cta-btn secondary">&#8592; View All Plans</a>
      </div>
      <p style="font-size:.75rem;color:var(--text-muted);margin-top:1.5rem;">Questions? Email <a href="mailto:info@vidismart.com" style="color:var(--accent-primary);">info@vidismart.com</a> or call for immediate consultation.</p>
    </div>
  </div>
</section>

<div class="ft"><div class="container">VidiSmart Corporate Bundle | Flat-Rate $3,000 Package | &copy; 2026 VidiSmart, Inc. | All deliverables subject to standard terms and scope of work agreement.</div></div>

<script src="assets/js/nav.js"></script>
</body>
</html>
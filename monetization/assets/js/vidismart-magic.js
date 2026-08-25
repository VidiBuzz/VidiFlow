/**
 * VidiSmart 3D Three.js & GSAP Visual Experience Engine
 * Adds interactive 3D particle constellation canvas & GSAP 3D interactive card tilts
 */
(function() {
  // 1. Inject Canvas for Three.js
  const canvas = document.createElement('canvas');
  canvas.id = 'vidi-three-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '0';
  canvas.style.opacity = '0.55';
  document.body.prepend(canvas);

  // Ensure content sits above canvas
  const style = document.createElement('style');
  style.textContent = `
    body { position: relative; }
    .topnav, .nav, .container, .plan-wrapper, .roadmap-wrapper, .content, main, section {
      position: relative;
      z-index: 2;
    }
    .tilt-card {
      transition: transform 0.15s ease-out, box-shadow 0.2s ease-out, border-color 0.2s ease-out;
      transform-style: preserve-3d;
      will-change: transform;
    }
    .tilt-card:hover {
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 229, 255, 0.15) !important;
    }
  `;
  document.head.appendChild(style);

  // 2. Helper to load external script asynchronously
  function loadScript(src, callback) {
    if (document.querySelector(`script[src="${src}"]`)) {
      if (callback) callback();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = callback;
    document.head.appendChild(s);
  }

  // 3. Initialize Three.js Ambient Particle Constellation
  function initThreeJS() {
    if (typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 320;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create glowing particles
    const particleCount = window.innerWidth < 768 ? 55 : 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = [];

    const palette = [
      new THREE.Color('#00e5ff'), // Cyan
      new THREE.Color('#7c5cfc'), // Purple
      new THREE.Color('#3b82f6'), // Azure Blue
      new THREE.Color('#10b981')  // Emerald
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 550;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 250;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      velocities.push({
        x: (Math.random() - 0.5) * 0.4,
        y: (Math.random() - 0.5) * 0.4,
        z: (Math.random() - 0.5) * 0.2
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material with Soft Glow
    const pMaterial = new THREE.PointsMaterial({
      size: 4.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, pMaterial);
    scene.add(particles);

    // Line connections
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending
    });

    const lineGeometry = new THREE.BufferGeometry();
    const maxLines = particleCount * 6;
    const linePositions = new Float32Array(maxLines * 6);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));

    const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineMesh);

    // Mouse Interaction
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.08;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.08;
    }, { passive: true });

    // Resize Handler
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);

      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      particles.rotation.y += 0.001;
      particles.rotation.x = targetY * 0.005;
      particles.rotation.y = targetX * 0.005;

      const posArr = geometry.attributes.position.array;
      let lineIdx = 0;
      const connectDistance = 90;

      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3] += velocities[i].x;
        posArr[i * 3 + 1] += velocities[i].y;
        posArr[i * 3 + 2] += velocities[i].z;

        // Bounce boundaries
        if (posArr[i * 3] < -300 || posArr[i * 3] > 300) velocities[i].x *= -1;
        if (posArr[i * 3 + 1] < -220 || posArr[i * 3 + 1] > 220) velocities[i].y *= -1;
        if (posArr[i * 3 + 2] < -150 || posArr[i * 3 + 2] > 150) velocities[i].z *= -1;

        // Connect nearby points with glowing lines
        for (let j = i + 1; j < particleCount; j++) {
          const dx = posArr[i * 3] - posArr[j * 3];
          const dy = posArr[i * 3 + 1] - posArr[j * 3 + 1];
          const dz = posArr[i * 3 + 2] - posArr[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < connectDistance && lineIdx < maxLines * 6) {
            linePositions[lineIdx++] = posArr[i * 3];
            linePositions[lineIdx++] = posArr[i * 3 + 1];
            linePositions[lineIdx++] = posArr[i * 3 + 2];

            linePositions[lineIdx++] = posArr[j * 3];
            linePositions[lineIdx++] = posArr[j * 3 + 1];
            linePositions[lineIdx++] = posArr[j * 3 + 2];
          }
        }
      }

      geometry.attributes.position.needsUpdate = true;
      lineGeometry.setDrawRange(0, lineIdx / 3);
      lineGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }
    animate();
  }

  // 4. Initialize GSAP Animations and 3D Tilt
  function initGSAP() {
    if (typeof gsap === 'undefined') return;

    // Staggered Entrance
    gsap.from('h1', { y: 25, opacity: 0, duration: 0.9, ease: 'power3.out' });
    gsap.from('.hero-eyebrow, .sub, .roadmap-subtitle, .plan-subtitle', { y: 15, opacity: 0, duration: 0.7, delay: 0.15, ease: 'power3.out' });
    gsap.from('.stat-pill', { scale: 0.9, opacity: 0, stagger: 0.08, duration: 0.6, delay: 0.25, ease: 'back.out(1.4)' });
    
    // Cards reveal
    const cards = document.querySelectorAll('.card, .app-card, .agent-card, .wave-card, .tool-card, .flow-showcase, .specs-card');
    if (cards.length > 0) {
      gsap.from(cards, {
        y: 35,
        opacity: 0,
        stagger: 0.06,
        duration: 0.8,
        delay: 0.35,
        ease: 'power3.out'
      });
    }

    // 3D Card Tilt Interaction
    cards.forEach(card => {
      card.classList.add('tilt-card');
      
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          scale: 1.015,
          duration: 0.25,
          ease: 'power1.out',
          transformPerspective: 1000
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          duration: 0.4,
          ease: 'power2.out'
        });
      });
    });
  }

  // Load Three.js & GSAP from CDN and initialize
  loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', initThreeJS);
  loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js', initGSAP);
})();

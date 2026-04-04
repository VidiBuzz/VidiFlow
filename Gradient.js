export class Gradient {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.gradients = [];
    this.animationId = null;
    this.width = 0;
    this.height = 0;
  }

  initGradient(selector) {
    this.canvas = document.querySelector(selector);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Get CSS custom properties for colors
    const style = getComputedStyle(this.canvas);
    const color1 = style.getPropertyValue('--gradient-color-1').trim() || '#0f172a';
    const color2 = style.getPropertyValue('--gradient-color-2').trim() || '#1e293b';
    const color3 = style.getPropertyValue('--gradient-color-3').trim() || '#312e81';
    const color4 = style.getPropertyValue('--gradient-color-4').trim() || '#1e1b4b';

    // Create gradient objects
    this.gradients = [
      {
        color: color1,
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 300 + 200,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
      },
      {
        color: color2,
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 300 + 200,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
      },
      {
        color: color3,
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 300 + 200,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
      },
      {
        color: color4,
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 300 + 200,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
      }
    ];

    this.animate();
    this.handleResize();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Update gradient positions
    this.gradients.forEach(gradient => {
      gradient.x += gradient.vx;
      gradient.y += gradient.vy;

      // Bounce off edges
      if (gradient.x < 0 || gradient.x > this.width) gradient.vx *= -1;
      if (gradient.y < 0 || gradient.y > this.height) gradient.vy *= -1;

      // Keep within bounds
      gradient.x = Math.max(0, Math.min(this.width, gradient.x));
      gradient.y = Math.max(0, Math.min(this.height, gradient.y));
    });

    // Create radial gradients
    this.gradients.forEach(gradient => {
      const radialGradient = this.ctx.createRadialGradient(
        gradient.x, gradient.y, 0,
        gradient.x, gradient.y, gradient.radius
      );
      radialGradient.addColorStop(0, gradient.color + '80');
      radialGradient.addColorStop(1, gradient.color + '00');

      this.ctx.fillStyle = radialGradient;
      this.ctx.fillRect(0, 0, this.width, this.height);
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  handleResize() {
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    });
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
} 
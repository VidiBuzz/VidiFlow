# VidiFlow Visualization Plan
## Neo4j + 3d-force-graph Integration

---

## 1. ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                    VidiFlow Dashboard                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Thinking   │  │   Status    │  │   Flow      │        │
│  │  Indicator  │  │   Orb       │  │   Graph     │        │
│  │  (CSS/JS)   │  │  (Three.js) │  │ (3d-force)  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │              3d-force-graph Canvas                   │   │
│  │  • Nodes = Neo4j entities (Agent, Task, Server)     │   │
│  │  • Links = Neo4j relationships (DEPENDS_ON, etc.)  │   │
│  │  • Particles = Data flow along relationships        │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    Neo4j Database                            │
│  • Agent nodes (48 agents with status, metrics)            │
│  • Task nodes (queue items with dependencies)              │
│  • Server nodes (8 servers with health)                    │
│  • Relationships: DEPENDS_ON, RUNS_ON, SENDS_TO           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. ANIMATION PATTERNS (From OpenCode Source)

### 2.1 Spinner Pattern
```javascript
// OpenCode uses braille characters with 80ms interval
const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
// Interval: 80ms between frames
// Simple, lightweight, works in terminal
```

### 2.2 Background Pulse Pattern (OpenCode)
```javascript
// Key constants from bg-pulse-render.ts
const PERIOD = 4600        // 4.6 seconds per cycle
const RINGS = 3            // 3 concentric pulse rings
const WIDTH = 3.8          // Pulse width
const TAIL = 9.5           // Tail length
const AMP = 0.55           // Amplitude
const BREATH_AMP = 0.05    // Breathing amplitude
const BREATH_SPEED = 0.0008 // Breathing speed

// Easing functions used:
const smoothstep = (t) => t * t * (3 - 2 * t)  // Hermite interpolation
const powerTail = (delta) => (1 + delta * TAIL_SCALE) ** 2.3  // Power-based falloff
const gaussianCore = (delta) => Math.exp(-(Math.abs(delta / 1.2) ** 1.8))  // Bell curve
```

### 2.3 Key Animation Principles
1. **Phase offsets** - Each ring/element has different timing
2. **Envelope modulation** - Sin-based fade in/out
3. **Edge falloff** - Intensity decreases with distance from center
4. **Breathing** - Continuous subtle sine wave oscillation
5. **Head/tail** - Moving pulse with leading edge and trailing fade

---

## 3. NEO4J DATA MODEL

### 3.1 Node Types

#### Agent Node
```cypher
CREATE (a:Agent {
  id: "agent-001",
  name: "Research Agent Alpha",
  status: "RUN",           // RUN, HOT, ERR, HOLD, IDLE
  project: "alpha",        // alpha, beta, gamma, shared
  task: "Analyzing customer sentiment",
  metrics: {
    tokensPerSec: 1250,
    memoryUsage: 0.72,
    runtime: 3420,
    cost: 0.45
  },
  confidence: 0.85,
  lastActivity: datetime(),
  x: 0.0,                  // 3D position (set by force layout)
  y: 0.0,
  z: 0.0
})
```

#### Task Node
```cypher
CREATE (t:Task {
  id: "task-019",
  name: "Generate report",
  priority: 1,             // 1=highest, 7=lowest
  status: "BLOCKED",       // BLOCKED, WAITING, READY, COMPLETE
  impact: 66,              // Number of tasks waiting on this
  severity: "critical",    // critical, high, medium, low
  estimatedDuration: 120,
  progress: 0.35
})
```

#### Server Node
```cypher
CREATE (s:Server {
  id: "server-gpu-01",
  name: "GPU Cluster 01",
  type: "GPU",             // GPU, CPU, MEMORY, STORAGE
  health: 0.87,            // 0.0 to 1.0
  cpu: 0.65,
  ram: 0.78,
  gpu: 0.92,
  temperature: 72,
  status: "healthy"        // healthy, warning, critical
})
```

### 3.2 Relationship Types

```cypher
// Agent depends on Task completion
(:Agent)-[:DEPENDS_ON {weight: 1.0, blocking: true}]->(:Task)

// Agent runs on Server
(:Agent)-[:RUNS_ON {resourceUsage: 0.72}]->(:Server)

// Data flows between Agents
(:Agent)-[:SENDS_TO {dataType: "embeddings", bytesPerSec: 1024}]->(:Agent)

// Task blocks other Tasks
(:Task)-[:BLOCKS {cascade: true}]->(:Task)

// Server connects to Server
(:Server)-[:CONNECTED_TO {bandwidth: 10000, latency: 2}]->(:Server)
```

---

## 4. 3D-FORCE-GRAPH CONFIGURATION

### 4.1 Basic Setup
```javascript
import ForceGraph3D from '3d-force-graph';
import neo4j from 'neo4j-driver';

// Initialize graph
const elem = document.getElementById('graph');
const graph = ForceGraph3D()(elem)
  .backgroundColor('#0a0a1a')
  .showNavInfo(false)
  .width(window.innerWidth)
  .height(window.innerHeight);
```

### 4.2 Node Configuration
```javascript
graph
  .nodeVal(node => {
    // Size based on type and importance
    switch(node.labels[0]) {
      case 'Agent': return node.properties.metrics.tokensPerSec / 100;
      case 'Task': return node.properties.impact;
      case 'Server': return node.properties.health * 20;
      default: return 5;
    }
  })
  .nodeColor(node => {
    // Color based on status
    const status = node.properties.status;
    const colors = {
      'RUN': '#00ff88',      // Green
      'HOT': '#ffaa00',      // Amber
      'ERR': '#ff4444',      // Red
      'HOLD': '#00ccff',     // Cyan
      'IDLE': '#666666',     // Gray
      'BLOCKED': '#ff6600',  // Orange
      'READY': '#00ff00',    // Bright green
      'healthy': '#00ff88',  // Server healthy
      'warning': '#ffaa00',  // Server warning
      'critical': '#ff4444'  // Server critical
    };
    return colors[status] || '#666666';
  })
  .nodeOpacity(0.9)
  .nodeResolution(16)  // Higher = smoother spheres
```

### 4.3 Link Configuration (with Particles)
```javascript
graph
  .linkColor(link => {
    const type = link.type;
    const colors = {
      'DEPENDS_ON': '#ff6600',
      'RUNS_ON': '#00ccff',
      'SENDS_TO': '#00ff88',
      'BLOCKS': '#ff4444',
      'CONNECTED_TO': '#888888'
    };
    return colors[type] || '#444444';
  })
  .linkWidth(1.5)
  .linkOpacity(0.6)
  // DIRECTIONAL PARTICLES - This is the key feature
  .linkDirectionalParticles(link => {
    // Number of particles based on data flow
    if (link.type === 'SENDS_TO') {
      return Math.ceil(link.properties.bytesPerSec / 500);
    }
    if (link.type === 'DEPENDS_ON') {
      return link.properties.blocking ? 3 : 1;
    }
    return 1;
  })
  .linkDirectionalParticleWidth(3)
  .linkDirectionalParticleSpeed(0.005)
  .linkDirectionalParticleColor(() => '#00ffff')
  .linkDirectionalArrowLength(5)
  .linkDirectionalArrowRelPos(1)
```

### 4.4 Force Configuration
```javascript
graph
  .d3AlphaDecay(0.02)
  .d3VelocityDecay(0.3)
  .d3Force('charge', d3.forceManyBody()
    .strength(-300)
    .distanceMax(500)
  )
  .d3Force('link', d3.forceLink()
    .id(d => d.identity)
    .distance(100)
    .strength(link => {
      // Stronger links for blocking dependencies
      return link.properties.blocking ? 0.8 : 0.3;
    })
  )
  .d3Force('center', d3.forceCenter(0, 0, 0))
  .d3Force('collision', d3.forceCollide()
    .radius(node => getNodeRadius(node) * 1.5)
  );
```

---

## 5. WORKING EXAMPLES TO BUILD

### Example 1: Basic 3d-force-graph with Neo4j Data
**File:** `vidiflow-force-graph.html`
**Purpose:** Demonstrate basic node rendering with status colors

```html
<!DOCTYPE html>
<html>
<head>
  <title>VidiFlow Force Graph</title>
  <script src="https://unpkg.com/3d-force-graph"></script>
  <script src="https://unpkg.com/three"></script>
  <style>
    body { margin: 0; background: #0a0a1a; overflow: hidden; }
    #graph { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="graph"></div>
  <script>
    // Mock Neo4j data (replace with real driver)
    const nodes = [
      { id: 'agent-001', label: 'Agent', name: 'Research Alpha', status: 'RUN', metrics: { tokensPerSec: 1250 } },
      { id: 'agent-002', label: 'Agent', name: 'Analysis Beta', status: 'HOT', metrics: { tokensPerSec: 800 } },
      { id: 'task-019', label: 'Task', name: 'Generate Report', status: 'BLOCKED', impact: 66 },
      { id: 'server-gpu-01', label: 'Server', name: 'GPU Cluster', status: 'healthy', health: 0.87 }
    ];
    
    const links = [
      { source: 'agent-001', target: 'task-019', type: 'DEPENDS_ON', properties: { blocking: true } },
      { source: 'agent-001', target: 'server-gpu-01', type: 'RUNS_ON', properties: {} },
      { source: 'agent-002', target: 'agent-001', type: 'SENDS_TO', properties: { bytesPerSec: 1024 } }
    ];

    const Graph = ForceGraph3D()(document.getElementById('graph'))
      .graphData({ nodes, links })
      .nodeVal(n => n.metrics?.tokensPerSec / 100 || 10)
      .nodeColor(n => ({ RUN: '#00ff88', HOT: '#ffaa00', ERR: '#ff4444', BLOCKED: '#ff6600', healthy: '#00ff88' }[n.status]))
      .linkDirectionalParticles(l => l.type === 'SENDS_TO' ? 5 : 2)
      .linkDirectionalParticleWidth(3)
      .linkDirectionalParticleSpeed(0.005)
      .linkDirectionalParticleColor(() => '#00ffff');
  </script>
</body>
</html>
```

### Example 2: Glowing Status Orb (Three.js)
**File:** `vidiflow-status-orb.html`
**Purpose:** State-driven glowing orb that changes color/animation based on agent status

```html
<!DOCTYPE html>
<html>
<head>
  <title>VidiFlow Status Orb</title>
  <script src="https://unpkg.com/three"></script>
  <script src="https://unpkg.com/three/examples/js/controls/OrbitControls.js"></script>
  <style>
    body { margin: 0; background: #0a0a1a; overflow: hidden; }
    canvas { display: block; }
  </style>
</head>
<body>
  <script>
    // Setup scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Orb states
    const STATES = {
      idle: { color: 0x666666, pulseSpeed: 0.001, ringCount: 0, particleCount: 0 },
      thinking: { color: 0x00ccff, pulseSpeed: 0.003, ringCount: 2, particleCount: 50 },
      running: { color: 0x00ff88, pulseSpeed: 0.005, ringCount: 3, particleCount: 100 },
      error: { color: 0xff4444, pulseSpeed: 0.008, ringCount: 4, particleCount: 200 },
      hot: { color: 0xffaa00, pulseSpeed: 0.006, ringCount: 3, particleCount: 150 }
    };

    let currentState = 'idle';
    let orb, rings = [], particles = [];

    // Create orb
    const orbGeometry = new THREE.SphereGeometry(1, 32, 32);
    const orbMaterial = new THREE.MeshBasicMaterial({ color: STATES.idle.color });
    orb = new THREE.Mesh(orbGeometry, orbMaterial);
    scene.add(orb);

    // Create rings
    for (let i = 0; i < 5; i++) {
      const ringGeometry = new THREE.RingGeometry(1.2 + i * 0.3, 1.3 + i * 0.3, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: STATES.idle.color, 
        transparent: true, 
        opacity: 0.3,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.visible = false;
      rings.push(ring);
      scene.add(ring);
    }

    // Create particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({ 
      color: STATES.idle.color, 
      size: 0.1, 
      transparent: true, 
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      
      const time = Date.now() * STATES[currentState].pulseSpeed;
      
      // Pulse orb
      const scale = 1 + Math.sin(time) * 0.1;
      orb.scale.set(scale, scale, scale);
      
      // Animate rings
      rings.forEach((ring, i) => {
        if (ring.visible) {
          ring.rotation.z = time * (i + 1) * 0.5;
          ring.material.opacity = 0.2 + Math.sin(time + i) * 0.1;
        }
      });
      
      renderer.render(scene, camera);
    }

    // State change function
    window.setState = function(state) {
      currentState = state;
      const config = STATES[state];
      
      orb.material.color.setHex(config.color);
      rings.forEach((ring, i) => {
        ring.visible = i < config.ringCount;
        ring.material.color.setHex(config.color);
      });
    };

    camera.position.z = 5;
    animate();
  </script>
</body>
</html>
```

### Example 3: Data Flow Particles (GSAP + Three.js)
**File:** `vidiflow-data-flow.html`
**Purpose:** Particles flowing along bezier curves between nodes

```html
<!DOCTYPE html>
<html>
<head>
  <title>VidiFlow Data Flow</title>
  <script src="https://unpkg.com/three"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <style>
    body { margin: 0; background: #0a0a1a; overflow: hidden; }
  </style>
</head>
<body>
  <script>
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Node positions
    const nodeA = new THREE.Vector3(-5, 0, 0);
    const nodeB = new THREE.Vector3(5, 0, 0);
    const controlPoint1 = new THREE.Vector3(-2, 3, 2);
    const controlPoint2 = new THREE.Vector3(2, -3, -2);

    // Create bezier curve
    const curve = new THREE.CubicBezierCurve3(nodeA, controlPoint1, controlPoint2, nodeB);

    // Create particles along curve
    const particleCount = 50;
    const particles = [];
    const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8
    });

    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone());
      particle.userData.offset = i / particleCount; // Stagger particles
      particle.userData.speed = 0.001 + Math.random() * 0.001;
      particles.push(particle);
      scene.add(particle);
    }

    // Create nodes at endpoints
    const nodeGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const nodeMaterialA = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
    const nodeMaterialB = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const nodeMeshA = new THREE.Mesh(nodeGeometry, nodeMaterialA);
    const nodeMeshB = new THREE.Mesh(nodeGeometry, nodeMaterialB);
    nodeMeshA.position.copy(nodeA);
    nodeMeshB.position.copy(nodeB);
    scene.add(nodeMeshA);
    scene.add(nodeMeshB);

    // Create curve line for visualization
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.3 });
    const curveLine = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(curveLine);

    // Animation
    function animate() {
      requestAnimationFrame(animate);
      
      particles.forEach(particle => {
        // Move particle along curve
        particle.userData.offset = (particle.userData.offset + particle.userData.speed) % 1;
        const position = curve.getPointAt(particle.userData.offset);
        particle.position.copy(position);
        
        // Orient particle to direction of travel
        const tangent = curve.getTangentAt(particle.userData.offset);
        particle.lookAt(position.clone().add(tangent));
        
        // Pulse opacity
        particle.material.opacity = 0.5 + Math.sin(Date.now() * 0.005) * 0.3;
      });
      
      renderer.render(scene, camera);
    }

    camera.position.z = 10;
    animate();
  </script>
</body>
</html>
```

### Example 4: Thinking Indicator (CSS + JS)
**File:** `vidiflow-thinking.html`
**Purpose:** OpenCode-style thinking animation adapted for web

```html
<!DOCTYPE html>
<html>
<head>
  <title>VidiFlow Thinking Indicator</title>
  <style>
    body { margin: 0; background: #0a0a1a; display: flex; justify-content: center; align-items: center; height: 100vh; }
    
    .thinking-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
    
    .orb {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: radial-gradient(circle, #00ccff 0%, #0066aa 50%, #003366 100%);
      animation: breathe 2s ease-in-out infinite;
      position: relative;
    }
    
    .orb::before {
      content: '';
      position: absolute;
      inset: -10px;
      border-radius: 50%;
      border: 2px solid #00ccff;
      animation: ring-pulse 1.5s ease-in-out infinite;
    }
    
    .orb::after {
      content: '';
      position: absolute;
      inset: -20px;
      border-radius: 50%;
      border: 1px solid #00ccff;
      animation: ring-pulse 1.5s ease-in-out infinite 0.5s;
    }
    
    @keyframes breathe {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.1); opacity: 1; }
    }
    
    @keyframes ring-pulse {
      0% { transform: scale(0.8); opacity: 0; }
      50% { transform: scale(1.2); opacity: 0.5; }
      100% { transform: scale(0.8); opacity: 0; }
    }
    
    .status-text {
      color: #00ccff;
      font-family: monospace;
      font-size: 14px;
      animation: text-pulse 1s ease-in-out infinite;
    }
    
    @keyframes text-pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
  </style>
</head>
<body>
  <div class="thinking-container">
    <div class="orb"></div>
    <div class="status-text">THINKING...</div>
  </div>
</body>
</html>
```

### Example 5: Dashboard Integration
**File:** `vidiflow-dashboard.html`
**Purpose:** Full dashboard with all components working together

---

## 6. NEO4J INTEGRATION

### 6.1 Connection Setup
```javascript
const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'password')
);

async function getGraphData() {
  const session = driver.session();
  
  try {
    // Get all nodes
    const nodesResult = await session.run(`
      MATCH (n)
      RETURN n, labels(n) as labels, id(n) as identity
    `);
    
    // Get all relationships
    const linksResult = await session.run(`
      MATCH (a)-[r]->(b)
      RETURN id(a) as source, id(b) as target, type(r) as type, properties(r) as properties
    `);
    
    return {
      nodes: nodesResult.records.map(record => ({
        ...record.get('n').properties,
        labels: record.get('labels'),
        identity: record.get('identity').toNumber()
      })),
      links: linksResult.records.map(record => ({
        source: record.get('source').toNumber(),
        target: record.get('target').toNumber(),
        type: record.get('type'),
        properties: record.get('properties')
      }))
    };
  } finally {
    await session.close();
  }
}
```

### 6.2 Real-time Updates (Bolt Protocol)
```javascript
// Watch for changes
const session = driver.session();
const result = await session.run('MATCH (n) RETURN n');
const reactiveResult = result.pipe();

// Subscribe to changes
reactiveResult.subscribe({
  onNext: (record) => {
    // Update graph with new data
    updateGraphNode(record.get('n'));
  },
  onCompleted: () => {
    console.log('Stream complete');
  },
  onError: (error) => {
    console.error(error);
  }
});
```

---

## 7. PERFORMANCE CONSIDERATIONS

### 7.1 Node Limits
- **< 100 nodes**: Full 3D with all effects
- **100-500 nodes**: Reduce particle count, simplify geometry
- **500+ nodes**: Use 2D fallback or level-of-detail

### 7.2 Particle Optimization
```javascript
// Use InstancedMesh for better performance
const particleMesh = new THREE.InstancedMesh(
  particleGeometry,
  particleMaterial,
  particleCount
);

// Update positions in buffer
const dummy = new THREE.Object3D();
particles.forEach((particle, i) => {
  dummy.position.copy(particle.position);
  dummy.updateMatrix();
  particleMesh.setMatrixAt(i, dummy.matrix);
});
particleMesh.instanceMatrix.needsUpdate = true;
```

### 7.3 Throttling Updates
```javascript
// Throttle Neo4j updates to 30fps
let lastUpdate = 0;
const THROTTLE_MS = 33; // ~30fps

function handleUpdate(update) {
  const now = Date.now();
  if (now - lastUpdate < THROTTLE_MS) return;
  lastUpdate = now;
  
  // Batch updates
  requestAnimationFrame(() => {
    updateGraph(update);
  });
}
```

---

## 8. IMPLEMENTATION ROADMAP

### Phase 1: Basic Visualization (Week 1)
- [ ] Setup 3d-force-graph with mock data
- [ ] Implement node coloring by status
- [ ] Add basic force layout
- [ ] Create status orb component

### Phase 2: Neo4j Integration (Week 2)
- [ ] Connect to Neo4j database
- [ ] Implement real-time data fetching
- [ ] Add relationship visualization
- [ ] Enable directional particles

### Phase 3: Advanced Effects (Week 3)
- [ ] Add GSAP animations
- [ ] Implement thinking indicator
- [ ] Create data flow particles
- [ ] Add bloom post-processing

### Phase 4: Dashboard Integration (Week 4)
- [ ] Integrate with existing VidiFlow UI
- [ ] Add keyboard navigation
- [ ] Implement responsive design
- [ ] Performance optimization

---

## 9. SUCCESS CRITERIA

- [ ] Nodes render with correct colors based on status
- [ ] Particles flow along relationships showing data movement
- [ ] Status orb changes color/animation based on agent state
- [ ] Real-time updates from Neo4j appear within 100ms
- [ ] Performance maintains 60fps with 100+ nodes
- [ ] User can click nodes to see details
- [ ] User can filter by node type (Agent/Task/Server)

---

## 10. REFERENCES

1. **3d-force-graph**: https://github.com/vasturiano/3d-force-graph
2. **Neo4j JavaScript Driver**: https://github.com/neo4j/neo4j-javascript-driver
3. **OpenCode Source**: https://github.com/anomalyco/opencode
4. **Three.js**: https://threejs.org
5. **GSAP**: https://greensock.com/gsap

---

*Last Updated: June 7, 2026*
*Author: VidiFlow Development Team*

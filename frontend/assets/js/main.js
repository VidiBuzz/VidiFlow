// Main JavaScript file for VidiSmart AI Directory
// Integrations: Vespa (vector search + geospatial), Supabase/PostgreSQL (main DB)

// Configuration for backend services
const CONFIG = {
    vespa: {
        baseUrl: 'https://vespa.vidismart.com',
        appId: 'vidismart-ai-directory',
        searchEndpoint: '/api/v1/search',
        vectorEndpoint: '/api/v1/vector-search',
        geospatialEndpoint: '/api/v1/geospatial'
    },
    supabase: {
        url: 'https://u2627-m33aqlpqghg3.supabase.co',
        anonKey: 'YOUR_SUPABASE_ANON_KEY', // Load from .env in production
        endpoints: {
            users: '/rest/v1/users',
            companies: '/rest/v1/companies',
            consultants: '/rest/v1/consultants',
            resources: '/rest/v1/resources'
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle (if we had one)
    // For now, just basic initialization
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Add active class to current nav item
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('header nav ul li a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath || 
            (currentPath === '' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Initialize Three.js background animation
    initThreeBackground();

    // Omni Search functionality - Wired to Vespa + Supabase
    const omniSearchForm = document.getElementById('omniSearchForm');
    if (omniSearchForm) {
        omniSearchForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const searchInput = this.querySelector('.omni-search-input');
            const searchTerm = searchInput.value.trim();
            
            if (!searchTerm) return;
            
            // Show loading state
            searchInput.disabled = true;
            const originalPlaceholder = searchInput.placeholder;
            searchInput.placeholder = 'Searching Vespa + Supabase...';
            
            try {
                // Use the unified search API (Vespa vector + Supabase PostgreSQL)
                const results = await window.VidiSmartAPI.performUnifiedSearch(searchTerm, {
                    limit: 20,
                    filters: {}
                });
                
                console.log('Search results:', results);
                
                // Redirect to directory with search term (results will be fetched there)
                window.location.href = `directory.html?search=${encodeURIComponent(searchTerm)}`;
                
            } catch (error) {
                console.error('Omni Search error:', error);
                alert('Search failed. Please try again.');
            } finally {
                searchInput.disabled = false;
                searchInput.placeholder = originalPlaceholder;
            }
        });
        
        // Add keyboard shortcut for quick access (Cmd/Ctrl + K)
        document.addEventListener('keydown', function(e) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }

    // Animate elements on scroll
    animateOnScroll();
});

// Three.js Background Animation - Particle Constellation Effect
function initThreeBackground() {
    const canvas = document.getElementById('three-bg');
    if (!canvas) return;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
    );
    camera.position.z = 30;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create particles
    const particleCount = 150;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 60;     // x
        positions[i + 1] = (Math.random() - 0.5) * 60; // y
        positions[i + 2] = (Math.random() - 0.5) * 40; // z

        velocities.push({
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02
        });
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle material with gradient colors
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x667eea,
        size: 0.15,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particlesGeometry, particleMaterial);
    scene.add(particles);

    // Create connecting lines (constellation effect)
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x764ba2,
        transparent: true,
        opacity: 0.15
    });

    let linesGeometry = new THREE.BufferGeometry();
    const lines = new THREE.LineSegments(linesGeometry, lineMaterial);
    scene.add(lines);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        const positions = particlesGeometry.attributes.position.array;

        // Update particle positions
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] += velocities[i].x;
            positions[i * 3 + 1] += velocities[i].y;
            positions[i * 3 + 2] += velocities[i].z;

            // Bounce particles at edges
            if (Math.abs(positions[i * 3]) > 30) velocities[i].x *= -1;
            if (Math.abs(positions[i * 3 + 1]) > 30) velocities[i].y *= -1;
            if (Math.abs(positions[i * 3 + 2]) > 20) velocities[i].z *= -1;
        }

        particlesGeometry.attributes.position.needsUpdate = true;

        // Create constellation lines between nearby particles
        const linePositions = [];
        const maxDistance = 8;

        for (let i = 0; i < particleCount; i++) {
            for (let j = i + 1; j < particleCount; j++) {
                const dx = positions[i * 3] - positions[j * 3];
                const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (distance < maxDistance) {
                    linePositions.push(
                        positions[i * 3],
                        positions[i * 3 + 1],
                        positions[i * 3 + 2],
                        positions[j * 3],
                        positions[j * 3 + 1],
                        positions[j * 3 + 2]
                    );
                }
            }
        }

        linesGeometry.setAttribute(
            'position', 
            new THREE.Float32BufferAttribute(linePositions, 3)
        );

        // Subtle rotation based on mouse position
        targetRotationY = mouseX * 0.5;
        targetRotationX = mouseY * 0.5;

        particles.rotation.y += (targetRotationY - particles.rotation.y) * 0.05;
        particles.rotation.x += (targetRotationX - particles.rotation.x) * 0.05;
        lines.rotation.y += (targetRotationY - lines.rotation.y) * 0.05;
        lines.rotation.x += (targetRotationX - lines.rotation.x) * 0.05;

        // Continuous slow rotation
        particles.rotation.z += 0.001;
        lines.rotation.z += 0.001;

        renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Animate elements on scroll
function animateOnScroll() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe feature cards, stats, and other elements
    document.querySelectorAll('.feature, .stat, .directory-item, .resource-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ============================================
// VESPA INTEGRATION - Vector Search + Geospatial
// ============================================

/**
 * Perform vector similarity search using Vespa
 * @param {string} query - Search query text
 * @param {Object} options - Search options (location, radius, filters)
 * @returns {Promise<Array>} - Array of search results
 */
async function vespaVectorSearch(query, options = {}) {
    const {
        latitude = null,
        longitude = null,
        radius = 50, // km
        limit = 20,
        filters = {}
    } = options;

    try {
        // Generate embedding for query (in production, use your embedding model)
        const queryVector = await generateQueryEmbedding(query);
        
        const vespaUrl = `${CONFIG.vespa.baseUrl}${CONFIG.vespa.vectorEndpoint}`;
        
        const requestBody = {
            queries: [{
                body: {
                    query: query,
                    features: queryVector,
                    ranking: {
                        profile: 'hybrid-search',
                        input: {
                            'query(q)': query
                        }
                    },
                    // Geospatial filter if location provided
                    ...(latitude && longitude ? {
                        where: `nearestNeighbor(location, lat(${latitude}), lon(${longitude})) <= ${radius}km`
                    } : {}),
                    // Additional filters
                    ...filters
                },
                groupBy: 'category(0|1)'
            }]
        };

        const response = await fetch(vespaUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Vespa API error: ${response.status}`);
        }

        const data = await response.json();
        return extractResultsFromVespa(data);

    } catch (error) {
        console.error('Vespa vector search failed:', error);
        // Fallback to text-based search
        return vespaTextSearch(query, options);
    }
}

/**
 * Text-based search fallback using Vespa
 */
async function vespaTextSearch(query, options = {}) {
    try {
        const vespaUrl = `${CONFIG.vespa.baseUrl}${CONFIG.vespa.searchEndpoint}`;
        
        const response = await fetch(`${vespaUrl}?query=${encodeURIComponent(query)}&limit=${options.limit || 20}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Vespa API error: ${response.status}`);
        }

        const data = await response.json();
        return extractResultsFromVespa(data);

    } catch (error) {
        console.error('Vespa text search failed:', error);
        return [];
    }
}

/**
 * Geospatial search using Vespa's built-in geospatial features
 */
async function vespaGeospatialSearch(latitude, longitude, radius = 50, entityType = 'all') {
    try {
        const vespaUrl = `${CONFIG.vespa.baseUrl}${CONFIG.vespa.geospatialEndpoint}`;
        
        const response = await fetch(vespaUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                location: { lat: latitude, lon: longitude },
                radius: `${radius}km`,
                entity_type: entityType,
                limit: 50
            })
        });

        if (!response.ok) {
            throw new Error(`Vespa geospatial error: ${response.status}`);
        }

        const data = await response.json();
        return data.hits || [];

    } catch (error) {
        console.error('Vespa geospatial search failed:', error);
        return [];
    }
}

// ============================================
// SUPABASE/POSTGRESQL INTEGRATION - Main DB
// ============================================

/**
 * Fetch companies from Supabase
 */
async function fetchCompaniesFromSupabase(filters = {}) {
    try {
        const url = `${CONFIG.supabase.url}${CONFIG.supabase.endpoints.companies}`;
        let queryParam = '';
        
        if (filters.category) {
            queryParam += `category=eq.${filters.category}&`;
        }
        if (filters.location) {
            queryParam += `location=ilike.%${filters.location}%&`;
        }
        if (filters.limit) {
            queryParam += `limit=${filters.limit}`;
        }

        const response = await fetch(`${url}?${queryParam}`, {
            headers: {
                'apikey': CONFIG.supabase.anonKey,
                'Authorization': `Bearer ${CONFIG.supabase.anonKey}`
            }
        });

        if (!response.ok) {
            throw new Error(`Supabase error: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Supabase companies fetch failed:', error);
        return [];
    }
}

/**
 * Fetch consultants from Supabase
 */
async function fetchConsultantsFromSupabase(filters = {}) {
    try {
        const url = `${CONFIG.supabase.url}${CONFIG.supabase.endpoints.consultants}`;
        let queryParam = '';
        
        if (filters.specialty) {
            queryParam += `specialty=ilike.%${filters.specialty}%&`;
        }
        if (filters.limit) {
            queryParam += `limit=${filters.limit}`;
        }

        const response = await fetch(`${url}?${queryParam}`, {
            headers: {
                'apikey': CONFIG.supabase.anonKey,
                'Authorization': `Bearer ${CONFIG.supabase.anonKey}`
            }
        });

        if (!response.ok) {
            throw new Error(`Supabase error: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Supabase consultants fetch failed:', error);
        return [];
    }
}

/**
 * Fetch resources from Supabase
 */
async function fetchResourcesFromSupabase(filters = {}) {
    try {
        const url = `${CONFIG.supabase.url}${CONFIG.supabase.endpoints.resources}`;
        let queryParam = '';
        
        if (filters.type) {
            queryParam += `type=eq.${filters.type}&`;
        }
        if (filters.category) {
            queryParam += `category=ilike.%${filters.category}%&`;
        }
        if (filters.limit) {
            queryParam += `limit=${filters.limit}`;
        }

        const response = await fetch(`${url}?${queryParam}`, {
            headers: {
                'apikey': CONFIG.supabase.anonKey,
                'Authorization': `Bearer ${CONFIG.supabase.anonKey}`
            }
        });

        if (!response.ok) {
            throw new Error(`Supabase error: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Supabase resources fetch failed:', error);
        return [];
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate embedding for query text
 * In production, replace with actual embedding API call
 */
async function generateQueryEmbedding(text) {
    // Placeholder - in production use:
    // - OpenAI embeddings API
    // - Hugging Face inference API  
    // - Or your own embedding model
    
    // For now, return a dummy vector (512 dimensions for example)
    const vector = new Array(512).fill(0);
    for (let i = 0; i < 512; i++) {
        vector[i] = Math.sin(text.charCodeAt(i % text.length) * i) * 0.1;
    }
    return vector;
}

/**
 * Extract and format results from Vespa response
 */
function extractResultsFromVespa(data) {
    const results = [];
    
    if (data.root && data.root.children) {
        data.root.children.forEach(child => {
            if (child.fields) {
                results.push({
                    id: child.id,
                    title: child.fields.title || 'No Title',
                    description: child.fields.description || '',
                    url: child.fields.url || '#',
                    category: child.fields.category || 'General',
                    location: child.fields.location || '',
                    rating: child.fields.rating || 0,
                    score: child.relevance || 0
                });
            }
        });
    }
    
    return results;
}

/**
 * Unified search function - combines Vespa + Supabase
 */
async function performUnifiedSearch(query, options = {}) {
    const startTime = performance.now();
    
    // Run searches in parallel
    const [vespaResults, supabaseCompanies, supabaseConsultants] = await Promise.all([
        vespaVectorSearch(query, options),
        fetchCompaniesFromSupabase({ query, limit: 10 }),
        fetchConsultantsFromSupabase({ query, limit: 10 })
    ]);

    // Merge and deduplicate results
    const allResults = mergeAndRankResults(vespaResults, supabaseCompanies, supabaseConsultants);
    
    const endTime = performance.now();
    console.log(`Unified search completed in ${endTime - startTime}ms`);
    
    return allResults;
}

/**
 * Merge results from multiple sources and rank them
 */
function mergeAndRankResults(vespaResults, companies, consultants) {
    const merged = [...vespaResults];
    
    // Add unique companies not in Vespa results
    companies.forEach(company => {
        if (!merged.find(r => r.id === company.id)) {
            merged.push({ ...company, source: 'supabase' });
        }
    });
    
    // Add unique consultants not in Vespa results  
    consultants.forEach(consultant => {
        if (!merged.find(r => r.id === consultant.id)) {
            merged.push({ ...consultant, source: 'supabase', type: 'consultant' });
        }
    });
    
    // Sort by relevance score
    return merged.sort((a, b) => (b.score || 0) - (a.score || 0));
}

// Export functions for use in other modules
window.VidiSmartAPI = {
    vespaVectorSearch,
    vespaTextSearch,
    vespaGeospatialSearch,
    fetchCompaniesFromSupabase,
    fetchConsultantsFromSupabase,
    fetchResourcesFromSupabase,
    performUnifiedSearch,
    CONFIG
};



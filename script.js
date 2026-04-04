// --- Three.js Background Animation ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg-canvas'), alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
const clock = new THREE.Clock();
const geometry = new THREE.PlaneGeometry(2, 2);
const material = new THREE.ShaderMaterial({
    uniforms: {
        u_time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_mouse: { value: new THREE.Vector2(0.5, 0.5) }
    },
    vertexShader: `void main() { gl_Position = vec4(position, 1.0); }`,
    fragmentShader: `
        uniform vec2 u_resolution;
        uniform float u_time;
        float random (in vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }
        float noise (in vec2 st) {
            vec2 i = floor(st); vec2 f = fract(st);
            float a = random(i); float b = random(i + vec2(1.0, 0.0)); float c = random(i + vec2(0.0, 1.0)); float d = random(i + vec2(1.0, 1.0));
            vec2 u = f*f*(3.0-2.0*f);
            return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }
        float dither(vec2 st) {
            return (random(st + u_time) - 0.5) * 0.03;
        }
        void main() {
            vec2 st = gl_FragCoord.xy/u_resolution.xy; st.x *= u_resolution.x/u_resolution.y;
            // Very dark base, deep blue sweep (40% darker)
            vec3 base = vec3(0.006, 0.013, 0.045); // 40% darker
            vec3 blue = vec3(0.096, 0.248, 0.592); // 40% darker
            vec3 gray = vec3(0.083, 0.096, 0.115); // 40% darker
            float sweep = smoothstep(0.0, 0.7, st.x - st.y + 0.25 + 0.18*sin(u_time*0.28*3.0)) * 1.0;
            float sweep2 = smoothstep(0.0, 0.8, st.x + st.y - 0.2 + 0.12*cos(u_time*0.19*3.0)) * 0.7;
            float n = noise(st * 2.7 + u_time * 0.09*3.0);
            float n2 = noise(st * 3.5 - u_time * 0.07*3.0);
            float pattern = mix(n, n2, 0.5);
            float contrast = 0.6 + 1.2*pattern;
            vec3 color = base;
            color = mix(color, gray, 0.4 + 0.6*pattern);
            color = mix(color, blue, sweep + sweep2);
            color *= contrast;
            color += dither(st);
            gl_FragColor = vec4(color, 1.0);
        }`
});
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);
function animate() { requestAnimationFrame(animate); material.uniforms.u_time.value = clock.getElapsedTime(); renderer.render(scene, camera); }
function onWindowResize() { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); material.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight); }
function onMouseMove(event) { material.uniforms.u_mouse.value.x = event.clientX / window.innerWidth; material.uniforms.u_mouse.value.y = 1.0 - (event.clientY / window.innerHeight); }
window.addEventListener('resize', onWindowResize, false); window.addEventListener('mousemove', onMouseMove, false);
animate();

// --- VidiSmart App Logic ---
const techData = {
    archetype: [ { id: 'creator-hub', name: 'Video-First Creator Hub', description: 'A platform focused on video content, community engagement, and monetization for creators.' }, { id: 'knowledge-forum', name: 'Knowledge-Based Discussion Forum', description: 'A community centered around structured discussions, knowledge sharing, and long-form content.' }, { id: 'elearning', name: 'E-learning Community', description: 'An integrated platform for online courses, student interaction, and educational content delivery.' }, { id: 'brand-community', name: 'Brand-Sponsored Community', description: 'A space for customers to connect, share experiences, and engage directly with a brand.' }, ],
    frontend: [ 
        { id: 'react', name: 'React.js', description: 'The library for web and native user interfaces. Often paired with a router and state management for full applications.', website: 'https://react.dev/', video: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM' },
        { id: 'nextjs', name: 'Next.js (React Framework)', description: 'A powerful React framework for building scalable, high-performance web applications with both server-side and static rendering.', website: 'https://nextjs.org/', video: 'https://www.youtube.com/watch?v=Sklc_fQBmcs' }, 
        { id: 'nuxtjs', name: 'Nuxt.js (Vue Framework)', description: 'The intuitive Vue framework for creating universal applications, static websites, and single-page applications.', website: 'https://nuxt.com/', video: 'https://www.youtube.com/watch?v=d_B1GtrA7sU' }, 
        { id: 'sveltekit', name: 'SvelteKit', description: 'A framework for building web applications of all sizes, with a beautiful development experience and flexible filesystem-based routing.', website: 'https://kit.svelte.dev/', video: 'https://www.youtube.com/watch?v=UGBJg3b9A7U' }, 
        { id: 'angular', name: 'Angular', description: 'A platform for building mobile and desktop web applications, developed and maintained by Google.', website: 'https://angular.dev/', video: 'https://www.youtube.com/watch?v=3qBXWUpoPHo' }, 
    ],
    backend: [ 
        { id: 'supabase', name: 'Supabase (Postgres)', description: 'An open-source Firebase alternative built on PostgreSQL. Provides a database, authentication, instant APIs, and storage.', website: 'https://supabase.com/', video: 'https://www.youtube.com/watch?v=6C3t_8pI5s' }, 
        { id: 'mysql', name: 'MySQL', description: 'The world\'s most popular open-source relational database. A reliable and standard choice for many web applications.', website: 'https://www.mysql.com/', video: 'https://www.youtube.com/watch?v=7S_tz1z_5bA' },
        { id: 'mongodb', name: 'MongoDB (NoSQL)', description: 'A leading NoSQL, document-oriented database. Its flexible schema is ideal for rapidly evolving applications.', website: 'https://www.mongodb.com/', video: 'https://www.youtube.com/watch?v=ofIu_vGpgqU' },
        { id: 'airtable', name: 'Airtable', description: 'A low-code platform for building collaborative apps. It combines the flexibility of a spreadsheet with the power of a database.', website: 'https://www.airtable.com/', video: 'https://www.youtube.com/watch?v=6UjGAnj-F8s' },
        { id: 'self-hosted-pg', name: 'Self-Hosted Postgres + Node.js', description: 'A flexible and powerful combination for full control over your backend infrastructure, using Node.js for the application server.', website: 'https://www.postgresql.org/', video: 'https://www.youtube.com/watch?v=e4S22_N_aC4' }, 
        { id: 'laravel', name: 'Laravel (PHP)', description: 'A PHP web application framework with expressive, elegant syntax, focusing on easing common development tasks.', website: 'https://laravel.com/', video: 'https://www.youtube.com/watch?v=ImtZ5_V2_o' }, 
        { id: 'firebase', name: 'Firebase (NoSQL)', description: 'Google\'s platform for creating mobile and web applications. Provides a realtime NoSQL database, auth, and hosting.', website: 'https://firebase.google.com/', video: 'https://www.youtube.com/watch?v=jsrg_i66n-4' }, 
    ],
    cms: [ { id: 'strapi', name: 'Strapi', description: 'A leading open-source headless CMS. It\'s 100% JavaScript, fully customizable, and developer-first.', website: 'https://strapi.io/', video: 'https://www.youtube.com/watch?v=Bomyso33sLg' }, { id: 'payload', name: 'Payload CMS', description: 'A TypeScript-native headless CMS and application framework. Can be installed directly into a Next.js app.', website: 'https://payloadcms.com/', video: 'https://www.youtube.com/watch?v=h8pYAAc3ySM' }, { id: 'headless-wp', name: 'Headless WordPress', description: 'Using the world\'s most popular CMS as a content backend, serving data via its REST API to a modern frontend.', website: 'https://wordpress.org/', video: 'https://www.youtube.com/watch?v=VtsD_IqC30c' }, { id: 'octobercms', name: 'October CMS (Laravel)', description: 'A free, open-source, self-hosted CMS platform based on the Laravel PHP Framework, known for its simplicity and extensibility.', website: 'https://octobercms.com/', video: 'https://www.youtube.com/watch?v=5A9aY6a_3E4' }, { id: 'statamic', name: 'Statamic (Laravel)', description: 'A highly flexible, flat-file CMS built on Laravel. It stores content in files, not a database, offering a unique developer experience.', website: 'https://statamic.com/', video: 'https://www.youtube.com/watch?v=Tq9z-Q_3_kU' }, { id: 'wintercms', name: 'Winter CMS (Laravel)', description: 'A community-driven fork of October CMS, offering a back-to-basics approach with a focus on speed, security, and simplicity.', website: 'https://wintercms.com/', video: 'https://www.youtube.com/watch?v=U-g0_m_fA_I' }, { id: 'hygraph', name: 'Hygraph', description: 'A federated content platform that allows you to connect and manage content from various sources through a single API.', website: 'https://hygraph.com/', video: 'https://www.youtube.com/watch?v=Yj2e04a-5FY' }, ],
    'ai-model': [ 
        { id: 'gemini', name: 'Google Gemini', description: 'A powerful family of natively multimodal models, designed to understand and process text, images, audio, and video.', website: 'https://gemini.google.com/', video: 'https://www.youtube.com/watch?v=jV1vkHv4Ofs' }, 
        { id: 'claude', name: 'Anthropic Claude', description: 'A family of large language models renowned for strong performance in creative writing, complex reasoning, and nuanced text generation.', website: 'https://www.anthropic.com/', video: 'https://www.youtube.com/watch?v=7t1fHrN0-pI' }, 
        { id: 'openai-gpt', name: 'OpenAI GPT-4o', description: 'A highly advanced multimodal model from OpenAI, capable of processing and generating text, audio, and image content.', website: 'https://openai.com/', video: 'https://www.youtube.com/watch?v=oZ9pcoG49Gk' }, 
        { id: 'ollama', name: 'Ollama (Local LLM)', description: 'Run large language models like Llama 3 and others locally on your own machine for privacy and control.', website: 'https://ollama.com/', video: 'https://www.youtube.com/watch?v=9ayACi_y_O' },
        { id: 'lm-studio', name: 'LM Studio (Google)', description: 'Discover, download, and run local LLMs from a user-friendly desktop application.', website: 'https://lmstudio.ai/' },
    ],
    'ai-video': [ { id: 'heygen', name: 'HeyGen', description: 'An AI video platform for creating engaging videos with generative avatars and voice cloning for business use cases.', website: 'https://www.heygen.com/', video: 'https://www.youtube.com/watch?v=cUMc5r1An-A' }, { id: 'tavus', name: 'Tavus', description: 'An AI video personalization platform that automatically generates unique videos of you for thousands of recipients.', website: 'https://www.tavus.io/', video: 'https://www.youtube.com/watch?v=LqgQ52d32a4' }, { id: 'pictory', name: 'Pictory AI', description: 'An AI tool that automatically creates short, highly-shareable branded videos from your long-form content.', website: 'https://pictory.ai/', video: 'https://www.youtube.com/watch?v=iZ5a1XieHj4' }, { id: 'invideo', name: 'InVideo', description: 'An online video editor with templates, stock media, and AI tools to make professional videos quickly and easily.', website: 'https://invideo.io/', video: 'https://www.youtube.com/watch?v=s45Vf2a2o' }, { id: 'veo', name: 'Google Veo', description: 'Google\'s most capable generative video model, creating high-quality, realistic video clips from text and image prompts.', website: 'https://deepmind.google/technologies/veo/', video: 'https://www.youtube.com/watch?v=K8e95e1dcI' }, ],
    crm: [ 
        { id: 'gohighlevel', name: 'GoHighLevel', description: 'An all-in-one sales and marketing platform for agencies and small businesses, providing CRM, funnels, and automation.', website: 'https://www.gohighlevel.com/', video: 'https://www.youtube.com/watch?v=Sg_mKxYy9A' },
        { id: 'hubspot', name: 'HubSpot', description: 'A leading CRM platform with tools for marketing, sales, customer service, and content management.', website: 'https://www.hubspot.com/' },
        { id: 'salesforce', name: 'Salesforce', description: 'The #1 AI CRM, uniting your marketing, sales, service, commerce, and IT teams from anywhere.', website: 'https://www.salesforce.com/' },
    ],
    payment: [ { id: 'stripe', name: 'Stripe', description: 'A developer-first payments platform with powerful APIs for handling online transactions, subscriptions, and more.', website: 'https://stripe.com/', video: 'https://www.youtube.com/watch?v=p3--gI67g' }, { id: 'paypal', name: 'PayPal', description: 'A globally recognized and trusted payment provider, offering a simple way to accept payments online.', website: 'https://www.paypal.com/', video: 'https://www.youtube.com/watch?v=3MUnSaim_w' }, { id: 'bitpay', name: 'BitPay', description: 'A leading crypto payment processor that allows merchants to accept cryptocurrencies and receive settlement in fiat.', website: 'https://bitpay.com/', video: 'https://www.youtube.com/watch?v=t3-w2t3t2o' }, { id: 'coinbase-commerce', name: 'Coinbase Commerce', description: 'A straightforward solution for businesses to accept cryptocurrency payments from a trusted brand in the crypto space.', website: 'https://commerce.coinbase.com/', video: 'https://www.youtube.com/watch?v=Js-Q_qQ' }, ],
    hosting: [ { id: 'vercel', name: 'Vercel (JS Platform)', description: 'The platform from the creators of Next.js.Offers seamless git-based deployment and a global edge network.', website: 'https://vercel.com/', video: 'https://www.youtube.com/watch?v=f5h_3I4p-I' }, { id: 'netlify', name: 'Netlify (JS Platform)', description: 'A powerful platform for building and deploying modern Jamstack web projects.', website: 'https://www.netlify.com/', video: 'https://www.youtube.com/watch?v=3W9p3S' }, { id: 'cloudflare-pages', name: 'Cloudflare Pages (JS Platform)', description: 'A Jamstack platform for frontend developers to collaborate and deploy websites.', website: 'https://pages.cloudflare.com/', video: 'https://www.youtube.com/watch?v=1YVj' }, { id: 'render', name: 'Render (JS Platform)', description: 'A unified cloud to build and run all your apps and websites with free TLS certificates, a global CDN, and DDoS protection.', website: 'https://render.com/', video: 'https://www.youtube.com/watch?v=dC_i4y_2h2Y' }, { id: 'replit', name: 'Replit (JS Platform)', description: 'An online IDE and hosting platform that allows for rapid development and deployment directly from the browser.', website: 'https://replit.com/', video: 'https://www.youtube.com/watch?v=20t3-I4A2dM' }, { id: 'hostinger', name: 'Hostinger (VPS)', description: 'A popular and affordable web hosting provider offering a range of services from shared hosting to VPS and cloud plans.', website: 'https://www.hostinger.com/', video: 'https://www.youtube.com/watch?v=Gg_g' }, { id: 'bluehost', name: 'Bluehost (VPS)', description: 'A leading web hosting solutions company, specializing in WordPress and offering a variety of hosting services.', website: 'https://www.bluehost.com/', video: 'https://www.youtube.com/watch?v=z4c94s9A-l8' }, { id: 'siteground', name: 'SiteGround (VPS)', description: 'A web hosting company known for top-rated customer support and fast, reliable hosting services.', website: 'https://www.siteground.com/', video: 'https://www.youtube.com/watch?v=T9uMWV3f6gY' }, { id: 'contabo', name: 'Contabo (VPS)', description: 'A German hosting company offering powerful and affordable VPS and dedicated servers with a focus on performance.', website: 'https://contabo.com/', video: 'https://www.youtube.com/watch?v=k2v_q4_w5_g' }, { id: 'godaddy', name: 'GoDaddy (VPS)', description: 'A major domain registrar and web hosting company providing a wide range of online services, including VPS hosting.', website: 'https://www.godaddy.com/', video: 'https://www.youtube.com/watch?v=i_pA9f4S_Yc' }, { id: 'hostgator', name: 'HostGator (VPS)', description: 'A global provider of web hosting and related services, offering VPS plans for growing websites.', website: 'https://www.hostgator.com/', video: 'https://www.youtube.com/watch?v=wKOA7_gE5A' }, { id: 'ionos', name: 'IONOS (1&1) (VPS)', description: 'A web hosting and cloud partner for small and medium-sized businesses, offering a wide array of products.', website: 'https://www.ionos.com/', video: 'https://www.youtube.com/watch?v=0_2Xn9g_t_g' }, ],
    siteCreation: [
        { id: 'cursor', name: 'Cursor', description: 'The AI-first code editor, designed for building software with LLMs at its core.', website: 'https://cursor.sh/' },
        { id: 'vscode', name: 'VS Code', description: 'A free, powerful, and extensible code editor from Microsoft that has become an industry standard.', website: 'https://code.visualstudio.com/' },
        { id: 'lovable', name: 'Lovable', description: 'An AI-powered platform to build web applications from scratch, describing them in plain English.', website: 'https://lovable.dev/' },
        { id: 'windsurf', name: 'Windsurf', description: 'A conceptual AI tool for rapid site generation and development, mentioned in planning docs.', website: '#' },
        { id: 'webstudio', name: 'Webstudio', description: 'An open-source visual development platform, seen as an alternative to Webflow.', website: 'https://webstudio.is/' },
        { id: 'grapesjs', name: 'GrapesJS', description: 'An open-source, multi-purpose, Web Builder Framework which combines different tools to help you build HTML templates.', website: 'https://grapesjs.com/' },
        { id: 'databutton', name: 'DataButton', description: 'Build and deploy data apps, dashboards, and AI agents directly from your browser.', website: 'https://www.databutton.com/' },
    ],
    uiuxTools: [
        { id: 'figma', name: 'Figma', description: 'The leading collaborative interface design tool for creating, testing, and shipping better designs.', website: 'https://www.figma.com/' },
        { id: 'relume', name: 'Relume', description: 'Build websites in hours, not months with the world\'s largest library of Figma & Webflow components.', website: 'https://www.relume.io/' },
        { id: 'shadcn-ui', name: 'shadcn/ui', description: 'Beautifully designed components that you can copy and paste into your apps. Accessible. Customizable. Open Source.', website: 'https://ui.shadcn.com/' },
        { id: 'lucide-react', name: 'Lucide React', description: 'A beautiful and consistent open-source icon set, provided as a React library.', website: 'https://lucide.dev/' },
        { id: 'anima', name: 'Anima', description: 'A design-to-code platform that lets you create interactive prototypes in Figma and export them to HTML, React, or Vue.', website: 'https://www.animaapp.com/' },
    ],
    agentTools: [
        { id: 'n8n', name: 'n8n', description: 'A powerful, self-hostable workflow automation tool to connect various services and build complex automations.', website: 'https://n8n.io/' },
        { id: 'zapier', name: 'Zapier', description: 'The most popular no-code automation tool, connecting thousands of web apps to automate repetitive tasks.', website: 'https://zapier.com/' },
        { id: 'make', name: 'Make', description: 'A visual platform for anyone to design, build, and automate anything from tasks and workflows to apps and systems.', website: 'https://www.make.com/' },
        { id: 'langgraph', name: 'LangGraph', description: 'A library for building stateful, multi-actor applications with LLMs, built on top of LangChain.', website: 'https://langchain-ai.github.io/langgraph/' },
        { id: 'langchain', name: 'LangChain', description: 'A framework for developing applications powered by large language models (LLMs).', website: 'https://www.langchain.com/' },
        { id: 'lindy', name: 'Lindy', description: 'An AI-powered assistant that can handle repetitive tasks like scheduling, email drafting, and more.', website: 'https://www.lindy.ai/' },
        { id: 'relevance-ai', name: 'Relevance AI', description: 'A low-code platform for building and deploying AI agents and workflows for your business data.', website: 'https://relevance.ai/' },
    ],
    mcpServers: [
        { id: 'supabase-mcp', name: 'Supabase MCP', description: 'A Model-Context-Protocol server for interacting with Supabase, enabling agents to query databases.', website: 'https://github.com/supabase-community/mcp-server-supabase' },
        { id: 'github-mcp', name: 'GitHub MCP', description: 'A conceptual MCP server for allowing AI agents to interact with GitHub repositories, issues, and actions.', website: '#' },
        { id: 'docker-mcp', name: 'Docker MCP', description: 'A conceptual MCP server for managing Docker containers and images through an agentic interface.', website: '#' },
        { id: 'crawl4ai-mcp', name: 'Crawl4AI MCP', description: 'An MCP server built for AI-powered web scraping and data retrieval for RAG pipelines.', website: 'https://github.com/coleam00/mcp-crawl-server' },
        { id: 'brave-mcp', name: 'Brave Search MCP', description: 'An MCP server to provide AI agents with access to the Brave Search API for real-time web information.', website: 'https://github.com/modelcontextprotocol/mcp-brave-search' },
        { id: 'figma-mcp', name: 'Figma MCP', description: 'A conceptual MCP server for agentic interaction with Figma designs and prototypes.', website: '#' },
        { id: 'gdrive-mcp', name: 'Google Drive MCP', description: 'A conceptual MCP server for agents to read, write, and manage files in Google Drive.', website: '#' },
        { id: 'gmaps-mcp', name: 'Google Maps MCP', description: 'A conceptual MCP server to provide agents with location data, routing, and place information.', website: '#' },
        { id: 'playwright-mcp', name: 'Playwright MCP', description: 'A conceptual MCP server to allow agents to control a Playwright browser for advanced web automation.', website: '#' },
    ],
    videoHosting: [
        // === SELF-HOSTED OPEN SOURCE PLATFORMS ===
        { id: 'peertube', name: 'PeerTube', description: 'Federated video platform using ActivityPub. Self-hosted, P2P streaming, plugins, no ads. AGPL-3.0 license.', website: 'https://joinpeertube.org/', github: 'https://github.com/Chocobozzz/PeerTube', screenshot: 'https://lutim.cpy.re/9CLXh0Ys.png', license: 'AGPL-3.0', openSource: true },
        { id: 'mediacms', name: 'MediaCMS', description: 'Modern YouTube clone built with Django + React. HLS streaming, transcoding, REST API. Docker ready. AGPL-3.0.', website: 'https://mediacms.io/', github: 'https://github.com/mediacms-io/mediacms', screenshot: 'https://raw.githubusercontent.com/mediacms-io/mediacms/main/docs/images/index.jpg', license: 'AGPL-3.0', openSource: true },
        { id: 'ghost', name: 'Ghost', description: 'Publishing platform with native memberships, subscriptions, newsletters. Video embeds + API. MIT license.', website: 'https://ghost.org/', github: 'https://github.com/TryGhost/Ghost', screenshot: 'https://user-images.githubusercontent.com/353959/169805900-66be5b89-0859-4816-8da9-528ed7534704.png', license: 'MIT', openSource: true },
        { id: 'classroomio', name: 'ClassroomIO', description: 'Open source LMS with video courses, AI tutor, community features. Built for educators. Self-hostable.', website: 'https://classroomio.com/', github: 'https://github.com/classroomio/classroomio', screenshot: 'https://raw.githubusercontent.com/classroomio/classroomio/main/apps/classroomio-com/static/classroomio-courses.png', license: 'AGPL-3.0', openSource: true },
        { id: 'owncast', name: 'Owncast', description: 'Self-hosted live streaming server. OBS-compatible, chat, webhooks, embeddable player. Twitch alternative.', website: 'https://owncast.online/', github: 'https://github.com/owncast/owncast', screenshot: 'https://owncast.online/images/owncast-splash.png', license: 'MIT', openSource: true },
        { id: 'openedx', name: 'Open edX', description: 'Enterprise LMS powering edX.org. Video lectures, certificates, analytics. Python/Django. AGPL-3.0.', website: 'https://openedx.org/', github: 'https://github.com/openedx', screenshot: '', license: 'AGPL-3.0', openSource: true },
        { id: 'kaltura-ce', name: 'Kaltura CE', description: 'Community edition of Kaltura video platform. Enterprise-grade transcoding, analytics, distribution.', website: 'https://corp.kaltura.com/', github: 'https://github.com/kaltura', screenshot: '', license: 'AGPL-3.0', openSource: true },
        { id: 'odysee', name: 'Odysee/LBRY', description: 'Blockchain-based video platform with monetization. LBRY protocol allows self-hosting content nodes.', website: 'https://odysee.com/', github: 'https://github.com/lbryio', screenshot: '', license: 'MIT', openSource: true },
        // === MANAGED VIDEO HOSTING (API-FIRST) ===
        { id: 'mux', name: 'Mux', description: 'Developer-first video API. HLS streaming, analytics, AI captions. Usage-based pricing. Great for custom builds.', website: 'https://www.mux.com/', github: '', screenshot: '', license: 'Proprietary', openSource: false },
        { id: 'cf-stream', name: 'Cloudflare Stream', description: 'Video streaming integrated with Cloudflare CDN. Per-minute pricing, global delivery, low latency.', website: 'https://www.cloudflare.com/products/cloudflare-stream/', github: '', screenshot: '', license: 'Proprietary', openSource: false },
        { id: 'bunny-stream', name: 'Bunny Stream', description: 'Affordable video CDN with transcoding, DRM, and player. Pay-per-use model. Great value.', website: 'https://bunny.net/stream/', github: '', screenshot: '', license: 'Proprietary', openSource: false },
        // === MAINSTREAM PLATFORMS ===
        { id: 'youtube', name: 'YouTube', description: 'The world\'s largest video sharing platform, ideal for public content, brand channels, and broad reach.', website: 'https://www.youtube.com/' },
        { id: 'vimeo', name: 'Vimeo', description: 'A high-quality video platform favored by professionals for its powerful tools and ad-free experience.', website: 'https://vimeo.com/' },
        { id: 'facebook', name: 'Facebook Video', description: 'Integrated video hosting for sharing content natively within the Facebook ecosystem to engage followers.', website: 'https://www.facebook.com/watch/' },
        { id: 'instagram', name: 'Instagram Video/Reels', description: 'Platform for short-form and long-form vertical video content, ideal for mobile-first audiences.', website: 'https://www.instagram.com/' },
        { id: 'patreon', name: 'Patreon (Membership)', description: 'A membership platform that makes it easy for creators to get paid, offering exclusive video hosting for supporters.', website: 'https://www.patreon.com/' },
        { id: 'skool', name: 'Skool (Membership)', description: 'A community platform for creators to host courses, events, and paid memberships, with integrated video features.', website: 'https://www.skool.com/' },
        { id: 'orange-logic', name: 'Orange Logic (DAM)', description: 'Best for handling large, high-resolution video files, including formats like 8K video and raw formats.', website: 'https://www.orangelogic.com/' },
        { id: 'mediavalet', name: 'MediaValet (DAM)', description: 'Excels in automated video transcription and translation using AI-powered audio-video intelligence (AVI).', website: 'https://www.mediavalet.com/' },
        { id: 'picsio', name: 'Pics.io (DAM)', description: 'Ideal for AI-driven video tagging and features a video management interface for editing and tracking revisions.', website: 'https://pics.io/' },
        { id: 'acquia-dam', name: 'Acquia DAM (Widen)', description: 'Known for integrated video captioning and includes a video creator tool with AI assistance.', website: 'https://www.acquia.com/products/dam' },
        { id: 'bynder', name: 'Bynder (DAM)', description: 'Strong in dynamic asset transformation and optimization, ensuring videos are in the best format for any platform.', website: 'https://www.bynder.com/' },
        { id: 'air-dam', name: 'Air (DAM)', description: 'Excellent for centralized asset feedback and collaboration, with a visual workspace tailored for creative teams.', website: 'https://www.air.inc/' },
        { id: 'cloudinary', name: 'Cloudinary (DAM)', description: 'Specializes in image and video scaling, optimization, and delivery with an API-first platform.', website: 'https://cloudinary.com/' },
        { id: 'intelligencebank', name: 'IntelligenceBank (DAM)', description: 'Offers an end-to-end content production solution, combining DAM, brand asset management, and marketing management.', website: 'https://www.intelligencebank.com/' },
        { id: 'canto', name: 'Canto (DAM)', description: 'Focuses on brand asset organization with smart tagging, facial recognition, and a Media Delivery Cloud.', website: 'https://www.canto.com/' },
        { id: 'imagen-dam', name: 'Imagen (DAM)', description: 'Strong in media content distribution and archiving of high-resolution videos.', website: 'https://imagen.io/' },
        { id: 'aem-assets', name: 'AEM Assets (DAM)', description: 'Best for enterprise-level integration within the Adobe ecosystem.', website: 'https://business.adobe.com/products/experience-manager/assets.html' },
        { id: 'daminion', name: 'Daminion (DAM)', description: 'A comprehensive DAM with strong support for video asset management, particularly for larger files and production workflows.', website: 'https://daminion.net/' },
        { id: 'wistia', name: 'Wistia (Marketing)', description: 'Focuses on video marketing with features for lead generation, analytics, and SEO optimization.', website: 'https://wistia.com/' },
        { id: 'vidyard', name: 'Vidyard (Sales)', description: 'Designed for B2B sales, offering features for creating personalized video messages and tracking viewer actions.', website: 'https://www.vidyard.com/' },
        { id: 'panopto', name: 'Panopto (Internal)', description: 'Specifically built for internal knowledge sharing and training within organizations and educational institutions.', website: 'https://www.panopto.com/' },
        { id: 'vidme', name: 'Vidme.io (Defunct)', description: 'A former video hosting community, mentioned in planning documents. No longer operational.', website: '#' },
    ],
    vectorDB: [
        { id: 'pinecone', name: 'Pinecone', description: 'A managed, cloud-native vector database with a simple API and no infrastructure hassles.', website: 'https://www.pinecone.io/' },
        { id: 'weaviate', name: 'Weaviate', description: 'An open-source, AI-native vector database that helps developers create intuitive and reliable AI-powered applications.', website: 'https://weaviate.io/' },
        { id: 'milvus', name: 'Milvus', description: 'An open-source vector database built for scalable similarity search for AI applications.', website: 'https://milvus.io/' },
        { id: 'qdrant', name: 'Qdrant', description: 'An open-source vector similarity search engine and vector database, written in Rust.', website: 'https://qdrant.tech/' },
        { id: 'chromadb', name: 'ChromaDB', description: 'The open-source embedding database. The easiest way to build LLM apps with memory.', website: 'https://www.trychroma.com/' },
        { id: 'pgvector', name: 'PGVector', description: 'An open-source vector similarity search extension for PostgreSQL. Ideal for adding AI features to an existing Postgres DB.', website: 'https://github.com/pgvector/pgvector' },
        { id: 'elasticsearch-vector', name: 'Elasticsearch Vector Search', description: 'Leverages the power of Elasticsearch for scalable and fast vector search alongside text search.', website: 'https://www.elastic.co/elasticsearch/vector-search' },
    ]
};

const multiSelectCategories = ['mcpServers', 'uiuxTools', 'videoHosting', 'ai-model', 'payment', 'hosting'];
let currentModalCategory = null;
let selections = {};

function populateControls() {
    const defaults = {
        archetype: 'creator-hub',
        frontend: 'nextjs',
        backend: 'supabase',
        cms: 'strapi',
        'ai-model': ['gemini'],
        'ai-video': 'heygen',
        crm: 'hubspot',
        payment: ['stripe'],
        hosting: ['vercel'],
        siteCreation: 'cursor',
        uiuxTools: ['figma'],
        agentTools: 'n8n',
        mcpServers: ['supabase-mcp'],
        videoHosting: ['youtube'],
        vectorDB: 'pinecone'
    };

    for (const category in techData) {
        const container = document.getElementById(category) || document.getElementById(`${category}-btn`);
        if (!container) continue;

        const defaultValue = defaults[category] || (multiSelectCategories.includes(category) ? [] : 'none');
        selections[category] = Array.isArray(defaultValue) ? defaultValue : [defaultValue];
        
        if (multiSelectCategories.includes(category)) {
            updateModalButtonText(category);
        } else {
            container.innerHTML = ''; 
            techData[category].forEach(item => { 
                const option = document.createElement('option'); 
                option.value = item.id; 
                option.textContent = item.name; 
                container.appendChild(option); 
            });
            const noneOption = document.createElement('option');
            noneOption.value = 'none';
            noneOption.textContent = 'None';
            container.appendChild(noneOption);
            container.value = selections[category][0];
            container.addEventListener('change', (e) => {
                selections[category] = e.target.value === 'none' ? [] : [e.target.value];
            });
        }
    }
}

function updateModalButtonText(category) {
    const button = document.getElementById(`${category}-btn`);
    if (!button) return;
    const count = selections[category]?.length || 0;
    if (count === 0) {
        button.textContent = 'Select...';
    } else if (count === 1) {
        const singleSelectionId = selections[category][0];
        const item = techData[category].find(d => d.id === singleSelectionId);
        button.textContent = item ? item.name : '1 selected';
    } else {
        button.textContent = `${count} selected`;
    }
}

function openModal(category) {
    currentModalCategory = category;
    const modal = document.getElementById('multi-select-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    modalTitle.textContent = `Select ${getCategoryTitle(category)}`;
    modalContent.innerHTML = '';

    techData[category].forEach(item => {
        const isSelected = selections[category]?.includes(item.id);
        const html = `
            <div>
                <input type="checkbox" id="modal-${item.id}" value="${item.id}" class="hidden multi-select-input" ${isSelected ? 'checked' : ''}>
                <label for="modal-${item.id}" class="multi-select-label">${item.name}</label>
            </div>
        `;
        modalContent.innerHTML += html;
    });
    modal.style.display = 'flex';
}

function saveModalSelections() {
    if (!currentModalCategory) return;
    const modalContent = document.getElementById('modal-content');
    const checkedInputs = modalContent.querySelectorAll('input:checked');
    selections[currentModalCategory] = Array.from(checkedInputs).map(input => input.value);
    updateModalButtonText(currentModalCategory);
    closeModal();
}

function closeModal() {
    const modal = document.getElementById('multi-select-modal');
    modal.style.display = 'none';
    currentModalCategory = null;
}

function getCardIcon(category, id) {
    // Standardized size, silver color, 3D effect
    const size = 108;
    const stroke = '#d1d5db'; // silver
    const strokeWidth = 2;
    // SVG filter for 3D effect
    const filter = `<filter id="icon3d" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="#fff" flood-opacity="0.18"/><feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#000" flood-opacity="0.22"/></filter>`;
    // All icons fit in 32x32 centered in 36x36
    const icons = {
        archetype: `<svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><defs>${filter}</defs><rect x="7" y="7" width="22" height="22" rx="6" fill="none" filter="url(#icon3d)"/><path d="M18 12v12M12 18h12" filter="url(#icon3d)"/></svg>`,
        frontend: `<svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><defs>${filter}</defs><rect x="6" y="10" width="24" height="16" rx="4" fill="none" filter="url(#icon3d)"/><path d="M10 14h16M10 18h16M10 22h8" filter="url(#icon3d)"/></svg>`,
        backend: `<svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><defs>${filter}</defs><ellipse cx="18" cy="18" rx="12" ry="7" fill="none" filter="url(#icon3d)"/><path d="M6 18v7c0 3.9 5.4 7 12 7s12-3.1 12-7v-7" filter="url(#icon3d)"/></svg>`,
        cms: `<svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><defs>${filter}</defs><rect x="8" y="8" width="20" height="20" rx="5" fill="none" filter="url(#icon3d)"/><path d="M12 12h12M12 18h12M12 24h8" filter="url(#icon3d)"/></svg>`,
        'ai-model': `<svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><defs>${filter}</defs><circle cx="18" cy="18" r="10" fill="none" filter="url(#icon3d)"/><path d="M18 8v4M18 24v4M8 18h4M24 18h4M12.9 12.9l2.8 2.8M20.3 20.3l2.8 2.8M12.9 23.1l2.8-2.8M20.3 15.7l2.8-2.8" filter="url(#icon3d)"/></svg>`,
        'ai-video': `<svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><defs>${filter}</defs><rect x="8" y="12" width="20" height="12" rx="4" fill="none" filter="url(#icon3d)"/><polygon points="18,16 24,18 18,20" fill="${stroke}" stroke="none" filter="url(#icon3d)"/></svg>`,
        crm: `<svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><defs>${filter}</defs><circle cx="18" cy="14" r="5" fill="none" filter="url(#icon3d)"/><path d="M8 28c0-4 4.5-7 10-7s10 3 10 7" filter="url(#icon3d)"/></svg>`,
        payment: `<svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><defs>${filter}</defs><rect x="8" y="14" width="20" height="8" rx="3" fill="none" filter="url(#icon3d)"/><path d="M12 18h8" filter="url(#icon3d)"/></svg>`,
        hosting: `<svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><defs>${filter}</defs><ellipse cx="18" cy="18" rx="12" ry="7" fill="none" filter="url(#icon3d)"/><rect x="10" y="14" width="16" height="8" rx="2" fill="none" filter="url(#icon3d)"/></svg>`,
        videoHosting: `<svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><defs>${filter}</defs><rect x="8" y="12" width="20" height="12" rx="4" fill="none" filter="url(#icon3d)"/><polygon points="16,16 24,18 16,20" fill="${stroke}" stroke="none" filter="url(#icon3d)"/></svg>`,
        vectorDB: `<svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><defs>${filter}</defs><ellipse cx="18" cy="18" rx="12" ry="7" fill="none" filter="url(#icon3d)"/><ellipse cx="18" cy="18" rx="6" ry="3" fill="none" filter="url(#icon3d)"/></svg>`,
        uiuxTools: `<svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><defs>${filter}</defs><rect x="10" y="10" width="16" height="16" rx="4" fill="none" filter="url(#icon3d)"/><rect x="14" y="14" width="8" height="8" rx="2" fill="none" filter="url(#icon3d)"/></svg>`,
        mcpServers: `<svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><defs>${filter}</defs><rect x="8" y="14" width="20" height="8" rx="3" fill="none" filter="url(#icon3d)"/><path d="M12 18h8" filter="url(#icon3d)"/></svg>`,
    };
    return icons[category] || `<svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><defs>${filter}</defs><circle cx="18" cy="18" r="16" fill="none" filter="url(#icon3d)"/></svg>`;
}

function generatePlan() {
    const resultsContainer = document.getElementById('results-container');
    const aiAnalysisButtonContainer = document.getElementById('ai-analysis-button-container');
    const aiAnalysisContainer = document.getElementById('ai-analysis-container');
    const generateBtn = document.getElementById('generate-plan');
    
    generateBtn.classList.add('is-thinking');
    generateBtn.disabled = true;

    setTimeout(() => {
        aiAnalysisContainer.innerHTML = '';
        resultsContainer.innerHTML = '';

        let hasSelection = false;
        for(const category in selections) {
            if (selections[category].length > 0 && !(selections[category].length === 1 && selections[category][0] === 'none')) {
                hasSelection = true;
                break;
            }
        }

        if (!hasSelection) {
            resultsContainer.innerHTML = '<p class="text-center text-gray-400">Please select at least one tool to generate a plan.</p>';
            aiAnalysisButtonContainer.style.display = 'none';
        } else {
            let html = '<h2 class="text-3xl font-bold text-center mb-8"><span id="sweep-highlight-text" class="sweep-highlight vidismart-yellow">Your Customized Tech Stack</span></h2>';
            html += '<div class="grid grid-cols-1 md:grid-cols-2 results-grid-cols-3 gap-6">';

            for (const category in selections) {
                if (!Array.isArray(selections[category])) continue;
                
                selections[category].forEach(id => {
                    if (id !== 'none') {
                        const item = techData[category]?.find(d => d.id === id);
                        if (item) {
                            let videoLink = `https://www.youtube.com/results?search_query=${encodeURIComponent(item.name.split('(')[0].trim())}`;
                            html += `<div class="result-card flex flex-col">
                                <div class="card-icon">${getCardIcon(category, item.id)}</div>
                                <h3 class="text-xl font-bold vidismart-yellow mb-2">${getCategoryTitle(category)}</h3>
                                <h4 class="text-lg font-semibold text-white mb-3">${item.name}</h4>
                                <p class="text-gray-400 flex-grow mb-4">${item.description}</p>
                                <div class="card-actions mt-auto flex space-x-3">
                                    ${item.website && item.website !== '#' ? `<a href="${item.website}" target="_blank" rel="noopener noreferrer" class="btn btn-sweep text-center font-semibold">Website</a>` : ''}
                                    <a href="${videoLink}" target="_blank" rel="noopener noreferrer" class="btn btn-sweep text-center font-semibold">Watch Video</a>
                                </div>
                            </div>`;
                        }
                    }
                });
            }
            html += '</div>';
            
            resultsContainer.innerHTML = html;
            aiAnalysisButtonContainer.style.display = 'block';
            // Add sweep-highlight class to the heading span (retrigger animation)
            const sweepSpan = document.getElementById('sweep-highlight-text');
            if (sweepSpan) {
                sweepSpan.classList.remove('sweep-highlight'); // Remove if present to retrigger
                void sweepSpan.offsetWidth;
                sweepSpan.classList.add('sweep-highlight');
            }
        }
        
        generateBtn.classList.remove('is-thinking');
        generateBtn.disabled = false;

        // Scroll so the generate button is 50px from the top after generating the plan
        setTimeout(() => {
          generateBtn.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => { window.scrollBy({ top: -50, left: 0, behavior: 'smooth' }); }, 350);
        }, 50);
    }, 1000);
}

function getCategoryTitle(categoryKey) {
    const titles = { 
        archetype: 'Project Archetype', 
        frontend: 'Frontend Framework', 
        backend: 'Backend & Database', 
        cms: 'Content Management (CMS)', 
        'ai-model': 'Primary AI Models', 
        'ai-video': 'AI Video Creation Tool', 
        crm: 'CRM & Marketing', 
        payment: 'Payment Gateways', 
        hosting: 'Hosting & Deployment',
        siteCreation: 'Ai Site Creation',
        uiuxTools: 'UI/UX Design Tools',
        agentTools: 'Agentified Agent Army',
        mcpServers: 'MCP Servers',
        videoHosting: 'Video Hosting Channels',
        vectorDB: 'Vector Database'
    };
    return titles[categoryKey] || categoryKey;
}

async function getAiAnalysis() {
    const aiAnalysisContainer = document.getElementById('ai-analysis-container');
    aiAnalysisContainer.innerHTML = '<div class="loader"></div>';

    const selectedTech = [];
    for (const category in selections) {
        if (!Array.isArray(selections[category])) continue;

        selections[category].forEach(id => {
            if (id !== 'none') {
                const item = techData[category].find(d => d.id === id);
                if (item) selectedTech.push(item.name);
            }
        });
    }

    if (selectedTech.length === 0) {
         aiAnalysisContainer.innerHTML = `<div class="ai-analysis-card text-center text-gray-400"><p>Please select at least one tool to get an AI analysis.</p></div>`;
         return;
    }

    const prompt = `
        As an expert solutions architect, analyze the following technology stack selected for a new web project: ${selectedTech.join(', ')}.

        Provide a concise analysis covering these points:
        1.  **Compatibility & Synergies:** How do these technologies work well together? What are the key benefits of this combination?
        2.  **Potential Challenges:** What are the potential pitfalls or difficulties to watch out for with this specific stack?
        3.  **Estimated Monthly Cost:** Based on the free or lowest-cost tiers of these services, provide a rough monthly cost estimate. Assume very low usage: a maximum of 500 hits/visits per month and under 1GB of total data traffic/transfer. Clearly state these usage limits in your cost analysis.
        4.  **Key Recommendations:** What are 2-3 actionable recommendations for a developer starting a project with this stack?

        Format the response clearly with headings for each section.
    `;

    try {
        // NOTE TO USER: This fetch call will fail if you open this file directly in a browser.
        // It is designed to work when deployed on a hosting platform (like Vercel or Netlify)
        // that supports serverless functions.
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });

        if (!response.ok) { throw new Error(`API request failed with status ${response.status}`); }
        
        const result = await response.json();
        const formattedHtml = result.analysis.replace(/\*\*(.*?)\*\*/g, '<h4>$1</h4>').replace(/\n/g, '<br>');
        aiAnalysisContainer.innerHTML = `<div class="ai-analysis-card">${formattedHtml}</div>`;

    } catch (error) {
        console.error("Error fetching AI analysis:", error);
        aiAnalysisContainer.innerHTML = `<div class="ai-analysis-card text-red-400"><p>Sorry, there was an error getting the AI analysis. This is expected if you are running this file locally. To make this work, you must deploy it to a hosting provider like Vercel or Netlify and set up a serverless function.</p></div>`;
    }
}

// --- Event Listeners ---
document.getElementById('generate-plan').addEventListener('click', generatePlan);
document.getElementById('get-ai-analysis').addEventListener('click', getAiAnalysis);

document.querySelectorAll('.modal-btn').forEach(button => {
    button.addEventListener('click', () => openModal(button.dataset.category));
});

document.getElementById('modal-close-btn').addEventListener('click', closeModal);
document.getElementById('modal-save-btn').addEventListener('click', saveModalSelections);

document.getElementById('modal-clear-btn').addEventListener('click', () => {
    if (currentModalCategory) {
        const modalContent = document.getElementById('modal-content');
        modalContent.querySelectorAll('input:checked').forEach(input => input.checked = false);
    }
});

window.onload = () => { populateControls(); };

// --- Cloud and Sheep Overlay Animation ---
(function() {
  const canvas = document.getElementById('vidismart-logo');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;

  // Mouse movement tracking for electron reactivity
  let mouse = { x: cx, y: cy, dx: 0, dy: 0, lastX: cx, lastY: cy };
  canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left);
    const my = (e.clientY - rect.top);
    mouse.dx = mx - mouse.x;
    mouse.dy = my - mouse.y;
    mouse.lastX = mouse.x;
    mouse.lastY = mouse.y;
    mouse.x = mx;
    mouse.y = my;
  });
  // Decay mouse movement for smoothness
  function decayMouse() {
    mouse.dx *= 0.92;
    mouse.dy *= 0.92;
    requestAnimationFrame(decayMouse);
  }
  decayMouse();

  // Nucleus properties (darker blue, 3D sphere look)
  const nucleusRadius = 48;
  const nucleusCoreColor = '#0a1e3a'; // deep blue

  // Electron properties (longer, brighter tails)
  const electrons = [
    { r: 90, a: 0, speed: 0.018, tilt: 0 },
    { r: 70, a: Math.PI/2, speed: 0.022, tilt: Math.PI/5 },
    { r: 80, a: Math.PI, speed: 0.015, tilt: -Math.PI/4 },
    { r: 100, a: Math.PI*1.5, speed: 0.012, tilt: Math.PI/3 },
    { r: 85, a: Math.PI/3, speed: 0.017, tilt: Math.PI/1.7 },
    { r: 75, a: Math.PI/1.2, speed: 0.019, tilt: -Math.PI/2.2 }
  ];
  const electronRadius = 8 / 3;
  const electronColor = 'rgba(200,240,255,1)'; // very bright blue-white
  const tailLength = 60;
  const tailColor = 'rgba(255,255,255,'; // white tail

  electrons.forEach(e => e.trail = []);

  // Draw a 3D shaded sphere for the nucleus
  function drawNucleus(t) {
    t = t || 0;
    ctx.save();
    // Animate highlight center for dual-axis rotation
    const highlightOrbit = nucleusRadius / 2;
    const highlightX = cx - highlightOrbit * Math.cos(t / 900);
    const highlightY = cy - highlightOrbit * Math.sin(t / 700);
    // Smaller, more specular blue highlight
    let sphereGrad = ctx.createRadialGradient(
      highlightX, highlightY, nucleusRadius/10, // much smaller inner radius
      cx, cy, nucleusRadius
    );
    sphereGrad.addColorStop(0, '#7ecbff'); // bright blue specular
    sphereGrad.addColorStop(0.13, '#3a7bd5');
    sphereGrad.addColorStop(0.3, '#174a7c');
    sphereGrad.addColorStop(0.7, nucleusCoreColor);
    sphereGrad.addColorStop(1, '#06142e'); // shadow edge
    ctx.beginPath();
    ctx.arc(cx, cy, nucleusRadius, 0, 2*Math.PI);
    ctx.fillStyle = sphereGrad;
    ctx.shadowColor = '#0a1e3a';
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.restore();

    // Add a few tiny sparkles (random, twinkling)
    for (let i = 0; i < 5; i++) {
      const sparkleAngle = (t/400 + i*1.2) % (2*Math.PI);
      const sparkleRadius = nucleusRadius * (0.5 + 0.35 * Math.sin(t/800 + i));
      const sx = cx + Math.cos(sparkleAngle) * sparkleRadius;
      const sy = cy + Math.sin(sparkleAngle) * sparkleRadius;
      ctx.save();
      ctx.beginPath();
      ctx.arc(sx, sy, 1.1 + 0.7*Math.abs(Math.sin(t/180 + i*2)), 0, 2*Math.PI);
      ctx.globalAlpha = (0.7 + 0.3*Math.sin(t/200 + i*3)) * 0.3;
      ctx.fillStyle = '#eaf6ff';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 21;
      ctx.fill();
      ctx.restore();
    }
  }

  // Draw a gold 3D play button with animated specular highlight
  function drawPlayButton(t) {
    ctx.save();
    // Animate play button radius (zoom in/out by 5px every 7 seconds)
    const basePlayR = 28;
    const zoom = 5 * Math.sin((t || 0) / 7000 * 2 * Math.PI);
    const playR = basePlayR + zoom;
    const playCx = cx;
    const playCy = cy;
    const bevel = 3; // much smaller bevel

    // Dynamic shadow based on z-depth (zoom)
    ctx.save();
    const shadowY = playCy + playR * 0.85;
    const shadowW = playR * 1.1;
    const shadowH = playR * 0.38 + 6;
    ctx.beginPath();
    ctx.ellipse(playCx, shadowY, shadowW, shadowH, 0, 0, 2 * Math.PI);
    // Shadow blur: more diffuse when zoomed out, sharper when zoomed in
    ctx.globalAlpha = 0.22 + 0.13 * (1 - (playR - basePlayR) / 5);
    ctx.filter = `blur(${12 + 10 * (1 - (playR - basePlayR) / 5)}px)`;
    ctx.fillStyle = '#0a1e3a';
    ctx.fill();
    ctx.filter = 'none';
    ctx.globalAlpha = 1;
    ctx.restore();

    // Main gold triangle with subtle 3D bevel
    ctx.beginPath();
    ctx.moveTo(playCx - playR/2, playCy + playR/1.5);
    ctx.lineTo(playCx - playR/2, playCy - playR/1.5);
    ctx.lineTo(playCx + playR, playCy);
    ctx.closePath();
    // Gold gradient for face (center 10% darker)
    let goldGrad = ctx.createLinearGradient(playCx - playR/2, playCy - playR/1.5, playCx + playR, playCy + playR/1.5);
    goldGrad.addColorStop(0, '#e6d48c');
    goldGrad.addColorStop(0.13, '#e6c84d');
    goldGrad.addColorStop(0.35, '#d1b200');
    goldGrad.addColorStop(0.7, '#b39800');
    goldGrad.addColorStop(1, '#7a5e00');
    ctx.fillStyle = goldGrad;
    ctx.fill();
    // Dark gold 3D stroke
    ctx.save();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#6b4a00';
    ctx.shadowColor = '#b39800';
    ctx.shadowBlur = 2.5;
    ctx.beginPath();
    ctx.moveTo(playCx - playR/2, playCy + playR/1.5);
    ctx.lineTo(playCx - playR/2, playCy - playR/1.5);
    ctx.lineTo(playCx + playR, playCy);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    ctx.restore();
  }

  function drawElectron(e) {
    // Draw tail as a particle system (dots)
    for (let i = e.trail.length - 1; i > 0; i--) {
      const p = e.trail[i];
      // Fade alpha and size with distance
      const alpha = 0.13 * (i / e.trail.length) + 0.03;
      const radius = 2.2 * (i / e.trail.length) + 0.7;
      // Add random jitter for organic look
      const jitterX = (Math.random() - 0.5) * 1.2 * (1 - i / e.trail.length);
      const jitterY = (Math.random() - 0.5) * 1.2 * (1 - i / e.trail.length);
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x + jitterX, p.y + jitterY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.shadowColor = '#e0f7ff';
      ctx.shadowBlur = 8 * (i / e.trail.length);
      ctx.fill();
      ctx.restore();
    }
    // Draw electron (fuzzier, more glow, 50% transparent)
    ctx.save();
    ctx.beginPath();
    ctx.arc(e.x, e.y, electronRadius, 0, 2*Math.PI);
    ctx.fillStyle = electronColor;
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 48;
    ctx.globalAlpha = 0.25;
    ctx.fill();
    // Subtle outer blue glow
    ctx.beginPath();
    ctx.arc(e.x, e.y, electronRadius * 1.7, 0, 2*Math.PI);
    ctx.globalAlpha = 0.09;
    ctx.fillStyle = 'rgba(120,200,255,0.7)';
    ctx.shadowColor = '#b3e6ff';
    ctx.shadowBlur = 32;
    ctx.fill();
    ctx.restore();
  }

  function animate(t) {
    t = t || 0;
    ctx.clearRect(0, 0, w, h);
    drawNucleus(t);
    drawPlayButton(t);
    // Calculate mouse direction as a small tilt/phase bias
    const mx = (mouse.x - cx) / w;
    const my = (mouse.y - cy) / h;
    const mdx = mouse.dx / w;
    const mdy = mouse.dy / h;
    electrons.forEach((e, i) => {
      // Reactivity: bias tilt and phase based on mouse movement direction
      // (subtle, smooth, not too strong)
      const tiltBias = 0.18 * mx + 0.18 * mdx;
      const phaseBias = 0.18 * my + 0.18 * mdy;
      e.a += e.speed;
      // Spherical projection with mouse bias
      let phi = e.tilt + tiltBias;
      let theta = e.a + phaseBias;
      let r = e.r;
      e.x = cx + r * Math.cos(theta) * Math.sin(phi);
      e.y = cy + r * Math.sin(theta) * Math.sin(phi) + r * Math.cos(phi) * 0.25;
      // Update trail
      e.trail.push({x: e.x, y: e.y});
      if (e.trail.length > tailLength) e.trail.shift();
      drawElectron(e);
    });
    requestAnimationFrame(animate);
  }

  animate();
})();

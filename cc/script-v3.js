/* ============================================
   CARIBBEAN CONSULTANTS - INTERACTIVE LOGIC
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initStickyNav();
  initScrollReveal();
  initProjectSlider();
  initMobileMenu();
  
  // Initialize dynamic rendering if on specific pages
  if (document.getElementById('projects-grid')) {
    renderProjectsGrid('all');
    initFilters();
    injectModalHtml(); // CRITICAL: Initialize the modal container
  }
});

// 0. PROJECT DATA
const projectsData = [
  {
    id: 1,
    title: "L'Ermitage Beverly Hills",
    role: "Owner's Representative",
    location: "Beverly Hills, California",
    description: "Complete hotel transformation while maintaining five-star operations. All guest suites, lobby, restaurants, and facilities renovated to five-star standards.",
    category: "luxury",
    image: "assets/images/project-1-lermitage-hero.jpg"
  },
  {
    id: 2,
    title: "Hyatt Regency Kauai",
    role: "Owner's Representative",
    location: "Kauai, Hawaii",
    description: "Multi-year renovation and expansion of Hawaii's premier resort, including new pool complex and dining venues in collaboration with architectural firm WATG.",
    category: "luxury",
    image: "assets/images/project-2-hyatt-kauai-hero.png",
    address: "1571 Poipu Rd, Koloa, HI 96756",
    link: "https://www.hyatt.com/en-US/hotel/hawaii/grand-hyatt-kauai-resort-and-spa/kauai"
  },
  {
    id: 3,
    title: "St. Regis Fort Lauderdale",
    role: "Owner's Representative",
    location: "Fort Lauderdale, Florida",
    description: "24-story oceanfront tower with ultra-luxury residences and hotel rooms, marina, and beachfront amenities.",
    category: "luxury",
    image: "assets/images/project-3-stregis.png",
    address: "1 North Fort Lauderdale Beach Blvd, Fort Lauderdale, FL 33304",
    link: "https://www.marriott.com/en-us/hotels/fllxr-the-st-regis-fort-lauderdale-resort/overview/"
  },
  {
    id: 4,
    title: "Ritz-Carlton Reserve Dorado Beach",
    role: "Development & Construction Management",
    location: "Dorado, Puerto Rico",
    description: "$300M ultra-luxury resort with 100 rooms, 29 oceanfront estates, and two Jack Nicklaus golf courses, working alongside SB Architects.",
    category: "luxury",
    image: "assets/images/project-4-dorado-hero.png",
    address: "100 Dorado Beach Drive, Dorado, Puerto Rico",
    link: "https://www.ritzcarlton.com/en/hotels/puerto-rico/dorado-beach"
  },
  {
    id: 5,
    title: "Plaza Lotus Hotel",
    role: "International Project Management",
    location: "St. Petersburg, Russia",
    description: "Executive strategy and development management for a 5-star collection of landmark resort projects, including historical monument restorations.",
    category: "international",
    image: "https://upload.wikimedia.org/wikipedia/commons/b/b5/2014_Moskva_Ritz-Carlton_building.JPG",
    address: "St. Petersburg, Russia"
  },
  {
    id: 6,
    title: "Four Seasons Resort",
    role: "Owner's Representative",
    location: "Turks & Caicos Islands",
    description: "100-room oceanfront resort with private beach cabanas and world-renowned spa on Grace Bay.",
    category: "luxury",
    image: "assets/images/project-6-fourseasons.png"
  },
  {
    id: 7,
    title: "Rosewood Little Dix Bay",
    role: "Redevelopment & Renovation",
    location: "Virgin Gorda, BVI",
    description: "Comprehensive renovation of iconic 60's resort preserving mid-century modern charm and Caribbean hospitality.",
    category: "luxury",
    image: "assets/images/project-7-rosewood.png"
  },
  {
    id: 8,
    title: "Mandarin Oriental Miami",
    role: "Construction Management",
    location: "Miami, Florida",
    description: "300-guest-room waterfront hotel with world-class spa overlooking Biscayne Bay.",
    category: "luxury",
    image: "assets/images/project-8-mandarin.png"
  },
  {
    id: 9,
    title: "The Golf Club at Caneel Bay",
    role: "Master Planning & Development",
    location: "St. John, USVI",
    description: "Currently developing this 50-acre hilltop resort with panoramic Caribbean Sea views and world-class marina.",
    category: "golf",
    image: "assets/images/project-9-caneel-1.png",
    address: "Caneel Bay, St. John, USVI 00831",
    link: "https://www.nps.gov/viis/learn/historyculture/caneel-bay.htm"
  },
  {
    id: 10,
    title: "One&Only Port de la Mer",
    role: "Owner's Representative",
    location: "Saint Barthélemy",
    description: "Ultra-luxury 66-suite resort on premier beach of St. Barts, featuring exceptional dining and design.",
    category: "luxury",
    image: "assets/images/project-10-oneonly.png"
  },
  {
    id: 11,
    title: "The Ritz-Carlton Golf Resort",
    role: "Development Advisor",
    location: "Jupiter, Florida",
    description: "300-acre golf resort with two Greg Norman-designed courses and 150 resort rooms.",
    category: "golf",
    image: "assets/images/project-11-jupiter.png"
  },
  {
    id: 12,
    title: "Belmond Hotel Caruso",
    role: "Historic Renovation Consultant",
    location: "Ravello, Italy",
    description: "Restoration of 11th-century palazzo above Amalfi Coast, preserving historic architecture.",
    category: "international",
    image: "assets/images/project-12-belmond-real.jpg",
    thumbnail: "assets/images/project-12-belmond-thumb.jpg",
    tags: ["Redevelopment", "Logistics", "Anguilla"]
  },
  {
    id: 13,
    title: "Atlantis Bahamas",
    category: "Hospitality",
    location: "Nassau, Bahamas",
    year: "2022",
    description: "Strategic advisor for the renovation of the Coral Towers and revitalization of the resort's marine infrastructure.",
    image: "assets/images/project-13-atlantis.png",
    thumbnail: "assets/images/project-13-atlantis-thumb.jpg",
    tags: ["Strategic", "Renovation", "Bahamas"]
  },
  {
    id: 14,
    title: "Bali Luxury Retreat",
    category: "Hospitality",
    location: "Ubud, Bali",
    year: "2018",
    description: "Owner's representation for a boutique wellness resort. Focused on traditional Balinese architecture and modern wellness amenities.",
    image: "assets/images/project-14-bali.png",
    thumbnail: "assets/images/project-14-bali-thumb.jpg",
    tags: ["Wellness", "Boutique", "International"]
  },
  {
    id: 15,
    title: "Amanera Resort",
    role: "Development Management",
    location: "Playa Grande, Dominican Republic",
    description: "Ultra-luxury resort featuring 25 casitas and an Aman Spa, overlooking the Atlantic Ocean.",
    category: "luxury",
    image: "assets/images/project-15-amanera.png",
    link: "https://80659.sgp.homes/"
  },
  {
    id: 16,
    title: "Federal Monument Sochi",
    role: "International Project Director",
    location: "Sochi, Russia",
    description: "Development management for a $1.8 billion project, including federal monument restoration and luxury hotel infrastructure.",
    category: "international",
    image: "assets/images/project-16-sochi.png"
  },
  {
    id: 17,
    title: "Fortuna Mill Estate",
    role: "Lead Consultant",
    location: "St. Thomas, USVI",
    description: "Transformation of a historic 18th-century sugar mill into a world-class ultra-luxury private enclave.",
    category: "luxury",
    image: "assets/images/project-17-fortuna.png"
  }
];

// 1. STICKY NAVIGATION
function initStickyNav() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
}

// 2. SCROLL REVEAL ANIMATION
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .stagger-reveal');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  revealElements.forEach(el => observer.observe(el));
}

// 3. PROJECT SLIDER
function initProjectSlider() {
  const slider = document.getElementById('project-slider');
  if (!slider) return;
  
  const slides = slider.querySelectorAll('.project-slide');
  if (slides.length === 0) return;

  const prevBtn = document.querySelector('.slider-nav.prev');
  const nextBtn = document.querySelector('.slider-nav.next');
  
  let currentSlide = 0;
  let isTransitioning = false;
  let autoAdvanceTimer;

  function showSlide(index) {
    if (isTransitioning) return;
    isTransitioning = true;
    
    slides.forEach(slide => slide.classList.remove('active'));
    slides[index].classList.add('active');
    
    currentSlide = index;
    
    setTimeout(() => {
      isTransitioning = false;
    }, 1000);
    
    resetAutoAdvance();
  }

  function nextSlide() {
    let next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }

  function prevSlide() {
    let prev = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prev);
  }

  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  function startAutoAdvance() {
    autoAdvanceTimer = setInterval(nextSlide, 8000);
  }

  function resetAutoAdvance() {
    clearInterval(autoAdvanceTimer);
    startAutoAdvance();
  }

  startAutoAdvance();

  slider.addEventListener('mouseenter', () => clearInterval(autoAdvanceTimer));
  slider.addEventListener('mouseleave', startAutoAdvance);
}

// 4. MOBILE MENU
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = toggle.querySelector('i');
      if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });
  }
}

// 5. PROJECT GRID RENDERING
function renderProjectsGrid(filter = 'all', limit = null) {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  let filteredProjects = filter === 'all' 
    ? projectsData 
    : projectsData.filter(p => p.category === filter);

  if (limit) {
    filteredProjects = filteredProjects.slice(0, limit);
  }

  grid.innerHTML = filteredProjects.map(project => `
    <div class="project-card-premium" onclick="openProjectModal(${project.id})" style="position: relative; border-radius: 2rem; overflow: hidden; box-shadow: var(--shadow-premium); aspect-ratio: 4/5;">
      <img src="${project.image}" alt="${project.title}" style="width: 100%; height: 100%; object-fit: cover;">
      <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(15, 23, 42, 0.9), transparent 60%); padding: 3rem; display: flex; flex-direction: column; justify-content: flex-end; color: white;">
        <span style="color: var(--primary-light); font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.8rem; margin-bottom: 0.75rem;">${project.role}</span>
        <h3 style="font-size: 2rem; color: white; margin-bottom: 1rem;">${project.title}</h3>
        <p style="opacity: 0.8; margin-bottom: 1.5rem;">${project.description}</p>
        <span style="font-size: 0.85rem; opacity: 0.6;"><i class="fas fa-map-marker-alt" style="margin-right: 0.5rem;"></i> ${project.location}</span>
      </div>
    </div>
  `).join('');

  // Re-trigger reveal after content injection
  grid.classList.remove('visible');
  setTimeout(() => grid.classList.add('visible'), 100);
}

// 6. FILTERS
function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProjectsGrid(btn.dataset.filter);
    });
  });
}

// 7. MODAL LOGIC
function injectModalHtml() {
  if (document.getElementById('project-modal')) return;
  const modalHtml = `
    <div id="project-modal" class="modal-overlay" onclick="if(event.target === this) closeProjectModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeProjectModal()"><i class="fas fa-times"></i></button>
        <div>
          <img id="modal-img" class="modal-image" src="" alt="">
        </div>
        <div class="modal-body">
          <span id="modal-role" style="color: var(--primary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.85rem; margin-bottom: 1rem; display: block;"></span>
          <h2 id="modal-title" style="font-size: 2.5rem; margin-bottom: 1rem; line-height: 1.1;"></h2>
          <span id="modal-location" style="display: block; font-size: 1rem; color: var(--slate-500); margin-bottom: 0.5rem;"><i class="fas fa-map-marker-alt" style="margin-right: 0.5rem; color: var(--primary);"></i> <span></span></span>
          <span id="modal-address" style="display: block; font-size: 0.9rem; color: var(--slate-400); margin-bottom: 1.5rem; padding-left: 1.5rem;"></span>
          <p id="modal-desc" style="font-size: 1.15rem; color: var(--slate-700); line-height: 1.8; margin-bottom: 2rem;"></p>
          <a id="modal-link" href="#" target="_blank" class="btn-premium" style="display: inline-block; padding: 0.75rem 1.5rem; font-size: 0.9rem;">Visit Official Site <i class="fas fa-external-link-alt" style="margin-left: 0.5rem;"></i></a>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProjectModal();
  });
}

function openProjectModal(id) {
  const project = projectsData.find(p => p.id === id);
  if (!project) return;
  
  injectModalHtml();
  
  document.getElementById('modal-img').src = project.image;
  document.getElementById('modal-img').alt = project.title;
  document.getElementById('modal-title').textContent = project.title;
  document.getElementById('modal-role').textContent = project.role;
  document.getElementById('modal-desc').textContent = project.description;
  document.querySelector('#modal-location span').textContent = project.location;
  
  const addressEl = document.getElementById('modal-address');
  if (project.address) {
    addressEl.textContent = project.address;
    addressEl.style.display = 'block';
  } else {
    addressEl.style.display = 'none';
  }

  const linkEl = document.getElementById('modal-link');
  if (project.link) {
    linkEl.href = project.link;
    linkEl.style.display = 'inline-block';
  } else {
    linkEl.style.display = 'none';
  }
  
  document.getElementById('project-modal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  const modal = document.getElementById('project-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => { document.body.style.overflow = ''; }, 400);
  }
}

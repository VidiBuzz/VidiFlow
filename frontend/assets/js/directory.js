/**
 * Directory Page — AI Companies & Consultants
 * 
 * Uses the shared DirectusService to fetch data from VidiCRM.
 * Falls back to mock data if Directus is unavailable.
 */
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const typeFilter = document.getElementById('typeFilter');
    const locationFilter = document.getElementById('locationFilter');
    const resultsCount = document.getElementById('resultsCount');
    const directoryGrid = document.getElementById('directoryGrid');
    
    // Mock data for fallback when Directus is unavailable
    const mockCompanies = [
        {
            id: 1, name: "Ryan Zernach: iOS/Android Mobile App Developer",
            business_type: "AI / ML Development", rating: "5.0",
            location: "Miami FL", website: "https://ryan.zernach.com/",
            description: "Full-stack developer specializing in AI and machine learning applications."
        },
        {
            id: 2, name: "SDSol Technologies",
            business_type: "AI / ML Development", rating: "5.0",
            location: "Miami FL", website: "https://www.sdsol.com/",
            description: "Software development company with AI/ML expertise."
        }
    ];
    
    const mockConsultants = [
        {
            id: 1, name: "Elevate AI Consulting",
            business_type: "AI Consulting / Strategy", rating: 5.0,
            location: "South Florida", website: "http://www.elevateaiconsulting.com/",
            description: "We help leaders adopt AI responsibly, upskill fast, and ship measurable wins."
        },
        {
            id: 2, name: "The AI Consulting Lab",
            business_type: "AI Consulting / Strategy", rating: 5.0,
            location: "South Florida", website: "https://theaiconsultinglab.com/",
            description: "AI consulting and strategy services."
        }
    ];

    // Use shared directusService (from directus-service.js)
    const ds = window.directusService || null;
    
    async function fetchData() {
        let companiesData = [];
        let consultantsData = [];
        
        try {
            if (ds) {
                // Try fetching from Directus
                const [companiesResponse, consultantsResponse] = await Promise.all([
                    ds.getItems('ai_companies'),
                    ds.getItems('ai_consultants')
                ]);
                companiesData = companiesResponse.data || [];
                consultantsData = consultantsResponse.data || [];
            } else {
                throw new Error('DirectusService not available');
            }
        } catch (error) {
            console.warn('Directus unavailable, using mock data:', error.message);
            companiesData = mockCompanies;
            consultantsData = mockConsultants;
        }
        
        displayResults(companiesData, consultantsData);
    }
    
    function displayResults(companies, consultants) {
        if (!directoryGrid) return;
        directoryGrid.innerHTML = '';
        
        const typeFilterValue = typeFilter ? typeFilter.value : 'all';
        const locationFilterValue = locationFilter ? locationFilter.value : 'all';
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        
        let filteredCompanies = [...companies];
        let filteredConsultants = [...consultants];
        
        // Apply type filter
        if (typeFilterValue === 'company') {
            filteredConsultants = [];
        } else if (typeFilterValue === 'consultant') {
            filteredCompanies = [];
        }
        
        // Apply location filter
        if (locationFilterValue !== 'all') {
            filteredCompanies = filteredCompanies.filter(company => 
                (company.location || '').toLowerCase().includes(locationFilterValue)
            );
            filteredConsultants = filteredConsultants.filter(consultant => 
                (consultant.location || '').toLowerCase().includes(locationFilterValue)
            );
        }
        
        // Apply search filter
        if (searchTerm) {
            filteredCompanies = filteredCompanies.filter(company => 
                (company.name || '').toLowerCase().includes(searchTerm) || 
                (company.business_type || '').toLowerCase().includes(searchTerm) ||
                (company.location || '').toLowerCase().includes(searchTerm) ||
                (company.description || '').toLowerCase().includes(searchTerm)
            );
            
            filteredConsultants = filteredConsultants.filter(consultant => 
                (consultant.name || '').toLowerCase().includes(searchTerm) || 
                (consultant.business_type || '').toLowerCase().includes(searchTerm) ||
                (consultant.location || '').toLowerCase().includes(searchTerm) ||
                (consultant.description || '').toLowerCase().includes(searchTerm)
            );
        }
        
        const totalResults = filteredCompanies.length + filteredConsultants.length;
        if (resultsCount) {
            resultsCount.textContent = `${totalResults} results found`;
        }
        
        // Display companies
        filteredCompanies.forEach(company => {
            const item = document.createElement('div');
            item.className = 'directory-item';
            item.innerHTML = `
                <h3>${company.name || 'Unnamed Company'}</h3>
                <div class="business-type">${company.business_type || ''}</div>
                <div class="rating">⭐ ${company.rating || 'N/A'}</div>
                <p>${company.description || ''}</p>
                <p><strong>Location:</strong> ${company.location || 'Remote'}</p>
                ${company.website ? `<a href="${company.website}" target="_blank" rel="noopener" class="website">Visit Website</a>` : ''}
            `;
            directoryGrid.appendChild(item);
        });
        
        // Display consultants
        filteredConsultants.forEach(consultant => {
            const item = document.createElement('div');
            item.className = 'directory-item';
            item.innerHTML = `
                <h3>${consultant.name || 'Unnamed Consultant'}</h3>
                <div class="business-type">${consultant.business_type || ''}</div>
                <div class="rating">⭐ ${consultant.rating || 'N/A'}</div>
                <p>${consultant.description || ''}</p>
                <p><strong>Location:</strong> ${consultant.location || 'Remote'}</p>
                ${consultant.website ? `<a href="${consultant.website}" target="_blank" rel="noopener" class="website">Visit Website</a>` : ''}
            `;
            directoryGrid.appendChild(item);
        });
    }
    
    // Event listeners
    if (searchBtn) searchBtn.addEventListener('click', () => displayResults(mockCompanies, mockConsultants));
    if (searchInput) searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') fetchData();
    });
    if (typeFilter) typeFilter.addEventListener('change', fetchData);
    if (locationFilter) locationFilter.addEventListener('change', fetchData);
    
    // Initial load
    fetchData();
});
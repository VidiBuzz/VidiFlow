// Directory page JavaScript for searching and displaying AI companies and consultants
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const typeFilter = document.getElementById('typeFilter');
    const locationFilter = document.getElementById('locationFilter');
    const resultsCount = document.getElementById('resultsCount');
    const directoryGrid = document.getElementById('directoryGrid');
    
    // Import Directus service (in a real implementation, this would be imported)
    // For now, we'll simulate the service
    class DirectusService {
        async getItems(collection, params = {}) {
            // Simulate API call with timeout
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Return mock data based on collection
            if (collection === 'ai_companies') {
                return {
                    data: [
                        {
                            id: 1,
                            name: "Ryan Zernach: iOS/Android Mobile App Developer",
                            business_type: "AI / ML Development",
                            rating: "5.0",
                            location: "Miami FL",
                            website: "https://ryan.zernach.com/",
                            description: "Full-stack developer specializing in AI and machine learning applications."
                        },
                        {
                            id: 2,
                            name: "SDSol Technologies",
                            business_type: "AI / ML Development",
                            rating: "5.0",
                            location: "Miami FL",
                            website: "https://www.sdsol.com/",
                            description: "Software development company with AI/ML expertise."
                        }
                    ]
                };
            } else if (collection === 'ai_consultants') {
                return {
                    data: [
                        {
                            id: 1,
                            name: "Elevate AI Consulting",
                            business_type: "AI Consulting / Strategy",
                            rating: 5.0,
                            location: "South Florida",
                            website: "http://www.elevateaiconsulting.com/",
                            description: "We help leaders adopt AI responsibly, upskill fast, and ship measurable wins."
                        },
                        {
                            id: 2,
                            name: "The AI Consulting Lab",
                            business_type: "AI Consulting / Strategy",
                            rating: 5.0,
                            location: "South Florida",
                            website: "https://theaiconsultinglab.com/",
                            description: "Access to this page is forbidden."
                        }
                    ]
                };
            }
            return { data: [] };
        }
    }
    
    const directusService = new DirectusService();
    
    async function fetchData() {
        try {
            // Fetch data from Directus API
            const [companiesResponse, consultantsResponse] = await Promise.all([
                directusService.getItems('ai_companies'),
                directusService.getItems('ai_consultants')
            ]);
            
            const companiesData = companiesResponse.data || [];
            const consultantsData = consultantsResponse.data || [];
            
            displayResults(companiesData, consultantsData);
        } catch (error) {
            console.error('Error fetching data:', error);
            resultsCount.textContent = 'Error loading data. Please try again later.';
        }
    }
    
    function displayResults(companies, consultants) {
        directoryGrid.innerHTML = '';
        
        const typeFilterValue = typeFilter.value;
        const locationFilterValue = locationFilter.value;
        const searchTerm = searchInput.value.toLowerCase();
        
        let filteredCompanies = companies;
        let filteredConsultants = consultants;
        
        // Apply type filter
        if (typeFilterValue === 'company') {
            filteredConsultants = [];
        } else if (typeFilterValue === 'consultant') {
            filteredCompanies = [];
        }
        
        // Apply location filter
        if (locationFilterValue !== 'all') {
            filteredCompanies = filteredCompanies.filter(company => 
                company.location.toLowerCase().includes(locationFilterValue)
            );
            filteredConsultants = filteredConsultants.filter(consultant => 
                consultant.location.toLowerCase().includes(locationFilterValue)
            );
        }
        
        // Apply search filter
        if (searchTerm) {
            filteredCompanies = filteredCompanies.filter(company => 
                company.name.toLowerCase().includes(searchTerm) || 
                company.business_type.toLowerCase().includes(searchTerm) ||
                company.location.toLowerCase().includes(searchTerm) ||
                company.description.toLowerCase().includes(searchTerm)
            );
            
            filteredConsultants = filteredConsultants.filter(consultant => 
                consultant.name.toLowerCase().includes(searchTerm) || 
                consultant.business_type.toLowerCase().includes(searchTerm) ||
                consultant.location.toLowerCase().includes(searchTerm) ||
                consultant.description.toLowerCase().includes(searchTerm)
            );
        }
        
        const totalResults = filteredCompanies.length + filteredConsultants.length;
        resultsCount.textContent = `${totalResults} results found`;
        
        // Display companies
        filteredCompanies.forEach(company => {
            const item = document.createElement('div');
            item.className = 'directory-item';
            item.innerHTML = `
                <h3>${company.name}</h3>
                <div class="business-type">${company.business_type}</div>
                <div class="rating">⭐ ${company.rating}</div>
                <p>${company.description}</p>
                <p><strong>Location:</strong> ${company.location}</p>
                <a href="${company.website}" target="_blank" class="website">Visit Website</a>
            `;
            directoryGrid.appendChild(item);
        });
        
        // Display consultants
        filteredConsultants.forEach(consultant => {
            const item = document.createElement('div');
            item.className = 'directory-item';
            item.innerHTML = `
                <h3>${consultant.name}</h3>
                <div class="business-type">${consultant.business_type}</div>
                <div class="rating">⭐ ${consultant.rating}</div>
                <p>${consultant.description}</p>
                <p><strong>Location:</strong> ${consultant.location}</p>
                <a href="${consultant.website}" target="_blank" class="website">Visit Website</a>
            `;
            directoryGrid.appendChild(item);
        });
    }
    
    // Event listeners
    searchBtn.addEventListener('click', displayResults);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            displayResults();
        }
    });
    typeFilter.addEventListener('change', displayResults);
    locationFilter.addEventListener('change', displayResults);
    
    // Initial load
    fetchData();
});
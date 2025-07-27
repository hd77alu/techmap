// Helper to handle fetch with credentials
function apiFetch(url, options = {}) {
    return fetch(url, { credentials: 'include', ...options })
        .then(res => {
            if (res.ok) return res.json();
            if (res.status === 401) {
                // Redirect to welcome page if not authenticated
                window.location.href = '/';
                return Promise.reject({ status: 401, message: 'Not authenticated' });
            }
            return Promise.reject(res);
        });
}

// Logout functionality
document.getElementById('logoutBtn').onclick = () => {
    window.location = '/auth/logout';
};

// Profile - Fetch user info
function fetchProfile() {
    apiFetch('/api/user')
        .then(data => {
            const username = data.name || data.username || "User";
            const firstName = username.split(' ')[0]; // Get first name only
            document.getElementById('profile').innerHTML = `
                <div class="welcome-message" onclick="celebrateUser()">
                    <span class="wave-emoji">👋</span>
                    <span class="welcome-text">Welcome back, <span class="username">${firstName}</span>!</span>
                </div>
            `;
            
            // Add animation class after a brief delay
            setTimeout(() => {
                const welcomeMsg = document.querySelector('.welcome-message');
                if (welcomeMsg) {
                    welcomeMsg.classList.add('animated');
                }
            }, 100);
        })
        .catch(() => {
            // If profile fetch fails, redirect to welcome
            window.location.href = '/';
        });
}

// Fun celebration function for when user clicks the welcome message
function celebrateUser() {
    const welcomeMsg = document.querySelector('.welcome-message');
    if (welcomeMsg) {
        // Add a celebration class temporarily
        welcomeMsg.classList.add('celebrating');
        
        // Create floating emojis
        const emojis = ['🎉', '✨', '🚀', '💫', '🎊'];
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                createFloatingEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
            }, i * 100);
        }
        
        // Remove celebration class after animation
        setTimeout(() => {
            welcomeMsg.classList.remove('celebrating');
        }, 600);
    }
}

// Create floating emoji animation
function createFloatingEmoji(emoji) {
    const floatingEmoji = document.createElement('span');
    floatingEmoji.textContent = emoji;
    floatingEmoji.style.cssText = `
        position: fixed;
        font-size: 1.5rem;
        pointer-events: none;
        z-index: 1000;
        left: ${Math.random() * window.innerWidth}px;
        top: ${window.innerHeight}px;
        animation: float-up 2s ease-out forwards;
    `;
    
    document.body.appendChild(floatingEmoji);
    
    // Remove emoji after animation
    setTimeout(() => {
        if (floatingEmoji.parentNode) {
            floatingEmoji.parentNode.removeChild(floatingEmoji);
        }
    }, 2000);
}

// Make function globally available
window.celebrateUser = celebrateUser;

// Initialize dashboard
fetchProfile();

// Fetch and display user's learning style assessment in descending order
function fetchLearningStyleAssessment() {
    apiFetch('/api/learning-style')
        .then(data => {
            let styleScores;
            if (data && (data.visual || data.auditory || data.kinesthetic || data.reading)) {
                styleScores = [
                    ['Visual', data.visual || 0],
                    ['Auditory', data.auditory || 0],
                    ['Kinesthetic', data.kinesthetic || 0],
                    ['Reading/Writing', data.reading || 0]
                ];
                styleScores.sort((a, b) => b[1] - a[1]);

            // Display heading and percentages in nav-style section
            const styleResultsHeading = document.getElementById('styleResultsHeading');
            if (styleResultsHeading) styleResultsHeading.textContent = 'Based On VARK Assessment Results:';
            
            // Learning Style Results
            const styleResultsDiv = document.getElementById('styleResults');
            if (styleResultsDiv) styleResultsDiv.innerHTML = '';

            // Helper function to get CSS class name
            const getStyleClass = (style) => {
                const classMap = {
                    'Visual': 'visual',
                    'Auditory': 'auditory', 
                    'Kinesthetic': 'kinesthetic',
                    'Reading/Writing': 'reading'
                };
                return classMap[style] || style.toLowerCase();
            };

            // Dynamically render style buttons with percentages in sorted order
            const styleBtnGroup = document.getElementById('styleBtnGroup');
            if (styleBtnGroup) {
                styleBtnGroup.innerHTML = styleScores.map(
                    ([style, percent]) => {
                        const styleClass = getStyleClass(style);
                        return `
                            <div class="style-button-container">
                                <div class="style-percentage ${styleClass}">${percent}%</div>
                                <div class="style-button-wrapper">
                                    <button onclick="selectLearningStyle('${styleClass}')" class="btn ${styleClass}">${style}</button>
                                </div>
                            </div>
                        `;
                    }
                ).join('');
            }

            // Dynamically render style buttons in sorted order (for resources)
            const resBtnGroup = document.querySelector('#nav-resources .btn-group');
            if (resBtnGroup) {
                resBtnGroup.innerHTML = styleScores.map(
                    ([style]) => `<button onclick="fetchResources('${style}')" class="btn ${getStyleClass(style)}">${style}</button>`
                ).join('');
            }

            // Auto-fetch resources for top style
            if (styleScores[0]) fetchResources(styleScores[0][0]);
        } else {
            // No quiz data, show default buttons (simple style without percentages)
            const defaultStyles = [
                ['Visual', 'visual'],
                ['Auditory', 'auditory'],
                ['Kinesthetic', 'kinesthetic'],
                ['Reading/Writing', 'reading']
            ];
            const styleBtnGroup = document.getElementById('styleBtnGroup');
            if (styleBtnGroup) {
                styleBtnGroup.innerHTML = defaultStyles.map(
                    ([label, styleClass]) => `<button onclick="selectLearningStyle('${styleClass}')" class="btn ${styleClass}">${label}</button>`
                ).join('');
            }
            // Set default resource buttons
            const resBtnGroup = document.querySelector('#nav-resources .btn-group');
            if (resBtnGroup) {
                resBtnGroup.innerHTML = defaultStyles.map(
                    ([label, styleClass]) => `<button onclick="fetchResources('${label}')" class="btn ${styleClass}">${label}</button>`
                ).join('');
            }
            // Clear style results and heading
            const styleResultsDiv = document.getElementById('styleResults');
            if (styleResultsDiv) styleResultsDiv.innerHTML = '';
            const styleResultsHeading = document.getElementById('styleResultsHeading');
            if (styleResultsHeading) styleResultsHeading.textContent = '';
        }
    })
    .catch((error) => {
            if (error.status === 401) {
                console.log('User not authenticated - showing default buttons');
                // User not authenticated, show default buttons without error
                const defaultStyles = [
                    ['Visual', 'visual'],
                    ['Auditory', 'auditory'],
                    ['Kinesthetic', 'kinesthetic'],
                    ['Reading/Writing', 'reading']
                ];
                const styleBtnGroup = document.getElementById('styleBtnGroup');
                if (styleBtnGroup) {
                    styleBtnGroup.innerHTML = defaultStyles.map(
                        ([label, styleClass]) => `<button onclick="selectLearningStyle('${styleClass}')" class="btn ${styleClass}">${label}</button>`
                    ).join('');
                }
                const resBtnGroup = document.querySelector('#nav-resources .btn-group');
                if (resBtnGroup) {
                    resBtnGroup.innerHTML = defaultStyles.map(
                        ([label, styleClass]) => `<button onclick="fetchResources('${label}')" class="btn ${styleClass}">${label}</button>`
                    ).join('');
                }
                const styleResultsDiv = document.getElementById('styleResults');
                if (styleResultsDiv) styleResultsDiv.innerHTML = '';
                const styleResultsHeading = document.getElementById('styleResultsHeading');
                if (styleResultsHeading) styleResultsHeading.textContent = '';
                return;
            }
            // On other errors, show default buttons
            const defaultStyles = [
                ['Visual', 'visual'],
                ['Auditory', 'auditory'],
                ['Kinesthetic', 'kinesthetic'],
                ['Reading/Writing', 'reading']
            ];
            const styleBtnGroup = document.getElementById('styleBtnGroup');
            if (styleBtnGroup) {
                styleBtnGroup.innerHTML = defaultStyles.map(
                    ([label, style]) => `<button onclick="selectLearningStyle('${style}')" class="btn ${style}">${label}</button>`
                ).join('');
            }
            const resBtnGroup = document.querySelector('#nav-resources .btn-group');
            if (resBtnGroup) {
                resBtnGroup.innerHTML = defaultStyles.map(
                    ([label, style]) => `<button onclick=\"fetchResources('${label}')\" class=\"btn ${style}\">${label}</button>`
                ).join('');
            }
            const styleResultsDiv = document.getElementById('styleResults');
            if (styleResultsDiv) styleResultsDiv.innerHTML = '';
            const styleResultsHeading = document.getElementById('styleResultsHeading');
            if (styleResultsHeading) styleResultsHeading.textContent = '';
        });
}

// Call this after login/profile loaded
fetchLearningStyleAssessment();

// Auto-load trends chart
fetchTrends();

// Define learning style descriptions
const learningStyleDescriptions = {
    visual: {
        title: "Visual Learner",
        content: `
            <p><strong>How you learn best:</strong> You prefer seeing information through charts, diagrams, mind maps, and visual presentations. You understand concepts better when they're displayed graphically.</p>
            <p><strong>Study strategies:</strong> Use colorful notes, create flowcharts, watch educational videos, and organize information in visual formats like tables and graphs.</p>
            <p><strong>Tech skills development:</strong> Focus on visual programming tools, UI/UX design, data visualization, and interactive tutorials with visual elements.</p>
        `
    },
    auditory: {
        title: "Auditory Learner", 
        content: `
            <p><strong>How you learn best:</strong> You absorb information through listening, discussions, and verbal explanations. You learn well through lectures, podcasts, and group conversations.</p>
            <p><strong>Study strategies:</strong> Record yourself reading notes, join study groups, listen to educational podcasts, and explain concepts out loud to others.</p>
            <p><strong>Tech skills development:</strong> Engage with coding bootcamp lectures, technical podcasts, pair programming sessions, and verbal code reviews.</p>
        `
    },
    kinesthetic: {
        title: "Kinesthetic/Tactile Learner",
        content: `
            <p><strong>How you learn best:</strong> You learn through hands-on activities, physical movement, and practical application. You prefer learning by doing rather than watching or listening.</p>
            <p><strong>Study strategies:</strong> Use interactive simulations, build physical models, take frequent breaks for movement, and practice skills immediately.</p>
            <p><strong>Tech skills development:</strong> Focus on hands-on coding projects, build real applications, use interactive coding platforms, and learn through experimentation.</p>
        `
    },
    reading: {
        title: "Read/Write Learner",
        content: `
            <p><strong>How you learn best:</strong> You prefer text-based learning through reading and writing. You excel with written instructions, note-taking, and text-heavy materials.</p>
            <p><strong>Study strategies:</strong> Take detailed written notes, create lists and outlines, read comprehensive documentation, and write summaries of what you learn.</p>
            <p><strong>Tech skills development:</strong> Study technical documentation thoroughly, maintain detailed coding notes, write technical blogs, and engage with text-based tutorials.</p>
        `
    }
};

// Function to select learning style and show dynamic description
function selectLearningStyle(style) {
    // Fetch resources for the selected style
    const styleMapping = {
        'visual': 'Visual',
        'auditory': 'Auditory',
        'kinesthetic': 'Kinesthetic',
        'reading': 'Reading/Writing'
    };
    
    fetchResources(styleMapping[style] || style);
    
    // Update dynamic description
    updateLearningDescription(style);
    
    // Update button active states
    updateButtonStates(style);
}

// Function to update learning description based on selected style
function updateLearningDescription(selectedStyle) {
    const descriptionContainer = document.getElementById('learningDescription');
    if (!descriptionContainer) return;

    const description = learningStyleDescriptions[selectedStyle];
    if (!description) return;

    // Remove all style classes
    descriptionContainer.className = 'learning-description';
    
    // Add the selected style class
    descriptionContainer.classList.add(selectedStyle);
    
    // Update content
    descriptionContainer.innerHTML = `
        <h3>${description.title}</h3>
        <div class="description-content">
            ${description.content}
        </div>
    `;

    // Add highlighted class to content paragraphs after a brief delay for animation
    setTimeout(() => {
        const paragraphs = descriptionContainer.querySelectorAll('.description-content p');
        paragraphs.forEach(p => p.classList.add('highlighted'));
    }, 100);
}

// Function to update button active states
function updateButtonStates(selectedStyle) {
    const buttons = document.querySelectorAll('.learning-style-btn, .btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.onclick && btn.onclick.toString().includes(selectedStyle)) {
            btn.classList.add('active');
        }
    });
}

// Make functions globally available
window.selectLearningStyle = selectLearningStyle;

// Resources
function fetchResources(style) {
    apiFetch(`/api/resources?style=${encodeURIComponent(style)}`)
        .then(response => {
            // Handle the new API response format {data: [...], total: number}
            const data = response.data || response;
            if (Array.isArray(data) && data.length) {
                document.getElementById('resources').innerHTML = data.map(resource => {
                    let links = '';
                    if (resource.link) {
                        links += `<a href="${resource.link}" target="_blank">Resource Link</a> `;
                    }
                    if (resource.url) {
                        links += `<a href="${resource.url}" target="_blank">More Info</a>`;
                    }
                    return `<div class="card">
                        <h3>${resource.title || resource.name}</h3>
                        <p>${resource.description || ''}</p>
                        ${links}
                    </div>`;
                }).join('');
            } else {
                document.getElementById('resources').innerHTML = '<div class="card">No resources found.</div>';
            }
        })
        .catch(() => document.getElementById('resources').innerHTML = '<div class="card">Error fetching resources</div>');
}
window.fetchResources = fetchResources;

// Projects
function fetchProjects() {
    apiFetch('/api/projects')
        .then(response => {
            // Handle the new API response format {data: [...], total: number}
            const data = response.data || response;
            if (Array.isArray(data) && data.length) {
                document.getElementById('projects').innerHTML = data.map(project => {
                    let links = '';
                    if (project.github) {
                        links += `<a href="${project.github}" target="_blank">GitHub</a> `;
                    }
                    if (project.url) {
                        links += `<a href="${project.url}" target="_blank">Project Link</a>`;
                    }
                    return `<div class="card">
                        <h3>${project.title || project.name}</h3>
                        <p><strong>Industry:</strong> ${project.industry || project.domain || project.category || 'N/A'}</p>
                        ${links}
                    </div>`;
                }).join('');
            } else {
                document.getElementById('projects').innerHTML = '<div class="card">No projects found.</div>';
            }
        })
        .catch(() => document.getElementById('projects').innerHTML = '<div class="card">Error fetching projects</div>');
}
window.fetchProjects = fetchProjects;

// Trends
function fetchTrends() {
    apiFetch('/api/trends')
        .then(data => {
            // Group data by category
            const categorizedData = {};
            const trends = Array.isArray(data) ? data : [data];
            
            trends.forEach(trend => {
                const category = trend.category || 'Other';
                if (!categorizedData[category]) {
                    categorizedData[category] = [];
                }
                categorizedData[category].push(trend);
            });

            // Chart configurations for each category
            const chartConfigs = {
                'Language': {
                    title: 'Top 15 Most Popular Programming Languages',
                    description: 'JavaScript has been the most used language according to Stack Overflow 2024 developers survey.',
                    limit: 15,
                    colors: ['#f7df1e', '#3178c6', '#e34c26', '#1572b6', '#c6538c', '#00d8ff', '#61dafb', '#764abc', '#ff6b6b', '#4fc08d', '#ff9500', '#8892bf', '#326ce5', '#e34f26', '#007acc']
                },
                'Framework': {
                    title: 'Top 10 Most Popular Web Frameworks',
                    description: "Node.js peaked in 2020 with its highest recorded usage score of 51%. While not as popular, it's still the most used web technology in the Stack Overflow 2024 developers survey and has increased popularity among those learning to code from last year.",
                    limit: 10,
                    colors: ['#68a063', '#61dafb', '#4fc08d', '#ff2d20', '#e23237', '#ed8611ff', '#764abc', '#ff6b6b', '#0ea5e9', '#7c3aed']
                },
                'Database': {
                    title: 'Top 10 Most Used Databases',
                    description: 'PostgreSQL debuted in Stack Overflow developer survey in 2018 when 33% of developers reported using it, compared with the most popular option that year: MySQL, in use by 59% of developers. Six years later, PostgreSQL is used by 49% of developers and is the most popular database for the second year in a row.',
                    limit: 10,
                    colors: ['#336791', '#00758f', '#ff6600', '#e97627', '#4db33d', '#005c98', '#dc382d', '#326ce5', '#f29111', '#00758f']
                },
                'Developer Tool': {
                    title: 'Top 10 Most Used Developer Tools for Compiling, Building and Testing',
                    description: 'Docker is used the most by professional developers (59%) and npm is used the most by developers learning to code (45%) according to Stack Overflow 2024 developers survey.',
                    limit: 10,
                    colors: ['#2496ed', '#cb3837', '#f05032', '#6cc644', '#47a248', '#ff6b6b', '#764abc', '#e34c26', '#1572b6', '#326ce5']
                },
                'Cloud Platform': {
                    title: 'Top 10 Most Used Cloud Platforms',
                    description: "AWS' share of usage amongst respondents is the same in Stack Overflow 2024 developers survey as in 2023, while Azure and Google Cloud increased their share. Azure has climbed from 26% to 28% usage and Google Cloud went from 24% to 25%.",
                    limit: 10,
                    colors: ['#ff9900', '#0078d4', '#4285f4', '#ff6b6b', '#326ce5', '#e97627', '#68a063', '#f29111', '#0ea5e9', '#7c3aed']
                },
                'Management Tool': {
                    title: 'Top 10 Most Used Project Management Tools',
                    description: 'Jira and Confluence top the list for most used asynchronous tools developers use for the third year in Stack Overflow survey.',
                    limit: 10,
                    colors: ['#0052cc', '#172b4d', '#61dafb', '#68a063', '#ff6b6b', '#e97627', '#4285f4', '#f29111', '#0ea5e9', '#7c3aed']
                },
                'Job Role': {
                    title: 'Most In-Demand Tech Jobs in 2025',
                    description: 'According to Reveal survey on software development challenges in 2025, The AI talent shortage, which saw some improvement in 2024, has worsened in 2025—especially in AI and cybersecurity roles. Companies that rapidly adopted AI now lack the specialized workforce needed to scale, refine, and secure their AI-driven infrastructure.\n\nThere is a strong demand for skilled AI engineers, with 28% of tech leaders finding it challenging to fill AI engineer positions. While the adoption of AI has helped companies optimize workflows, it has also opened new job opportunities that they are still struggling to fill.',
                    limit: 10,
                    colors: ['#ff6b6b', '#4fc08d', '#f7df1e', '#3178c6', '#e34c26', '#61dafb', '#764abc', '#68a063', '#ff9500', '#e97627']
                },
                'Software Challenges': {
                    title: 'The Biggest Software Development Challenges in 2025',
                    description: 'Tech leaders identify the biggest software development challenges as security (51%) and data privacy (41%), along with AI deployment (44%) and the quality/reliability of AI code (45%).\n\nThe majority of tech leaders now believe that security can no longer be an afterthought—it must be integrated into AI development from the start. Companies need real-time threat detection, AI auditing, and compliance-driven security measures to stay ahead of evolving threats.',
                    limit: 10,
                    colors: ['#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d', '#16a34a', '#059669', '#0891b2', '#0284c7', '#2563eb']
                }
            };

            // Clear previous content
            const trendsContainer = document.getElementById('trendsContainer');
            if (!trendsContainer) return;

            // Destroy existing chart instances
            if (window.trendsChartInstances) {
                window.trendsChartInstances.forEach(instance => instance.destroy());
            }
            window.trendsChartInstances = [];

            trendsContainer.innerHTML = '';

            // Create charts for each category
            Object.keys(categorizedData).forEach(category => {
                const config = chartConfigs[category];
                if (!config) return;

                const categoryData = categorizedData[category]
                    .sort((a, b) => (b.trend_score || 0) - (a.trend_score || 0))
                    .slice(0, config.limit);

                if (categoryData.length === 0) return;

                // Create chart container
                const chartSection = document.createElement('div');
                chartSection.className = 'trend-chart-section';
                chartSection.innerHTML = `
                    <div class="trend-chart-header">
                        <h3 class="trend-chart-title">${config.title}</h3>
                        <p class="trend-chart-description">${config.description}</p>
                    </div>
                    <div class="trend-chart-wrapper">
                        <canvas id="trendsChart${category.replace(/\s+/g, '')}" width="600" height="400"></canvas>
                    </div>
                `;

                trendsContainer.appendChild(chartSection);

                // Create chart
                const canvas = document.getElementById(`trendsChart${category.replace(/\s+/g, '')}`);
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    
                    // Improved label extraction - ensure we get item_name if it exists
                    const labels = categoryData.map(item => {
                        const itemName = item.item_name?.trim();
                        const category = item.category?.trim();
                        
                        // Prioritize item_name, but only if it's a non-empty string
                        if (itemName && itemName !== '' && itemName !== 'null' && itemName !== 'undefined') {
                            return itemName;
                        } else if (category && category !== '' && category !== 'null' && category !== 'undefined') {
                            return category;
                        } else {
                            return 'Unknown';
                        }
                    });

                    const chartInstance = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Usage %',
                                data: categoryData.map(item => item.trend_score || 0),
                                backgroundColor: config.colors.slice(0, categoryData.length),
                                borderColor: config.colors.slice(0, categoryData.length).map(color => color + '80'),
                                borderWidth: 2,
                                borderRadius: 8,
                                borderSkipped: false,
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { 
                                    display: false 
                                },
                                title: { 
                                    display: false 
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            return context.dataset.label + ': ' + context.parsed.y + '%';
                                        }
                                    }
                                }
                            },
                            scales: {
                                y: { 
                                    beginAtZero: true,
                                    ticks: {
                                        callback: function(value) {
                                            return value + '%';
                                        }
                                    }
                                },
                                x: {
                                    ticks: {
                                        maxRotation: 45,
                                        minRotation: 0
                                    }
                                }
                            },
                            layout: {
                                padding: {
                                    top: 20,
                                    bottom: 20
                                }
                            }
                        }
                    });

                    window.trendsChartInstances.push(chartInstance);
                }
            });

            // Add source links at the bottom
            const sourcesSection = document.createElement('div');
            sourcesSection.className = 'trend-sources';
            sourcesSection.innerHTML = `
                <h4>Data Sources:</h4>
                <div class="source-links">
                    <a href="https://www.revealbi.io/whitepapers/reveal-survey-report-top-software-development-challenges-for-2025" target="_blank" rel="noopener noreferrer">
                        Reveal Survey on Software Development Challenges in 2025
                    </a>
                    <a href="https://survey.stackoverflow.co/2024/technology" target="_blank" rel="noopener noreferrer">
                        Stack Overflow 2024 Developers Survey
                    </a>
                </div>
            `;
            trendsContainer.appendChild(sourcesSection);

        })
        .catch(() => {
            const trendsContainer = document.getElementById('trendsContainer');
            if (trendsContainer) {
                trendsContainer.innerHTML = '<div class="card">Error fetching trends data</div>';
            }
        });
}
window.fetchTrends = fetchTrends;

// Enhanced Resume Analysis
function analyzeResume() {
    const text = document.getElementById('resumeText').value.trim();
    
    // Validate input
    if (!text) {
        showResumeError('Please paste your resume text before analyzing.');
        return;
    }
    
    if (text.length < 100) {
        showResumeError('Resume text seems too short. Please provide more detailed content.');
        return;
    }
    
    if (text.length > 50000) {
        showResumeError('Resume text is too long. Please keep it under 50,000 characters.');
        return;
    }
    
    // Show loading state
    showResumeLoading();
    
    // Make API request
    apiFetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    })
    .then(data => {
        hideResumeLoading();
        displayResumeAnalysis(data);
    })
    .catch(error => {
        hideResumeLoading();
        console.error('Resume analysis error:', error);
        
        // Handle specific error cases
        if (error.status === 401) {
            showResumeError('Please log in to use the resume analysis feature.');
        } else if (error.status === 400) {
            showResumeError('Invalid resume data. Please check your input and try again.');
        } else if (error.status === 500) {
            showResumeError('Server error occurred. Please try again later.');
        } else {
            showResumeError('Analysis failed. Please check your connection and try again.');
        }
    });
}

function retryAnalysis() {
    hideResumeError();
    analyzeResume();
}

function showResumeLoading() {
    document.getElementById('resumeLoading').classList.remove('hidden');
    hideResumeResults();
    hideResumeError();
}

function hideResumeLoading() {
    document.getElementById('resumeLoading').classList.add('hidden');
}

function showResumeError(message) {
    const errorContainer = document.getElementById('resumeError');
    const errorMessage = errorContainer.querySelector('.error-message');
    errorMessage.textContent = message;
    errorContainer.classList.remove('hidden');
    hideResumeResults();
    hideResumeLoading();
}

function hideResumeError() {
    document.getElementById('resumeError').classList.add('hidden');
}

function hideResumeResults() {
    document.getElementById('resumeResults').classList.add('hidden');
}

function displayResumeAnalysis(data) {
    // Show results container
    document.getElementById('resumeResults').classList.remove('hidden');
    
    // Update summary
    updateAnalysisSummary(data.summary);
    
    // Display detected skills
    displayDetectedSkills(data.detectedSkills);
    
    // Display project recommendations
    displayProjectRecommendations(data.projectRecommendations);
    
    // Display skill gaps
    displaySkillGaps(data.skillGaps);
    
    // Display learning recommendations
    displayLearningRecommendations(data.learningRecommendations);
    
    // Display insights
    displayInsights(data.insights);
    
    // Scroll to results
    document.getElementById('resumeResults').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

function updateAnalysisSummary(summary) {
    document.getElementById('skillsCount').textContent = summary.totalSkillsDetected;
    document.getElementById('marketAlignment').textContent = `${summary.marketAlignmentPercentage}%`;
    document.getElementById('topCategory').textContent = summary.topCategory || 'General';
    
    // Add visual indicators based on alignment percentage
    const alignmentElement = document.getElementById('marketAlignment');
    alignmentElement.className = 'summary-number';
    
    if (summary.marketAlignmentPercentage >= 70) {
        alignmentElement.classList.add('high-alignment');
    } else if (summary.marketAlignmentPercentage >= 40) {
        alignmentElement.classList.add('medium-alignment');
    } else {
        alignmentElement.classList.add('low-alignment');
    }
}

function displayDetectedSkills(skills) {
    const container = document.getElementById('detectedSkills');
    
    if (!skills || skills.length === 0) {
        container.innerHTML = '<p class="no-data">No marketable skills detected. Consider adding more technical skills to your resume.</p>';
        return;
    }
    
    container.innerHTML = skills.map(skill => `
        <div class="skill-card">
            <div class="skill-header">
                <h4 class="skill-name">${skill.skill}</h4>
                <span class="skill-category">${skill.category}</span>
            </div>
            <div class="skill-metrics">
                <div class="market-score">
                    <span class="score-value">${skill.marketScore}%</span>
                    <span class="score-label">Market Usage</span>
                </div>
                <div class="demand-level ${skill.demand.toLowerCase().replace(/[\/\s]/g, '-')}">
                    ${skill.demand} Demand
                </div>
            </div>
        </div>
    `).join('');
}

function displayProjectRecommendations(projects) {
    const container = document.getElementById('projectRecommendations');
    
    if (!projects || projects.length === 0) {
        container.innerHTML = '<p class="no-data">No project recommendations available. Add more skills to get personalized suggestions.</p>';
        return;
    }
    
    container.innerHTML = projects.map(project => `
        <div class="project-recommendation-card">
            <div class="project-header">
                <h4 class="project-name">${project.name}</h4>
                <div class="relevance-score">
                    <span class="score">${project.relevanceScore}%</span>
                    <span class="label">Match</span>
                </div>
            </div>
            <p class="project-description">${project.description || 'No description available'}</p>
            <div class="project-meta">
                <span class="project-industry">
                    <strong>Industry:</strong> ${project.industry || 'General'}
                </span>
                <span class="matching-skills">
                    <strong>Matching Skills:</strong> ${project.matchingSkills.join(', ')}
                </span>
            </div>
            <div class="project-reason">${project.recommendationReason}</div>
            ${project.url ? `<a href="${project.url}" target="_blank" class="project-link">View Project</a>` : ''}
        </div>
    `).join('');
}

function displaySkillGaps(gaps) {
    const container = document.getElementById('skillGaps');
    
    if (!gaps || gaps.length === 0) {
        container.innerHTML = '<p class="no-data">Great! Your skills are well-aligned with current market trends.</p>';
        return;
    }
    
    container.innerHTML = gaps.map(gap => `
        <div class="gap-card">
            <div class="gap-header">
                <h4 class="gap-skill">${gap.skill}</h4>
                <div class="gap-priority priority-${gap.priority.toLowerCase()}">
                    ${gap.priority} Priority
                </div>
            </div>
            <div class="gap-metrics">
                <span class="gap-category">${gap.category}</span>
                <span class="gap-demand">${gap.demand} Demand</span>
                <span class="gap-score">${gap.marketScore}% Usage</span>
            </div>
            <p class="gap-reason">${gap.reason}</p>
        </div>
    `).join('');
}

function displayLearningRecommendations(recommendations) {
    const container = document.getElementById('learningRecommendations');
    
    if (!recommendations || recommendations.length === 0) {
        container.innerHTML = '<p class="no-data">Focus on strengthening your existing skills and exploring adjacent technologies.</p>';
        return;
    }
    
    container.innerHTML = recommendations.map(rec => `
        <div class="learning-card">
            <div class="learning-header">
                <h4 class="learning-skill">${rec.skill}</h4>
                <div class="learning-priority priority-${rec.priority.toLowerCase()}">
                    ${rec.priority} Priority
                </div>
            </div>
            <div class="learning-meta">
                <span class="learning-category">${rec.category}</span>
                <span class="learning-time">${rec.estimatedTime}</span>
                <span class="learning-score">${rec.marketScore}% Market Usage</span>
            </div>
            <div class="learning-path">
                <strong>Learning Path:</strong>
                <p>${rec.learningPath}</p>
            </div>
            <div class="learning-resources">
                <strong>Recommended Resources:</strong>
                <ul>
                    ${rec.resources.map(resource => `<li>${resource}</li>`).join('')}
                </ul>
            </div>
        </div>
    `).join('');
}

function displayInsights(insights) {
    const container = document.getElementById('insights');
    
    if (!insights || insights.length === 0) {
        container.innerHTML = '<p class="no-data">No specific insights available at this time.</p>';
        return;
    }
    
    container.innerHTML = insights.map(insight => `
        <div class="insight-card insight-${insight.type}">
            <div class="insight-header">
                <h4 class="insight-title">${insight.title}</h4>
                <span class="insight-type-badge ${insight.type}">${insight.type}</span>
            </div>
            <p class="insight-message">${insight.message}</p>
        </div>
    `).join('');
}

// Make function globally available
window.analyzeResume = analyzeResume;
window.retryAnalysis = retryAnalysis;

// Vision Board access
document.addEventListener('DOMContentLoaded', () => {
    const visionBoardBtn = document.getElementById("visionBoardBtn");
    if (visionBoardBtn) {
        visionBoardBtn.addEventListener("click", function (e) {
            e.preventDefault();
            window.location.href = "visual-board.html";
        });
    }

    // Simplified Scroll to Top Button Functionality
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    if (scrollToTopBtn) {
        // Show/hide button based on scroll position
        let scrollTimeout;
        
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > 200) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        };

        // Throttled scroll listener for better performance
        window.addEventListener('scroll', () => {
            if (!scrollTimeout) {
                scrollTimeout = setTimeout(() => {
                    handleScroll();
                    scrollTimeout = null;
                }, 16); // ~60fps
            }
        });

        // Simple scroll to top using native browser smooth scrolling
        scrollToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Let the browser handle smooth scrolling natively
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Initialize search functionality
    setupSearch();
});

// Enhanced Search and Pagination State Management
let resourcesState = {
    currentPage: 0,
    limit: 10,
    searchTerm: '',
    selectedStyle: '',
    loading: false,
    hasMore: true
};

let projectsState = {
    currentPage: 0,
    limit: 10,
    searchTerm: '',
    loading: false,
    hasMore: true
};

// Enhanced fetchResources with search and pagination
function enhancedFetchResources(style = '', reset = true, searchTerm = '') {
    if (resourcesState.loading) return;
    
    resourcesState.loading = true;
    
    if (reset) {
        resourcesState.currentPage = 0;
        resourcesState.selectedStyle = style;
        resourcesState.searchTerm = searchTerm;
        document.getElementById('resources').innerHTML = '';
    }

    const params = new URLSearchParams({
        style: resourcesState.selectedStyle,
        search: resourcesState.searchTerm,
        limit: resourcesState.limit,
        offset: resourcesState.currentPage * resourcesState.limit
    });

    // Show loading state
    if (reset) {
        document.getElementById('resources').innerHTML = '<div class="loading">Loading resources...</div>';
    }

    apiFetch(`/api/resources?${params}`)
        .then(response => {
            const data = response.data || response;
            const total = response.total || data.length;
            
            // Update results info
            updateResultsInfo('resourcesInfo', data.length, total, resourcesState.searchTerm, 'resources');
            
            if (Array.isArray(data) && data.length) {
                const resourcesHTML = data.map(resource => {
                    let links = '';
                    if (resource.link) {
                        links += `<a href="${resource.link}" target="_blank" class="resource-link">Resource Link</a> `;
                    }
                    if (resource.url) {
                        links += `<a href="${resource.url}" target="_blank" class="resource-link">More Info</a>`;
                    }
                    
                    const description = resource.description || '';
                    const techTags = resource.tech_tags || '';
                    const recommendedStyle = resource.recommended_style || '';
                    
                    return `<div class="card resource-card">
                        <h3>${resource.title || resource.name}</h3>
                        <p class="resource-description">${description}</p>
                        <div class="resource-meta">
                            <span class="resource-type">${resource.type || 'Resource'}</span>
                            ${recommendedStyle ? `<span class="learning-style-tag ${recommendedStyle.toLowerCase().replace('/', '-')}">${recommendedStyle}</span>` : ''}
                        </div>
                        ${techTags ? `<div class="resource-tags"><strong>Tags:</strong> ${techTags}</div>` : ''}
                        <div class="resource-links">${links}</div>
                    </div>`;
                }).join('');

                if (reset) {
                    document.getElementById('resources').innerHTML = resourcesHTML;
                } else {
                    document.getElementById('resources').innerHTML += resourcesHTML;
                }
                
                // Update pagination state
                resourcesState.currentPage++;
                resourcesState.hasMore = data.length === resourcesState.limit;
                
                // Show/hide "Show More" button
                const showMoreBtn = document.getElementById('showMoreResources');
                if (showMoreBtn) {
                    if (resourcesState.hasMore) {
                        showMoreBtn.classList.remove('hidden');
                    } else {
                        showMoreBtn.classList.add('hidden');
                    }
                }
                
            } else {
                if (reset) {
                    document.getElementById('resources').innerHTML = '<div class="no-results">No resources found.</div>';
                }
                resourcesState.hasMore = false;
                const showMoreBtn = document.getElementById('showMoreResources');
                if (showMoreBtn) showMoreBtn.classList.add('hidden');
            }
        })
        .catch(error => {
            console.error('Error fetching resources:', error);
            document.getElementById('resources').innerHTML = '<div class="error">Error fetching resources</div>';
        })
        .finally(() => {
            resourcesState.loading = false;
        });
}

// Enhanced fetchProjects with search and pagination
function enhancedFetchProjects(reset = true, searchTerm = '') {
    if (projectsState.loading) return;
    
    projectsState.loading = true;
    
    if (reset) {
        projectsState.currentPage = 0;
        projectsState.searchTerm = searchTerm;
        document.getElementById('projects').innerHTML = '';
    }

    const params = new URLSearchParams({
        search: projectsState.searchTerm,
        limit: projectsState.limit,
        offset: projectsState.currentPage * projectsState.limit
    });

    // Show loading state
    if (reset) {
        document.getElementById('projects').innerHTML = '<div class="loading">Loading projects...</div>';
    }

    apiFetch(`/api/projects?${params}`)
        .then(response => {
            const data = response.data || response;
            const total = response.total || data.length;
            
            // Update results info
            updateResultsInfo('projectsInfo', data.length, total, projectsState.searchTerm, 'projects');
            
            if (Array.isArray(data) && data.length) {
                const projectsHTML = data.map(project => {
                    let links = '';
                    if (project.github) {
                        links += `<a href="${project.github}" target="_blank" class="project-link">GitHub</a> `;
                    }
                    if (project.url) {
                        links += `<a href="${project.url}" target="_blank" class="project-link">Project Link</a>`;
                    }
                    
                    const description = project.description || '';
                    const industry = project.industry || project.domain || project.category || 'N/A';
                    const skills = project.required_skills || 'N/A';
                    
                    return `<div class="card project-card">
                        <h3>${project.title || project.name}</h3>
                        <p class="project-description">${description}</p>
                        <div class="project-meta">
                            <span class="project-industry"><strong>Industry:</strong> ${industry}</span>
                            ${project.difficulty ? `<span class="project-difficulty"><strong>Difficulty:</strong> ${project.difficulty}</span>` : ''}
                        </div>
                        <div class="project-skills">
                            <strong>Required Skills:</strong> ${skills}
                        </div>
                        <div class="project-links">${links}</div>
                    </div>`;
                }).join('');

                if (reset) {
                    document.getElementById('projects').innerHTML = projectsHTML;
                } else {
                    document.getElementById('projects').innerHTML += projectsHTML;
                }
                
                // Update pagination state
                projectsState.currentPage++;
                projectsState.hasMore = data.length === projectsState.limit;
                
                // Show/hide "Show More" button
                const showMoreBtn = document.getElementById('showMoreProjects');
                if (showMoreBtn) {
                    if (projectsState.hasMore) {
                        showMoreBtn.classList.remove('hidden');
                    } else {
                        showMoreBtn.classList.add('hidden');
                    }
                }
                
            } else {
                if (reset) {
                    document.getElementById('projects').innerHTML = '<div class="no-results">No projects found.</div>';
                }
                projectsState.hasMore = false;
                const showMoreBtn = document.getElementById('showMoreProjects');
                if (showMoreBtn) showMoreBtn.classList.add('hidden');
            }
        })
        .catch(error => {
            console.error('Error fetching projects:', error);
            document.getElementById('projects').innerHTML = '<div class="error">Error fetching projects</div>';
        })
        .finally(() => {
            projectsState.loading = false;
        });
}

// Results info display function
function updateResultsInfo(containerId, currentCount, total, searchTerm, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const resultsCount = container.querySelector('.results-count');
    if (!resultsCount) return;
    
    let message = '';
    if (searchTerm) {
        message = `Found ${total} ${type} matching "${searchTerm}"`;
    } else {
        message = `Showing ${currentCount} of ${total} ${type}`;
    }
    
    resultsCount.textContent = message;
    if (total > 0) {
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
}

// Real-time search with debouncing
function setupSearch() {
    let resourceSearchTimeout;
    let projectSearchTimeout;
    
    // Resources search
    const resourceSearch = document.getElementById('resourceSearch');
    if (resourceSearch) {
        resourceSearch.addEventListener('input', (e) => {
            clearTimeout(resourceSearchTimeout);
            resourceSearchTimeout = setTimeout(() => {
                enhancedFetchResources(resourcesState.selectedStyle, true, e.target.value);
            }, 300);
        });
    }
    
    // Projects search
    const projectSearch = document.getElementById('projectSearch');
    if (projectSearch) {
        projectSearch.addEventListener('input', (e) => {
            clearTimeout(projectSearchTimeout);
            projectSearchTimeout = setTimeout(() => {
                enhancedFetchProjects(true, e.target.value);
            }, 300);
        });
    }
    
    // Clear buttons
    const clearResourceSearch = document.getElementById('clearResourceSearch');
    if (clearResourceSearch) {
        clearResourceSearch.addEventListener('click', () => {
            resourceSearch.value = '';
            enhancedFetchResources(resourcesState.selectedStyle, true, '');
        });
    }
    
    const clearProjectSearch = document.getElementById('clearProjectSearch');
    if (clearProjectSearch) {
        clearProjectSearch.addEventListener('click', () => {
            projectSearch.value = '';
            enhancedFetchProjects(true, '');
        });
    }
    
    // Show More buttons
    const showMoreResources = document.getElementById('showMoreResources');
    if (showMoreResources) {
        showMoreResources.addEventListener('click', () => {
            enhancedFetchResources('', false);
        });
    }
    
    const showMoreProjects = document.getElementById('showMoreProjects');
    if (showMoreProjects) {
        showMoreProjects.addEventListener('click', () => {
            enhancedFetchProjects(false);
        });
    }
}

// Enhanced selectLearningStyle to work with search
function enhancedSelectLearningStyle(style) {
    const styleMapping = {
        'visual': 'Visual',
        'auditory': 'Auditory', 
        'kinesthetic': 'Kinesthetic',
        'reading': 'Reading/Writing'
    };
    
    const searchTerm = document.getElementById('resourceSearch')?.value || '';
    enhancedFetchResources(styleMapping[style] || style, true, searchTerm);
    updateLearningDescription(style);
    updateButtonStates(style);
}

// Initial projects load function
function loadInitialProjects() {
    const searchTerm = document.getElementById('projectSearch')?.value || '';
    enhancedFetchProjects(true, searchTerm);
}

// Override the existing functions with enhanced versions
window.fetchResources = enhancedFetchResources;
window.fetchProjects = enhancedFetchProjects;
window.selectLearningStyle = enhancedSelectLearningStyle;
window.loadInitialProjects = loadInitialProjects;

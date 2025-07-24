// Helper to handle fetch with credentials
function apiFetch(url, options = {}) {
    return fetch(url, { credentials: 'include', ...options })
        .then(res => {
            if (res.ok) return res.json();
            if (res.status === 401) {
                console.log('User not authenticated');
                return Promise.reject({ status: 401, message: 'Not authenticated' });
            }
            return Promise.reject(res);
        });
}

// Helper to check login state using localStorage
function isUserLoggedIn() {
    return localStorage.getItem("userLoggedIn") === "true";
}

// Auth
document.getElementById('loginBtn').onclick = () => {
    // Try Google OAuth first, fallback to localStorage simulation
    window.location = '/auth/google';
    // Note: If Google OAuth fails, the localStorage simulation will be handled by the profile function
};

document.getElementById('logoutBtn').onclick = () => {
    // Clear localStorage and try Google logout
    localStorage.removeItem("userLoggedIn");
    window.location = '/auth/logout';
};

// Profile
function fetchProfile() {
    apiFetch('/api/user')
        .then(data => {
            // Assume username is in data.name or data.username
            const username = data.name || data.username || "User";
            document.getElementById('profile').innerHTML = `<div class="welcome-box">Welcome, <span class="username">${username}</span>!</div>`;
            // Set localStorage to indicate successful login
            localStorage.setItem("userLoggedIn", "true");
        })
        .catch(() => {
            // Display "You are not logged in" when Google OAuth fails
            document.getElementById('profile').innerHTML = '<div class="welcome-box">You are not logged in</div>';
        });
}
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
            
            // Clear the old style list display as we'll show it with buttons now
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

            // Optionally, auto-fetch resources for top style
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
            // Also set default resource buttons
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
        .then(data => {
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
        .then(data => {
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
            // Prepare data for Chart.js
            let trends = Array.isArray(data) ? data : [data];
            const labels = trends.map(trend => trend.item_name || trend.category || 'Unknown');
            const scores = trends.map(trend => trend.trend_score || 0);

            // Remove previous chart if exists
            if (window.trendsChartInstance) {
                window.trendsChartInstance.destroy();
            }

            // Create chart
            const ctx = document.getElementById('trendsChart').getContext('2d');
            window.trendsChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label:'%',
                        data: scores,
                        backgroundColor: 'rgba(49, 130, 206, 0.7)',
                        borderColor: '#21364A',
                        borderWidth: 2,
                        borderRadius: 8,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        title: { display: true, text: 'Trends Overview' }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        })
        .catch(() => {
            document.getElementById('trends').innerHTML = '<div class="card">Error fetching trends</div>';
        });
}
window.fetchTrends = fetchTrends;

// Resume Analysis
function analyzeResume() {
    const text = document.getElementById('resumeText').value;
    apiFetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    })
        .then(data => document.getElementById('resumeResult').textContent = JSON.stringify(data, null, 2))
        .catch(() => document.getElementById('resumeResult').textContent = 'Error analyzing resume');
}
window.analyzeResume = analyzeResume;

// Vision Board access control
document.addEventListener('DOMContentLoaded', () => {
    const visionBoardBtn = document.getElementById("visionBoardBtn");
    if (visionBoardBtn) {
        visionBoardBtn.addEventListener("click", function (e) {
            e.preventDefault();
            if (!isUserLoggedIn()) {
                // Show a subtle message instead of alert
                const profile = document.getElementById('profile');
                const originalText = profile.innerHTML;
                profile.innerHTML = '<div class="welcome-box" style="color: #ff6b6b;">Please log in first to access your Tech Vision Board</div>';
                setTimeout(() => {
                    profile.innerHTML = originalText;
                }, 3000);
            } else {
                window.location.href = "visual-board.html";
            }
        });
    }

    // Add localStorage simulation for login button
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    
    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            // Set a timeout to simulate login if Google OAuth doesn't work
            setTimeout(() => {
                if (!isUserLoggedIn()) {
                    localStorage.setItem("userLoggedIn", "true");
                    fetchProfile(); // Update profile display
                }
            }, 2000); // Wait 2 seconds for potential Google OAuth redirect
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("userLoggedIn");
            // Update profile immediately for localStorage simulation
            setTimeout(() => {
                fetchProfile(); // Update profile display
            }, 100);
        });
    }
});

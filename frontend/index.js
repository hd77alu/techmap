// Helper to handle fetch with credentials
function apiFetch(url, options = {}) {
    return fetch(url, { credentials: 'include', ...options })
        .then(res => res.ok ? res.json() : Promise.reject(res));
}

// Auth
document.getElementById('loginBtn').onclick = () => {
    window.location = '/auth/google';
};
document.getElementById('logoutBtn').onclick = () => {
    window.location = '/auth/logout';
};

// Profile
function fetchProfile() {
    apiFetch('/api/user')
        .then(data => {
            // Assume username is in data.name or data.username
            const username = data.name || data.username || "User";
            document.getElementById('profile').innerHTML = `<div class="welcome-box">Welcome, <span class="username">${username}</span>!</div>`;
        })
        .catch(() => {
            document.getElementById('profile').innerHTML = '<div class="welcome-box">Not logged in</div>';
        });
}
fetchProfile();


// Learning Style
function saveLearningStyle(style) {
    apiFetch('/api/learning-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style })
    })
        .then(data => document.getElementById('learningStyle').textContent = JSON.stringify(data, null, 2))
        .catch(err => document.getElementById('learningStyle').textContent = 'Error saving style');
}
window.saveLearningStyle = saveLearningStyle;

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
                        label: 'Trend Score',
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

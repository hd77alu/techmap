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
        .then(data => document.getElementById('profile').textContent = JSON.stringify(data, null, 2))
        .catch(() => document.getElementById('profile').textContent = 'Not logged in');
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
        .then(data => document.getElementById('resources').textContent = JSON.stringify(data, null, 2))
        .catch(() => document.getElementById('resources').textContent = 'Error fetching resources');
}
window.fetchResources = fetchResources;

// Projects
function fetchProjects() {
    apiFetch('/api/projects')
        .then(data => document.getElementById('projects').textContent = JSON.stringify(data, null, 2))
        .catch(() => document.getElementById('projects').textContent = 'Error fetching projects');
}
window.fetchProjects = fetchProjects;

// Trends
function fetchTrends() {
    apiFetch('/api/trends')
        .then(data => document.getElementById('trends').textContent = JSON.stringify(data, null, 2))
        .catch(() => document.getElementById('trends').textContent = 'Error fetching trends');
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

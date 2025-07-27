document.getElementById('resumeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const input = document.getElementById('resumeInput');
    const file = input.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('resume', file);
    const resultDiv = document.getElementById('analysisResult');
    resultDiv.textContent = 'Analyzing...';
    try {
        const res = await fetch('/api/resume/analyze', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (data.error) {
            resultDiv.textContent = 'Error: ' + data.error;
        } else {
            resultDiv.innerHTML = `<h2>Summary</h2><pre>${data.summary}</pre>
                <h3>Skills</h3><ul>${data.skills.map(s => `<li>${s}</li>`).join('')}</ul>
                <h3>Education</h3><ul>${data.education.map(e => `<li>${e}</li>`).join('')}</ul>
                <h3>Experience</h3><ul>${data.experience.map(ex => `<li>${ex}</li>`).join('')}</ul>`;
        }
    } catch (err) {
        resultDiv.textContent = 'Error: ' + err.message;
    }
});

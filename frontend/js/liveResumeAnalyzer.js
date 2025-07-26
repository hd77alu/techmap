class LiveResumeAnalyzer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.debounceTimer = null;
    this.setupInterface();
  }
  
  setupInterface() {
    this.container.innerHTML = `
      <div class="resume-analyzer">
        <div class="input-section">
          <textarea id="resume-input" placeholder="Paste your resume here for real-time analysis..."></textarea>
          <div class="upload-section">
            <input type="file" id="resume-file" accept=".pdf,.doc,.docx,.txt">
            <label for="resume-file">Or upload resume file</label>
          </div>
        </div>
        
        <div class="analysis-results">
          <div class="skills-section">
            <h3>Detected Skills</h3>
            <div id="detected-skills" class="skills-grid"></div>
          </div>
          
          <div class="gaps-section">
            <h3>Skill Gaps</h3>
            <div id="skill-gaps" class="gaps-list"></div>
          </div>
          
          <div class="recommendations-section">
            <h3>Recommendations</h3>
            <div id="recommendations" class="recommendations-list"></div>
          </div>
          
          <div class="score-section">
            <h3>Resume Score</h3>
            <div id="resume-score" class="score-display"></div>
          </div>
        </div>
      </div>
    `;
    
    this.bindEvents();
  }
  
  bindEvents() {
    const textarea = document.getElementById('resume-input');
    const fileInput = document.getElementById('resume-file');
    
    textarea.addEventListener('input', (e) => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.analyzeResume(e.target.value);
      }, 1000);
    });
    
    fileInput.addEventListener('change', (e) => {
      this.handleFileUpload(e.target.files[0]);
    });
  }
  
  async analyzeResume(resumeText) {
    if (!resumeText.trim()) {
      this.clearResults();
      return;
    }
    
    try {
      const response = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: resumeText, realtime: true })
      });
      
      const analysis = await response.json();
      this.displayResults(analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
      this.displayError('Analysis failed. Please try again.');
    }
  }
  
  displayResults(analysis) {
    this.displayDetectedSkills(analysis.skills);
    this.displaySkillGaps(analysis.gaps);
    this.displayRecommendations(analysis.recommendations);
    this.displayResumeScore(analysis.score);
  }
  
  displayDetectedSkills(skills) {
    const container = document.getElementById('detected-skills');
    
    container.innerHTML = Object.entries(skills.technical)
      .flatMap(([category, skillList]) => 
        skillList.map(skill => `
          <div class="skill-tag ${skill.experience_level}">
            <span class="skill-name">${skill.skill}</span>
            <span class="skill-level">${skill.experience_level}</span>
            <span class="confidence">${Math.round(skill.confidence * 100)}%</span>
          </div>
        `)
      ).join('');
  }
}
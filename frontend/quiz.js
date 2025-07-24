document.getElementById('quizForm').onsubmit = async function(e) {
  e.preventDefault();
  const form = e.target;
  
  // Validate that all questions are answered
  const unansweredQuestions = [];
  for (let i = 1; i <= 15; i++) {
    const checkboxes = form.querySelectorAll(`input[name="q${i}"]:checked`);
    if (checkboxes.length === 0) {
      unansweredQuestions.push(i);
    }
  }
  
  // If there are unanswered questions, show error and stop submission
  if (unansweredQuestions.length > 0) {
    const resultDiv = document.getElementById('quizResult');
    resultDiv.innerHTML = `
      <div style="color: #ff6b6b; background: rgba(255, 107, 107, 0.1); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
        <strong>Please answer all questions!</strong><br>
        You missed question${unansweredQuestions.length > 1 ? 's' : ''}: ${unansweredQuestions.join(', ')}
      </div>
    `;
    
    // Scroll to the first unanswered question
    const firstUnanswered = document.querySelector(`input[name="q${unansweredQuestions[0]}"]`);
    if (firstUnanswered) {
      firstUnanswered.closest('.quiz-question').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      // Add temporary highlight to the question
      const questionDiv = firstUnanswered.closest('.quiz-question');
      questionDiv.style.borderLeft = '4px solid #ff6b6b';
      questionDiv.style.backgroundColor = 'rgba(255, 107, 107, 0.05)';
      setTimeout(() => {
        questionDiv.style.borderLeft = '4px solid #3182ce';
        questionDiv.style.backgroundColor = '';
      }, 3000);
    }
    return;
  }
  
  // Clear any previous error messages
  document.getElementById('quizResult').innerHTML = '';
  
  const scores = { visual: 0, auditory: 0, kinesthetic: 0, reading: 0 };
  
  // Count each checked answer across all 15 questions
  for (let i = 1; i <= 15; i++) {
    const checkboxes = form.querySelectorAll(`input[name="q${i}"]:checked`);
    checkboxes.forEach(checkbox => {
      if (scores[checkbox.value] !== undefined) {
        scores[checkbox.value]++;
      }
    });
  }
  
  // Calculate total selections
  const totalSelections = Object.values(scores).reduce((a, b) => a + b, 0);
  
  // Calculate percentages (or show raw scores if no selections)
  if (totalSelections > 0) {
    Object.keys(scores).forEach(style => {
      scores[style] = Math.round((scores[style] / totalSelections) * 100);
    });
  }

  console.log('VARK Assessment Results:', scores);

  // Send to backend
  try {
    const res = await fetch('/api/learning-style', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(scores)
    });
    
    if (res.status === 401) {
      document.getElementById('quizResult').textContent = "Please log in first to save your assessment.";
      setTimeout(() => window.location = 'index.html', 2000);
      return;
    }
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Server error: ${res.status} - ${errorText}`);
    }
    
    const data = await res.json();
    document.getElementById('quizResult').textContent = "VARK Assessment saved! Redirecting...";

    setTimeout(() => window.location = 'index.html', 1500);
  } catch (error) {
    console.error('Error saving assessment:', error);
    document.getElementById('quizResult').textContent = `Error: ${error.message}`;
  }
};

document.getElementById('quizForm').onsubmit = async function(e) {
  e.preventDefault();
  const form = e.target;
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
  console.log('Total selections:', totalSelections);

  // Send to backend
  try {
    console.log('Sending scores to backend:', scores); // Debug log
    const res = await fetch('/api/learning-style', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(scores)
    });
    
    console.log('Response status:', res.status); // Debug log
    
    if (res.status === 401) {
      document.getElementById('quizResult').textContent = "Please log in first to save your assessment.";
      setTimeout(() => window.location = 'index.html', 2000);
      return;
    }
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Server error response:', errorText); // Debug log
      throw new Error(`Server error: ${res.status} - ${errorText}`);
    }
    
    const data = await res.json();
    console.log('Success response:', data); // Debug log
    document.getElementById('quizResult').textContent = "VARK Assessment saved! Redirecting...";
    setTimeout(() => window.location = 'index.html', 1500);
  } catch (error) {
    console.error('Error saving assessment:', error);
    document.getElementById('quizResult').textContent = `Error: ${error.message}`;
  }
};

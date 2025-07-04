const db = require('./database');

const resources = [
  {
    name: "Free Programming Books",
    type: "Repository",
    url: "https://github.com/EbookFoundation/free-programming-books",
    recommended_style: "Reading/Writing",
    tech_tags: "Programming,Books,General"
  },
  {
    name: "Awesome Learning Resources",
    type: "Repository",
    url: "https://github.com/lauragift21/awesome-learning-resources",
    recommended_style: "Visual,Reading/Writing",
    tech_tags: "General,Learning,Development"
  },
  {
    name: "Python for Everybody (University of Michigan)",
    type: "Online Course",
    url: "https://www.py4e.com/",
    recommended_style: "Visual,Auditory",
    tech_tags: "Python,Beginner,Data Science"
  },
  {
    name: "CS50's Introduction to Computer Science",
    type: "Online Course",
    url: "https://cs50.harvard.edu/x/2025/",
    recommended_style: "Visual,Auditory,Kinesthetic,Reading/Writing",
    tech_tags: "Computer Science,Algorithms,Programming,C,Python,SQL"
  },
  {
    name: "Python 101 by Michael Driscoll",
    type: "Book",
    url: "https://python101.pythonlibrary.org/",
    recommended_style: "Reading/Writing",
    tech_tags: "Python,Beginner"
  }
];

db.serialize(() => {
  const stmt = db.prepare(`
    INSERT INTO resources (name, type, url, recommended_style, tech_tags)
    VALUES (?, ?, ?, ?, ?)
  `);

  resources.forEach(r => {
    stmt.run(r.name, r.type, r.url, r.recommended_style, r.tech_tags);
  });

  stmt.finalize();
  console.log("✅ Sample resources inserted into the database.");
});

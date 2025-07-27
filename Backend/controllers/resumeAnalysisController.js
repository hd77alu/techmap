const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

// Simple resume analysis: extract text and basic info
async function analyzeResume(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    let text = '';
    if (ext === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        text = data.text;
    } else if (ext === '.txt') {
        text = fs.readFileSync(filePath, 'utf8');
    } else {
        throw new Error('Unsupported file type');
    }
    // Basic analysis: extract lines with keywords
    const skills = [];
    const education = [];
    const experience = [];
    const lines = text.split('\n');
    lines.forEach(line => {
        if (/skill/i.test(line)) skills.push(line);
        if (/education|degree|university/i.test(line)) education.push(line);
        if (/experience|worked|company/i.test(line)) experience.push(line);
    });
    return { skills, education, experience, summary: text.slice(0, 500) };
}

exports.analyzeResume = analyzeResume;

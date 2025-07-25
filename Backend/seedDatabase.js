const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const db = require('./models/database');

// Define CSV file paths (assuming they're in a 'data' folder)
const CSV_FILES = {
    resources: path.join(__dirname, 'data', 'resources.csv'),
    projects: path.join(__dirname, 'data', 'projects.csv'),
    trending_data: path.join(__dirname, 'data', 'trending_data.csv')
};

// Function to read and parse CSV file
function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}

// Helper function to clean comma-separated values
function cleanCommaSeparated(value) {
    if (!value) return '';
    return value
        .split(',')
        .map(item => item.trim().replace(/^"/, '').replace(/"$/, '')) // Remove quotes
        .join(', '); // Rejoin with consistent spacing
}

// Function to seed resources table
async function seedResources(data) {
    console.log('Seeding resources table...');
    const stmt = db.prepare(`
        INSERT OR REPLACE INTO resources (name, type, url, recommended_style, tech_tags)
        VALUES (?, ?, ?, ?, ?)
    `);

    for (const row of data) {
        try {
            stmt.run(
                row.name,
                row.type,
                row.url,
                cleanCommaSeparated(row.recommended_style),
                cleanCommaSeparated(row.tech_tags)
            );
        } catch (error) {
            console.error('Error inserting resource:', row.name, error.message);
        }
    }
    stmt.finalize();
    console.log(`✅ Inserted ${data.length} resources`);
}

// Function to seed projects table
async function seedProjects(data) {
    console.log('Seeding projects table...');
    const stmt = db.prepare(`
        INSERT OR REPLACE INTO projects (name, description, url, industry, required_skills)
        VALUES (?, ?, ?, ?, ?)
    `);

    for (const row of data) {
        try {
            stmt.run(
                row.name,
                row.description,
                row.url,
                row.industry,
                cleanCommaSeparated(row.required_skills)
            );
        } catch (error) {
            console.error('Error inserting project:', row.name, error.message);
        }
    }
    stmt.finalize();
    console.log(`✅ Inserted ${data.length} projects`);
}

// Function to seed trending_data table
async function seedTrendingData(data) {
    console.log('Seeding trending_data table...');
    const stmt = db.prepare(`
        INSERT OR REPLACE INTO trending_data (category, item_name, trend_score, update_date)
        VALUES (?, ?, ?, datetime('now'))
    `);

    for (const row of data) {
        try {
            stmt.run(
                row.category,
                row.Item_name || row.item_name,
                parseFloat(row.trend_score) || 0
            );
        } catch (error) {
            console.error('Error inserting trend data:', row.Item_name || row.item_name, error.message);
        }
    }
    stmt.finalize();
    console.log(`✅ Inserted ${data.length} trending data entries`);
}

// Main seeding function
async function seedDatabase() {
    console.log('Starting database seeding...\n');

    try {
        // Check if CSV files exist
        for (const [tableName, filePath] of Object.entries(CSV_FILES)) {
            if (!fs.existsSync(filePath)) {
                console.error(`❌ CSV file not found: ${filePath}`);
                console.log(`Please ensure the file exists or update the path in seedDatabase.js`);
                return;
            }
        }

        // Seed resources
        if (fs.existsSync(CSV_FILES.resources)) {
            const resourcesData = await readCSV(CSV_FILES.resources);
            await seedResources(resourcesData);
        }

        // Seed projects
        if (fs.existsSync(CSV_FILES.projects)) {
            const projectsData = await readCSV(CSV_FILES.projects);
            await seedProjects(projectsData);
        }

        // Seed trending data
        if (fs.existsSync(CSV_FILES.trending_data)) {
            const trendingData = await readCSV(CSV_FILES.trending_data);
            await seedTrendingData(trendingData);
        }

        console.log('\nDatabase seeding completed successfully!');
        console.log('You can now start the server with: npm start');

    } catch (error) {
        console.error('❌ Error during seeding:', error);
    } finally {
        db.close();
    }
}

// Run seeding if this file is executed directly
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase };

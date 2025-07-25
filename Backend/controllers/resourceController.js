const Resource = require('../models/resourceModel');

// Helper function to split and clean comma-separated values
function parseCommaSeparated(value) {
    if (!value) return [];
    return value.split(',').map(item => item.trim().replace(/"/g, ''));
}

exports.getResources = async (req, res) => {
  try {
    const { style, tag } = req.query;
    const list = await Resource.getByStyle(style, tag);
    
    // Process the results to parse comma-separated values
    const processedResults = list.map(resource => ({
        ...resource,
        recomended_styles: parseCommaSeparated(resource.recomended_style),
        tech_tags_array: parseCommaSeparated(resource.tech_tags)
    }));
    
    res.json(processedResults);
  } catch (err) { 
    console.error('Error fetching resources:', err);
    res.status(500).json({ error: 'Failed to fetch resources' }); 
  }
};
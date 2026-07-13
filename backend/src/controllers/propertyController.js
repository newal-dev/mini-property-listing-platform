const propertyService = require('../services/propertyService');

async function listProperties(req,res) {
    try {
        const properties = await propertyService.getPublishedProperties();
        res.status(200).json(properties);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}

module.exports = { listProperties };
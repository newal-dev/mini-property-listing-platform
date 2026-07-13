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

async function createProperty(req,res) {
    try {
        const { title, description, location, price } = req.body;
        const property = await propertyService.createProperty({
            ownerId: req.user.userId,
            title,
            description, 
            location, 
            price,
        });
        res.status(201).json(property);
    } catch (error) {
        if(error.statusCode) {
            return res.status(error.statusCode).json({ error:error.message });
        }
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}

async function publishProperty(req, res) {
    try {
        const property = await propertyService.publishProperty({
            propertyId: req.params.id,
            ownerId: req.user.userId,
        });
        res.status(200).json(property);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error(error);
        res.status(500).json({ error: 'Something went wrong'});
    }
}

module.exports = { listProperties, createProperty, publishProperty };
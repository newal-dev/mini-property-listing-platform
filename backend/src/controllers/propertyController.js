const propertyService = require('../services/propertyService');
const imageService = require('../services/imageService');
const { image } = require('../config/cloudinary');

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

async function uploadImage(req,res) {
    try {
        if(!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }
        const image = await imageService.uploadPropertyImage({
            propertyId: req.params.id,
            ownerId: req.user.userId,
            fileBuffer: req.file.buffer,
        });
        res.status(201).json(image);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message});
        }
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}

async function updateProperty(req,res) {
    try {
        const property = await propertyService.updateProperty({
            propertyId: req.params.id,
            ownerId: req.user.userId,
            updates: req.body,
        });
        res.status(200).json(property);
    } catch (error) {
        if(error.statusCode) return res.status(error.statusCode).json({ error: error.message});
        console.error(error);
        res.status(500).json({ error: 'Something went wrong'});
    }
}

async function listAllForAdmin(req,res) {
    try{
        const properties = await propertyService.getAllPropertiesForAdmin();
        res.status(200).json(properties);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong'});
    }
}

async function disableProperty(req, res) {
    try {
        const property = await propertyService.disableProperty({ propertyId: req.params.id });
        res.status(200).json(property);
    } catch (error) {
        if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}


async function deleteProperty(req,res) {
    try {
        await propertyService.deleteProperty({
            propertyId: req.params.id,
            ownerId: req.user.userId,
        });
        res.status(204).send();
    } catch(error) {
        if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}
module.exports = { listProperties, createProperty, publishProperty, uploadImage, updateProperty, listAllForAdmin, disableProperty, deleteProperty };
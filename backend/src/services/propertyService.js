const { PropertyStatus } = require('@prisma/client');
const prisma = require('../config/prisma');

async function getPublishedProperties() {
    return prisma.property.findMany({
        where: {
            status: PropertyStatus.PUBLISHED,
            deletedAt: null,
        },
    });
}

async function createProperty({ ownerId, title, description, location, price }) {
    if (!title || !description || !location || !price === undefined) {
        const error = new Error('Title, description, location, and price are required');
        error.status(400);
        throw error;
    }

    if (typeof price !=='number' || price <= 0) {
        const error = new Error('Price must be a positive number');
        error.statusCode = 400;
        throw error;
    }

    return prisma.property.create({
        data: {
            ownerId,
            title,
            description,
            location,
            price,
            status: PropertyStatus.DRAFT,
        },
    });
}

module.exports = { getPublishedProperties, createProperty };
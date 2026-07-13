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
    if (!title || !description || !location || price === undefined) {
        const error = new Error('Title, description, location, and price are required');
        error.statusCode = 400;
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

async function publishProperty({ propertyId, ownerId}) {
    return prisma.$transaction(async (tx) => {
        const property = await tx.property.findUnique({
            where: {id: propertyId },
            include: { images: true },
        });

        if(!property || property.deletedAt) {
            const error = new Error('Property not found');
            error.statusCode = 404;
            throw error;
        }

        if(property.ownerId !== ownerId) {
            const error = new Error('Property not found');
            error.statusCode = 404;
            throw error;
        }

        if (property.status !== PropertyStatus.DRAFT) {
            const error = new Error('Only draft properties can be published');
            error.statusCode = 409;
            throw error;
        }

        if (property.images.length < 1) {
            const error = new Error('Property must have at least one image before publishing');
            error.statusCode = 400;
            throw error;
        }

        return tx.property.update({
            where: {id: propertyId },
            data: { status: PropertyStatus.PUBLISHED },
        });
    });
}

module.exports = { getPublishedProperties, createProperty, publishProperty };
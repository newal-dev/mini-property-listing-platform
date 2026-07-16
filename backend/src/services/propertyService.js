const { PropertyStatus } = require('@prisma/client');
const prisma = require('../config/prisma');

async function getPublishedProperties({ page = 1, limit = 10, location, minPrice, maxPrice }) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const where = {
        status: PropertyStatus.PUBLISHED,
        deletedAt: null,
        ...(location && { location: { contains: location, mode: 'insensitive' } }),
        ...(minPrice && { price: { gte: Number(minPrice) } }),
        ...(maxPrice && { price: { ...(minPrice ? {gte: Number(minPrice) } :{}), lte: Number(maxPrice) } }),
    };

    const [properties, total] = await Promise.all([
        prisma.property.findMany({
            where,
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
            include: {
                images: true,
            },
        }),
        prisma.property.count({ where }),
    ]);

    return { properties, total, page: pageNum, totalPages: Math.ceil(total / limitNum) };
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

async function updateProperty({ propertyId, ownerId, updates}) {
    const property = await prisma.property.findUnique({ where: { id: propertyId} });

    if(!property || property.deletedAt || property.ownerId !== ownerId) {
        const error = new Error('Property not found');
        error.statusCode(404);
        throw error;
    }

    if (property.status !== PropertyStatus.DRAFT) {
        const error = new Error('Only draft properties can be edited');
        error.statusCode = 409;
        throw error;
    }

    const allowedFields = ['title', 'description', 'location', 'price'];
    const data = {};
    for (const field of allowedFields) {
        if (updates[field] !== undefined) data[field] = updates[field];
    }

    return prisma.property.update({ where: { id: propertyId }, data });
}

async function getAllPropertiesForAdmin() {
    return prisma.property.findMany({ where: { deletedAt: null },
    include: {
            images: true
        }
    });
}

async function disableProperty({ propertyId }){
    const property = await prisma.property.findUnique({ where: { id: propertyId } });

    if (!property || property.deletedAt) {
        const error = new Error('Property not found');
        error.statusCode = 404;
        throw error;
    }

    return prisma.property.update({
        where: { id: propertyId },
        data: { status: PropertyStatus.ARCHIVED },
    });
}

async function deleteProperty({ propertyId, ownerId }) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });

    if(!property || property.deletedAt || property.ownerId !== ownerId) {
        const error = new Error('Property not found');
        error.statusCode = 404;
        throw error;
    }

    if(property.status !== PropertyStatus.ARCHIVED) {
        const error = new Error('Property must be archived before it can be deleted');
        error.statusCode = 409;
        throw error;
    }

    return prisma.property.update({
        where: { id: propertyId},
        data: { deletedAt: new Date() },
    });
}


async function getMyProperties({ ownerId }) {
    return prisma.property.findMany ({ 
        where: { ownerId, deletedAt: null},
        include: { images: true },
    });
}

module.exports = { getPublishedProperties, createProperty, publishProperty, updateProperty, getAllPropertiesForAdmin, disableProperty, deleteProperty, getMyProperties };
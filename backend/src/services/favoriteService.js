const prisma = require('../config/prisma');
const { propertyStatus, PropertyStatus } = require('@prisma/client');

async function addFavorite({ userId, propertyId }) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });

    if(!property || property.deletedAt || property.status !== PropertyStatus.PUBLISHED) {
        const error = new Error('Property not found');
        error.statusCode = 404;
        throw error;
    }

    try {
        return await prisma.favorite.create({ data: { userId, propertyId } });
    } catch (error) {
        if(error.code === 'P2002') {
            const conflictError = new Error('Property already favorited');
            conflictError.statusCode = 409;
            throw conflictError;
        }
        throw error;
    }
}

async function removeFavorite({ userId, propertyId }){
    await prisma.favorite.deleteMany({ where: {userId, propertyId } });
}

async function getMyFavorites({ userId }) {
  return prisma.favorite.findMany({
    where: { userId },
    include: { property: { include: { images: true } }},
  });
}

module.exports = { addFavorite, removeFavorite, getMyFavorites };
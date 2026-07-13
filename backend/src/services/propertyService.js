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

module.exports = { getPublishedProperties };
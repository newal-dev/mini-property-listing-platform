const cloudinary = require('../config/cloudinary');
const prisma = require('../config/prisma');

async function uploadPropertyImage({ propertyId, ownerId, fileBuffer }) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });

    if (!property || property.deletedAt || property.ownerId !== ownerId) {
        const error = new Error('Property not found');
        error.statusCode = 404;
        throw error;
    }

    if (property.status !== 'DRAFT') {
        const error = new Error('Images can only be added to draft properties');
        error.statusCode = 409;
        throw error;
    }

    const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'property-platform' },
            (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(fileBuffer);
    });

    return prisma.propertyImage.create({
        data: { propertyId, url: uploadResult.secure_url },
    });
}

module.exports = { uploadPropertyImage };
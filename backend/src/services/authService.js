const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');

async function registerUser({ name, email, password, role }) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (exisitngUser) {
        const error = new Error('Email already in use');
        error.statusCodde = 409;
        throw error;
    }

    const passwordHash = await bcrypt.hash(password,10);

    const user = await prisma.user.create({
        data: { name, email, passwordHash, role: role || 'USer' },
    });

    return user;
}

module.exports = {registerUser};
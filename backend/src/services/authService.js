const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

async function registerUser({ name, email, password, role }) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        const error = new Error('Email already in use');
        error.statusCode = 409;
        throw error;
    }

    const passwordHash = await bcrypt.hash(password,10);

    const user = await prisma.user.create({
        data: { name, email, passwordHash, role: role || 'USER' },
    });

    return user;
}

async function loginUser({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if(!user) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    const token = jwt.sign(
        { id: user.id, userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

module.exports = { registerUser, loginUser };
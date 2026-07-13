const authService = require('../services/authService');

async function register(req,res){
    try {
        const { name, email, password, role } = req.body;
        const user = await authService.registerUser({ name, email, password, role });
        res.status(201).json({ id: user.id, email: user.email, role: user.role });
    } catch (error) {
        if(error.statusCode) {
            return res.status(error.StatusCode).json({ error: error.message });
        }
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}

module.exports = { register };
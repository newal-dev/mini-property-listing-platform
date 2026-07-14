const authService = require('../services/authService');

async function register(req,res){
    try {
        const { name, email, password, role } = req.body;
        const user = await authService.registerUser({ name, email, password, role });
        res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
        if(error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser({ email, password });
        res.status(200).json(result);
    } catch (error) {
        if(error.statusCode) {
            return res.status(error.StatusCode).json({ error: error.message});
        }
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}

module.exports = { register, login };
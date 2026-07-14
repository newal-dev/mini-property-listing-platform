require('dotenv').config();
const express = require('express');
const propertyRoutes = require('./routes/propertyRoutes');
const authRoutes = require('./routes/authRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get('/health', (req,res)=>{
    res.status(200).json({ status: 'ok' });
});

app.use('/api/properties', propertyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoriteRoutes);

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});
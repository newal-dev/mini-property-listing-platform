require('dotenv').config();
const express = require('express');
const cors = require('cors');
const propertyRoutes = require('./routes/propertyRoutes');
const authRoutes = require('./routes/authRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: (origin, callback) => {
    // Always allow requests from localhost (dev) or no origin (curl/Postman)
    if (!origin || origin.startsWith('http://localhost:3000')) {
      return callback(null, true);
    }

    // Allow any *.vercel.app domain
    if (/\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Otherwise block
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

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
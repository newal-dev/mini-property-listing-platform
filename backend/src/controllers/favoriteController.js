const favoriteService = require('../services/favoriteService');

async function addFavorite(req, res) {
    try {
        const favorite = await favoriteService.addFavorite({
            userId: req.user.userId,
            propertyId: req.params.id,
        });
        res.status(201).json(favorite);
    } catch (error) {
        if(error.statusCode) return res.status(error.statusCode).json({ error: error.message });
        console.error(error);
        res.status(500). json({ error: 'Something went wrong' });
    }
}

async function removeFavorite(req,res) {
    try{
        await favoriteService.removeFavorite({
            userId: req.user.userId,
            propertyId: req.params.id,
        });
        res.status(204).send();
    } catch(error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}

async function listMine(req, res) {
  try {
    const favorites = await favoriteService.getMyFavorites({ userId: req.user.id });
    res.status(200).json(favorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong'});
  }
}

module.exports = { addFavorite, removeFavorite, listMine };
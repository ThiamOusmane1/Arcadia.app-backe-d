const express = require('express');
const router = express.Router();
const Habitat = require('../models/habitats');

// Route pour afficher tous les habitats
router.get('/', async (req, res) => {
  try {
    const habitats = await Habitat.find().populate('animaux');
    res.json(habitats); // Renvoie les données en JSON
  } catch (error) {
    console.error('Error fetching habitats:', error.message);
    res.status(500).send('Error fetching habitats');
  }
});

// Route pour afficher les animaux par habitat
router.get('/:habitatName', async (req, res) => {
  try {
    const habitatName = req.params.habitatName;
    const habitat = await Habitat.findOne({ nom: new RegExp('^' + habitatName + '$', 'i') }).populate('animaux');
    if (!habitat) {
      return res.status(404).send('Habitat not found');
    }
    res.json(habitat); // Renvoie les données en JSON
  } catch (error) {
    console.error('Error fetching animals for habitat:', error.message);
    res.status(500).send('Error fetching animals for habitat');
  }
});

module.exports = router;


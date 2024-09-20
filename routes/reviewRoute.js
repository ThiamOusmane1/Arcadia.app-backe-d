const express = require('express');
const router = express.Router();
const Review = require('../models/reviews');

// Route POST pour soumettre un avis
router.post('/', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
    }

    try {
        const newReview = new Review({ name, email, subject, message });
        await newReview.save();
        res.status(201).json({ message: 'Avis envoyé avec succès.' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'avis.' });
    }
});

module.exports = router;

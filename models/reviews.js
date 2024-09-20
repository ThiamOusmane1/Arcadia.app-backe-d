const mongoose = require('mongoose');

// Schéma pour les avis des utilisateurs
const reviewSchema = new mongoose.Schema({
    name: { type: String, required: true },           // Nom de l'utilisateur
    subject: { type: String, required: true },        // Sujet de l'avis
    message: { type: String, required: true },        // Message de l'avis
    email: { type: String, required: true },          // Adresse email de l'utilisateur
    createdAt: { type: Date, default: Date.now }      // Date de création automatique
 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

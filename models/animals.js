const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
  nom: { type: String, required: true, unique: true },
  sante: { type: String, required: true },
  poids: { type: Number, required: true, min: 0 }, // Poids en kg
  nourriture: { type: String, required: true },
  quantite: { type: Number, required: true, min: 0 }, // Quantité
  habitat: { type: mongoose.Schema.Types.ObjectId, ref: 'Habitat', required: true },
  url: { type: String, required: true, match: /^(http|https):\/\/[^ "]+$/ }, // URL de l'image
  consultations: { type: Number, default: 0 }, // Compteur de consultations
  soins: { type: String, required: true }
});

animalSchema.index({ nom: 1 });
animalSchema.index({ habitat: 1 });

const Animal = mongoose.model('Animal', animalSchema);

module.exports = Animal;


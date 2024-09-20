const mongoose = require('mongoose');

const habitatSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  animaux: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Animal' }]
});

const Habitat = mongoose.model('Habitat', habitatSchema);

module.exports = Habitat;


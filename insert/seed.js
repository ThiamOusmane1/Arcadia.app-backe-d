require('dotenv').config();
const mongoose = require('mongoose');
const Animal = require('../models/animals');
const Habitat = require('../models/habitats');

const animaux = [
  { nom: 'Lion', sante: 'Bonne', poids: 190, nourriture: 'Viande', quantite: 10, url: 'Lion.jpg', habitat: 'Savane' },
  { nom: 'Zèbre', sante: 'Excellente', poids: 300, nourriture: 'Herbe', quantite: 5, url: 'Zèbre.jpg', habitat: 'Savane' },
  { nom: 'Singe', sante: 'Bonne', poids: 35, nourriture: 'Fruits', quantite: 3, url: 'Singe.jpg', habitat: 'Jungle' },
  { nom: 'Tigre', sante: 'Bonne', poids: 220, nourriture: 'Viande', quantite: 8, url: 'Tigre.jpg', habitat: 'Jungle' },
  { nom: 'Crocodile', sante: 'Excellente', poids: 500, nourriture: 'Viande', quantite: 12, url: 'Crocodile.jpg', habitat: 'Marais' },
  { nom: 'Héron', sante: 'Bonne', poids: 2, nourriture: 'Poisson', quantite: 1, url: 'Héron.jpg', habitat: 'Marais' }
];

const habitats = [
  {
    nom: 'Savane',
    description: 'Une vaste étendue herbeuse où vivent de nombreux animaux.',
    image: 'pictures/savane.jpg',
    animaux: []  
  },
  {
    nom: 'Jungle',
    description: 'Une forêt dense avec une grande variété de faune et de flore.',
    image: 'pictures/jungle.jpg',
    animaux: [] 
  },
  {
    nom: 'Marais',
    description: 'Des zones humides où vivent des reptiles et des oiseaux aquatiques.',
    image: 'pictures/marais.jpg',
    animaux: []  
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Supprimer les collections existantes
    await Animal.deleteMany({});
    await Habitat.deleteMany({});

    // Insérer les animaux
    const animauxInstances = await Animal.insertMany(animaux);

    // Mettre à jour les animaux existants pour ajouter le champ `consultations` avec une valeur par défaut
    await Animal.updateMany(
      { consultations: { $exists: false } }, // Cible les documents sans le champ `consultations`
      { $set: { consultations: 0 } } // Ajoute le champ `consultations` avec la valeur `0`
    );

    // Définir les animaux pour chaque habitat
    habitats[0].animaux = animauxInstances.filter(a => ['Lion', 'Zèbre'].includes(a.nom)).map(a => a._id);
    habitats[1].animaux = animauxInstances.filter(a => ['Singe', 'Tigre'].includes(a.nom)).map(a => a._id);
    habitats[2].animaux = animauxInstances.filter(a => ['Crocodile', 'Héron'].includes(a.nom)).map(a => a._id);

    // Insérer les habitats
    await Habitat.insertMany(habitats);

    console.log('Database seeded successfully');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();

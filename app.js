require('dotenv').config();
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/connection');

// Import des modèles pour s'assurer qu'ils sont enregistrés
require('./models/habitats');
const Animal = require('./models/animals');
const User = require('./models/user');

// Import des routeurs
const animalRouter = require('./routes/animals');
const habitatRouter = require('./routes/habitats');
const reviewRouter = require('./routes/reviewRoute'); 
const authRoutes = require('./routes/auth');

const app = express();
const port = 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret'; // Secret pour JWT

// Configuration CORS pour permettre les requêtes du frontend
app.use(cors({
    origin: ['http://127.0.0.1:8080', 'https://backarcadia.vercel.app',],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    credentials: true
}));

// Middleware pour parser le body des requêtes
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir les fichiers statiques du répertoire 'front-end' (images, CSS, JS, etc.)
app.use(express.static(path.join(__dirname, '../front-end')));

// Servir les images depuis le répertoire 'front-end/pictures'
app.use('/pictures', express.static(path.join(__dirname, '../front-end/pictures')));

// Route de base pour la racine
app.get('/', (req, res) => {
    res.send('Bienvenue sur l\'API Zoo Arcadia !');
});

// Route pour obtenir les détails d'un animal spécifique
app.get('/api/animal-details', async (req, res) => {
    const animalId = req.query.id;

    try {
        const animal = await Animal.findById(animalId);
        if (!animal) {
            return res.status(404).json({ message: 'Animal non trouvé' });
        }

        // Renvoie les détails de l'animal en JSON
        res.json({
            nom: animal.nom,
            sante: animal.sante,
            poids: animal.poids,
            nourriture: animal.nourriture,
            quantite: animal.quantite,
            consultations: animal.consultations,
            url: animal.url 
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des détails de l\'animal:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.post('/api/update-counter', async (req, res) => {
    const { id: animalId } = req.body; // Récupération de l'ID depuis le corps de la requête

    if (!animalId) {
        return res.status(400).json({ message: 'Animal ID is required' });
    }

    try {
        const animal = await Animal.findById(animalId);

        if (!animal) {
            return res.status(404).json({ message: 'Animal non trouvé' });
        }

        animal.consultations = (animal.consultations || 0) + 1;
        await animal.save();

        res.json({ consultations: animal.consultations });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du compteur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});



// Mise à jour de la route API pour inclure le peuplement de l'habitat
app.get('/api/vet/animals', async (req, res) => {
    try {
        const animals = await Animal.find()
            .populate('habitat', 'nom') // Peupler l'habitat avec uniquement le champ nom
            .select('nom sante poids habitat url nourriture quantite');
        res.status(200).json(animals);
    } catch (error) {
        console.error('Erreur lors de la récupération des informations vétérinaires :', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des informations vétérinaires' });
    }
});

// Route API pour mettre à jour un animal
app.put('/api/vet/animals/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { sante, poids, soins } = req.body;

        // Mise à jour de l'animal
        const updatedAnimal = await Animal.findByIdAndUpdate(id, {
            sante: sante,
            poids: poids,
            soins: soins
        }, { new: true }); // Option { new: true } pour retourner l'animal mis à jour

        if (!updatedAnimal) {
            return res.status(404).json({ message: 'Animal non trouvé' });
        }

        res.status(200).json(updatedAnimal);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'animal :', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'animal' });
    }
});



//  Routeurs pour les différentes API
app.use('/api/animals', animalRouter);
app.use('/api/habitats', habitatRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/auth', authRoutes.router);

// Route de connexion avec JWT
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Vérifier si l'utilisateur existe avec l'email donné
        const user = await User.findOne({ email });

        if (user) {
            // Comparer le mot de passe entré avec le mot de passe haché dans la base de données
            const isPasswordCorrect = await bcrypt.compare(password, user.password);

            if (isPasswordCorrect) {
                // Si le mot de passe est correct, générer un token JWT
                const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

                // Répondre avec un message de succès et renvoyer le token
                return res.status(200).json({ message: 'Connexion réussie', token });
            } else {
                return res.status(401).json({ message: 'Mot de passe incorrect' });
            }
        } else {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
    } catch (err) {
        console.error('Erreur lors de la connexion:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Middleware pour vérifier le token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Récupère le token

    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide' });
        }
        req.user = user; // Stocker les infos du token décrypté (userId, role)
        next();
    });
};

// Middleware d'autorisation des rôles
const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        const { role } = req.user;
        if (allowedRoles.includes(role)) {
            next(); // Passe à la route suivante si le rôle est autorisé
        } else {
            res.status(403).json({ message: 'Accès refusé.' });
        }
    };
};

// Route protégée avec authentification JWT
app.get('/api/protected-route', authenticateToken, (req, res) => {
    res.json({ message: 'Accès autorisé', user: req.user });
});

// Exemple de route protégée avec rôle spécifique
app.get('/api/admin-dashboard', authenticateToken, authorizeRole('admin'), (req, res) => {
    res.json({ message: 'Bienvenue sur le tableau de bord admin' });
});

// Démarre le serveur et la connexion à la base de données
const startServer = async () => {
    try {
        await connectDB();
        console.log('Base de données connectée avec succès !');

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}/`);
        });
    } catch (err) {
        console.error('Erreur lors du démarrage du serveur:', err);
    }
};

startServer();




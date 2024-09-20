// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');  // Importation du modèle User

const JWT_SECRET = process.env.JWT_SECRET || 'default JWT_SECRET ';

// Route de connexion
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Utilisateur non trouvé' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Mot de passe incorrect' });

        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });

    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
});

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Récupère le token

    console.log('Token reçu:', token); // Pour vérifier que le token est bien reçu

    if (!token) return res.status(401).json({ message: 'Token manquant' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Erreur lors de la vérification du token:', err);
            return res.status(403).json({ message: 'Token invalide' });
        }
        req.user = user; // Stocker les infos du token décrypté (userId, role)
        console.log('Utilisateur décodé du token:', req.user); // Pour vérifier les infos du token
        next();
    });
};


// Middleware pour vérifier les rôles
function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) { 
            return res.status(403).json({ message: 'Accès interdit' });
        }
        next();
    };
}

// Route protégée pour récupérer le rôle de l'utilisateur
router.get('/getUserRole', authenticateToken, (req, res) => {
    const { role } = req.user;  // Le rôle est extrait du token JWT
    res.json({ role });
});

module.exports = { router, authenticateToken, authorizeRoles };

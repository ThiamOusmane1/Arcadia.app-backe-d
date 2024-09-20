const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Middleware d'authentification
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token manquant' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token invalide' });
        req.user = user;
        next();
    });
}

// Middleware d'autorisation en fonction des rôles
function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Accès interdit : rôle insuffisant' });
        }
        next();
    };
}

module.exports = { authenticateToken, authorizeRoles };

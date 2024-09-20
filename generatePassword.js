const bcrypt = require('bcrypt');

const passwords = ['adminpass', 'vetpass', 'employeepass'];

const generateHashes = async () => {
    for (const password of passwords) {
        try {
            // Générer un sel avec un nombre de rounds de 10 (vous pouvez ajuster ce nombre si nécessaire)
            const salt = await bcrypt.genSalt(10);
            
            // Hacher le mot de passe avec le sel généré
            const hash = await bcrypt.hash(password, salt);
            
            // Afficher le mot de passe et son hachage
            console.log(`Password: ${password}, Hash: ${hash}`);
        } catch (error) {
            console.error('Error generating hash:', error);
        }
    }
};

generateHashes();

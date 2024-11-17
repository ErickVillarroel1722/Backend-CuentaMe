const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Leer el token del encabezado de la solicitud (Authorization: Bearer <token>)
    const token = req.header('Authorization')?.replace('Bearer ', '');  // Quitar el "Bearer " del encabezado

    // Si no hay token, denegar acceso
    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No hay token proporcionado.' });
    }

    try {
        // Verificar el token con la clave secreta
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // Adjuntar el usuario decodificado al objeto `req` para usarlo en las rutas protegidas
        req.user = verified; 

        // Continuar con la siguiente función (ruta)
        next();
    } catch (error) {
        // Si el token es inválido o ha expirado
        res.status(400).json({ message: 'Token inválido.' });
    }
};

module.exports = authMiddleware;

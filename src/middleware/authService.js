import jwt from "jsonwebtoken";
import Administrador from "../database/models/Users/Administrator.js";
import User from "../database/models/Users/User.js";

const verificarAutenticacion = async (req, res, next) => {
  // Validar si se está enviando el token
  const token = req.headers.authorization?.split(" ")[1]; // Extraer el token del header
  if (!token) {
    return res.status(401).json({ msg: "Lo sentimos, debes proporcionar un token" });
  }

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Primero intentamos buscar al administrador
    const admin = await Administrador.findById(decoded.id).select("-password -token");

    if (admin) {
      // Si es un administrador, agregamos los datos del admin a req
      req.user = admin;
      req.role = 'admin'; // Opcional, si quieres diferenciar los roles en el futuro
      return next(); // Pasar al siguiente middleware o controlador
    }

    // Si no encontramos al admin, buscamos al usuario normal
    const user = await User.findById(decoded.id).select("-password -token");

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Si encontramos al usuario, agregamos sus datos a req
    req.user = user;
    req.role = 'user'; // Opcional, si quieres diferenciar los roles en el futuro
    next(); // Pasar al siguiente middleware o controlador

  } catch (error) {
    console.error("Error verificando el token:", error);
    return res.status(401).json({ msg: "Token no válido o expirado" });
  }
};

export default verificarAutenticacion;
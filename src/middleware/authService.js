import jwt from "jsonwebtoken";
import Administrador from "../database/models/Users/Administrator.js";

const verificarAutenticacion = async (req, res, next) => {
  // Validar si se está enviando el token
  const token = req.headers.authorization?.split(" ")[1]; // Extraer el token del header
  if (!token) {
    return res.status(401).json({ msg: "Lo sentimos, debes proporcionar un token" });
  }

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar al administrador por ID en la base de datos
    const admin = await Administrador.findById(decoded.id).select("-password -token");

    if (!admin) {
      return res.status(404).json({ msg: "Administrador no encontrado" });
    }

    // Agregar los datos del administrador a req
    req.user = admin;
    next(); // Pasar al siguiente middleware o controlador
  } catch (error) {
    console.error("Error verificando el token:", error);
    return res.status(401).json({ msg: "Token no válido o expirado" });
  }
};

export default verificarAutenticacion;
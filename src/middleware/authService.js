// Importar JWT y los modelos de Veterinario y Paciente
import jwt from "jsonwebtoken";
import Administrador from "../database/models/Users/Administrator.js";
import Usuario from "../database/models/Users/User.js";

// Método para proteger rutas
const verificarAutenticacion = async (req, res, next) => {
  // Validar si se está enviando el token
  if (!req.headers.authorization)
    return res.status(404).json({ msg: "Lo sentimos, debes proporcionar un token" });

  // Desestructurar el token del encabezado
  const { authorization } = req.headers;

  // Capturar errores
  try {
    // Verificar el token recuperado con el almacenado
    const { id, rol } = jwt.verify(
      authorization.split(" ")[1],
      process.env.JWT_SECRET
    );
  } catch (error) {
    // Capturar errores y presentarlos
    const e = new Error("Formato del token no válido");
    return res.status(404).json({ msg: e.message });
  }
};
///////////////////////////////////////////////////////////////////////////////
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ msg: 'Sin token, autorización denegada' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token no valido' });
  }
};

export { verificarAutenticacion, verifyToken };

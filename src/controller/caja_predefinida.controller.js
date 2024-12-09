import cajaPredefinida from "../database/models/Objects/cajaPredefinida.js";
import cloudinary from "../services/cloudinary.js";
import CajaPredefinida from "../database/models/Objects/cajaPredefinida.js";

// ** Acciones para las cajas predefinidas **
export const crearCajaPredefinida = async (req, res) => {
    try {
        const { nombre, descripcion, stock, precio } = req.body;
        let imagenUrl = null;

        // Verificar si ya existe una caja predefinida con el mismo nombre
        const cajaExistente = await CajaPredefinida.findOne({ nombre });
        if (cajaExistente) {
            return res.status(400).json({ msg: 'La caja predefinida con este nombre ya existe.' });
        }

        // Crear la nueva caja predefinida sin la imagen inicialmente
        const nuevaCajaPredefinida = new CajaPredefinida({
            nombre,
            descripcion,
            stock,
            precio,
            imagen: null, // Sin imagen al principio
        });

        // Guardar la nueva caja en la base de datos para generar el _id
        await nuevaCajaPredefinida.save();

        // Si se proporciona una imagen, subirla a Cloudinary
        if (req.file) {
            const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
                public_id: `cajas_predefinidas/${nuevaCajaPredefinida._id}`,  // Usar el _id generado por MongoDB
                overwrite: true,  // Sobrescribir si ya existe una imagen con ese nombre
            });

            // La URL de la imagen será la URL proporcionada por Cloudinary
            imagenUrl = uploadResponse.secure_url;

            // Actualizar la caja predefinida con la URL de la imagen
            nuevaCajaPredefinida.imagen = imagenUrl;
            await nuevaCajaPredefinida.save();  // Guardar nuevamente con la URL de la imagen
        } else {
            return res.status(400).json({ msg: 'No se ha recibido ninguna imagen' });
        }

        // Responder con la caja predefinida creada y su imagen
        res.status(201).json({ msg: 'Caja predefinida creada exitosamente', cajaPredefinida: nuevaCajaPredefinida });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al crear la caja predefinida' });
    }
};

export const obtenerCajasPredefinidas = async (req, res) => {
    try {
        const cajasPredefinidas = await CajaPredefinida.find();
        res.status(200).json(cajasPredefinidas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener las cajas predefinidas' });
    }
};

export const actualizarCajaPredefinida = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, stock, precio } = req.body;

        // Verificar si la caja predefinida existe
        const cajaPredefinida = await CajaPredefinida.findById(id);
        if (!cajaPredefinida) {
            return res.status(404).json({ msg: 'Caja predefinida no encontrada.' });
        }

        // Actualizar los campos de la caja predefinida
        cajaPredefinida.nombre = nombre;
        cajaPredefinida.descripcion = descripcion;
        cajaPredefinida.stock = stock;
        cajaPredefinida.precio = precio;

        // Si hay una nueva imagen, actualizarla
        if (req.file) {
            const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
                public_id: `cajas_predefinidas/${cajaPredefinida._id}`,
                overwrite: true,
            });

            cajaPredefinida.imagen = uploadResponse.secure_url;
        }

        // Guardar los cambios
        await cajaPredefinida.save();
        res.status(200).json({ msg: 'Caja predefinida actualizada exitosamente', cajaPredefinida });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al actualizar la caja predefinida' });
    }
};

export const eliminarCajaPredefinida = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si la caja predefinida existe
        const cajaPredefinida = await CajaPredefinida.findById(id);
        if (!cajaPredefinida) {
            return res.status(404).json({ msg: 'Caja predefinida no encontrada.' });
        }

        // Eliminar la caja predefinida
        await cajaPredefinida.remove();
        res.status(200).json({ msg: 'Caja predefinida eliminada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al eliminar la caja predefinida' });
    }
};


// Obtener información de una caja según su ID
export const obtenerCajaPredefinidaPorId = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar la caja predefinida por su ID
        const cajaPredefinida = await CajaPredefinida.findById(id);
        if (!cajaPredefinida) {
            return res.status(404).json({ msg: 'Caja predefinida no encontrada.' });
        }

        // Devolver la información de la caja encontrada
        res.status(200).json(cajaPredefinida);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener la caja predefinida' });
    }
};
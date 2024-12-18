// * Acciones para las cajas predefinidas *
import CajaPredefinida from '../database/models/Objects/cajaPredefinida.js'; // Modelo de MongoDB
import cloudinary from '../services/cloudinary.js'; // Configuración de Cloudinary
import mongoose from 'mongoose';

export const crearCajaPredefinida = async (req, res) => {
    try {
        const { nombre, descripcion, stock, precio } = req.body;

        // Mostrar el cuerpo de la solicitud
        console.log('Request body:', req.body);

        // Verificar si ya existe una caja predefinida con el mismo nombre
        let cajaExistente = await CajaPredefinida.findOne({ nombre });

        if (cajaExistente) {
            console.warn('Caja predefinida con el mismo nombre ya existe:', cajaExistente);
            return res.status(400).json({ msg: 'La caja predefinida con este nombre ya existe.' });
        }

        // Verificar si se recibió una imagen
        if (!req.file) {
            console.warn('No se recibió ninguna imagen en la solicitud');
            return res.status(400).json({ msg: 'No se ha recibido ninguna imagen' });
        }

        // Subir la imagen a Cloudinary antes de crear la caja
        console.log('Subiendo imagen a Cloudinary...');
        let uploadResponse;
        try {
            uploadResponse = await cloudinary.uploader.upload(req.file.path, {
                public_id: `cajas_predefinidas/${new mongoose.Types.ObjectId()}`, // Usamos un nuevo ID único
                overwrite: true,
            });
        } catch (uploadError) {
            console.error('Error al subir la imagen a Cloudinary:', uploadError);
            return res.status(500).json({ msg: 'Error al subir la imagen a Cloudinary', error: uploadError.message });
        }

        console.log('Respuesta de Cloudinary:', uploadResponse);

        // Crear la caja predefinida con la URL de la imagen
        const nuevaCajaPredefinida = new CajaPredefinida({
            nombre,
            descripcion,
            stock,
            precio,
            imagen: uploadResponse.secure_url, // Guardar la URL de la imagen en la caja
        });

        // Guardar la caja predefinida en la base de datos
        console.log('Guardando nueva caja predefinida en la base de datos...');
        await nuevaCajaPredefinida.save();

        console.log('Caja predefinida creada exitosamente:', nuevaCajaPredefinida);

        // Responder con la caja predefinida y su imagen
        return res.status(201).json({ msg: 'Caja predefinida creada exitosamente', cajaPredefinida: nuevaCajaPredefinida });

    } catch (error) {
        // Manejar error de clave duplicada
        if (error.code === 11000) {
            console.warn('Error de clave duplicada detectado:', error.keyValue);
            return res.status(400).json({ msg: 'Ya existe una caja predefinida con este nombre.' });
        }

        // Mostrar todos los errores posibles en la consola
        console.error('Error al crear o actualizar la caja predefinida:', error);
        console.error('Detalle del error:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
        });

        // Responder al cliente con un mensaje de error
        res.status(500).json({ msg: 'Error al crear o actualizar la caja predefinida', error: error.message });
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

        // Validar si el id es un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: 'ID no válido' });
        }

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
            console.log('Archivo recibido:', req.file);
            
            try {
                const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
                    public_id: `cajas_predefinidas/${cajaPredefinida._id}`,
                    overwrite: true,
                });

                console.log('Imagen subida a Cloudinary:', uploadResponse);
                cajaPredefinida.imagen = uploadResponse.secure_url;
            } catch (uploadError) {
                console.error('Error al subir la imagen a Cloudinary:', uploadError);
                return res.status(500).json({ msg: 'Error al actualizar la imagen' });
            }
        } else {
            console.log('No se ha recibido ningún archivo.');
        }

        // Guardar los cambios
        await cajaPredefinida.save();
        res.status(200).json({ msg: 'Caja predefinida actualizada exitosamente', cajaPredefinida });
    } catch (error) {
        console.error('Error al actualizar la caja predefinida:', error);
        res.status(500).json({ msg: 'Error al actualizar la caja predefinida' });
    }
};

export const eliminarCajaPredefinida = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar si el id es un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: 'ID no válido' });
        }

        // Verificar si la caja predefinida existe
        const cajaPredefinida = await CajaPredefinida.findById(id);
        if (!cajaPredefinida) {
            return res.status(404).json({ msg: 'Caja predefinida no encontrada.' });
        }

        // Eliminar la caja predefinida usando deleteOne
        await CajaPredefinida.deleteOne({ _id: id }); // Cambiar remove() por deleteOne()
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

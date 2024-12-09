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

        // Si la caja no existe, crearla
        if (!cajaExistente) {
            // Crear la caja predefinida sin la imagen
            const nuevaCajaPredefinida = new CajaPredefinida({
                nombre,
                descripcion,
                stock,
                precio,
                imagen: null, // Inicialmente sin imagen
            });

            // Guardar la caja creada
            console.log('Guardando nueva caja predefinida en la base de datos...');
            await nuevaCajaPredefinida.save();

            console.log('Caja predefinida creada exitosamente:', nuevaCajaPredefinida);

            // Subir la imagen a Cloudinary
            console.log('Subiendo imagen a Cloudinary...');
            let uploadResponse;
            try {
                uploadResponse = await cloudinary.uploader.upload(req.file.path, {
                    public_id: `cajas_predefinidas/${nuevaCajaPredefinida._id}`, // Usamos el ID de la caja como nombre del archivo
                    overwrite: true,
                });
            } catch (uploadError) {
                console.error('Error al subir la imagen a Cloudinary:', uploadError);
                return res.status(500).json({ msg: 'Error al subir la imagen a Cloudinary', error: uploadError.message });
            }

            console.log('Respuesta de Cloudinary:', uploadResponse);

            // Actualizar la caja con la URL de la imagen
            nuevaCajaPredefinida.imagen = uploadResponse.secure_url;

            // Guardar la caja con la imagen actualizada
            await nuevaCajaPredefinida.save();

            console.log('Caja predefinida actualizada con la imagen:', nuevaCajaPredefinida);

            // Responder con la caja predefinida y su imagen
            return res.status(201).json({ msg: 'Caja predefinida creada exitosamente', cajaPredefinida: nuevaCajaPredefinida });
        } else {
            console.warn('Caja predefinida con el mismo nombre ya existe:', cajaExistente);
            return res.status(400).json({ msg: 'La caja predefinida con este nombre ya existe.' });
        }
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

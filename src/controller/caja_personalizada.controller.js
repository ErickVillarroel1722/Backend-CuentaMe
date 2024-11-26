import CajaPersonalizada from "../database/models/Objects/cajaPersonalizada.js";

// Crear una nueva caja personalizada
export const createCajaPersonalizada = async (req, res) => {
    try {
        const caja = new CajaPersonalizada(req.body);
        const savedCaja = await caja.save();
        res.status(201).json(savedCaja);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la caja personalizada', error });
    }
};

// Obtener todas las cajas personalizables
export const getCajasPersonalizadas = async (req, res) => {
    try {
        const cajas = await CajaPersonalizada.find().populate('extras');
        res.status(200).json(cajas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las cajas personalizadas', error });
    }
};

// Obtener una caja personalizada por ID
export const getCajaPersonalizadaById = async (req, res) => {
    try {
        const caja = await CajaPersonalizada.findById(req.params.id).populate('extras');
        if (!caja) {
            return res.status(404).json({ message: 'Caja personalizada no encontrada' });
        }
        res.status(200).json(caja);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la caja personalizada', error });
    }
};

// Actualizar una caja personalizada (con restricción de tiempo)
export const updateCajaPersonalizada = async (req, res) => {
    try {
        const caja = await CajaPersonalizada.findById(req.params.id);
        if (!caja) {
            return res.status(404).json({ message: 'Caja personalizada no encontrada' });
        }

        // Verificar si han pasado más de 4 horas desde la creación
        const tiempoCreacion = new Date(caja.createdAt);
        const ahora = new Date();
        const tiempoTranscurridoHoras = (ahora - tiempoCreacion) / (1000 * 60 * 60);

        if (tiempoTranscurridoHoras > 4) {
            return res.status(403).json({ message: 'No se puede modificar la caja después de 4 horas' });
        }

        const updatedCaja = await CajaPersonalizada.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        }).populate('extras');
        res.status(200).json(updatedCaja);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la caja personalizada', error });
    }
};

// Eliminar una caja personalizada
export const deleteCajaPersonalizada = async (req, res) => {
    try {
        const deletedCaja = await CajaPersonalizada.findByIdAndDelete(req.params.id);
        if (!deletedCaja) {
            return res.status(404).json({ message: 'Caja personalizada no encontrada' });
        }
        res.status(200).json({ message: 'Caja personalizada eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la caja personalizada', error });
    }
};

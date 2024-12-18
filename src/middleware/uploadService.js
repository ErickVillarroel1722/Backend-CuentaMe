import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../services/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cuenta_me/products', // El nombre de la carpeta donde se almacenarán las imágenes en Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Formatos permitidos
  },
});

const upload = multer(
  { 
    storage: storage,
    limiits:{
      fileSize: 1024 * 1024 * 10 // Máximo de 10 megabytes
    }
  }
);

export default upload;

import multer from 'multer';
import {CloudinaryStorage} from "multer-storage-cloudinary";
import cloudinary from "../services/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "cuenta_me/products",
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
})

const upload = multer({ storage: storage });

export default upload;

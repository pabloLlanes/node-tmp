import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

export class FileUploader {
    constructor(destination = 'products') {
        this.__filename = fileURLToPath(import.meta.url);
        this.__dirname = path.dirname(this.__filename);
        this.destination = path.join(this.__dirname, `../../uploads/${destination}`);
        this.storage = this.configureStorage();
        this.fileFilter = this.configureFileFilter();
        this.uploader = this.configureUploader();
    }

    configureStorage() {
        return multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, this.destination);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const extension = path.extname(file.originalname);
                cb(null, file.fieldname + '-' + uniqueSuffix + extension);
            }
        });
    }

    configureFileFilter() {
        return (req, file, cb) => {
            const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
            const extension = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = allowedFileTypes.test(file.mimetype);
            
            if (extension && mimetype) {
                return cb(null, true);
            }
            
            cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
        };
    }

    configureUploader() {
        return multer({
            storage: this.storage,
            fileFilter: this.fileFilter,
            limits: {
                fileSize: 5 * 1024 * 1024 // 5MB
            }
        });
    }

    getSingleUploader(fieldName = 'image') {
        return this.uploader.single(fieldName);
    }
    
    getMultipleUploader(fieldName = 'images', maxCount = 5) {
        return this.uploader.array(fieldName, maxCount);
    }
}

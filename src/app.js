/**
 * Archivo principal de la aplicación Node.js
 * Este archivo configura el servidor Express, middleware y rutas API
 */

// === IMPORTACIONES NECESARIAS ===
// Express: Framework web para Node.js que proporciona funcionalidades para crear APIs
import express from "express";
// Morgan: Middleware para registrar solicitudes HTTP en la consola (logging)
import morgan from "morgan";
// Dotenv: Carga variables de entorno desde un archivo .env
import dotenv from "dotenv";
// Path: Utilidades para trabajar con rutas de archivos y directorios
import path from "path";
// FileURLToPath: Convierte una URL de archivo a una ruta del sistema de archivos
import { fileURLToPath } from "url";
// Fs: Sistema de archivos para crear directorios y verificar si existen
import fs from "fs";
// CORS: Middleware para habilitar solicitudes desde dominios cruzados
import cors from "cors";
// Importación de rutas principales desde index.js
import router from "./routes/index.js";
// Conexión a la base de datos MongoDB
import { connectDB } from "./config/db.js";
// Importación de rutas específicas para cada recurso
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import categoryRouter from "./routes/categoryRouter.js";
import orderRouter from "./routes/orderRouter.js";
import relationRouter from "./routes/relationRouter.js"; // Nuevo router para gestionar relaciones

/**
 * Configuración de __dirname en ES modules
 * En ES modules no existe __dirname como en CommonJS, por lo que se crea manualmente
 * usando fileURLToPath y path.dirname
 */
const __filename = fileURLToPath(import.meta.url); // Convierte la URL del módulo actual a una ruta de archivo
const __dirname = path.dirname(__filename); // Obtiene el directorio del archivo actual

// Carga las variables de entorno del archivo .env al objeto process.env
dotenv.config();

// Inicia la conexión a la base de datos MongoDB (definida en config/db.js)
connectDB();

/**
 * Configuración del directorio de uploads
 * Verifica si el directorio para archivos subidos existe y lo crea si no existe
 * Esto es importante para almacenar archivos subidos por los usuarios (imágenes, etc.)
 */
const uploadsDir = path.join(__dirname, '../uploads'); // Ruta absoluta al directorio uploads
if (!fs.existsSync(uploadsDir)) { // Verifica si el directorio existe
    fs.mkdirSync(uploadsDir, { recursive: true }); // Crea el directorio y subdirectorios si no existen
}

/**
 * Inicialización de la aplicación Express
 * Express es un framework minimalista que facilita la creación de aplicaciones web y APIs
 */
const app = express();

// Middleware para analizar cuerpos de solicitud JSON (req.body)
app.use(express.json());

/**
 * Configuración de CORS (Cross-Origin Resource Sharing)
 * Permite que el frontend en http://localhost:5174 pueda realizar solicitudes a esta API
 * Esto es esencial para aplicaciones que tienen el frontend y backend en dominios diferentes
 */
app.use(cors());

// Configuración CORS para producción
/* app.use(cors({
    origin: ['https://tudominio.com', 'https://app.tudominio.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  })); */

/**
 * Configuración para servir archivos estáticos
 * Permite acceder a archivos en la carpeta 'uploads' a través de la URL '/uploads'
 * Por ejemplo: http://localhost:3000/uploads/imagen.jpg
 */
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Middleware de logging - muestra información de las solicitudes en la consola
// 'dev' es un formato predefinido que muestra: método HTTP, ruta, código de estado y tiempo de respuesta
app.use(morgan('dev'));

/**
 * Middleware personalizado para todas las rutas
 * Se ejecuta en cada solicitud antes de llegar a las rutas específicas
 * Útil para logging, validación, autenticación global, etc.
 */
app.use((req, res, next) => {
    // Registra la fecha y el método HTTP de cada solicitud
    console.log(`${new Date()}: METHOD: ${req.method}`)

    /*    if (true) {
           res.json({ error: "esto es un error" })
       } */
    // Este código comentado muestra cómo interrumpir el flujo y enviar una respuesta de error

    // Continúa con el siguiente middleware o ruta
    next()
})

/**
 * Registro de rutas API
 * Cada recurso tiene su propio router que maneja endpoints específicos
 * La URL base de cada recurso se define aquí y el router maneja las subrutas
 */
app.use("/api/users", userRouter);       // Maneja rutas como /api/users, /api/users/:id, etc.
app.use("/api/products", productRouter);   // Maneja rutas como /api/products, /api/products/:id, etc.
app.use("/api/categories", categoryRouter); // Maneja rutas como /api/categories, /api/categories/:id, etc.
app.use("/api/orders", orderRouter);     // Maneja rutas como /api/orders, /api/orders/:id, etc.
app.use("/api/relations", relationRouter); // Maneja rutas para gestionar relaciones entre entidades


/**
 * Configuración del puerto
 * Se obtiene desde las variables de entorno (archivo .env)
 * Si no se encuentra, debería tener un valor por defecto (típicamente 3000)
 */
const port = process.env.PORT
console.log(`Puerto configurado: ${port}`);

/**
 * Iniciar el servidor
 * El método listen inicia el servidor HTTP en el puerto especificado
 * La función callback se ejecuta cuando el servidor está listo para recibir solicitudes
 */
app.listen(port, () => {
    console.log(`Server (backend) running on port: ${port}`)
})



/**
 * ==========================================
 * RUTAS PRINCIPALES (index.js)
 * ==========================================
 * Este archivo configura el router principal de la aplicación.
 * Actualmente está vacío ya que las rutas se montan directamente en app.js,
 * pero podría usarse para agrupar todas las rutas o crear rutas genéricas.
 */

// Importación del Router de Express para crear un nuevo enrutador
import { Router } from "express";

/**
 * Creación de una instancia del enrutador
 * Este objeto permite definir rutas HTTP (GET, POST, PUT, DELETE, etc.)
 * y agruparlas de manera modular para mejor organización del código
 */
const router = Router();

// Aquí se podrían definir rutas genéricas como:
// router.get('/', (req, res) => { res.json({ message: 'API funcionando correctamente' }) });
// router.use('/api', apiRouter);

// Exportación del router para ser utilizado en app.js u otros archivos
export default router;
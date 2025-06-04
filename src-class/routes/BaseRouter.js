import { Router } from "express";

class BaseRouter {
    constructor() {
        this.router = Router();
        // No llamamos a initializeRoutes aquí, lo haremos en un método separado
    }
    
    initializeRoutes() {
        // Debe ser implementado por las clases hijas
    }
    
    setupRoutes() {
        // Este método debe ser llamado explícitamente después de que la clase hija
        // haya inicializado todos sus componentes
        this.initializeRoutes();
        return this;
    }
    
    getRouter() {
        return this.router;
    }
}

export default BaseRouter;

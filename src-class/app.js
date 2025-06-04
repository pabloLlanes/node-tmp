import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cors from "cors";

import { DatabaseConnection } from "./config/db.js";
import { CategoryRouter } from "./routes/CategoryRouter.js";
import { ProductRouter } from "./routes/ProductRouter.js";
import { UserRouter } from "./routes/UserRouter.js";
import { OrderRouter } from "./routes/OrderRouter.js";
import { RelationRouter } from "./routes/RelationRouter.js";

class App {
    constructor() {
        this.app = express();
        this.configureDotenv();
        this.configureDatabaseConnection();
        this.configureUploadsDirectory();
        this.configureMiddlewares();
        this.configureRoutes();
        this.port = process.env.PORT;
    }

    configureDotenv() {
        dotenv.config();
    }

    configureDatabaseConnection() {
        const dbConnection = new DatabaseConnection();
        dbConnection.connect();
    }

    configureUploadsDirectory() {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const uploadsDir = path.join(__dirname, '../uploads');
        
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
    }

    configureMiddlewares() {
        this.app.use(express.json());
        this.app.use(cors());
        
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
        
        this.app.use(morgan('dev'));
        this.app.use((req, res, next) => {
            console.log(`${new Date()}: METHOD: ${req.method}`);
            next();
        });
    }

    configureRoutes() {
        this.app.use("/api/users", new UserRouter().getRouter());
        this.app.use("/api/products", new ProductRouter().getRouter());
        this.app.use("/api/categories", new CategoryRouter().getRouter());
        this.app.use("/api/orders", new OrderRouter().getRouter());
        this.app.use("/api/relations", new RelationRouter().getRouter());
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Puerto configurado: ${this.port}`);
            console.log(`Server (backend) running on port: ${this.port}`);
        });
    }
}

const application = new App();
application.start();

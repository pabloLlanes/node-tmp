import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cors from "cors";
import router from "./routes/index.js";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import categoryRouter from "./routes/categoryRouter.js";
import orderRouter from "./routes/orderRouter.js";
import relationRouter from "./routes/relationRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

connectDB();

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

app.use(express.json());

app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(morgan('dev'));

app.use((req, res, next) => {
    console.log(`${new Date()}: METHOD: ${req.method}`)

    /*    if (true) {
           res.json({ error: "esto es un error" })
       } */

    next()
})

app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/orders", orderRouter);
app.use("/api/relations", relationRouter);

const port = process.env.PORT
console.log(`Puerto configurado: ${port}`);

app.listen(port, () => {
    console.log(`Server (backend) running on port: ${port}`)
})

import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import router from "./routes/index.js";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

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


const port = process.env.PORT
console.log(port);

app.listen(port, () => {
    console.log(`server (backend) running on port: ${port}`)
})



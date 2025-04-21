import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";

let users = [
    { id: 1, name: "pipo" },
    { id: 2, name: "pepe" },
    { id: 3, name: "papo" },
    { id: 4, name: "pato" },
]

dotenv.config();

const app = express();

app.use(morgan('dev'))

app.get("/", (req, res) => {
    res.json({
        message: "HOME"
    })
})

app.get("/api", (req, res) => {
    res.json({
        message: "Welcome to Express"
    })
})

app.get("/api/users", (req, res) => {
    res.json({
        message: "Los Users",
        data: users
    })
})

app.get("/api/users/:id", (req, res) => {
    const userId = parseInt(req.params.id);
    console.log(typeof userId);
    console.log(userId);

    const user = users.find((user) => user.id === userId)
    console.log(user)

    if (!user) {
        res.json({ error: true, message: "USUARIO NO ENCONTRADO" })
    }
    res.json(user)

})


app.post("/api/users", (req, res) => {
    res.send("ENDPOINT CREATE USER")
})

app.put("/api/users", (req, res) => {
    res.send("ENDPOINT UPDATE USER")

})

app.delete("/api/users", (req, res) => res.send("ENDPOINT DELETE USER"))

console.log(process.env.PORT)

console.log(process.env.TOPSECRET)

const port = process.env.PORT

app.listen(port, () => {
    console.log(`server (backend) running on port: ${port}`)
})



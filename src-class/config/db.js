import mongoose from "mongoose";

export class DatabaseConnection {
    constructor() {
        this.mongoURI = process.env.MONGO_DB;
    }

    connect() {
        mongoose.connect(this.mongoURI)
            .then(() => {
                console.log('Connected successfully to MongoDB');
            })
            .catch((error) => {
                console.error('Error connecting to MongoDB:', error.message);
                process.exit(1);
            });
    }
}

import { Router } from "express";

class MainRouter {
    constructor() {
        this.router = Router();
    }

    getRouter() {
        return this.router;
    }
}

export default new MainRouter().getRouter();

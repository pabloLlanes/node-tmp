import mongoose from 'mongoose';

class BaseModel {
    constructor(name, schema) {
        this.modelName = name;
        this.schema = schema;
        this.model = mongoose.model(this.modelName, this.schema);
    }
    
    getModel() {
        return this.model;
    }
}

export default BaseModel;

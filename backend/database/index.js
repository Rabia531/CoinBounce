const mongoose = require('mongoose');

const {MONGO_URI} = require("../config/index");

const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`Database Connected to host: ${conn.connection.host}`);
    } catch (error) {
        console.log(`Error: ${error}`);
    }
}

module.exports = dbConnect;
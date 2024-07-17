require('dotenv').config();
const { MongoClient } = require('mongodb');

// MongoDB connection URL with authentication options
const url = process.env.MONGO_URL;

let dbInstance = null;
const dbName = process.env.MONGO_DB;

async function connectToDatabase() {
    if (dbInstance) {
        return dbInstance;
    }

    // Task 2: Connect to MongoDB
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    // Task 3: Connect to the secondChance database and store it in variable dbInstance
    dbInstance = client.db(dbName);

    // Task 4: Return the database instance
    return dbInstance;
}

module.exports = connectToDatabase;

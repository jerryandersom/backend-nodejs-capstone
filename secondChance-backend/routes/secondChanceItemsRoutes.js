const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');

// Define the upload directory path
const directoryPath = 'public/images';

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, directoryPath); // Specify the upload directory
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original file name
    },
});

const upload = multer({ storage: storage });

// Get all secondChanceItems
router.get('/', async (req, res, next) => {
    logger.info('/ called');
    try {
        // Task 1: Retrieve the database connection from db.js and store the connection to db constant
        const db = await connectToDatabase();

        // Task 2: Use the collection() method to retrieve the secondChanceItems collection
        const collection = db.collection('secondChanceItems');

        // Task 3: Fetch all secondChanceItems using the collection.find() method. Chain it with the toArray() method to convert to a JSON array
        const secondChanceItems = await collection.find({}).toArray();

        // Task 4: Return the secondChanceItems using the res.json() method
        res.json(secondChanceItems);
    } catch (e) {
        logger.error('oops something went wrong', e);
        next(e);
    }
});

// Add a new item
router.post('/', upload.single('file'), async (req, res, next) => {
    try {
        // Task 1: Retrieve the database connection from db.js and store the connection to db constant
        const db = await connectToDatabase();

        // Task 2: Use the collection() method to retrieve the secondChanceItems collection
        const collection = db.collection('secondChanceItems');

        // Task 3: Create a new secondChanceItem from the request body
        let secondChanceItem = req.body;

        // Task 4: Get the last id, increment it by 1, and set it to the new secondChanceItem
        const lastItemQuery = await collection.find().sort({ 'id': -1 }).limit(1);
        await lastItemQuery.forEach(item => {
            secondChanceItem.id = (parseInt(item.id) + 1).toString();
        });

        const date_added = Math.floor(new Date().getTime() / 1000);
        secondChanceItem.date_added = date_added

        // Task 6: Add the secondChanceItem to the database
        secondChanceItem = await collection.insertOne(secondChanceItem);

        // Task 7: Upload its image to the images directory
        // (The image upload is handled by multer's upload middleware)

        res.status(201).json(result.ops[0]);
    } catch (e) {
        next(e);
    }
});

// Get a single secondChanceItem by ID
const { ObjectId } = require('mongodb'); // Make sure to require ObjectId from mongodb

router.get('/:id', async (req, res, next) => {
    try {
        // Step 4: task 1 - insert code here
        const db = await connectToDatabase();

        // Step 4: task 2 - insert code here
        const collection = db.collection('secondChanceItems');

        // Step 4: task 3 - insert code here
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
            return res.status(400).send("Invalid ID format");
        }

        const secondChanceItem = await collection.findOne({ _id: new ObjectId(id) });

        // Step 4: task 4 - insert code here
        if (!secondChanceItem) {
            return res.status(404).send("secondChanceItem not found");
        }
        res.json(secondChanceItem);
    } catch (e) {
        next(e);
    }
});


// Update an existing item
router.put('/:id', upload.single('image'), async (req, res, next) => {
    try {
        // Step 5: task 1 - insert code here
        const db = await connectToDatabase();

        // Step 5: task 2 - insert code here
        const collection = db.collection('secondChanceItems');

        // Step 5: task 3 - insert code here
        const secondChanceItem = await collection.findOne({ _id: new ObjectId(id) });

        if (!secondChanceItem) {
            logger.error('secondChanceItem not found');
            return res.status(404).json({ error: "secondChanceItem not found" });
        }

        secondChanceItem.category = req.body.category;
        secondChanceItem.condition = req.body.condition;
        secondChanceItem.age_days = req.body.age_days;
        secondChanceItem.description = req.body.description;
        secondChanceItem.age_years = Number((secondChanceItem.age_days / 365).toFixed(1));
        secondChanceItem.updatedAt = new Date();

        const updatepreloveItem = await collection.findOneAndUpdate(
            { _id: new MongoClient.ObjectID(req.params.id) },
            { $set: secondChanceItem },
            { returnDocument: 'after' }
        );

        // Step 5: task 4 - insert code here
        // const result = await collection.updateOne({ _id: new MongoClient.ObjectID(req.params.id) }, { $set: updatedItem });


        // Step 5: task 5 - insert code here
        if (updatepreloveItem) {
            res.json({ "uploaded": "success" });
        } else {
            res.json({ "uploaded": "failed" });
        }
        // res.json(result);
    } catch (e) {
        next(e);
    }
});

// Delete an existing item
router.delete('/:id', async (req, res, next) => {
    try {
        // Step 6: task 1 - insert code here
        const db = await connectToDatabase();

        // Step 6: task 2 - insert code here
        const collection = db.collection('secondChanceItems');

        // Step 6: task 3 - insert code here
        // const result = await collection.deleteOne({ _id: new MongoClient.ObjectID(req.params.id) });
        const secondChanceItem = await collection.findOne({ _id: new MongoClient.ObjectID(req.params.id) });

        if (!secondChanceItem) {
            logger.error('secondChanceItem not found');
            return res.status(404).json({ error: "secondChanceItem not found" });
        }

        await collection.deleteOne({ _id: new MongoClient.ObjectID(req.params.id) });
        res.json({ "deleted": "success" });

        // Step 6: task 4 - insert code here
        res.json(result);
    } catch (e) {
        next(e);
    }
});

module.exports = router;

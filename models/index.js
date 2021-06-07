require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
    useCreateIndex: true
});

const db = mongoose.connection;


// Set up events for database to print connection
db.once('open', () => {
    console.log(`Connected to MongoDB on ${db.host}:${db.port}`);
});

db.on('error', (error) => {
    console.log('------------ INDEX.JS ERROR ------------')
    console.log(error);
});


// Import all of the models
const User = require('./User');
const Book = require('./Book');


// Export all the models within this file
module.exports = {
    User,
    Book
};
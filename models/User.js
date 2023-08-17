const mongoose = require('mongoose');
const { Snowflake } = require('@theinternetfolks/snowflake');
const db = require('../db'); // Importing the database connection

const userSchema = new mongoose.Schema({
    id: {
        type: String,
        default: () => Snowflake.generate(),
        unique: true,
    },
    name: {
        type: String,
        default: null,
        maxlength: 64,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        maxlength: 128,
    },
    password: {
        type: String,
        maxlength: 64,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = db.model('User', userSchema);








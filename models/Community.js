const mongoose = require('mongoose');
const { Snowflake } = require('@theinternetfolks/snowflake');
const db = require('../db'); // Importing the database connection
const User = require('./User'); // Importing the User schema

const communitySchema = new mongoose.Schema({
    id: {
        type: String,
        default: () => Snowflake.generate(),
        unique: true,
    },
    name: {
        type: String,
        required: true,
        maxlength: 128,
    },
    slug: {
        type: String,
        unique: true,
        maxlength: 255,
    },
    owner: {
        type: String,
        ref: User,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = db.model('Community', communitySchema);








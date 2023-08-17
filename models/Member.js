const mongoose = require('mongoose');
const { Snowflake } = require('@theinternetfolks/snowflake');
const db = require('../db'); // Importing the database connection
const Community = require('./Community'); // Importing the Community schema
const User = require('./User'); // Importing the User schema
const Role = require('./Role'); // Importing the Role schema

const memberSchema = new mongoose.Schema({
    id: {
        type: String,
        default: () => Snowflake.generate(),
        unique: true,
    },
    community: {
        type: String,
        ref: Community,
    },
    user: {
        type: String,
        ref: User,
    },
    role: {
        type: String,
        ref: Role,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = db.model('Member', memberSchema);








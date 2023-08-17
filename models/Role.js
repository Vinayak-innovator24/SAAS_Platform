const mongoose = require('mongoose');
const { Snowflake } = require('@theinternetfolks/snowflake');
const db = require('../db'); // Importing the database connection

const roleSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => Snowflake.generate(),
    unique: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
    maxlength: 64,
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

module.exports = db.model('Role', roleSchema);

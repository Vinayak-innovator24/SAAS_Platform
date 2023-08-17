
const express = require("express");
const router = express.Router();
const { Snowflake } = require('@theinternetfolks/snowflake');
const Role = require("../models/Role"); // importing the Role Schema

// POST /v1/role/
router.post("/", async (req, res) => {
    try {
        const { roleName } = req.body;
        if (!roleName) {
            return res.status(400).json({ error: 'Role name is required' });
        }
        //  Generating Snowflake ID
        const roleId = Snowflake.generate();
        
        // Create a new role using the Role model
        const newRole = new Role({ name: roleName });

        // Save the new role to the database
        const savedRole = await newRole.save();

        res.status(201).json({ 
            status: true,
            content: {
                data: {
                    id: roleId,
                    name: roleName,
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            }
         })
    } catch (err) {
        console.log({ err });
        res.status(500).json({ error: err.message });
    }
});

// GET all roles "/v1/role"
router.get('/', async (req, res) => {
  try {
    // Pagination settings
    const itemsPerPage = 10;
    const page = parseInt(req.query.page) || 1;

    // Count total documents
    const totalDocuments = await Role.countDocuments();

    // Calculate total pages
    const totalPages = Math.ceil(totalDocuments / itemsPerPage);

    // Find documents for the current page
    const roles = await Role.find()
        .skip((page - 1) * itemsPerPage)
        .limit(itemsPerPage);

    res.status(200).json({
      status: true,
      meta: {
        total: totalDocuments,
        pages: totalPages,
        page: page,
      },
      content: roles,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
const express = require('express');
const Community = require('../models/Community'); // Importing the Community model
const Member = require('../models/Member'); // Importing the Member model
const Role = require('../models/Role'); // Importing the Role model
const verifyAccessToken = require("./middleware"); // Importing the verifyAccessToken middleware
const router = express.Router();

// Add a member using community, user and role.
// Only Community Admin can add user. Other roles will be thrown the NOT_ALLOWED_ACCESS error.
router.post('/', verifyAccessToken, async (req, res) => {
  try {
    const { community, user, role } = req.body;

    // Check if the user making the request is a Community Admin
    // Your aggregation pipeline
const pipeline = [
  {
    $match: {
      community: community,
      user: req.userId
    }
  },
  {
    $lookup: {
      from: 'roles', // Assuming your Role collection name is 'roles'
      localField: 'role',
      foreignField: 'id',
      as: 'roleData'
    }
  },
  {
    $unwind: '$roleData'
  },
  {
    $project: {
      _id: 0,
      roleName: '$roleData.name' // Assuming you want to project the role name
    }
  }
];

// Execute the aggregation pipeline
const requestingUserRole = await Member.aggregate(pipeline);

    if (!requestingUserRole || requestingUserRole.role !== 'Community Admin') {
      return res.status(403).json({
        status: false,
        error: 'NOT_ALLOWED_ACCESS',
      });
    }

    // Check if the role is valid
      const existingRole = await Role.findOne({ id: role });
    if (!existingRole) {
      return res.status(400).json({
        status: false,
        error: 'INVALID_ROLE',
      });
    }

    // Create a new member
    const newMember = new Member({
      community: community,
      user: user,
      role: role,
      created_at: new Date(),
    });

    await newMember.save();

    res.status(201).json({
      status: true,
      content: {
        data: {
          id: newMember.id,
          community: newMember.community,
          user: newMember.user,
          role: newMember.role,
          created_at: newMember.created_at,
        },
      },
    });
  } catch (error) {
      console.log(error);
    res.status(500).json({
      status: false,
      error: 'Error adding member',
    });
  }
});

// Remove a member using Token.
// Only Community Admin and Community Moderator can remove the user. Other roles will be thrown the NOT_ALLOWED_ACCESS error.
router.post('/:id', verifyAccessToken, async (req, res) => {
  try {
    const memberId = req.params.id;

    // Check if the user making the request is a Community Admin
    const requestingUserRole = await Member.findOne({
      _id: memberId,
      user: req.user.id,
    }).populate('role', 'name');

    if (!requestingUserRole || (requestingUserRole.role.name !== 'Community Admin' && requestingUserRole.role.name !== 'Community Moderator')) {
      return res.status(403).json({
        status: false,
        error: 'NOT_ALLOWED_ACCESS',
      });
    }

    // Remove the member from the community
      await Member.findByIdAndDelete(memberId);

      res.status(201).json({
          status: true,
      });
    } catch (error) {
        res.status(500).json({
        status: false,
        error: 'Error removing member',
        });
    }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const Community = require("../models/Community"); // importing the Community Schema
const Member = require("../models/Member"); // importing the Member Schema
const Role = require("../models/Role"); // importing the Role Schema
const verifyAccessToken = require("./middleware"); // Importing verifyAccessToken Middleware

router.post("/", verifyAccessToken, async (req, res) => {
    try {
        const { name } = req.body;
        const ownerId = req.userId;

        // Create a new community with the provided name and slug (autogenerated)
        const newCommunity = new Community({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        owner: ownerId,
        });

        await newCommunity.save();

        // Get the Community Admin role
        const adminRole = await Role.findOne({ name: 'Community Admin' });

        // Create a member record for the community owner with the Community Admin role
        const newMember = new Member({
            community: newCommunity.id,
            user: ownerId,
            role: adminRole.id,
        });

        await newMember.save()

        // Respond with the created community data
        res.status(201).json({
            status: true,
            content: {
                data: {
                    id: newCommunity.id,
                    name: newCommunity.name,
                    slug: newCommunity.slug,
                    owner: newCommunity.owner,
                    created_at: newCommunity.created_at,
                    updated_at: newCommunity.updated_at,
                },
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: false,
            error: 'Error creating community',
        });
    }
});

// GET "/v1/community"
// List all the data with pagination.

// The user who is the owner should be expanded into an object, to know their details. Only id and name should be expanded inside the owner attribute
router.get('/', async (req, res) => {
    try {
        // Pagination settings
        const itemsPerPage = 10;
        const page = parseInt(req.query.page) || 1;

        // Calculate the skip value based on pagination
        const skip = (page - 1) * itemsPerPage;

        // Count total documents
        const totalDocuments = await Community.countDocuments();

        // Your aggregation pipeline
const pipeline = [
  {
    $lookup: {
      from: 'users', // Assuming your User collection name is 'users'
      localField: 'owner',
      foreignField: 'id',
      as: 'ownerData'
    }
  },
  {
    $unwind: '$ownerData'
  },
  {
    $project: {
      _id: 1,
      // Other fields you want to project
      owner: {
        _id: '$ownerData.id',
        name: '$ownerData.name'
      }
    }
  },
  {
    $skip: skip
  },
  {
    $limit: itemsPerPage
  }
];

// Execute the aggregation pipeline
const communities = await Community.aggregate(pipeline);

console.log(communities);

        // Calculate total pages
        const totalPages = Math.ceil(totalDocuments / itemsPerPage);

        res.status(200).json({
            status: true,
            content: {
                meta: {
                    totalDocuments: totalDocuments,
                    pages: totalPages,
                    page: page,
                },
                data: communities.map((community) => ({
                    id: community.id,
                    name: community.name,
                    slug: community.slug,
                    owner: {
                        id: community.owner.id,
                        name: community.owner.name,
                    },
                    created_at: community.created_at,
                    updated_at: community.updated_at,
                })),
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: false,
            error: 'Error fetching communities',
        });
    }
});

// GET "/v1/community/:id/members"
// List all the data with pagination.

// The community is know so it will not be expanded. The roleand user should be expanded to know its details. Only id and name should be expanded inside the user attribute, as we do not want to reveal the email, password and other fields of the user.
router.get('/:id/members', async (req, res) => {
    try {
        // Pagination settings
        const itemsPerPage = 10;
        const page = parseInt(req.query.page) || 1;

        // Calculate the skip value based on pagination
        const skip = (page - 1) * itemsPerPage;

        // Count total count of members in the community
        const totalMembers = await Member.countDocuments({ community: req.params.id });

        // Get members with pagination and expand user and owner details
        const members = await Member.find({ community: req.params.id })
            .populate({
                path: 'user',
                select: 'id name',
            })
            .populate({
                path: 'role',
                select: 'id name',
            })
            .skip(skip)
            .limit(itemsPerPage);

        // Calculate total pages
        const totalPages = Math.ceil(totalMembers / itemsPerPage);

        res.status(200).json({
            status: true,
            content: {
                meta: {
                    totalMembers: totalMembers,
                    pages: totalPages,
                    page: page,
                },
                data: members.map((member) => ({
                    id: member.id,
                    community: member.community,
                    user: {
                        id: member.user.id,
                        name: member.user.name,
                    },
                    created_at: community.created_at,
                })),
            },
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            error: 'Error fetching community members',
        });
    }
});

// GET "/v1/community/me/owner"
// List all the data with pagination.

// Since, the owner is known, which is the currently signed in user, it will not expanded.  
router.get('/me/owner', async (req, res) => {
    try {
        // Pagination settings
        const itemsPerPage = 10;
        const page = parseInt(req.query.page) || 1;

        // Calculate the skip value based on pagination
        const skip = (page - 1) * itemsPerPage;

        // Count the total count of communities owned by the user
        const totalCommunitiesOwned = await Community.countDocuments({ owner: req.user.id });

        // Get communities owned by the user with pagination
        const members = await Community.find({ owner: req.user.id })
            .skip(skip)
            .limit(itemsPerPage);

        // Calculate total pages
        const totalPages = Math.ceil(totalCommunitiesOwned / itemsPerPage);

        res.status(200).json({
            status: true,
            content: {
                meta: {
                    totalCommunitiesOwned: totalCommunitiesOwned,
                    pages: totalPages,
                    page: page,
                },
                data: communities.map((community) => ({
                    id: community.id,
                    name: community.name,
                    slug: community.slug,
                    owner: community.owner,
                    created_at: community.created_at,
                    updated_at: community.updated_at,
                })),
            },
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            error: 'Error fetching owned communities',
        });
    }
});

// GET "/v1/community/me/member"
// List all the data with pagination.

// The user who is the owner should be expanded into an object, to know their details. Only id and name should be expanded inside the owner attribute, as we do not want to reveal the email, password and other fields of the user.  
router.get('/me/member', async (req, res) => {
    try {
        // Pagination settings
        const itemsPerPage = 10;
        const page = parseInt(req.query.page) || 1;

        // Calculate the skip value based on pagination
        const skip = (page - 1) * itemsPerPage;

        // Count the total count of communities where user is a member
        const totalCommunitiesJoined = await Community.countDocuments({ members: req.user.id });

        // Get communities where user is a member with pagination
        const communities = await Community.find({ members: req.user.id })
            .skip(skip)
            .limit(itemsPerPage)
            .populate('owner', '_id name');

        // Calculate total pages
        const totalPages = Math.ceil(totalCommunitiesJoined / itemsPerPage);

        res.status(200).json({
            status: true,
            content: {
                meta: {
                    totalCommunitiesJoined: totalCommunitiesJoined,
                    pages: totalPages,
                    page: page,
                },
                data: communities.map((community) => ({
                    id: community.id,
                    name: community.name,
                    slug: community.slug,
                    owner: {
                        id: community.owner.id,
                        name: community.owner.name,
                    },
                    created_at: community.created_at,
                    updated_at: community.updated_at,
                })),
            },
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            error: 'Error fetching joined communities',
        });
    }
});

module.exports = router;
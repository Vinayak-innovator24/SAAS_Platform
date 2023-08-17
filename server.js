require("dotenv").config();

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

// route middlewares
const roleRoute = require("./routes/role");  // importing the role route
const authRoute = require("./routes/user");  // importing the user route
const communityRoute = require("./routes/community");  // importing the community route
const memberRoute = require("./routes/member");  // importing the member route

// Middleware
app.use(express.json());

// routes
app.use("/v1/role", roleRoute);
app.use("/v1/auth", authRoute);
app.use("/v1/community", communityRoute);
app.use("/v1/member", memberRoute);

// Server starting
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server connected to ${port}`)
});
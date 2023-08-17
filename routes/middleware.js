require("dotenv").config();
const jwt = require("jsonwebtoken");

// Middleware to verify access token from the cookie
/**
 * 
 * @param {Request} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
const verifyAccessToken = (req, res, next) => {
    const accessToken = req.headers["authorization"].split(" ")[1];
    console.log(accessToken);
  if (!accessToken) {
    return res.status(401).json({
      status: false,
      error: 'Access token not found',
    });
  }

    try {
        console.log(accessToken);
    const decodedToken = jwt.verify(accessToken, process.env.SECRET_KEY);
      req.userId = decodedToken.id;
      next();
  } catch (error) {
      console.log(error);
    return res.status(401).json({
      status: false,
      error: 'Invalid access token',
    });
  }
};

module.exports = verifyAccessToken;
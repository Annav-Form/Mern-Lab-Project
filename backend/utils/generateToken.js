const jwt = require("jsonwebtoken");

/**
 * Generates a JWT and sets it as an HttpOnly cookie on the response.
 * @param {Object} res - Express response object
 * @param {string} userId - MongoDB customer _id
 */
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,           // Not accessible via JS
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });

  return token;
};

module.exports = generateToken;

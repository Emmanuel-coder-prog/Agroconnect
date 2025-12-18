const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Log the JWT secret presence for debug (remove in production)
  console.log("JWT Secret in middleware:", !!process.env.JWT_SECRET);

  // Accept headers regardless of case and also support common aliases
  const authHeader =
    (req.headers && (req.headers.authorization || req.headers.Authorization)) ||
    (typeof req.get === "function" && req.get("authorization"));

  if (!authHeader) {
    return res.status(401).send("Access denied. No token provided.");
  }

  // Support both 'Bearer <token>' and raw token formats
  const parts = authHeader.split(" ");
  let token = null;
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
    token = parts[1];
  } else if (parts.length === 1) {
    token = parts[0];
  } else {
    return res.status(401).send("Access denied. Invalid token format.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach decoded user (id, etc.)
    return next();
  } catch (error) {
    console.error("JWT verification error:", error && error.message);
    return res.status(401).send("Invalid or expired token.");
  }
};

module.exports = authMiddleware;
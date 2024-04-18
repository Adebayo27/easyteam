const SECRET_KEY = "wherecargo_secret";
const jwt = require("jsonwebtoken");
exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log('token')
  console.log(token)
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  jwt.verify(token, SECRET_KEY, async (err, user) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    req.body.userTokenBreak = user;
    await next();
  });
};

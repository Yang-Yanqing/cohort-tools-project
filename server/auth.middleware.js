const jwt = require("jsonwebtoken");
const SECRET = "mysecretkey"; 

const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Without token" });
  }

 const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.payload = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ message: "undefinid token" });
  }
};

module.exports = { isAuthenticated, SECRET };

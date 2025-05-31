// /backend/src/middleware/admin.middleware.js
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403); // 403 Forbidden is more appropriate than 401 Unauthorized
    throw new Error("Not authorized as an admin");
  }
};

export { admin };
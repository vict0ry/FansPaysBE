const jwt = require("jsonwebtoken");
exports.requireLogin = (req, res, next) => {
    return next();
    const isVerified = jwt.verify(req.headers.authorization, 'secretkey');
    if (isVerified) {
        return next();
    }
    res.status(403).send('Please login');
}

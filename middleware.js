const jwt = require("jsonwebtoken");
exports.requireLogin = (req, res, next) => {
   // return next();
    try {
        const isVerified = jwt.verify(req.headers.authorization, 'secretkey');
        if (isVerified) {
            return next();
        }
    } catch(err) {
        res.status(403).send('Please login');
    }

}

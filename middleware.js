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
exports.isAdmin = (req, res, next) => {
    try {
        const isVerified = jwt.verify(req.headers.authorization, 'secretkey');
        // const isAdmin = jwt.decode(req.headers.authorization, 'secretkey').payload.role;
        if (isVerified) {
            return next();
        }
    } catch(err) {
        res.status(403).send('Please login');
    }
}
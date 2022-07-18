const jwt = require("jsonwebtoken");
// const moment = require("moment");
// const User = require("./schemas/UserSchema");
exports.requireLogin = (req, res, next) => {
    try {
        const isVerified = jwt.verify(req.headers.authorization, 'secretkey');
        if (isVerified) {
            const userId = jwt.decode(req.headers.authorization, 'secretkey')._id;
            // User.findOneAndUpdate({userId: _id}, {lastOnline: moment.now()});
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
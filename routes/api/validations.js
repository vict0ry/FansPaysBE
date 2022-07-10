const express = require('express');
const app = express();
const router = express.Router();
const User = require("../../schemas/UserSchema");
router.get('/username/:username', async (req, res, next) => {
    const foundUser = await User.findOne({username: req.params.username});
    if (!foundUser) {
        return res.send(true);
    }
    return res.send(false);
})

router.get('/email/:email', async (req, res, next) => {
    const foundUser = await User.findOne({email: req.params.email});
    if (!foundUser) {
        return res.send(true);
    }
    return res.send(false);
})
module.exports = router;
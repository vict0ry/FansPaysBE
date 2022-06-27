const bodyParser = require("body-parser")

const express = require('express');
const router = express.Router();
require("body-parser");
require("bcrypt");
const User = require('../schemas/UserSchema');
const app = express();
app.use(bodyParser.urlencoded({extended: false}));

router.get("/", (req, res, next) => {

    const payload = {
        pageTitle: req.session.user.username,
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        profileUser: req.session.user
    };

    console.log('profile page...');

    res.status(200).render("profilePage", payload);
})

router.get("/:username", async (req, res, next) => {
    const payload = await getPayload(req.params.username, req.session.user);
    console.log('profile page 1...', payload);

    res.status(200).send(payload);
})

router.get("/:username/replies", async (req, res, next) => {

    var payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = "replies";

    res.status(200).render("profilePage", payload);
})

router.get("/:username/following", async (req, res, next) => {

    var payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = "following";

    res.status(200).render("followersAndFollowing", payload);
})

router.get("/:username/followers", async (req, res, next) => {

    var payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = "followers";

    res.status(200).render("followersAndFollowing", payload);
})

async function getPayload(username, userLoggedIn) {
    let user = await User.findOne({username: username});

    if (user == null) {

        user = await User.findById(username);

        if (user == null) {
            return {
                pageTitle: "User not found",
                userLoggedIn: userLoggedIn,
                userLoggedInJs: JSON.stringify(userLoggedIn)
            }
        }
    }

    return {
        pageTitle: user.username,
        userLoggedIn: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
        profileUser: user
    }
}

module.exports = router;

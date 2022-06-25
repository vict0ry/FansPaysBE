const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt");
const User = require('../schemas/UserSchema');
const jwt = require("jsonwebtoken");

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({extended: false}));

router.get("/", (req, res, next) => {

    res.status(200).render("login");
})

router.post("/", async (req, res, next) => {

    const payload = req.body;
    console.log('here 1')

    if (req.body.login && req.body.password) {
        const user = await User.findOne({
            $or: [
                {username: req.body.login},
                {email: req.body.login}
            ]
        })
            .catch((error) => {
                console.log(error);
                payload.errorMessage = "Something went wrong.";
                res.status(500).send(payload.errorMessage);
            });

        if (user !== null) {
            const result = await bcrypt.compare(req.body.password, user.password);

            if (result) {
                const token = jwt.sign(user.toJSON(), 'secretkey');
                req.session.user = user;
                return res.send(token);
            }
        }

        payload.errorMessage = "Login credentials incorrect.";
        return res.status(404).send(payload.errorMessage);
    }

    payload.errorMessage = "Make sure each field has a valid value.";
    res.status(200).send(payload.errorMessage);
})

module.exports = router;

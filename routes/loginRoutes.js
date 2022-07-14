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
    console.log(req.body);

    if (req.body.login && req.body.password) {
        const findUser = User.findOne({
            $or: [
                {username: req.body.login},
                {email: req.body.login}
            ]
        });
        const user = await findUser;
        if (user !== null) {
            const pass = await findUser.select('password');
            const result = await bcrypt.compare(req.body.password, pass.password);
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

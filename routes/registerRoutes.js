const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt");
const User = require('../schemas/UserSchema');
const jwt = require("jsonwebtoken");

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({extended: true}));
const jsonParser = bodyParser.json()

router.post("/", async (req, res, next) => {
    const firstName = req.body.firstName.trim();
    const lastName = req.body.lastName.trim();
    const username = req.body.username.trim();
    const email = req.body.email.trim();
    const password = req.body.password;
    const birthDate = req.body.birthDate;
    const payload = req.body;

    const isValidEmail = /\S+@\S+\.\S+/;
    if (!isValidEmail.test(email)) {
        payload.errorMessage = "Invalid email.";
        return res.status(500).send({errorMessage: payload.errorMessage});
    }

    if (firstName && lastName && username && email && password) {
        const user = await User.findOne({
            $or: [
                {username: username},
                {email: email}
            ]
        })
            .catch((error) => {
                console.log(error);
                payload.errorMessage = "Something went wrong.";
                res.status(200).send(payload);
            });

        if (user == null) {
            // No user found
            const data = req.body;
            data.password = await bcrypt.hash(password, 10);

            const user = await User.create(data);
            const token = jwt.sign(user.toJSON(), 'secretkey');
            res.status(200).send(token);

        } else {
            // User found
            if (email === user.email) {
                payload.errorMessage = "Email already in use.";
            } else {
                payload.errorMessage = "Username already in use.";
            }
            res.status(500).send({errorMessage: payload.errorMessage});
        }
    } else {
        payload.errorMessage = "Make sure each field has a valid value.";
        res.status(500).send({errorMessage: payload.errorMessage});
    }
})

module.exports = router;

const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const upload = multer({dest: "uploads/"});
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');
const Notification = require('../../schemas/NotificationSchema');
const jwt = require("jsonwebtoken");
const {requireLogin} = require("../../middleware");
const Credit = require("../../schemas/CreditSchema");

app.use(bodyParser.urlencoded({extended: false}));

router.get("/", async (req, res, next) => {
    let searchObj = req.query;


    if (req.query.search !== undefined) {
        searchObj = {
            $or: [
                {firstName: {$regex: req.query.search, $options: "i"}},
                {lastName: {$regex: req.query.search, $options: "i"}},
                {username: {$regex: req.query.search, $options: "i"}},
            ]
        }
    } else {
        User.find()
            .then(results => res.status(200).send(results))
            .catch(error => {
                console.log(error);
                res.sendStatus(400);
            })
    }

    User.find(searchObj)
        .then(results => res.status(200).send(results))
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
});

router.put("/:userId/follow", async (req, res, next) => {

    const userData = jwt.decode(req.headers.authorization, 'secretkey')
    console.log('userdata: ', userData);
    const {_id} = userData;

    const userId = req.params.userId;

    const user = await User.findById(userId);
    const subscriberCredits = await Credit.find({$or: [{recipient: _id}, {sender: _id}]});
    const subscriberCreditsTotal = subscriberCredits.map(i => i.amount).reduce((a,b) => { return a+b}, 0);
    const sufficientBalance = (Number(subscriberCreditsTotal) > Number(user.subscribtionPrice));

    console.log('subscriberCreditsTotal', subscriberCreditsTotal);
    console.log('user.subscriptionPrice', user.subscribtionPrice);
    console.log('sufficientBalance', subscriberCreditsTotal);




    if (user == null) return res.sendStatus(404);

    const isFollowing = user.followers && user.followers.includes(_id);

    if (!isFollowing) {
        if (!sufficientBalance) {
            return res.status(200).send('not enough balance');
        }
        console.log('recipient: ', userId);
        console.log('sender: ', userData._id);

        const addedCredit = await Credit.create({
            description: 'New subscriber',
            amount: user.subscribtionPrice,
            recipient: userId,
            sender: userData._id,
        })
        const creditRemoval = await Credit.create({
            description: 'Subscription payment',
            amount: user.subscribtionPrice * -1,
            recipient: userData._id,
            sender: userId
        })
        console.log('credit changed')
    }


    const option = isFollowing ? "$pull" : "$addToSet";

    const updatedUser = await User.findByIdAndUpdate(_id, {[option]: {following: userId}}, {new: true})
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })

    User.findByIdAndUpdate(userId, {[option]: {followers: _id}})
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })

    // if (!isFollowing) {
    //     await Notification.insertNotification(userId, _id, "follow", _id);
    // }

    res.status(200).send(updatedUser);
})

router.get("/:userId/following", async (req, res, next) => {
    User.findById(req.params.userId)
        .populate("following")
        .then(results => {
            res.status(200).send(results);
        })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
});

router.get("/:userId/followers", async (req, res, next) => {
    User.findById(req.params.userId)
        .populate("followers")
        .populate("following")
        .then(results => {
            const {following, followers} = results
            res.status(200).send({following, followers});
        })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
});
router.put("/updateprofile", async (req, res, next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    const foundUser = await User.findByIdAndUpdate(user._id, {
        description: req.body.description,
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        birthDate: req.body.birthDate
    }, {new: true});
    res.status(200).send(foundUser)
});

router.put('/subscribtionPrice', async (req,res,next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    console.log('newprice : ', req.body.price);
    const foundUser = await User.findByIdAndUpdate(user._id, {
        subscribtionPrice: req.body.price
    }).then(i => {
        return res.send(200);
    })
});

router.put('/contacts', async (req,res, next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');

})

router.post("/profilePicture", upload.single("croppedImage"), async (req, res, next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    if (!req.file) {
        console.log("No file uploaded with ajax request.");
        return res.sendStatus(400);
    }

    const filePath = `/uploads/images/${req.file.filename}.png`;
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, `../../${filePath}`);
    await fs.rename(tempPath, targetPath, async error => {
        if (error != null) {
            console.log(error);
            return res.sendStatus(400);
        } else {
            const foundUser = await User.findByIdAndUpdate(user._id, {
                profilePic: filePath
            });
            res.status(200).send(foundUser);
        }
    })

});

router.post("/coverPhoto", upload.single("croppedImage"), async (req, res, next) => {
    if (!req.file) {
        console.log("No file uploaded with ajax request.");
        return res.sendStatus(400);
    }

    const filePath = `/uploads/images/${req.file.filename}.png`;
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, `../../${filePath}`);

    fs.rename(tempPath, targetPath, async error => {
        if (error != null) {
            console.log(error);
            return res.sendStatus(400);
        }

        req.session.user = await User.findByIdAndUpdate(req.session.user._id, {coverPhoto: filePath}, {new: true});
        res.sendStatus(204);
    })

});

module.exports = router;

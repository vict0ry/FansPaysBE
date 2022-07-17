const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const upload = multer({dest: "uploads/"});
const User = require('../../schemas/UserSchema');
const jwt = require("jsonwebtoken");
const Credit = require("../../schemas/CreditSchema");
const {SubscriptionHelper} = require("../../SubscriptionHelper");
const {CreditHelper} = require("../../CreditHelper");

app.use(bodyParser.urlencoded({extended: false}));

router.get("/", async (req, res, next) => {
    let searchObj = req.query;
    let perPage = 12
        , page = req.query.page > 0 ? req.query.page : 0;
    const count = await User.count();



    if (req.query.search !== undefined) {
        searchObj = {
            $or: [
                {firstName: {$regex: req.query.search, $options: "i"}},
                {lastName: {$regex: req.query.search, $options: "i"}},
                {username: {$regex: req.query.search, $options: "i"}},
            ]
        }
    } else {
       return User.find()
            .limit(perPage)
            .skip(perPage * page)
            .sort({username: 'asc'})
            .then(async (data) => {
                return res.status(200).send({
                    data,
                    page,
                    pages: Math.floor(count / perPage)
                })
            })
            .catch(error => {
                console.log(error);
                res.sendStatus(400);
            })
    }

    User.find(searchObj)
        .limit(perPage)
        .skip(perPage * page)
        .sort({username: 'asc'})
        .then(async (data) => {
            return res.status(200).send({
                data,
                page,
                pages: Math.floor(count / perPage)
            })
        })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
});

router.put("/:userId/follow", async (req, res, next) => {

    const userData = jwt.decode(req.headers.authorization, 'secretkey')
    const {_id} = userData;

    const userId = req.params.userId;

    const user = await User.findById(userId);
    const incomeCredits = await Credit.find({recipient: _id});
    const outcomeCredits = await Credit.find({sender: _id});
    const total = incomeCredits.map(i => i.amount).reduce((a,b) => a+b, 0) - outcomeCredits.map(i => i.amount).reduce((a,b) => a+b, 0);
    const sufficientBalance = (Number(total) > Number(user.subscribtionPrice));

    if (user == null) return res.sendStatus(404);
    const isFollowing = user.followers && user.followers.includes(_id);
    const subscriptionInit = await new SubscriptionHelper(userData._id, userId).create();
    if (subscriptionInit.isActive) {
        return res.status(200).send('You already subscribed');
    } else {
        if (!sufficientBalance) {
            return res.status(200).send({
                error: {
                    message: 'INSUFFICIENT_BALANCE'
                }
            });
        }
        const credit = await new CreditHelper(user, userData).subscribe();
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
    const foundUser = await User.findByIdAndUpdate(user._id, {
        subscribtionPrice: req.body.price
    }).then(i => {
        return res.send(200);
    })
});

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

module.exports = router;

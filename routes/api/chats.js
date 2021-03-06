const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const User = require('../../schemas/UserSchema');
const Chat = require('../../schemas/ChatSchema');
const Message = require('../../schemas/MessageSchema');
const jwt = require("jsonwebtoken");

app.use(bodyParser.urlencoded({extended: false}));

router.post("/", async (req, res, next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    console.log('chattttz')
    if (!req.body.users) {
        console.log("Users param not sent with request");
        return res.sendStatus(400);
    }

    const users = req.body.users;

    if (users.length === 0) {
        console.log("Users array is empty");
        return res.sendStatus(400);
    }

    users.push(user);

    const chatData = {
        users: users,
        isGroupChat: true
    };

    Chat.create(chatData)
        .then(results => res.status(200).send(results))
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
})

router.get("/", async (req, res, next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    console.log('chatszs')
    Chat.find({users: {$elemMatch: {$eq: user?._id}}})
        .populate("users")
        .populate("latestMessage")
        .sort({updatedAt: -1})
        .then(async results => {
            console.log('uiiiis');

            if (req.query.unreadOnly && req.query.unreadOnly === "true") {
                results = results.filter(r => r.latestMessage && !r.latestMessage.readBy.includes(user._id));
            }


            results = await User.populate(results, {path: "latestMessage.sender"});
            return res.status(200).send(results);
        })
        .catch(error => {
            console.log(error);
            return res.sendStatus(400);
        })
})

router.get("/:chatId", async (req, res, next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    console.log('/:chatid');
    Chat.findOne({_id: req.params.chatId, users: {$elemMatch: {$eq: user._id}}})
        .populate("users")
        .then(results => res.status(200).send(results))
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
})

router.put("/:chatId", async (req, res, next) => {
    console.log('put /:chatid');
    Chat.findByIdAndUpdate(req.params.chatId, req.body)
        .then(results => res.sendStatus(204))
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
})

router.get("/:chatId/messages", async (req, res, next) => {
    console.log(':chatId/messages');
    Message.find({chat: req.params.chatId})
        .populate("sender")
        .populate("product")
        .then(results => res.status(200).send(results))
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
})

router.put("/:chatId/messages/markAsRead", async (req, res, next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    Message.updateMany({chat: req.params.chatId}, {$addToSet: {readBy: user._id}})
        .then(() => res.sendStatus(204))
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
})

module.exports = router;

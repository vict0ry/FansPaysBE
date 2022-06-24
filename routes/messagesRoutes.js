const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt");
const mongoose = require('mongoose');
const User = require('../schemas/UserSchema');
const Chat = require('../schemas/ChatSchema');
const jwt = require("jsonwebtoken");

router.get("/:chatId", async (req, res, next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    const userId = user._id;
    const chatId = req.params.chatId;
    const isValidId = mongoose.isValidObjectId(chatId);


    const payload = {
        pageTitle: "Chat",
        userLoggedIn: user,
        userLoggedInJs: JSON.stringify(user)
    };

    if (!isValidId) {
        payload.errorMessage = "Chat does not exist or you do not have permission to view it.";
        return res.status(200).send(payload);
    }

    let chat = await Chat.findOne({_id: chatId, users: {$elemMatch: {$eq: userId}}})
        .populate("users");

    if (chat == null) {
        // Check if chat id is really user id
        const userFound = await User.findById(chatId);

        if (userFound != null) {
            // get chat using user id
            chat = await getChatByUserId(userFound._id, userId);
        }
    }

    if (chat == null) {
        payload.errorMessage = "Chat does not exist or you do not have permission to view it.";
    } else {
        payload.chat = chat;
    }

    res.status(200).send(payload);
})

function getChatByUserId(userLoggedInId, otherUserId) {
    return Chat.findOneAndUpdate({
            isGroupChat: false,
            users: {
                $size: 2,
                $all: [
                    {$elemMatch: {$eq: mongoose.Types.ObjectId(userLoggedInId)}},
                    {$elemMatch: {$eq: mongoose.Types.ObjectId(otherUserId)}}
                ]
            }
        },
        {
            $setOnInsert: {
                users: [userLoggedInId, otherUserId]
            }
        },
        {
            new: true,
            upsert: true
        })
        .populate("users");
}

module.exports = router;

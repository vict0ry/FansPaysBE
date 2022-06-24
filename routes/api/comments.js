const express = require('express');
const app = express();
const router = express.Router();
const Comment = require('../../schemas/CommentSchema');
const jwt = require("jsonwebtoken");
const Notification = require('../../schemas/NotificationSchema');
router.put("/:id", async (req, res, next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    const userId = user._id;
    const commentId = req.params.id;
    const comment = req.body.comment;
    const commentSchema = await Comment.create({
        sender: userId, comment: comment
    });
    await commentSchema.populate('sender').execPopulate();
    console.log('sender populated: ', commentSchema);
    const savedComment = await Comment.findByIdAndUpdate({_id: commentId}, {['$addToSet']: {comments: commentSchema._id}})
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        });
    res.status(200).send(savedComment)
})
router.put("/:id/like", async (req, res, next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    const userId = user._id;
    const commentId = req.params.id;
    const foundComment = await Comment.findById(commentId);
    console.log('found comments: ', foundComment);
    const isLiked = foundComment.likes.includes(userId);
    const option = isLiked ? "$pull" : "$addToSet";

    const savedComment = await Comment.findByIdAndUpdate({_id: commentId}, {[option]: {likes: userId}}, {new: true})
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        });
    if (!isLiked) {
        await Notification.insertNotification(savedComment.sender, userId, "commentLike", savedComment._id);
    }
    res.status(200).send(savedComment)
})

module.exports = router;

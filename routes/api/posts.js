const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');
const Notification = require('../../schemas/NotificationSchema');
const Comment = require('../../schemas/CommentSchema');
const jwt = require("jsonwebtoken");
const multer = require("multer");
const upload = multer({dest: "uploads/"});
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const {omit} = require("mongoose/lib/utils");
const {SubscriptionHelper} = require("../../SubscriptionHelper");


app.use(bodyParser.urlencoded({extended: false}));

router.get("/", async (req, res, next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    const foundUser = await User.findOne({username: user.username});
    const searchObj = req.query;

    if (searchObj.search !== undefined) {
        searchObj.content = {$regex: searchObj.search, $options: "i"};
        delete searchObj.search;
    }


    if (searchObj.followingOnly !== undefined) {
        const followingOnly = searchObj.followingOnly === "true";

        if (followingOnly) {
            const objectIds = [];

            if (!foundUser.following) {
                foundUser.following = [];
            }

            foundUser.following.forEach(user => {
                objectIds.push(user);
            })

            objectIds.push(user._id);
            searchObj.postedBy = {$in: objectIds};
        }
        console.log('following only true!!!');

        delete searchObj.followingOnly;
    }
    const results = await getPosts(searchObj);
    console.log('result: ', results)
    res.status(200).send(results);
})

router.get('/:username', async (req, res, next) => {
    const username = req.params.username;
    const loggedUser = await jwt.decode(req.headers.authorization, 'secretkey');
    const user = await User.findOne({username: username});
    const postOwnerId = user?._id;
    const isOwner = postOwnerId === loggedUser._id;
    let posts = await Post.find({postedBy: postOwnerId})
        .populate("postedBy")
        .populate({
        path: 'comments',
        populate: {
            path: 'sender',
        }
    }).populate({
        path: 'comments',
        populate: {
            path: 'comments',
            populate: {
                path: 'sender',
            }
        }
    }).lean();
    const subscription = await new SubscriptionHelper(loggedUser._id, postOwnerId).create();
    if (!subscription.isActive) {
        posts = posts.map(post => {
            const {pictures, comments, ...omitedPost} = post;
            omitedPost['not_subscribed'] = true;
            return omitedPost;
        })
    }

    res.status(200).send(posts);
})

// router.get("/:id", async (req, res, next) => {
//
//     const postId = req.params.id;
//
//     let postData = await getPosts({_id: postId});
//     postData = postData[0];
//
//     const results = {
//         postData: postData
//     };
//
//     if (postData.replyTo !== undefined) {
//         results.replyTo = postData.replyTo;
//     }
//
//     results.replies = await getPosts({replyTo: postId});
//
//     res.status(200).send(results);
// })

router.post("/", upload.array("images[]"), async (req, res, next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    console.log('post /');
    if (!req.body.content) {
        console.log("Content param not sent with request");
        return res.sendStatus(400);
    }
    let filesPath = [];

    if (req.files.length) {
        req.files.forEach(file => {
            console.log(file);
            const ending = file.originalname.split('.')[1];
            console.log('ending: ', ending);
            const filePath = `/uploads/images/${file.filename}.` + ending;
            const tempPath = file.path;
            const targetPath = path.join(__dirname, `../../${filePath}`);
            console.log("target: ", filePath);
            filesPath.push(filePath);
            fs.rename(tempPath, targetPath, async error => {
                if (error != null) {
                    console.log(error);
                    return res.sendStatus(400);
                }
            })
        })

    }

    const postData = {
        content: req.body.content,
        postedBy: user
    };

    if (req.body.replyTo) {
        postData.replyTo = req.body.replyTo;
    }
    if (filesPath.length) {
        postData.pictures = filesPath;
    }


    Post.create(postData)
        .then(async newPost => {
            newPost = await User.populate(newPost, {path: "postedBy"})
            newPost = await Post.populate(newPost, {path: "replyTo"})

            if (newPost.replyTo !== undefined) {
                await Notification.insertNotification(newPost.replyTo.postedBy, req.session.user._id, "reply", newPost._id);
            }

            res.status(201).send(newPost);
        })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
})

router.put("/:id/like", async (req, res, next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    const userId = user._id;
    console.log('/:id/like');

    const postId = req.params.id;
    const foundPost = await Post.findOne({_id: postId});
    const isLiked = foundPost.likes.includes(userId);

    const option = isLiked ? "$pull" : "$addToSet";

    await User.findByIdAndUpdate(userId, {[option]: {likes: postId}}, {new: true})
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })

    const post = await Post.findByIdAndUpdate(postId, {[option]: {likes: user._id}}, {new: true})
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        });
    if (!isLiked) {
        await Notification.insertNotification(post.postedBy, userId, "postLike", post._id);
    }


    res.status(200).send(post)
})
router.put("/:id/comment", async (req, res, next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    console.log('/id/comment');
    const userId = user._id;
    const postId = req.params.id;
    const comment = req.body.comment;
    const commentSchema = await Comment.create({
        sender: userId, comment: comment, post: postId
    });
    const post = await Post.findByIdAndUpdate({_id: postId}, {['$addToSet']: {comments: commentSchema._id}})
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        });
    const commentPopulated = await commentSchema.populate('sender').execPopulate();
    console.log(commentPopulated);
    res.status(200).send(commentPopulated)
})

router.delete('/:id', async (req, res, next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    console.log('/:id');
    const postId = req.params.id;
    await Post.findOneAndDelete({postedBy: user._id, _id: postId})
        .then(result => {
            res.status(200).send(result);
        })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        });
});

router.post('/:id/update', upload.array("images[]"), async (req, res, next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    console.log('/:id/update');
    const postId = req.params.id;

    if (!req.body.content) {
        console.log("Content param not sent with request");
        return res.sendStatus(400);
    }
    let filesPath = [];

    console.log(req.files)
    console.log("body: ", req.body)

    await Post.findOne({postedBy: user._id, _id: postId})
        .then(async result => {
            result.content = req.body.content;

            console.log("PICTURES: ", result.pictures)

            if(req.body.images) {
                result.pictures.forEach(picture => {
                    const findResult = req.body.images.find(picImages => picture === picImages);
                    findResult ? filesPath.push(findResult) : fs.unlink(path.join(__dirname, `../../${picture}`), (err) => {
                        if (err) throw err;
                        console.log(picture, ' was deleted');
                    });
                    ;
                });
                console.log("changed", filesPath)
            }

            if (req.files.length) {
                req.files.forEach(file => {
                    const ending = file.originalname.split('.')[1];
                    console.log('ending: ', ending);
                    const filePath = `/uploads/images/${file.filename}.` + ending;
                    const tempPath = file.path;
                    const targetPath = path.join(__dirname, `../../${filePath}`);
                    console.log("target: ", filePath);
                    filesPath.push(filePath);
                    fs.rename(tempPath, targetPath, async error => {
                        if (error != null) {
                            console.log(error);
                            return res.sendStatus(400);
                        }
                    })
                })

            }

            result.pictures = filesPath;

            console.log(result.pictures)

            await result.save();

            res.status(200).send(result);
        })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        });
});

router.post("/:id/retweet", async (req, res, next) => {
    const postId = req.params.id;
    const userId = req.session.user._id;

    // Try and delete retweet
    const deletedPost = await Post.findOneAndDelete({postedBy: userId, retweetData: postId})
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        });

    var option = deletedPost != null ? "$pull" : "$addToSet";

    var repost = deletedPost;

    if (repost == null) {
        repost = await Post.create({postedBy: userId, retweetData: postId})
            .catch(error => {
                console.log(error);
                res.sendStatus(400);
            })
    }

    req.session.user = await User.findByIdAndUpdate(userId, {[option]: {retweets: repost._id}}, {new: true})
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })

    const post = await Post.findByIdAndUpdate(postId, {[option]: {retweetUsers: userId}}, {new: true})
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        });

    if (!deletedPost) {
        await Notification.insertNotification(post.postedBy, userId, "retweet", post._id);
    }


    res.status(200).send(post)
})


router.put("/:id", async (req, res, next) => {

    if (req.body.pinned !== undefined) {
        await Post.updateMany({postedBy: req.session.user}, {pinned: false})
            .catch(error => {
                console.log(error);
                res.sendStatus(400);
            })
    }

    Post.findByIdAndUpdate(req.params.id, req.body)
        .then(() => res.sendStatus(204))
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
})

async function getPosts(filter) {
    let results = await Post.find(filter)
        .populate("postedBy")
        .populate("retweetData")
        .populate("replyTo")
        .populate("sender")
        .populate("comments")
        .populate({
            path: 'comments',
            populate: {
                path: 'sender',
            }
        })
        .populate({
            path: 'comments',
            populate: {
                path: 'comments',
                populate: {
                    path: 'sender',
                }
            }
        })
        .sort({"createdAt": -1})
        .catch(error => console.log(error));

    console.log('getposts')

    results = await User.populate(results, {path: "replyTo.postedBy"})
    return User.populate(results, {path: "retweetData.postedBy"});
}

module.exports = router;

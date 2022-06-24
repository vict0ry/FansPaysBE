const express = require("express");
const app = express();
const router = express.Router();
const jwt = require("jsonwebtoken");
const Shop = require("../../schemas/ShopSchema");
const multer = require("multer");
const upload = multer({dest: "uploads/"});
const fs = require("fs");
const path = require("path");


router.post("/", upload.array("images[]"), async (req, res, next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    console.log(req.body);

    let filesPath = [];
    if (req.files.length) {
        req.files.forEach(file => {
            console.log(file);
            if (file && file.path) {
                const ending = file.originalname.split('.')[1];
                const filePath = `/uploads/images/${file.filename}.` + ending;
                const tempPath = file.path;
                const targetPath = path.join(__dirname, `../../${filePath}`);
                filesPath.push(filePath);
                fs.rename(tempPath, targetPath, async error => {
                    if (error != null) {
                        console.log(error);
                        return res.sendStatus(400);
                    }
                })
            }
        })

    }

    const shopData = {
        postedBy: user,
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    };

    if (filesPath.length) {
        shopData.pictures = filesPath;
    }


    Shop.create(shopData)
        .then(async newProduct => {
            // if (newPost.replyTo !== undefined) {
            //     // await Notification.insertNotification(newPost.replyTo.postedBy, req.session.user._id, "reply", newPost._id);
            // }
            res.status(201).send(newProduct);
        })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
})
router.get('/', async (req, res, next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    return Shop.find({postedBy: user._id}).then(data => {
        return res.send(data);
    })
})
module.exports = router;

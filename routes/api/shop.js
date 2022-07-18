const express = require("express");
const app = express();
const router = express.Router();
const jwt = require("jsonwebtoken");
const Shop = require("../../schemas/ShopSchema");
const multer = require("multer");
const upload = multer({dest: "uploads/"});
const fs = require("fs");
const path = require("path");
const Message = require("../../schemas/MessageSchema");
const Chat = require("../../schemas/ChatSchema");
const User = require("../../schemas/UserSchema");


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
            res.status(201).send(newProduct);
        })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
})
router.get('/:profileId', async (req, res, next) => {
    return Shop.find({postedBy: req.params.profileId}).then(data => {
        return res.send(data);
    })
})
router.get('/', async (req,res,next) => {
    let searchObj = req.query;
    let perPage = 12
        , page = req.query.page > 0 ? req.query.page : 0;
    const count = await Shop.count();

    return Shop.find()
        .limit(perPage)
        .skip(perPage * page)
        .sort({username: 'asc'})
        .then(async (data) => {
            return res.status(200).send({
                data,
                page,
                pages: Math.floor(count / perPage)
            });
        });
});
router.post('/buy/:id', async (req,res,next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    const product = await Shop.findOne({_id: req.params.id});

    const chatData = {
        users: [user._id, product.postedBy._id],
        isGroupChat: false
    };

    const chat = await Chat.create(chatData);
    const newMessage = {
        sender: user._id,
        content: product.postedBy._id,
        chat: chat._id,
        product: req.params.id
    };

    console.log('new message: ', newMessage);
    Message.create(newMessage);
})

module.exports = router;

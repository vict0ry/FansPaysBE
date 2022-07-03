const express = require("express");
const app = express();
const router = express.Router();

const jwt = require("jsonwebtoken");
const Wish = require("../../schemas/WishSchema");
router.get('/:id', async (req, res, next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    if (req.params.id !== 'undefined') {
        return Wish.find({owner: req.params.id}).then(data => {
            return res.send(data);
        })
    }
    return res.status(404);
});
router.delete('/:id', async (req,res,next) => {
    await Wish.findByIdAndDelete(req.params.id);
    return res.status(200);
})
router.post('/add', async (req, res, next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    const {name, amount } = req.body;
    const createdWish = await Wish.create({
        name,
        amount,
        owner: user._id,
    });
    return res.status(200).send(createdWish);
});
module.exports = router;
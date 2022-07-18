const express = require("express");
const app = express();
const router = express.Router();
const jwt = require("jsonwebtoken");
const Demands = require("../../schemas/DemandsSchema");

router.post("/", async (req, res, next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    const demand = await Demands.create({
        description: req.body.description,
        price: req.body.price,
        postedBy: user._id,
        recipient: req.body.recipient
    });
    return res.status(200).send(demand);
})
router.get('/:id', async (req,res, next) => {
    const demands = await Demands.find({recipient: req.params.id}).populate('postedBy');
    return res.status(200).send(demands);
})
router.put('/change-status', async (req,res,next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    const demand = await Demands.findOneAndUpdate(
        {recipient: user._id, _id: req.body.demandId},
        {status: req.body.action}).populate('postedBy');
    return res.status(200).send(demand);
})
module.exports = router;

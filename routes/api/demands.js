const express = require("express");
const app = express();
const router = express.Router();
const jwt = require("jsonwebtoken");
const Demands = require("../../schemas/DemandsSchema");
const {CreditHelper} = require("../../CreditHelper");
const Notification = require("../../schemas/NotificationSchema");

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
    const {action, demandId} = req.body;
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    const dd = await Demands.findOne({ _id: demandId}).populate('postedBy');
    if (user._id !== dd.recipient) {
        return res.status(403).send('hi hacker!');
    }
    if(dd.status !== 'request') {
        return res.status(403);
    }

    const creditInstance = new CreditHelper(dd.postedBy._id,user);
    await creditInstance.demand(dd.price);
    const updatedDd = await Demands.findOneAndUpdate({_id: demandId},{
        status: action
    })
    await Notification.insertNotification(dd.postedBy._id, user._id, "DEMAND_ACCEPTED", dd._id);
    return res.status(200).send(updatedDd);
})
module.exports = router;

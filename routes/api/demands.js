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
module.exports = router;

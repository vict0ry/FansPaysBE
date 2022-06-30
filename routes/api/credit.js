const express = require("express");
const app = express();
const router = express.Router();
const jwt = require("jsonwebtoken");
const Credit = require("../../schemas/CreditSchema");


router.post("/", async (req, res, next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    const income = await Credit.find({recipient: user._id}).then(i => i.map(i => i.amount).reduce((a, b) => a + b, 0))
    const outcome = await Credit.find({sender: user._id}).then(i => i.map(i => i.amount).reduce((a, b) => a + b, 0)) + req.body.amount
    const credit = await Credit.create({
        description: req.body.description,
        amount: req.body.amount,
        recipient: req.body.recipient,
        sender: user._id,
    })
    res.send(credit);
})
router.post('/addremove', async (req,res,next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    const userRole = user.role;
    if (userRole === 'admin') {
        await Credit.create({
            description: req.body.description || 'admin action',
            amount: req.body.amount,
            recipient: req.body.recipient,
            sender: user._id,
        })
    } else {
        return res.status(403).send('Not admin');
    }
})
router.get('/', async (req, res, next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    const incomeAndOutcome = await Credit.find({$or: [{recipient: user._id}, {sender: user._id}]}).populate("recipient").populate("sender")
    const total = incomeAndOutcome.map(i => i.amount).reduce((a,b) => { return a+b}, 0)
    return res.send({
        transactions: incomeAndOutcome,
        total
    });
})
// router.get('/transactions', async (req, res, next) => {
//     const user = await jwt.decode(req.headers.authorization, 'secretkey');
//     await Credit.find({sender: user._id}).then(data => {
//         return res.send(data);
//     })
// })
module.exports = router;

const express = require("express");
const app = express();
const router = express.Router();
const jwt = require("jsonwebtoken");
const Credit = require("../../schemas/CreditSchema");
const {CreditHelper} = require("../../CreditHelper");


router.post("/", async (req, res, next) => {
    const category = req.body.category;
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    const creditInstance = await new CreditHelper(user._id, req.body.recipient);
    if (category === 'TIP') {
        if(await creditInstance.insufficientBalance(req.body.amount)) {
            return res.status(200).send({
                error: {
                    message: 'INSUFFICIENT_BALANCE'
                }
            });
        }
        await creditInstance.tip(req.body.amount);
    }
    res.sendStatus(200);
})
router.post('/addremove', async (req,res,next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    const userRole = user.role;
    if (userRole === 'admin') {
        await Credit.create({
            description: req.body.description || 'admin action',
            amount: req.body.amount,
            category: 'ADMIN_ACTION',
            recipient: req.body.recipient,
            sender: user._id,
        });
        return res.status(200).send('OK');
    } else {
        return res.status(403).send('Not admin');
    }
})
router.get('/', async (req, res, next) => {
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    const incomeAndOutcome = await Credit.find({$or: [{recipient: user._id}, {sender: user._id}]}).populate("recipient").populate("sender")
    const incomeCredits = await Credit.find({recipient: user._id});
    const outcomeCredits = await Credit.find({sender: user._id});
    const total = incomeCredits.map(i => i.amount).reduce((a,b) => a+b,0) - outcomeCredits.map(i => i.amount).reduce((a,b) => a+b,0);

    return res.send({
        transactions: incomeAndOutcome,
        income: incomeCredits,
        outcome: outcomeCredits,
        total
    });
})
module.exports = router;

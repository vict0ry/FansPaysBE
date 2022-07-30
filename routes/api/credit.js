const express = require("express");
const app = express();
const router = express.Router();
const jwt = require("jsonwebtoken");
const Credit = require("../../schemas/CreditSchema");
const {CreditHelper} = require("../../CreditHelper");
const User = require("../../schemas/UserSchema");


router.post("/", async (req, res, next) => {
    const category = req.body.category;
    const user = await jwt.decode(req.headers.authorization, 'secretkey');
    const recipient = await User.findOne({'_id': req.body.recipient});
    const creditInstance = await new CreditHelper(user, recipient);

    if(await creditInstance.insufficientBalance(req.body.amount)) {
        if (!user.stripeUserId) {
            return res.status(200).send({
                error: {
                    message: 'INSUFFICIENT_BALANCE'
                }
            });
        } else {
            console.log('here 01')
            creditInstance.chargeSavedCard(55500).then(i => {
                return res.sendStatus(200).send(i);
            })
        }
    }
    if (category === 'TIP') {
        await creditInstance.tip(req.body.amount);
    }
    else if (category === 'WISH') {
        console.log('initiated 2? ', creditInstance.from._id + ' ' + creditInstance.to._id)
        await creditInstance.wish(req.body.amount, req.body.wishId);
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
    const incomeAndOutcome = await Credit.find({recipient: user._id})
        .populate("recipient")
        .populate("sender")
        .sort('-date');
    const total = incomeAndOutcome.map(i => i.amount).reduce((a,b) => a+b,0);

    return res.send({
        transactions: incomeAndOutcome,
        total
    });
})
module.exports = router;

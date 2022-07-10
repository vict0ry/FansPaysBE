const Credit = require("./schemas/CreditSchema");
const Subscription = require('./schemas/SubscriptionSchema');
class CreditHelper {
    from;
    to;
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    async subscribe() {
        const addedCredit = await Credit.create({
            description: 'New subscriber',
            amount: this.to.subscribtionPrice,
            recipient: this.to._id,
            category: 'SUBSCRIPTION',
            sender: this.from._id,
        })
        const creditRemoval = await Credit.create({
            description: 'Subscription payment',
            amount: this.to.subscribtionPrice * -1,
            category: 'SUBSCRIPTION',
            recipient: this.from._id,
            sender: this.to._id
        });
        await Subscription.create({
            price: this.to.subscribtionPrice,
            following: this.to._id,
            follower: this.from._id,
            renewal: 'ONEMONTH'
        });
        return true;
    }

    async tip(amount) {
        const addedCredit = await Credit.create({
            description: 'Tip from user',
            amount,
            recipient: this.to._id,
            category: 'TIP',
            sender: this.from._id,
        })
        const creditRemoval = await Credit.create({
            description: 'Tip from you',
            amount: amount * -1,
            category: 'TIP',
            recipient: this.from._id,
            sender: this.to._id
        });
    }
}
module.exports = {CreditHelper};
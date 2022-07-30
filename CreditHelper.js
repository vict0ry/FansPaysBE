const Credit = require("./schemas/CreditSchema");
const Subscription = require('./schemas/SubscriptionSchema');
const Wish = require("./schemas/WishSchema");
const stripe = require("stripe")('sk_test_51LHjpdEZZiK54waal5CeD2qHjc9P5LV7sUqFgUsJ8Vi8EwSkNzGD1XQBEVPCxcKcgabBa8WxdUmWryAs6evDl0Ra00vjb96Cqe');
class CreditHelper {
    from;
    to;
    constructor(from, to) {
        if ((typeof from === 'string' || from instanceof String) || (typeof to === 'string' || to instanceof String)) {
            throw('We need user object, not the ID');
        }
        this.from = from;
        this.to = to;
    }

    async insufficientBalance(amount) {
        const userBalance = await this.userBalance(this.from._id);
        return userBalance < amount;
    }

    async userBalance(userId) {
        const incomeCredits = await Credit.find({recipient: userId});
        const outcomeCredits = await Credit.find({sender: userId});
        return incomeCredits.map(i => i.amount).reduce((a,b) => a+b, 0) - outcomeCredits.map(i => i.amount).reduce((a,b) => a+b, 0);
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
        return true;
    }
    async wish(amount, wishId) {
        const addedCredit = await Credit.create({
            description: 'Wish tip from user',
            amount,
            recipient: this.to._id,
            category: 'WISH',
            sender: this.from._id,
            wish: wishId
        })
        console.log('addedCredit: ', addedCredit);
        console.log('sender: ', this.from._id);
        console.log('recipient: ', this.to._id);


        await Wish.findByIdAndUpdate(wishId, {["$addToSet"]: {collected: addedCredit._id}});
        const creditRemoval = await Credit.create({
            description: 'Wish tip from you',
            amount: amount * -1,
            category: 'WISH',
            recipient: this.from._id,
            sender: this.to._id,
            wish: wishId
        });
        console.log('creditRemoval: ', creditRemoval);
        return true;
    }
    async chargeSavedCard(amount) {
        const paymentMethods = await stripe.paymentMethods.list({
            customer: this.from.stripeUserId,
            type: 'card',
        });
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: "czk",
            payment_method: paymentMethods.data[0].id,
            customer: this.from.stripeUserId,
            off_session: true,
            confirm: true
        });
        return paymentIntent
    }
}
module.exports = {CreditHelper};
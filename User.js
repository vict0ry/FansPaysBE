const Credit = require("../../schemas/CreditSchema");
const User = require("./schemas/UserMetadataSchema");

class UserClass {
    user;
    async constructor(authToken) {
        this.user = await User.findById(authToken);
    }
    getUser() {
        return this.user;
    }
    async getUserBalance() {
        const subscriberCredits = await Credit.find({$or: [{recipient: _id}, {sender: _id}]});
        const subscriberCreditsTotal = subscriberCredits.map(i => i.amount).reduce((a,b) => { return a+b}, 0);
        const sufficientBalance = (Number(subscriberCreditsTotal) > Number(this.user.subscribtionPrice));
        return
    }
    async getSpending() {
        const subscriberCredits = await Credit.find({sender: _id});
    }
}
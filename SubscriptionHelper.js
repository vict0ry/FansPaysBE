const moment = require("moment");
const {now} = require("moment");
const Subscription = require("./schemas/SubscriptionSchema");

class SubscriptionHelper {
    follower;
    following;
    now = moment();
    subscription;
    isActive;
    daysLeft;
    async create() {
        this.subscription = await Subscription.findOne({ $and: [{following: this.following}, {follower: this.follower}  ]});
        if (this.subscription) {
            await this.checkIfIsActive();
        } else {
            this.isActive = false;
        }
        return this;
    }
    constructor(follower, following) {
        this.follower = follower;
        this.following = following;

    }
    async activeByPackage(days) {
        this.daysLeft = this.checkHowMuchDaysLeft(days);
        return this.daysLeft >= 0;
    }
    checkHowMuchDaysLeft(days) {
        const purchase_date = moment(this.subscription.createdAt, "YYYY-MM-DD").add(days, 'days');
        return this.now.diff(purchase_date, 'days') * -1;
    }
    async checkIfIsActive() {
        if (this.subscription) {
            console.log('current sub renewal: ', this.subscription.renewal);
            switch(this.subscription.renewal) {
                case 'ONEMONTH':
                    return this.isActive = await this.activeByPackage(30)
                case 'THREEMONTH':
                    return this.isActive = await this.activeByPackage(90)
                case 'SIXMONTHS':
                    return this.isActive = await this.activeByPackage(180)
                case 'YEAR':
                    return this.isActive = await this.activeByPackage(365)
            }
        }
    }

}
module.exports = {SubscriptionHelper};
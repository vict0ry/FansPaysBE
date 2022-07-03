const moment = require("moment");
const {now} = require("moment");
const Subscription = require("./schemas/SubscriptionSchema");

class SubscriptionHelper {
    follower;
    following;
    now = moment();
    subscription;
    isActive;
    async create() {
        console.log('gothere...');
        console.log('this.following', this.following);
        console.log('this.follower', this.follower);
        this.subscription = await Subscription.findOne({ $and: [{following: this.following}, {follower: this.follower}  ]});
        console.log('this.subscription: ', this.subscription);
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
        const purchase_date = moment(this.subscription.createdAt, "YYYY-MM-DD");
        const difference = this.now.diff(purchase_date, 'days');
        console.log('difference: ', difference);
        console.log('days : ', days);
        return difference <= days;
    }
    async daysLeft() {
        const purchase_date = moment(this.subscription.createdAt, "YYYY-MM-DD");
        return this.now.diff(purchase_date, 'days');
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
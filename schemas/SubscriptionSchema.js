const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionSchema = new Schema({
    price: {type: Number, required: true},
    following: {type: Schema.Types.ObjectId, ref: 'User'},
    follower: {type: Schema.Types.ObjectId, ref: 'User'},
    cancelled: {type: Boolean, default: false},
    renewal: {type: String, trim: true, enum: ['ONEMONTH', 'THREEMONTH', 'SIXMONTH', 'ONEYEAR'],
    }
}, {timestamps: true});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
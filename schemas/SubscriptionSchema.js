const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SubscriptionSchema = new Schema({
    price: {type: Number, required: true},
    subscribedTo: {type: Schema.Types.ObjectId, ref: 'User'},
}, {timestamps: true});

const Shop = mongoose.model('Subscription', SubscriptionSchema);
module.exports = Shop;

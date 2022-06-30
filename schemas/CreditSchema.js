const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CreditSchema = new Schema({
    description: {type: String, trim: true},
    amount: {type: Number, required: true},
    category: {type: String, 'trim': true,
        enum: ['POST', 'MESSENGER', 'SHOP', 'SUBSCRIPTION'],
        required: true},
    recipient: {type: Schema.Types.ObjectId, ref: 'User'},
    sender: {type: Schema.Types.ObjectId, ref: 'User'},
}, {timestamps: true});

const Shop = mongoose.model('Credit', CreditSchema);
module.exports = Shop;

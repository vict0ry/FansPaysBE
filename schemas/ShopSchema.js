const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ShopSchema = new Schema({
    name: {type: String, trim: true, required: true},
    description: {type: String, trim: true, required: true},
    price: {type: Number, required: true},
    postedBy: {type: Schema.Types.ObjectId, ref: 'User'},
    pictures: [{type: String}],
    status: {type: String, enum: ['request', 'accepted', 'declined', 'done'], default: 'request'},
}, {timestamps: true});

const Shop = mongoose.model('Shop', ShopSchema);
module.exports = Shop;

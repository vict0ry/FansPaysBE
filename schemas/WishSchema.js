const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const WishSchema = new Schema({
    name: {type: String, trim: true},
    amount: {type: Number, required: true},
    owner: {type: Schema.Types.ObjectId, ref: 'User'},
    collected: [{type: Schema.Types.ObjectId, ref: 'Credit'}],

}, {timestamps: true});

const Wish = mongoose.model('Wish', WishSchema);
module.exports = Wish;

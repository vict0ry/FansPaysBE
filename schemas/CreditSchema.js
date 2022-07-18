const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CreditSchema = new Schema({
    description: {type: String, trim: true},
    amount: {type: Number, required: true},
    category: {type: String, 'trim': true,
        enum: [
            'POST',
            'WISH',
            'MESSENGER',
            'SHOP',
            'SUBSCRIPTION',
            'ADMIN_ACTION',
            'ROBOT',
            'WITHDRAWAL',
            'FILL',
            'TIP'],
        required: true},
    recipient: {type: Schema.Types.ObjectId, ref: 'User'},
    sender: {type: Schema.Types.ObjectId, ref: 'User'},
    wish: {type: Schema.Types.ObjectId, ref: 'Wish'}
}, {timestamps: true});
module.exports = mongoose.model('Credit', CreditSchema);
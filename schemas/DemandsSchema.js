const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const DemandsSchema = new Schema({
    description: {type: String, trim: true, required: true},
    price: {type: Number, required: true},
    postedBy: {type: Schema.Types.ObjectId, ref: 'User'},
    recipient: {type: Schema.Types.ObjectId, ref: 'User'},
    status: {type: String, enum: ['request', 'accepted', 'declined', 'done'], default: 'request'},
}, {timestamps: true});

const Demands = mongoose.model('Demands', DemandsSchema);
module.exports = Demands;

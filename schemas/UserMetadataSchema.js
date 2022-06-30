const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserMetadata = new Schema({
    subscriptionPrice: {type: Number, required: false, trim: true},
    followers: [{type: Schema.Types.ObjectId, ref: 'User'}]
}, {timestamps: true});

const User = mongoose.model('User', UserSchema);
module.exports = User;

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: {type: String, required: true, trim: true},
    lastName: {type: String, required: true, trim: true},
    description: {type: String, required: false, trim: true},
    ageYear: {type: Number, required: false, trim: true},
    birthDate: {type: String, required: false, trim: true},
    username: {type: String, required: true, trim: true, unique: true},
    email: {type: String, required: true, trim: true, unique: true},
    password: {type: String, required: true},
    profilePic: {type: String, default: "/noavatar.png"},
    coverPhoto: {type: String},
    likes: [{type: Schema.Types.ObjectId, ref: 'Post'}],
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
    credit: [{type: Schema.Types.ObjectId, ref: 'Credit'}],
    retweets: [{type: Schema.Types.ObjectId, ref: 'Post'}],
    following: [{type: Schema.Types.ObjectId, ref: 'User'}],
    followers: [{type: Schema.Types.ObjectId, ref: 'User'}],
    role: {type: String, required: true},
}, {timestamps: true});

const User = mongoose.model('User', UserSchema);
module.exports = User;

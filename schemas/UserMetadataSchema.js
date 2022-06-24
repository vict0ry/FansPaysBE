const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    weight: {type: String, required: true, trim: true},
    height: {type: String, required: true, trim: true},
    eyeColor: {type: String, required: false, trim: true},
    age: {type: Number, required: false, trim: true},
    username: {type: String, required: true, trim: true, unique: true},
    email: {type: String, required: true, trim: true, unique: true},
    password: {type: String, required: true},
    profilePic: {type: String, default: "/images/profilePic.jpeg"},
    coverPhoto: {type: String},
    likes: [{type: Schema.Types.ObjectId, ref: 'Post'}],
    retweets: [{type: Schema.Types.ObjectId, ref: 'Post'}],
    following: [{type: Schema.Types.ObjectId, ref: 'User'}],
    followers: [{type: Schema.Types.ObjectId, ref: 'User'}]
}, {timestamps: true});

const User = mongoose.model('User', UserSchema);
module.exports = User;

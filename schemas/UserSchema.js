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
    password: {type: String, required: true, select: false},
    profilePic: {type: String, default: "/noavatar.png"},
    coverPhoto: {type: String},
    subscribtionPrice: {type: Number, default: 0, trim: true},
    likes: [{type: Schema.Types.ObjectId, ref: 'Post'}],
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
    credit: [{type: Schema.Types.ObjectId, ref: 'Credit'}],
    retweets: [{type: Schema.Types.ObjectId, ref: 'Post'}],
    following: [{type: Schema.Types.ObjectId, ref: 'User'}],
    followers: [{type: Schema.Types.ObjectId, ref: 'User'}],
    isBlocked: {type: Boolean, default: false},
    role: {type: String, default: "user", enum: ['user', 'admin', 'moderator']},
}, {timestamps: true});

const User = mongoose.model('User', UserSchema);
module.exports = User;

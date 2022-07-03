const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    content: {type: String, trim: true},
    postedBy: {type: Schema.Types.ObjectId, ref: 'User'},
    pinned: Boolean,
    pictures: [{type: String}],
    likes: [{type: Schema.Types.ObjectId, ref: 'User'}],
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
    retweetData: {type: Schema.Types.ObjectId, ref: 'Post'},
    replyTo: {type: Schema.Types.ObjectId, ref: 'Post'},
    price: {type: Number, trim: true, default: 0},
}, {timestamps: true});

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;

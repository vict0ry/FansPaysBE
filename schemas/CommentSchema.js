const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    sender: {type: Schema.Types.ObjectId, ref: 'User'},
    comment: {type: String, trim: true},
    post: {type: Schema.Types.ObjectId, ref: 'Post'},
    likes: [{type: Schema.Types.ObjectId, ref: 'User'}],
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
}, {timestamps: true});

module.exports = mongoose.model('Comment', commentSchema);

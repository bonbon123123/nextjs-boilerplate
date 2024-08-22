import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    text: String,
    upvotes: Number,
    downvotes: Number,
    createdAt: Date,
    updatedAt: Date,
}, { timestamps: true });

const Comment = mongoose.models.Post || mongoose.model("Post", CommentSchema);

export default Comment;

import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    url: String,
    tags: Array,
    upvotes: Number,
    downvotes: Number,
    createdAt: Date,
    updatedAt: Date,
    Locked: Boolean,
    Name: String,
    Size: Number,
    Type: String,
}, { timestamps: true });

const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);

export default Post;

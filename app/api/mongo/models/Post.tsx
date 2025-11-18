import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    userId: String,
    url: String,
    tags: Array,
    upvotes: Number,
    downvotes: Number,
    createdAt: Date,
    updatedAt: Date,
    width: Number,
    height: Number,
    locked: Boolean,
    name: String,
    size: Number,
    type: String,
  },
  { timestamps: true },
);

const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);

export default Post;

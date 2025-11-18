import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  voteValue: { type: Number, required: true },
});

const UserSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: String,
    role: String,
    createdAt: Date,
    updatedAt: Date,
    lastLogin: Date,
    sessionId: String,
    isActive: Boolean,
    isVerified: Boolean,
    votes: [VoteSchema],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;

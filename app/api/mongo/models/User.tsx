import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    role: String,
    createdAt: Date,
    updatedAt: Date,
    lastLogin: Date,
    isActive: Boolean,
    isVerified: Boolean,
    votes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vote',
            postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
            voteType: { type: String, enum: ['upvote', 'downvote'] },
            createdAt: Date,
        },
    ],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
import { NextResponse } from "next/server";
import User from "../models/User";
import Post from "../models/Post";
import dbConnect from "../db";
import mongoose from "mongoose";

export async function POST(req: Request) {
  const { userId, type } = await req.json();
  if (!userId || !type) {
    return new NextResponse(
      JSON.stringify({ error: "Brak wymaganych parametrów" }),
      { status: 400 }
    );
  }

  const user = await User.findById(userId);

  if (!user) {
    return new NextResponse(
      JSON.stringify({ error: "Użytkownik nie istnieje" }),
      { status: 404 }
    );
  }

  let posts;

  switch (type) {
    case "author":
      posts = await Post.find({ userId: user._id }).lean();
      break;
    case "liked":
      const likedPostIds = user.votes
        .filter(
          (vote: { postId: string; voteValue: number }) => vote.voteValue === 1
        )
        .map((vote: { postId: string }) => vote.postId);
      const objectIds = likedPostIds.map(
        (id: string) => new mongoose.Types.ObjectId(id)
      );
      posts = await Post.find({ _id: { $in: objectIds } }).lean();
      break;
    case "saved":
      posts = await Post.find({ _id: { $in: user.savedPosts } }).lean();
      break;
    default:
      return new NextResponse(JSON.stringify({ error: "Nieprawidłowy typ" }), {
        status: 400,
      });
  }

  return new NextResponse(JSON.stringify(posts), { status: 200 });
}

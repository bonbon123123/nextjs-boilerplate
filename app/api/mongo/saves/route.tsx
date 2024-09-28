import { NextResponse } from "next/server";
import User from "../models/User";
import dbConnect from "../db";

export async function POST(req: Request) {
    const body = await req.json();
    const { userId, postId } = body;

    if (!userId || !postId) {
        return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 400 });
    }

    user.savedPosts.push(postId);
    await user.save();

    return NextResponse.json({ message: 'Post saved successfully' }, { status: 200 });
}

export async function PATCH(req: Request) {
    const body = await req.json();
    const { userId, postId } = body;

    if (!userId || !postId) {
        return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 400 });
    }

    user.savedPosts = user.savedPosts.filter((id: string) => id !== postId);
    await user.save();

    return NextResponse.json({ message: 'Post removed from saved posts' }, { status: 200 });
}

export async function GET(req: Request) {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
        return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 400 });
    }

    const savedPosts = await User.findById(userId).populate('savedPosts');
    return NextResponse.json({ savedPosts: savedPosts.savedPosts }, { status: 200 });
}
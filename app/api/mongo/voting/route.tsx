import { NextResponse } from "next/server";
import User from "../models/User";
import dbConnect from "./db";

interface Vote {
    targetType: string;
    targetId: string;
    imageId?: string;
    voteType: string;
    createdAt: Date;
}


export async function POST(req: NextResponse) {
    const body = await req.json();
    const { userId, voteType, targetType, targetId, imageId } = body;

    if (!userId || !voteType || !targetType || !targetId) {
        return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }


    await dbConnect();


    const user = await User.findById(userId);
    if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 400 });
    }

    const existingVote = user.votes.find((vote: Vote) => vote.targetId === targetId && vote.targetType === targetType);


    if (existingVote) {
        if (voteType === '0') {
            user.votes.pull(existingVote);
        } else {
            existingVote.voteType = voteType;
        }
    } else {
        const newVote = {
            targetType,
            targetId,
            imageId,
            voteType,
            createdAt: new Date(),
        };
        user.votes.push(newVote);
    }


    await user.save();

    return NextResponse.json({ message: 'Vote updated successfully' }, { status: 200 });
}
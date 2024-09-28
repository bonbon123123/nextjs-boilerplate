import { NextResponse } from "next/server";
import User from "../models/User";
import dbConnect from "../db";

interface Vote {
    postId: string;
    voteValue: string;
    createdAt: Date;
}


export async function POST(req: NextResponse) {
    const body = await req.json();
    const { userId, targetId, voteValue } = body;
    console.log(userId)
    console.log(targetId)
    console.log(voteValue)
    if (!userId || !targetId) {
        return NextResponse.json({ message: 'wrong User or target' }, { status: 400 });
    }


    await dbConnect();


    const user = await User.findById(userId);
    if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 400 });
    }

    const existingVote = user.votes.find((vote: Vote) => vote.postId === targetId);


    if (existingVote) {
        if (voteValue === 0) {
            user.votes.pull(existingVote);
        } else {
            existingVote.voteValue = voteValue;
        }
    } else {
        const newVote = {
            targetId,
            voteValue,
            createdAt: new Date(),
        };
        user.votes.push(newVote);
    }


    await user.save();

    return NextResponse.json({ message: 'Vote updated successfully' }, { status: 200 });
}
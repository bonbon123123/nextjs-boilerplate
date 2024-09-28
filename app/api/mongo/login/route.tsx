import { NextResponse } from "next/server";
import User from "../models/User";
import dbConnect from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
    await dbConnect();
    const body = await req.json();
    const { username, password, isAnonymous } = body;
    if (isAnonymous) {
        const sessionId = await generateSessionId();
        if (sessionId) {

            return NextResponse.json({ sessionId }, { status: 200 });
        } else {
            return NextResponse.json({ message: 'Coś poszło nie tak' }, { status: 401 });
        }
    } else {
        try {
            const user = await User.findOne({ username });
            if (!user) {
                return NextResponse.json({ message: 'User not found' }, { status: 404 });
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
            }
            user.lastLogin = new Date();
            await user.save();

            const sessionId = await generateSessionId();
            user.sessionId = sessionId;

            await user.save();

            const userData = {
                sessionId,
                userId: user._id,
                username: user.username,
                role: user.role,
                votes: user.votes,
                comments: user.comments,
            };
            return NextResponse.json(userData, { status: 200 });
        } catch (error) {
            console.error('Error logging in:', error);
            return NextResponse.json({ message: 'Error logging in', error }, { status: 500 });

        }
    }

}

async function generateSessionId() {
    const sessionId = await uuidv4();
    return sessionId;
}
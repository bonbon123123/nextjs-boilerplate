import { NextResponse } from "next/server";
import User from "../models/User";
import dbConnect from "./db";
import mongoose from "mongoose";
import bcrypt from "bcrypt";


export async function GET(req: Request) {
    await dbConnect();

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (userId) {
        const user = await User.findById(userId).lean();
        return new NextResponse(JSON.stringify(user), { status: 200 });
    } else {
        const users = await User.find().lean();
        return new NextResponse(JSON.stringify(users), { status: 200 });
    }
}

export async function POST(req: Request) {
    await dbConnect();

    try {
        const data = await req.json();
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const newUser = new User({ ...data, password: hashedPassword });
        await newUser.save();

        return new NextResponse(JSON.stringify(newUser), { status: 201 });
    } catch (error) {
        console.error('Error adding user:', error);
        return new NextResponse(JSON.stringify({ message: 'Error adding user', error }), { status: 500 });
    }
}

export async function PATCH(req: Request) {
    await dbConnect();

    try {
        const data = await req.json();
        const userId = data._id;

        if (!userId) {
            return new NextResponse(JSON.stringify({ message: 'Invalid request' }), { status: 400 });
        }

        const user = await User.findById(userId);

        if (!user) {
            return new NextResponse(JSON.stringify({ message: 'User not found' }), { status: 404 });
        }

        if (data.username !== undefined) {
            user.username = data.username;
        }

        if (data.email !== undefined) {
            user.email = data.email;
        }

        if (data.password !== undefined) {
            user.password = await bcrypt.hash(data.password, 10);
        }

        if (data.role !== undefined) {
            user.role = data.role;
        }

        if (data.isActive !== undefined) {
            user.isActive = data.isActive;
        }

        if (data.isVerified !== undefined) {
            user.isVerified = data.isVerified;
        }

        await user.save();

        return new NextResponse(JSON.stringify(user), { status: 200 });
    } catch (error) {
        console.error('Error updating user:', error);
        return new NextResponse(JSON.stringify({ message: 'Error updating user', error }), { status: 500 });
    }
}

export async function DELETE(req: Request) {
    await dbConnect();

    try {
        const url = new URL(req.url);
        const userId = url.searchParams.get("userId");

        if (!userId) {
            return new NextResponse(JSON.stringify({ message: 'Invalid request' }), { status: 400 });
        }

        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return new NextResponse(JSON.stringify({ message: 'User not found' }), { status: 404 });
        }

        return new NextResponse(JSON.stringify({ message: 'User deleted successfully' }), { status: 200 });
    } catch (error) {
        console.error('Error deleting user:', error);
        return new NextResponse(JSON.stringify({ message: 'Error deleting user', error }), { status: 500 });
    }
}


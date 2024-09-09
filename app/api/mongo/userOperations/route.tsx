import { NextApiRequest, NextApiResponse } from 'next';
import User from "../models/User";
import dbConnect from "./db";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { NextResponse } from 'next/server';

export async function GET(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect();

    try {
        const users = await User.find().lean();
        return res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ message: 'Error fetching users', error });
    }
}

// {
//     "username": "johnDoe",
//         "password": "mysecretpassword",
//             "email": "johndoe@example.com"
// }
export async function POST(req: Request) {
    await dbConnect();

    try {
        const { username, password, email } = await req.json();

        if (!password) {
            return NextResponse.json({ message: 'Password is required' }, { status: 400 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        const newUser = new User(
            {
                username: username,
                password: hashedPassword,
                email: email,
                role: "user",
                isActive: false,
                isVerified: false
            });
        await newUser.save();
        return new NextResponse(JSON.stringify(newUser), { status: 201 });

    } catch (error) {
        console.error('Error creating user:', error);
        return new NextResponse(JSON.stringify({ message: 'Error creating user', error }), { status: 500 });
    }
}

export async function PATCH(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect();

    try {
        const { _id, username, email, currentPassword, newPassword, role } = req.body;
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid current password' });
        }

        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // Update other fields
        if (username) user.username = username;
        if (email) user.email = email;
        if (role) user.role = role;

        await user.save();
        return res.status(200).json(user);
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ message: 'Error updating user', error });
    }
}

export async function DELETE(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect();
    try {
        const { _id } = req.body;
        const user = await User.findByIdAndDelete(_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ message: 'Error deleting user', error });
    }


}


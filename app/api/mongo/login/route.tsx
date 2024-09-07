// import { NextResponse } from "next/server";
// import User from "../models/User";
// import dbConnect from "./db";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";

// export async function POST(req: Request) {
//     await dbConnect();

//     try {
//         const data = await req.json();
//         const user = await User.findOne({ email: data.email });

//         if (!user) {
//             return new NextResponse(JSON.stringify({ message: 'Invalid email or password' }), { status: 401 });
//         }

//         const isValidPassword = await bcrypt.compare(data.password, user.password);

//         if (!isValidPassword) {
//             return new NextResponse(JSON.stringify({ message: 'Invalid email or password' }), { status: 401 });
//         }

//         const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
//             expiresIn: '1h',
//         });

//         return new NextResponse(JSON.stringify({ token }), { status: 200 });
//     } catch (error) {
//         console.error('Error logging in:', error);
//         return new NextResponse(JSON.stringify({ message: 'Error logging in', error }), { status: 500 });
//     }
// }
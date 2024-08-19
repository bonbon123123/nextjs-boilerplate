import { NextResponse } from "next/server";
import Post from "./models/Post";
import dbConnect from "./db";

export async function GET() {
    await dbConnect();
    console.log("hit db connect", new Date().getSeconds());

    const posts = await Post.find().lean();  // Fetch and return posts as plain objects

    return new NextResponse(JSON.stringify(posts), { status: 200 });
}


export async function POST(req: Request) {
    await dbConnect();

    try {
        const data = await req.json(); 
        const newPost = new Post(data); 

        await newPost.save(); 

        return new NextResponse(JSON.stringify(newPost), { status: 201 });
    } catch (error) {
        console.error('Error adding post:', error); // Logowanie błędu do konsoli
        return new NextResponse(JSON.stringify({ message: 'Error adding post', error }), { status: 500 });
    }
}
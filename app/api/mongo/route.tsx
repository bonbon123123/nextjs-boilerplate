import { NextResponse } from "next/server";
import Post from "./models/Post";
import dbConnect from "./db";

export async function GET(req: Request) {
    await dbConnect();
    console.log("hit db connect", new Date().getSeconds());

    const url = new URL(req.url);
    const tags = url.searchParams.get("tags");


    if (tags) {
        console.log(tags)
        const posts = await Post.find({ tags: { $in: tags.split(",") } }).lean();
        return new NextResponse(JSON.stringify(posts), { status: 200 });
    } else {

        const posts = await Post.find().sort({ createdAt: -1 }).limit(100).lean();
        return new NextResponse(JSON.stringify(posts), { status: 200 });
    }
}


export async function POST(req: Request) {
    await dbConnect();

    try {
        const data = await req.json();
        const newPost = new Post(data);

        await newPost.save();

        return new NextResponse(JSON.stringify(newPost), { status: 201 });
    } catch (error) {
        console.error('Error adding post:', error);
        return new NextResponse(JSON.stringify({ message: 'Error adding post', error }), { status: 500 });
    }
}
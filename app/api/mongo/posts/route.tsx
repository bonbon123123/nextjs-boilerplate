import { NextResponse } from "next/server";
import Post from "../models/Post";
import User from "../models/User";
import dbConnect from "../db";

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

// {
//     "url": "https://utfs.io/f/651cbda2-dcd0-433e-bc71-ee088bfbaf28-hr7l8j.png",
//     "tags": [],
//     "upvotes": 0,
//     "downvotes": 0,
//     "createdAt": "2024-08-25T14:51:00.609Z",
//     "updatedAt": "2024-08-25T14:51:00.609Z",
//     "Locked": false,
//     "Name": "8d3bb84.png",
//     "Size": 241650,
//     "Type": "image/png"
//     "width": 100,
//     "height": 100
// }

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

export async function PATCH(req: Request) {
    await dbConnect();
    console.log("patch1")
    try {
        const data = await req.json();
        const postId = data._id;

        if (!postId) {
            return new NextResponse(JSON.stringify({ message: 'Invalid request' }), { status: 400 });
        }

        const post = await Post.findById(postId);


        if (!post) {
            return new NextResponse(JSON.stringify({ message: 'Post not found' }), { status: 404 });
        } else {
            // console.log("patch")
            // console.log(post)
        }
        if (data.vote !== undefined) {
            switch (data.vote) {
                case -2:
                    post.downvotes += 1;
                    post.upvotes -= 1;
                    break;
                case -1:
                    post.downvotes += 1;
                    break;
                case 1:
                    post.upvotes += 1;
                    break;
                case 2:
                    post.upvotes += 1;
                    post.downvotes -= 1;
                    break;
                default:
                    console.log(`Invalid vote value: ${data.vote}`);
                    break;
            }
        }

        if (data.tags !== undefined) {
            post.tags = data.tags;
        }

        await post.save();

        return new NextResponse(JSON.stringify(post), { status: 200 });
    } catch (error) {
        console.error('Error updating post:', error);
        return new NextResponse(JSON.stringify({ message: 'Error updating post', error }), { status: 500 });
    }
}

export async function DELETE(req: Request) {
    await dbConnect();
    try {
        const { postId, userId, imageUrl } = await req.json(); // Odbierz postId i userId z żądania

        if (!postId || !userId || !imageUrl) {
            return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: 'User  not found' }, { status: 404 });
        }

        // Sprawdź, czy użytkownik jest administratorem lub właścicielem postu
        if (user.role !== 'admin' && post.userId.toString() !== userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        try {
            const url = new URL('/api/uploadthing/fileUpload', req.url);
            const responseUploadthing = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                    {
                        imageURLs: [imageUrl]
                    }
                ),
            });
            const data = await responseUploadthing.json();
            console.log(data);
            // Usuń post
            await Post.findByIdAndDelete(postId);

            return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 });
        } catch (error) {
            console.error(error);
            return NextResponse.json({ error: "Error uploading files" });
        }

    } catch (error) {
        console.error('Error deleting post:', error);
        return NextResponse.json({ message: 'Error deleting post', error }, { status: 500 });
    }
}
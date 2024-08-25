import { NextResponse } from "next/server";
import Comment from "../models/Comment";
import dbConnect from "./db";
import mongoose from "mongoose";



interface Comment {
    _id: string;
    postId: string;
    userId: string;
    parentId: mongoose.Types.ObjectId | null;
    text: string;
    upvotes: number;
    downvotes: number;
    createdAt: Date;
    updatedAt: Date;
}



export async function GET(req: Request) {


    await dbConnect();

    const url = new URL(req.url);
    const postId = url.searchParams.get("postId");
    const parentId = url.searchParams.get("parentId");

    if (postId) {
        const comments: Comment[] = await Comment.find({ postId }).sort({ createdAt: -1 });
        console.log(comments)
        const commentsWithParentId = comments.filter(comment => comment.parentId !== null);
        const commentsWithoutParentId = comments.filter(comment => comment.parentId === null);

        const sortedComments: Comment[][] = [];


        commentsWithoutParentId.forEach(comment => {
            sortedComments.push([comment])
        });
        // commentsWithParentId.forEach(commentWith => {
        //     for (let i = 0; i < sortedComments.length; i++) {

        //         if (commentWith.parentId?.equals(sortedComments[i][0]._id)) {
        //             sortedComments[i].push(commentWith)
        //             console.log("gottem")
        //         }
        //     }
        // });



        console.log(sortedComments);
        return new NextResponse(JSON.stringify(commentsWithoutParentId), { status: 200 });
    }
    else if (parentId) {
        const comments = await Comment.find({ parentId }).sort({ createdAt: -1 }).lean();
        return new NextResponse(JSON.stringify(comments), { status: 200 });
    } else {
        const comments = await Comment.find().sort({ createdAt: -1 }).limit(100).lean();
        return new NextResponse(JSON.stringify(comments), { status: 200 });
    }
}


// {
//     "postId": "66c637f0b9e4d76888a6ff0e",
//         "userId": 1,
//             "parentId": null,
//                 "text": "String",
//                     "upvotes": 0,
//                         "downvotes": 0
// }

export async function POST(req: Request) {
    await dbConnect();
    console.log("postujesz komentarz")
    try {
        const data = await req.json();
        console.log('JSON payload:', data);
        data.userId = new mongoose.Types.ObjectId(data.userId);
        const newComment = new Comment(data);
        console.log(newComment)
        await newComment.save();

        return new NextResponse(JSON.stringify(newComment), { status: 201 });
    } catch (error) {
        console.error('Error adding comment:', error);
        return new NextResponse(JSON.stringify({ message: 'Error adding comment', error }), { status: 500 });
    }
}

export async function PATCH(req: Request) {
    await dbConnect();

    try {
        const data = await req.json();
        const commentId = data._id;

        if (!commentId) {
            return new NextResponse(JSON.stringify({ message: 'Invalid request' }), { status: 400 });
        }

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return new NextResponse(JSON.stringify({ message: 'Comment not found' }), { status: 404 });
        }

        if (data.vote !== undefined) {
            switch (data.vote) {
                case -2:
                    comment.downvotes += 1;
                    comment.upvotes -= 1;
                    break;
                case -1:
                    comment.downvotes += 1;
                    break;
                case 1:
                    comment.upvotes += 1;
                    break;
                case 2:
                    comment.upvotes += 1;
                    comment.downvotes -= 1;
                    break;
                default:
                    console.log(`Invalid vote value: ${data.vote}`);
                    break;
            }
        }

        if (data.text !== undefined) {
            comment.text = data.text;
        }

        await comment.save();

        return new NextResponse(JSON.stringify(comment), { status: 200 });
    } catch (error) {
        console.error('Error updating comment:', error);
        return new NextResponse(JSON.stringify({ message: 'Error updating comment', error }), { status: 500 });
    }
}
import { NextResponse } from "next/server";
import Comment from "../models/Comment";
import dbConnect from "../db";
import mongoose from "mongoose";
import User from "../models/User";

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
  replies?: Comment[];
}

function organizeComments(comments: Comment[]): Comment[] {
  // Tworzymy mapę dla szybszego dostępu do komentarzy po ID
  const commentMap = new Map();
  comments.forEach((comment) => {
    commentMap.set(comment._id.toString(), { ...comment, replies: [] });
  });

  const rootComments: Comment[] = [];

  // Przypisujemy komentarze do ich rodziców
  comments.forEach((comment) => {
    const commentWithReplies = commentMap.get(comment._id.toString());
    if (!comment.parentId) {
      rootComments.push(commentWithReplies);
    } else {
      const parentComment = commentMap.get(comment.parentId.toString());
      if (parentComment) {
        parentComment.replies?.push(commentWithReplies);
      }
    }
  });

  // Sortujemy komentarze po dacie (najnowsze pierwsze)
  const sortByDate = (a: Comment, b: Comment) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

  // Rekursywnie sortujemy komentarze i ich odpowiedzi
  const sortCommentsRecursively = (commentsToSort: Comment[]) => {
    commentsToSort.sort(sortByDate);
    commentsToSort.forEach((comment) => {
      if (comment.replies && comment.replies.length > 0) {
        sortCommentsRecursively(comment.replies);
      }
    });
    return commentsToSort;
  };

  return sortCommentsRecursively(rootComments);
}

export async function GET(req: Request) {
  await dbConnect();

  const url = new URL(req.url);
  const postId = url.searchParams.get("postId");
  const parentId = url.searchParams.get("parentId");

  try {
    if (postId) {
      // Pobieramy wszystkie komentarze dla danego posta i dołączamy dane użytkownika
      const comments = (await Comment.find({ postId })
        .populate("userId", "username") // Dołączamy tylko pole `username` z modelu User
        .lean()) as Comment[];

      const organizedComments = organizeComments(comments);
      return new NextResponse(JSON.stringify(organizedComments), {
        status: 200,
      });
    } else if (parentId) {
      // Pobieramy tylko odpowiedzi na konkretny komentarz
      const replies = await Comment.find({ parentId })
        .sort({ createdAt: -1 })
        .populate("userId", "username")
        .lean();

      return new NextResponse(JSON.stringify(replies), { status: 200 });
    } else {
      // Pobieramy ostatnie 100 komentarzy bez filtra
      const comments = await Comment.find()
        .sort({ createdAt: -1 })
        .limit(100)
        .populate("userId", "username")
        .lean();

      return new NextResponse(JSON.stringify(comments), { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
    return new NextResponse(
      JSON.stringify({ message: "Error fetching comments", error }),
      { status: 500 }
    );
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

  try {
    const data = await req.json();
    if (data.parentId === "null") {
      data.parentId = null;
    }

    // Sprawdzamy czy to odpowiedź na inny komentarz
    if (data.parentId !== null) {
      // Sprawdzamy czy komentarz-rodzic istnieje
      const parentComment = await Comment.findById(data.parentId);
      if (!parentComment) {
        return new NextResponse(
          JSON.stringify({ message: "Parent comment not found" }),
          { status: 404 }
        );
      }

      // Sprawdzamy czy parent należy do tego samego posta
      if (parentComment.postId.toString() !== data.postId.toString()) {
        return new NextResponse(
          JSON.stringify({
            message: "Parent comment belongs to different post",
          }),
          { status: 400 }
        );
      }
    }

    const newComment = new Comment(data);
    await newComment.save();

    if (newComment.userId) {
      await newComment.populate("userId", "username");
    }

    return new NextResponse(JSON.stringify(newComment), { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return new NextResponse(
      JSON.stringify({ message: "Error adding comment", error }),
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  await dbConnect();

  try {
    const data = await req.json();
    const commentId = data._id;

    if (!commentId) {
      return new NextResponse(JSON.stringify({ message: "Invalid request" }), {
        status: 400,
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return new NextResponse(
        JSON.stringify({ message: "Comment not found" }),
        { status: 404 }
      );
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
    console.error("Error updating comment:", error);
    return new NextResponse(
      JSON.stringify({ message: "Error updating comment", error }),
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  await dbConnect();

  try {
    const { commentId, userId } = await req.json(); // Pobieramy dane z żądania

    if (!commentId || !userId) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    // Znajdź komentarz po ID
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 }
      );
    }

    // Znajdź użytkownika po ID
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Sprawdź, czy użytkownik jest właścicielem komentarza lub administratorem
    if (user.role !== "admin" && comment.userId.toString() !== userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Funkcja rekurencyjna do usuwania komentarzy i ich podkomentarzy
    const deleteCommentAndReplies = async (commentId: string) => {
      // Znajdź wszystkie podkomentarze
      const childComments = await Comment.find({ parentId: commentId });

      // Usuń każdy podkomentarz rekurencyjnie
      for (const childComment of childComments) {
        await deleteCommentAndReplies(childComment._id.toString());
      }

      // Usuń aktualny komentarz
      await Comment.findByIdAndDelete(commentId);
    };

    // Usuń komentarz główny i wszystkie jego podkomentarze
    await deleteCommentAndReplies(commentId);

    return NextResponse.json(
      { message: "Comment and its replies deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting comment and its replies:", error);
    return NextResponse.json(
      { message: "Error deleting comment and its replies", error },
      { status: 500 }
    );
  }
}

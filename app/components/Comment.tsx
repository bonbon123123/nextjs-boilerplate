import React, { useState, useEffect, useContext } from "react";
import { SessionContext } from "../invisibleComponents/SessionProvider";
import CommentForm from "./CommentForm";
import Button from "./Button";
interface CommentSchema {
  _id: string;
  postId: string;
  userId: {
    _id: string;
    username: string;
  } | null;
  parentId: string | null;
  text: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  updatedAt: Date;
  replies?: CommentSchema[];
}

interface CommentProps {
  comment: CommentSchema;
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
  const [replies, setReplies] = useState<CommentSchema[]>();
  const [isReplying, setIsReplying] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const sessionContext = useContext(SessionContext);

  if (!sessionContext) {
    throw new Error("SessionContext is not provided");
  }
  useEffect(() => {
    setReplies(comment.replies);
  }, [comment]);

  const handleReplySubmit = () => {
    setIsReplying(false);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch("/api/mongo/comments", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId: comment._id,
          userId: sessionContext.userId,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log(data.message);
        setIsDeleted(true);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };
  console.log(comment);
  return (
    <div className="comment-container">
      {isDeleted ? (
        <div className="flex justify-center items-center h-full">
          <span className="text-lg">Comment was Deleted</span>
        </div>
      ) : (
        <div>
          <div className="comment-header">
            <span className="comment-username">
              {comment.userId ? comment.userId.username : "Anonymous"}
            </span>
            <span className="comment-timestamp">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="comment-text">{comment.text}</div>
          <div className="comment-actions">
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="text-sm text-primary hover:text-primary-focus cursor-pointer"
            >
              Reply
            </button>
            {(comment.userId != null &&
              comment.userId._id === sessionContext.userId) ||
            sessionContext.userRole === "admin" ? (
              <Button onClick={handleDelete}>Delete</Button>
            ) : null}
          </div>
          {isReplying && (
            <CommentForm
              parentId={comment._id}
              postId={comment.postId}
              onSubmit={handleReplySubmit}
              userId={sessionContext.userId}
              onCancel={() => setIsReplying(false)}
            />
          )}
          {replies && replies.length > 0 && (
            <div className="ml-4 mt-2 border-l-2 border-primary pl-2">
              {replies.map((reply, index) => (
                <Comment key={index} comment={reply} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Comment;

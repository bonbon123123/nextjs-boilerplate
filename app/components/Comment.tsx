import React, { useState, useEffect, useContext } from 'react';
import { SessionContext } from '../invisibleComponents/SessionProvider';
import CommentForm from './CommentForm';
import Button from './Button';
interface CommentSchema {
    _id: string;
    postId: string;
    userId: string;
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
        throw new Error('SessionContext is not provided');
    }
    useEffect(() => {
        setReplies(comment.replies)
    }, [comment]);

    const { userName } = sessionContext;

    const handleReplySubmit = () => {
        setIsReplying(false);

    };

    const handleDelete = async () => {
        try {
            const response = await fetch('/api/mongo/comments', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    commentId: comment._id,
                    userId: sessionContext.userId
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
            console.error('Error deleting post:', error);
        }
    };

    return (
        <div className="bg-light-secondary rounded-md p-2 mb-2 border-t-2 border-gray-600 pt-4 w-90">
            {isDeleted ? (
                <div className="flex justify-center items-center h-full">
                    <span className="text-lg">Comment was Deleted</span>
                </div>
            ) : (
                <div>
                    <div className="flex justify-between mb-1">
                        <span className="text-sm">{userName || 'Anonymous'}</span>
                        <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                        </span>
                    </div>
                    <div className="text-sm break-words overflow-hidden text-ellipsis mb-2">
                        {comment.text}
                    </div>
                    <div className="flex gap-2 mb-2">
                        <button
                            onClick={() => setIsReplying(!isReplying)}
                            className="text-xs text-blue-500 hover:text-blue-600"
                        >
                            Reply
                        </button>
                        {comment.userId === sessionContext.userId || sessionContext.userRole === 'admin' ? (
                            <Button onClick={handleDelete}>
                                Delete
                            </Button>
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
                        <div className="ml-4 border-l-2 border-gray-600 pl-2">
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
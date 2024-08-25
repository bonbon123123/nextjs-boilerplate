import React from 'react';
import { useState, useEffect } from 'react';

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
}

interface CommentProps {
    comment: CommentSchema;
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
    const [replies, setReplies] = useState<CommentSchema[]>();
    const [userName, setUserName] = useState<string>('');

    useEffect(() => {
        fetch(`/api/mongo/comments?parentId=${comment._id}`)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                setReplies(data as CommentSchema[])
            });
    }, [comment._id]);


    useEffect(() => {

        const fetchUserName = (userId: string) => {
            return `User ${Math.floor(Math.random() * 100)}`;
        };
        setUserName(fetchUserName(comment.userId));
    }, [comment.userId]);

    return (
        <div
            className="bg-light-secondary rounded-md p-2 mb-2 border-t-2 border-gray-600 pt-10 w-90"
        >
            <div className="flex justify-between mb-1">
                <span className="text-sm">{userName || 'Anonymous'}</span>
                <span className="text-xs text-gray-500">{comment.createdAt.toLocaleString()}</span>
            </div>
            <div className="text-sm break-words overflow-hidden text-ellipsis">
                {comment.text}
            </div>
            {replies != null && (
                <div className="ml-4">
                    {replies?.map((reply, index) => (
                        <Comment key={index} comment={reply} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Comment;
import { useState, useEffect } from 'react';
import Comment from './Comment';

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

interface Props {
    image: {
        url: string;
        tags: Array<string>;
        upvotes: number;
        downvotes: number;
        createdAt: Date;
        updatedAt: Date;
        width: number;
        height: number;
        locked: Boolean;
        name: string;
        size: number;
        type: string;
        _id: string;
    };
}

const CommentSection: React.FC<Props> = ({ image }) => {
    const [comments, setComments] = useState<CommentSchema[]>();

    useEffect(() => {
        fetch(`/api/mongo/comments?postId=${image._id}`)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                setComments(data as CommentSchema[])
            });
    }, [image._id]);

    return (
        <div className="w-full h-full bg-secondary">
            {comments?.map((comment, index) => (
                <Comment comment={comment} key={index} />
            ))}
        </div>
    );
};

export default CommentSection;
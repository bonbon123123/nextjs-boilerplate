import { useState } from 'react';

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
    onCommentPosted?: () => void; // Optional callback to refresh comments after posting
}

const CommentForm: React.FC<Props> = ({ image, onCommentPosted }) => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const postId = image._id;
        const parentId = null; // Adjust as needed
        const userId = null; // Replace with actual user ID if available

        try {
            const response = await fetch('/api/mongo/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId,
                    parentId,
                    userId,
                    text,
                    upvotes: 0,
                    downvotes: 0,
                }),
            });

            if (response.ok) {
                setText('');
                if (onCommentPosted) onCommentPosted();
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to post comment');
            }
        } catch (err) {
            setError('An error occurred while posting the comment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full p-4 bg-secondary border rounded-lg shadow-md">
            <div className="mb-4">
                <textarea
                    className="w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Write your comment..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                ></textarea>
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 text-white rounded-md ${loading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
                {loading ? 'Posting...' : 'Post Comment'}
            </button>
        </form>
    );
};

export default CommentForm;

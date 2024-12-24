import React, { useState } from 'react';
import Post from '../interfaces/Post';

interface ReplyFormProps {
    parentId: string;
    postId: string;
    onReplySubmit: () => void;
    onCancel: () => void;
}

const ReplyForm: React.FC<ReplyFormProps> = ({ parentId, postId, onReplySubmit, onCancel }) => {
    const [replyText, setReplyText] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/mongo/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId,
                    parentId,
                    text: replyText,
                    userId: "1", // Tymczasowo hardcoded, później pobierz z kontekstu sesji
                    upvotes: 0,
                    downvotes: 0
                }),
            });

            if (response.ok) {
                setReplyText('');
                onReplySubmit();
            }
        } catch (error) {
            console.error('Error posting reply:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-2 mb-4">
            <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full p-2 text-sm bg-light-secondary border border-gray-600 rounded"
                placeholder="Write your reply..."
                rows={3}
            />
            <div className="flex gap-2 mt-2">
                <button
                    type="submit"
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Submit
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};
export default ReplyForm;
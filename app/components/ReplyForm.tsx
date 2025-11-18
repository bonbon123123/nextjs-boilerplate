import React, { useState } from "react";
import Post from "../interfaces/Post";

interface ReplyFormProps {
  parentId: string;
  postId: string;
  onReplySubmit: () => void;
  onCancel: () => void;
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  parentId,
  postId,
  onReplySubmit,
  onCancel,
}) => {
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/mongo/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          parentId,
          text: replyText,
          userId: "1", // Tymczasowo hardcoded, później pobierz z kontekstu sesji
          upvotes: 0,
          downvotes: 0,
        }),
      });

      if (response.ok) {
        setReplyText("");
        onReplySubmit();
      }
    } catch (error) {
      console.error("Error posting reply:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 mb-4">
      <textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        className="textarea textarea-bordered w-full text-sm bg-base-100"
        placeholder="Write your reply..."
        rows={3}
      />
      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          className="btn btn-sm btn-primary"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-sm btn-neutral"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
export default ReplyForm;

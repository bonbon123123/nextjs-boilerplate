import { useState } from "react";

interface Props {
  parentId: String;
  postId: String;
  userId: String | null;
  onSubmit?: (comment: any) => void;
  onCancel?: () => void;
}

const CommentForm: React.FC<Props> = ({
  parentId,
  postId,
  userId,
  onSubmit,
  onCancel,
}) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/mongo/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: postId,
          parentId: parentId,
          text: text,
          userId: userId,
          upvotes: 0,
          downvotes: 0,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setText("");
        if (onSubmit) onSubmit(newComment);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to post comment");
      }
    } catch (err) {
      setError("An error occurred while posting the comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 mb-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
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
      {error && <p className="text-error text-sm mt-2">{error}</p>}
    </form>
  );
};

export default CommentForm;

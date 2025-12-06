import Comment from "./Comment";
import CommentSchema from "../interfaces/CommentSchema";

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
  comments: CommentSchema[];
  onCommentAdded: (comment: any) => void;
}

const CommentSection: React.FC<Props> = ({
  image,
  comments,
  onCommentAdded,
}) => {
  return (
    <div className="w-full h-full bg-base-200 p-2 overflow-y-auto">
      {comments?.map((comment, index) => (
        <Comment
          comment={comment}
          key={comment._id || index}
          onReplyAdded={onCommentAdded}
        />
      ))}
    </div>
  );
};

export default CommentSection;

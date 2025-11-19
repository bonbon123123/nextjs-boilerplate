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

export default CommentSchema;

interface Post {
    id: number;
    title: string;
    url: string;
    tags: Array<string>;
    upvotes: number;
    downvotes: number;
    createdAt: Date;
    updatedAt: Date;
    locked: Boolean;
    Name: string;
    Size: number;
    Type: string;
    _id: string;
    width: number;
    height: number;
    name: string;
    size: number;
    type: string;
}

export default Post;
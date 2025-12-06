import React, { useState, useEffect, useContext } from "react";
import Button from "./Button";
import CommentSection from "./CommentSection";
import CommentForm from "./CommentForm";
import { SessionContext } from "../invisibleComponents/SessionProvider";
import Image from "next/image";
import Post from "../interfaces/Post";
import { getTagColor } from "../interfaces/tags";

interface BigImageProps {
  image: Post;
  onClose: () => void;
  onTagClick?: (tag: string) => void;
}

const BigImage: React.FC<BigImageProps> = ({ image, onClose, onTagClick }) => {
  const [imageUrl, setImageUrl] = useState(image.url);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [similarImages, setSimilarImages] = useState<Post[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [comments, setComments] = useState<any[]>([]);

  const sessionContext = useContext(SessionContext);
  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTagClick) {
      onTagClick(tag);
    }
  };
  if (!sessionContext) {
    throw new Error("SessionContext is not provided");
  }

  const { addVote, getVote, addSave, getSave, votes, savedPosts } =
    sessionContext;

  // Zapisz pierwotny głos gdy komponent się montuje
  const [initialVote] = useState(() => getVote(image._id) || 0);
  const [vote, setVote] = useState(getVote(image._id) || 0);

  const handleCommentOn = () => {
    setShowCommentForm(!showCommentForm);
  };

  const handleReplySubmit = (newComment: any) => {
    setShowCommentForm(false);
    if (!newComment.parentId || newComment.parentId === "null") {
      // Główny komentarz (parentId jest null lub "null")
      setComments((prev) => [newComment, ...prev]);
    } else {
      // Odpowiedź na komentarz - dodaj rekurencyjnie
      setComments((prev) => addReplyToComment(prev, newComment));
    }
  };

  const addReplyToComment = (comments: any[], newReply: any): any[] => {
    return comments.map((comment) => {
      if (comment._id === newReply.parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply],
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: addReplyToComment(comment.replies, newReply),
        };
      }
      return comment;
    });
  };

  useEffect(() => {
    const currentSave = getSave(image._id);
    setIsSaved(!!currentSave);
  }, [image._id, savedPosts, getSave]);

  useEffect(() => {
    const currentVote = getVote(image._id) || 0;
    setVote(currentVote);
  }, [image._id, votes, getVote]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/mongo/comments?postId=${image._id}`);
        const data = await response.json();
        setComments(data || []);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
    fetchComments();
  }, [image._id]);

  // Fetch similar images based on tags
  useEffect(() => {
    const fetchSimilarImages = async () => {
      if (!image.tags || image.tags.length === 0) return;

      setLoadingSimilar(true);
      try {
        const params = new URLSearchParams();
        params.append("tags", image.tags.join(","));
        params.append("matchAll", "false"); // any tag matches
        params.append("limit", "3");
        params.append("excludeId", image._id); // exclude current image

        const response = await fetch(`/api/mongo/posts?${params.toString()}`);
        const data = await response.json();

        setSimilarImages(data.posts || []);
      } catch (error) {
        console.error("Error fetching similar images:", error);
      } finally {
        setLoadingSimilar(false);
      }
    };

    fetchSimilarImages();
  }, [image._id, image.tags]);

  const handleSave = async () => {
    if (sessionContext.userId) {
      addSave(image._id);
      setIsSaved(!isSaved);
    } else {
      console.log("You must be logged in to save posts");
    }
  };

  const handleUpvote = () => {
    const currentVote = getVote(image._id) || 0;
    const newVote = currentVote === 1 ? 0 : 1;
    setVote(newVote);
    addVote(image._id, newVote);
  };

  const handleDownvote = () => {
    const currentVote = getVote(image._id) || 0;
    const newVote = currentVote === -1 ? 0 : -1;
    setVote(newVote);
    addVote(image._id, newVote);
  };

  const handleImageError = () => {
    setImageUrl("/images/NoImage.png");
  };

  const handleImageLoad = () => {
    setImageUrl(image.url);
    setImageLoaded(true);
  };

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black bg-opacity-50 flex items-center justify-center px-6 md:px-12 lg:px-24 py-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[1400px] max-h-[90vh] bg-base-100 rounded-lg shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button  */}
        <div className="absolute top-3 right-3 z-20">
          <Button onClick={onClose}>×</Button>
        </div>

        <div className="flex-1 flex flex-col min-h-0 pt-6 md:pt-8 lg:pt-10 pb-6 md:pb-8 lg:pb-10">
          {/* Three-column layout */}
          <div className="flex-1 flex gap-4 min-h-0 px-6 md:px-8 lg:px-10">
            {/* LEFT SIDEBAR */}
            <div className="w-[280px] flex-shrink-0 bg-base-200 flex flex-col rounded-lg border-2 border-primary shadow-md overflow-hidden">
              <div className="p-4 border-b-2 border-primary bg-base-300 flex-shrink-0">
                <h3 className="font-bold text-lg text-center">Similar</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {loadingSimilar ? (
                  <div className="flex items-center justify-center h-full">
                    <span className="loading loading-spinner loading-md"></span>
                  </div>
                ) : similarImages.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {similarImages.map((similarImage) => (
                      <div
                        key={similarImage._id}
                        className="cursor-pointer hover:opacity-80 transition-opacity rounded-lg overflow-hidden border border-base-300"
                        onClick={() => {
                          onClose();
                          setTimeout(() => {}, 100);
                        }}
                      >
                        <Image
                          src={similarImage.url}
                          alt="Similar image"
                          width={similarImage.width}
                          height={similarImage.height}
                          className="w-full h-auto object-cover"
                          style={{ maxHeight: "150px" }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-base-content opacity-60 text-center p-4">
                    No similar images found
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
              {/* Image */}
              <div className="flex-1 flex items-center justify-center bg-base-300 p-4 md:p-6 lg:p-8 min-h-0 overflow-auto rounded-lg">
                <Image
                  alt={"Big image"}
                  width={image.width}
                  height={image.height}
                  src={imageUrl}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Tags bar */}
              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {image.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className={`badge ${getTagColor(
                        tag
                      )} gap-2 px-3 py-3 cursor-pointer hover:opacity-80`}
                      onClick={(e) => handleTagClick(tag, e)}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                {onTagClick && (
                  <p className="text-xs opacity-70 mt-2">
                    Click a tag to search for similar images
                  </p>
                )}
              </div>

              {/* Controls bar */}
              <div className="bg-base-100 px-4 py-2 flex flex-row justify-between items-center gap-2 border-b border-base-300 flex-wrap">
                <div className="flex gap-2">
                  <Button onClick={handleCommentOn} clicked={showCommentForm}>
                    Comment
                  </Button>
                  <Button
                    onClick={handleSave}
                    className={isSaved ? "btn-saved" : ""}
                  >
                    Save
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleUpvote}
                    className={vote === 1 ? "btn-upvoted" : ""}
                  >
                    ↑
                  </Button>
                  <span className="vote-display">
                    {image.upvotes - image.downvotes + vote - initialVote}
                  </span>
                  <Button
                    onClick={handleDownvote}
                    className={vote === -1 ? "btn-downvoted" : ""}
                  >
                    ↓
                  </Button>
                </div>
              </div>

              {/*comment form */}
              {showCommentForm && (
                <div className="bg-base-100 px-4 py-2 border-b border-base-300">
                  <CommentForm
                    parentId={"null"}
                    postId={image._id}
                    onSubmit={handleReplySubmit}
                    userId={sessionContext.userId}
                    onCancel={() => setShowCommentForm(false)}
                  />
                </div>
              )}
            </div>

            {/*  Comments section */}
            <div className="w-[320px] flex-shrink-0 bg-base-200 flex flex-col rounded-lg border-2 border-primary shadow-md overflow-hidden">
              <div className="p-4 border-b-2 border-primary bg-base-300 flex-shrink-0">
                <h3 className="font-bold text-lg text-center">Comments</h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                <CommentSection
                  image={image}
                  comments={comments}
                  onCommentAdded={handleReplySubmit}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BigImage;

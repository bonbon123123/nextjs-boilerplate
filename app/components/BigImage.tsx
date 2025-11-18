import React, { useState, useEffect, useContext } from "react";
import Button from "./Button";
import CommentSection from "./CommentSection";
import CommentForm from "./CommentForm";
import { SessionContext } from "../invisibleComponents/SessionProvider";
import Image from "next/image";
import Post from "../interfaces/Post";

interface Props {
  image: Post;
  onClose?: () => void;
}

const BigImage: React.FC<Props> = ({ image, onClose }) => {
  const [imageUrl, setImageUrl] = useState(image.url);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [vote, setVote] = useState(0);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [voteFromDb, setVoteFromDb] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const sessionContext = useContext(SessionContext);

  if (!sessionContext) {
    throw new Error("SessionContext is not provided");
  }

  const { addVote, getVote, addSave, getSave } = sessionContext;

  const handleCommentOn = () => {
    setShowCommentForm(!showCommentForm);
  };

  const handleReplySubmit = () => {
    setShowCommentForm(false);
  };

  useEffect(() => {
    const currentVote = getVote(image._id);
    if (typeof currentVote === "number") {
      setVoteFromDb(currentVote);
    }
    const currentSave = getSave(image._id);

    if (currentSave) {
      setIsSaved(true);
    }
  }, [image._id]);

  useEffect(() => {
    const currentSave = getSave(image._id);
    if (currentSave) {
      setIsSaved(true);
    } else {
      setIsSaved(false);
    }
  }, [image._id, sessionContext.savedPosts]);

  useEffect(() => {
    const currentVote = getVote(image._id);
    if (typeof currentVote === "number") {
      setVote(currentVote);
    }
  }, [image._id, sessionContext.votes]);

  const handleSave = async () => {
    if (sessionContext.userId) {
      addSave(image._id);
      setIsSaved(!isSaved);
    } else {
      console.log("You must be logged in to save posts");
    }
  };

  const handleUpvote = () => {
    const currentVote = getVote(image._id);
    if (currentVote === 1) {
      setVote(0);
      addVote(image._id, 0);
    } else {
      setVote(1);
      addVote(image._id, 1);
    }
  };

  const handleDownvote = () => {
    const currentVote = getVote(image._id);
    if (currentVote === -1) {
      setVote(0);
      addVote(image._id, 0);
    } else {
      setVote(-1);
      addVote(image._id, -1);
    }
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
        {/* Close button top-right */}
        <div className="absolute top-3 right-3 z-20">
          <Button onClick={onClose}>×</Button>
        </div>

        {/* Content wrapper: padding on top/bottom, flex for three columns */}
        <div className="flex-1 flex flex-col min-h-0 pt-6 md:pt-8 lg:pt-10 pb-6 md:pb-8 lg:pb-10">
          {/* Three-column layout */}
          <div className="flex-1 flex gap-4 min-h-0 px-6 md:px-8 lg:px-10">
            {/* LEFT SIDEBAR */}
            <div className="w-[280px] flex-shrink-0 bg-base-200 flex flex-col rounded-lg border-2 border-primary shadow-md overflow-y-auto">
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-3">Similar</h3>
                <div className="text-xs text-base-content opacity-60">
                  Similar images will appear here
                </div>
              </div>
            </div>

            {/* Main image  */}
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
              <div className="bg-base-200 px-4 py-2 border-b border-base-300 overflow-x-auto mt-4">
                <div className="flex gap-2 whitespace-nowrap">
                  {image.tags.map((tag, index) => (
                    <span key={index} className="tag inline-block">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Controls bar */}
              <div className="bg-base-100 px-4 py-2 flex flex-row justify-between items-center gap-2 border-b border-base-300 flex-wrap">
                <div className="flex gap-2">
                  <Button onClick={handleCommentOn} clicked={showCommentForm}>
                    Comment
                  </Button>
                  <Button onClick={handleSave} clicked={isSaved}>
                    Save
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={handleUpvote} clicked={vote == 1}>
                    ↑
                  </Button>
                  <span className="vote-display">
                    {image.upvotes - image.downvotes + vote - voteFromDb}
                  </span>
                  <Button onClick={handleDownvote} clicked={vote == -1}>
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
              <div className="p-4 border-b border-base-300 flex-shrink-0"></div>
              <div className="flex-1 overflow-y-auto">
                <CommentSection image={image} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BigImage;

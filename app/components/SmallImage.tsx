import React, { useState, useEffect, useContext } from "react";
import Button from "./Button";
import { SessionContext } from "../invisibleComponents/SessionProvider";
import Image from "next/image";
import Post from "../interfaces/Post";

interface Props {
  image: Post;
  onClick?: () => void;
}

const SmallImage: React.FC<Props> = ({ image, onClick }) => {
  const [imageUrl, setImageUrl] = useState(image.url);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [voteFromDb, setVoteFromDb] = useState(0);
  const sessionContext = useContext(SessionContext);

  if (!sessionContext) {
    throw new Error("SessionContext is not provided");
  }

  const { addVote, getVote, addSave, getSave, votes, savedPosts } =
    sessionContext;

  const initialVote = getVote(image._id) || 0;
  const initialIsSaved = getSave(image._id);

  const [vote, setVote] = useState(initialVote);
  const [isSaved, setIsSaved] = useState(initialIsSaved);

  useEffect(() => {
    setVote(getVote(image._id) || 0);
    setIsSaved(getSave(image._id));
  }, [votes, savedPosts, image._id]);

  const handleSave = async () => {
    if (sessionContext.userId) {
      addSave(image._id);
      setIsSaved(!isSaved);
    } else {
      console.log("You must be logged in to save posts");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch("/api/mongo/posts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: image._id,
          userId: sessionContext.userId,
          imageUrl: image.url,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log(data.message);
        setIsDeleted(true);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
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

  if (image.upvotes != 0) {
    // console.log(sessionContext.userRole)
    //console.log(image)
    // console.log(image.upvotes - image.downvotes)
  }

  return (
    <div
      className="overflow-hidden shadow-lg rounded-xl mb-4 border border-base-300 bg-base-100"
      style={{ maxHeight: "calc(100vw / 2)" }}
    >
      {isDeleted ? (
        <div className="flex justify-center items-center h-full py-10">
          <span className="text-lg">Image was Deleted</span>
        </div>
      ) : (
        <div className="w-full">
          {/* Image*/}
          <Image
            alt="Small image"
            width={image.width}
            height={image.height}
            src={imageUrl}
            onError={handleImageError}
            onLoad={handleImageLoad}
            className="w-full object-cover cursor-pointer"
            unoptimized={imageUrl.startsWith("/images/")}
            onClick={onClick}
            style={{ maxHeight: "60vh", width: "100%", height: "auto" }}
          />

          {/*  TAGS */}
          <div className="w-full h-8 flex items-center overflow-x-auto border-t border-base-300 bg-base-200 px-2">
            <div className="flex gap-2 whitespace-nowrap items-center">
              {image.tags?.map((tag, index) => (
                <span key={index} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* BUTTONS  */}
          <div className="w-full h-10 flex items-center justify-between gap-2 px-2 border-t border-base-300 bg-base-200">
            <div className="flex gap-2">
              {(image.userId === sessionContext.userId ||
                sessionContext.userRole === "admin") && (
                <Button onClick={handleDelete} className="btn-ghost btn-xs">
                  Delete
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleSave} clicked={isSaved} className="btn-xs">
                Save
              </Button>

              <Button
                onClick={handleUpvote}
                clicked={vote === 1}
                className="btn-xs"
              >
                ↑
              </Button>

              <span className="text-sm">
                {image.upvotes - image.downvotes + vote - voteFromDb}
              </span>

              <Button
                onClick={handleDownvote}
                clicked={vote === -1}
                className="btn-xs"
              >
                ↓
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmallImage;

import React, { useState, useEffect, useContext, useRef } from "react";
import Button from "./Button";
import { SessionContext } from "../invisibleComponents/SessionProvider";
import Image from "next/image";
import Post from "../interfaces/Post";
import { getTagColor } from "../interfaces/tags";

interface Props {
  image: Post;
  onClick?: () => void;
  onTagClick?: (tag: string) => void;
}

const SmallImage: React.FC<Props> = ({ image, onClick, onTagClick }) => {
  const [imageUrl, setImageUrl] = useState(image.url);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [voteFromDb, setVoteFromDb] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

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

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "200px",
        threshold: 0.01,
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    setVote(getVote(image._id) || 0);
    setIsSaved(getSave(image._id));
  }, [votes, savedPosts, image._id, getVote, getSave]);

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

  const handleTagClickInternal = (tag: string, e: React.MouseEvent) => {
    console.log(tag);
    e.stopPropagation();
    if (onTagClick) {
      onTagClick(tag);
    }
  };

  return (
    <div
      ref={imageRef}
      className="overflow-hidden shadow-lg rounded-xl mb-4 border border-base-300 bg-base-100"
      style={{ maxHeight: "calc(100vw / 2)" }}
    >
      {isDeleted ? (
        <div className="flex justify-center items-center h-full py-10">
          <span className="text-lg">Image was Deleted</span>
        </div>
      ) : (
        <div className="w-full">
          {/* Image with lazy loading */}
          {isVisible ? (
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
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23ddd'/%3E%3C/svg%3E"
            />
          ) : (
            <div
              className="w-full bg-base-300 animate-pulse"
              style={{
                aspectRatio: `${image.width}/${image.height}`,
                maxHeight: "60vh",
              }}
            >
              <div className="flex items-center justify-center h-full">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            </div>
          )}

          {/* TAGS */}
          <div className="w-full h-8 flex items-center overflow-x-auto border-t border-base-300 bg-base-200 px-2">
            <div className="flex gap-2 whitespace-nowrap items-center">
              {image.tags?.map((tag, index) => (
                <span
                  key={index}
                  className={`badge badge-sm ${getTagColor(
                    tag
                  )} gap-2 font-semibold cursor-pointer hover:opacity-80`}
                  onClick={(e) => handleTagClickInternal(tag, e)}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* BUTTONS */}
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

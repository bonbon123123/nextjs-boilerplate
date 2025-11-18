import React, { useContext, useState, useEffect } from "react";
import Button from "./Button";
import Image from "next/image";
import { SessionContext } from "../invisibleComponents/SessionProvider";

interface ImageDisplayProps {
  image: File;
  onImageSubmit: (image: File) => void;
}

interface ImageWithTag {
  image: File;
  tags: string[];
  width: number;
  height: number;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
  image,
  onImageSubmit,
}) => {
  const [imagesWithTag, setImagesWithTag] = useState<ImageWithTag[]>([]);
  const [newTag, setNewTag] = useState<string>("");
  const [imageWidth, setImageWidth] = useState<number>(0);
  const [imageHeight, setImageHeight] = useState<number>(0);
  const { userId } = useContext(SessionContext) || {};

  useEffect(() => {
    const img = document.createElement("img");
    img.onload = () => {
      setImageWidth(img.width);
      setImageHeight(img.height);
      const existingImageWithTag = imagesWithTag.find(
        (img) => img.image === image
      );
      if (existingImageWithTag) {
        existingImageWithTag.width = img.width;
        existingImageWithTag.height = img.height;
        setImagesWithTag([...imagesWithTag]);
      }
    };
    img.src = URL.createObjectURL(image);
  }, [image, imagesWithTag]);

  const handleAddTag = (image: File) => {
    const trimmedNewTag = newTag.trim();
    const existingImageWithTag = imagesWithTag.find(
      (img) => img.image === image
    );
    if (existingImageWithTag) {
      existingImageWithTag.tags.push(trimmedNewTag);
      setImagesWithTag([...imagesWithTag]);
    } else {
      setImagesWithTag([
        ...imagesWithTag,
        { image, tags: [trimmedNewTag], width: 0, height: 0 },
      ]);
    }
    setNewTag("");
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        handleAddTag(image);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [newTag, image, imagesWithTag]);

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTag(e.target.value);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("files", image);
    formData.append("width", imageWidth.toString());
    formData.append("height", imageHeight.toString());
    if (userId) {
      formData.append("userId", userId.toString());
    }
    const tags = imagesWithTag.find((img) => img.image === image)?.tags || [];
    formData.append("tags", JSON.stringify(tags));

    try {
      setImagesWithTag((prevImages) =>
        prevImages.filter((img) => img.image !== image)
      );
      onImageSubmit(image);
      const response = await fetch("/api/uploadthing/fileUpload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  const imageWithTag = imagesWithTag.find((img) => img.image === image);
  const tags = imageWithTag ? imageWithTag.tags : [];

  return (
    <div className="bg-base-200 w-full md:w-[66vw] h-[85vh] flex flex-col items-center card shadow-lg">
      <div className="w-full h-[75%] flex justify-center items-center p-4">
        <Image
          src={URL.createObjectURL(image)}
          width={imageWidth}
          height={imageHeight}
          alt={image.name}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* tags bar under image */}
      <div className="w-full py-2">
        <div className="overflow-x-auto">
          <div className="flex gap-2 whitespace-nowrap px-2">
            {tags.map((tag, index) => (
              <span key={index} className="tag inline-block">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* bottom controls */}
      <div className="w-full flex items-center gap-2 py-2">
        <input
          type="text"
          value={newTag}
          onChange={handleTagChange}
          className="input input-bordered flex-1 text-sm"
          placeholder="Add tag..."
        />
        <Button onClick={() => handleAddTag(image)} disabled={!newTag.trim()}>
          Add
        </Button>
        <div className="ml-auto">
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </div>
    </div>
  );
};

export default ImageDisplay;

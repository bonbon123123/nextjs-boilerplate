import React, { useContext, useState, useEffect } from "react";
import Button from "./Button";
import Image from "next/image";
import { SessionContext } from "../invisibleComponents/SessionProvider";
import TagInput from "./TagInput";

interface ImageDisplayProps {
  image: File;
  onImageSubmit: (image: File) => void;
  tags: string[];
  onTagsChange: (image: File, newTags: string[]) => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
  image,
  onImageSubmit,
  tags,
  onTagsChange,
}) => {
  const [imageWidth, setImageWidth] = useState<number>(0);
  const [imageHeight, setImageHeight] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { userId } = useContext(SessionContext) || {};

  useEffect(() => {
    const img = document.createElement("img");
    img.onload = () => {
      setImageWidth(img.width);
      setImageHeight(img.height);
    };
    img.src = URL.createObjectURL(image);

    return () => URL.revokeObjectURL(img.src);
  }, [image]);

  const handleSubmit = async () => {
    if (tags.length === 0) {
      alert("Please add at least one tag before uploading");
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append("files", image);
    formData.append("width", imageWidth.toString());
    formData.append("height", imageHeight.toString());
    if (userId) formData.append("userId", userId.toString());
    formData.append("tags", JSON.stringify(tags));

    try {
      setUploadProgress(30);

      const response = await fetch("/api/uploadthing/fileUpload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(80);

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      console.log(data);

      setUploadProgress(100);
      onImageSubmit(image);
    } catch (error) {
      console.error(error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="bg-base-200 w-full md:w-[66vw] h-[85vh] flex flex-col items-center card shadow-lg">
      {/* Image */}
      <div className="w-full h-[60%] flex justify-center items-center p-4">
        <Image
          src={URL.createObjectURL(image)}
          width={imageWidth || 500}
          height={imageHeight || 500}
          alt={image.name}
          className="max-w-full max-h-full object-contain"
          unoptimized
        />
      </div>

      {/* Info */}
      <div className="w-full px-4 py-2">
        <div className="grid grid-cols-2 gap-2 text-xs opacity-70">
          <div>
            <span>Size:</span> {(image.size / 1024).toFixed(2)} KB
          </div>
          <div>
            <span>Dimensions:</span> {imageWidth} × {imageHeight}
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="w-full flex-1 px-4 py-2 overflow-y-auto">
        <TagInput
          tags={tags}
          onChange={(newTags) => onTagsChange(image, newTags)}
          showSpecialTags={true}
        />
      </div>

      {/* Progress bar */}
      {uploading && (
        <div className="w-full px-4 py-2">
          <progress
            className="progress progress-primary w-full"
            value={uploadProgress}
            max={100}
          ></progress>
          <p className="text-xs text-center opacity-70 mt-1">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="w-full flex items-center gap-2 px-4 py-3 border-t border-base-300">
        <Button
          onClick={handleSubmit}
          disabled={uploading || tags.length === 0}
          className="btn-primary flex-1"
        >
          {uploading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Uploading...
            </>
          ) : (
            "Upload & Next"
          )}
        </Button>
        <Button
          onClick={() => onImageSubmit(image)}
          disabled={uploading}
          className="btn-ghost"
        >
          Skip
        </Button>
      </div>

      {tags.length === 0 && !uploading && (
        <p className="text-xs text-center opacity-70 pb-2">
          Add at least one tag to enable upload
        </p>
      )}
    </div>
  );
};

export default ImageDisplay;
